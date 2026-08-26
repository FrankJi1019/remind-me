import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
  FilteredLogEvent,
} from "@aws-sdk/client-cloudwatch-logs";

const LOG_GROUP = "/aws/lambda/remind-me";
const LOOKBACK_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RUNS = 50;

const logs = new CloudWatchLogsClient();

type RunStatus = "success" | "error" | "running";

interface LogLine {
  timestamp: number;
  message: string;
}

interface Run {
  requestId: string;
  startedAt: number | null;
  endedAt: number | null;
  durationMs: number | null;
  billedDurationMs: number | null;
  maxMemoryUsedMb: number | null;
  memorySizeMb: number | null;
  initDurationMs: number | null;
  status: RunStatus;
  messages: LogLine[];
}

const REQUEST_ID_RE =
  /RequestId:\s*([0-9a-fA-F-]{36})/;

function num(source: string, re: RegExp): number | null {
  const m = source.match(re);
  return m ? Math.round(parseFloat(m[1])) : null;
}

async function fetchEvents(): Promise<FilteredLogEvent[]> {
  const end = Date.now();
  const start = end - LOOKBACK_DAYS * DAY_MS;
  const events: FilteredLogEvent[] = [];
  let nextToken: string | undefined;

  do {
    const response = await logs.send(
      new FilterLogEventsCommand({
        logGroupName: LOG_GROUP,
        startTime: start,
        endTime: end,
        nextToken,
      })
    );
    events.push(...(response.events || []));
    nextToken = response.nextToken;
    // Guard against pulling an unbounded amount of history
  } while (nextToken && events.length < 10000);

  return events;
}

function classifyMessage(msg: string): "control" | "app" {
  if (
    msg.startsWith("START RequestId") ||
    msg.startsWith("END RequestId") ||
    msg.startsWith("REPORT RequestId") ||
    msg.startsWith("INIT_START")
  ) {
    return "control";
  }
  return "app";
}

function looksLikeError(msg: string): boolean {
  return /\b(ERROR|Task timed out|errorMessage|errorType|Unhandled|Exception|Runtime\.)\b/i.test(
    msg
  );
}

function buildRuns(events: FilteredLogEvent[]): Run[] {
  const runs = new Map<string, Run>();

  const getRun = (requestId: string): Run => {
    let run = runs.get(requestId);
    if (!run) {
      run = {
        requestId,
        startedAt: null,
        endedAt: null,
        durationMs: null,
        billedDurationMs: null,
        maxMemoryUsedMb: null,
        memorySizeMb: null,
        initDurationMs: null,
        status: "running",
        messages: [],
      };
      runs.set(requestId, run);
    }
    return run;
  };

  // INIT_START lines have no RequestId; attach them to the next START by timestamp order.
  const sorted = [...events].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

  // Track the run that is currently "open" (START seen, END not yet) so that
  // log lines without a RequestId (e.g. Lambda error stack traces) can be
  // attributed to the correct run.
  let openRequestId: string | null = null;

  for (const event of sorted) {
    const msg = (event.message || "").trim();
    const ts = event.timestamp || 0;
    const idMatch = msg.match(REQUEST_ID_RE);

    if (idMatch) {
      const requestId = idMatch[1];
      const run = getRun(requestId);

      if (msg.startsWith("START RequestId")) {
        run.startedAt = ts;
        openRequestId = requestId;
      } else if (msg.startsWith("END RequestId")) {
        run.endedAt = ts;
        if (run.status === "running") run.status = "success";
        if (openRequestId === requestId) openRequestId = null;
      } else if (msg.startsWith("REPORT RequestId")) {
        run.durationMs = num(msg, /Duration:\s*([\d.]+)\s*ms/);
        run.billedDurationMs = num(msg, /Billed Duration:\s*([\d.]+)\s*ms/);
        run.maxMemoryUsedMb = num(msg, /Max Memory Used:\s*([\d.]+)\s*MB/);
        run.memorySizeMb = num(msg, /Memory Size:\s*([\d.]+)\s*MB/);
        run.initDurationMs = num(msg, /Init Duration:\s*([\d.]+)\s*ms/);
      } else if (classifyMessage(msg) === "app") {
        run.messages.push({ timestamp: ts, message: msg });
        if (looksLikeError(msg)) run.status = "error";
      }
      continue;
    }

    // No RequestId in the message. If it's a control line (INIT_START) skip it.
    // Otherwise attribute it to the currently open run — this is where Lambda
    // error/stack-trace lines live, which is how we detect failed runs.
    if (classifyMessage(msg) === "control") continue;
    if (openRequestId) {
      const run = getRun(openRequestId);
      run.messages.push({ timestamp: ts, message: msg });
      if (looksLikeError(msg)) run.status = "error";
    }
  }

  const list = Array.from(runs.values())
    .filter((r) => r.startedAt !== null)
    .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0))
    .slice(0, MAX_RUNS);

  return list;
}

async function handler() {
  const events = await fetchEvents();
  const runs = buildRuns(events);
  return {
    statusCode: 200,
    body: JSON.stringify({
      logGroup: LOG_GROUP,
      daysTracked: LOOKBACK_DAYS,
      runs,
    }),
  };
}

export { handler };
