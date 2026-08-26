import {
  CloudWatchClient,
  GetMetricDataCommand,
  MetricDataQuery,
} from "@aws-sdk/client-cloudwatch";

const FUNCTION_NAME = "remind-me";
const TIMEZONE = "Pacific/Auckland";
const LOOKBACK_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

const cloudwatch = new CloudWatchClient();

interface DailyPoint {
  date: string; // YYYY-MM-DD (Pacific/Auckland)
  sent: number;
  errors: number;
  status?: "success" | "failed" | "norun";
}

interface Stats {
  currentStreak: number;
  longestStreak: number;
  totalSent: number;
  totalErrors: number;
  successDays: number;
  failedDays: number;
  successRate: number; // 0-100, rounded to 1dp — measured in days that ran
  avgDurationMs: number | null;
  lastSent: string | null; // ISO date (YYYY-MM-DD)
  lastError: string | null;
  daysTracked: number;
  daily: Array<Required<DailyPoint>>;
}

function localDateKey(timestamp: Date): string {
  // en-CA gives YYYY-MM-DD; anchor to the configured timezone
  return timestamp.toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

function buildQueries(): MetricDataQuery[] {
  const dimensions = [{ Name: "FunctionName", Value: FUNCTION_NAME }];
  return [
    {
      Id: "invocations",
      MetricStat: {
        Metric: { Namespace: "AWS/Lambda", MetricName: "Invocations", Dimensions: dimensions },
        Period: DAY_MS / 1000,
        Stat: "Sum",
      },
    },
    {
      Id: "errors",
      MetricStat: {
        Metric: { Namespace: "AWS/Lambda", MetricName: "Errors", Dimensions: dimensions },
        Period: DAY_MS / 1000,
        Stat: "Sum",
      },
    },
    {
      Id: "duration",
      MetricStat: {
        Metric: { Namespace: "AWS/Lambda", MetricName: "Duration", Dimensions: dimensions },
        Period: DAY_MS / 1000,
        Stat: "Average",
      },
    },
  ];
}

function toDayMap(timestamps: Date[] = [], values: number[] = []): Map<string, number> {
  const map = new Map<string, number>();
  timestamps.forEach((ts, i) => {
    map.set(localDateKey(ts), values[i] ?? 0);
  });
  return map;
}

async function computeStats(): Promise<Stats> {
  const end = new Date();
  const start = new Date(end.getTime() - LOOKBACK_DAYS * DAY_MS);

  const response = await cloudwatch.send(
    new GetMetricDataCommand({
      StartTime: start,
      EndTime: end,
      ScanBy: "TimestampAscending",
      MetricDataQueries: buildQueries(),
    })
  );

  const results = response.MetricDataResults || [];
  const byId = (id: string) => results.find((r) => r.Id === id);

  const invocations = byId("invocations");
  const errors = byId("errors");
  const duration = byId("duration");

  const invMap = toDayMap(invocations?.Timestamps, invocations?.Values);
  const errMap = toDayMap(errors?.Timestamps, errors?.Values);
  const durMap = toDayMap(duration?.Timestamps, duration?.Values);

  // Build a continuous day-by-day series from start..end (oldest -> newest)
  const daily: DailyPoint[] = [];
  const startKey = localDateKey(start);
  for (let t = start.getTime(); t <= end.getTime(); t += DAY_MS) {
    const key = localDateKey(new Date(t));
    if (key < startKey) continue;
    daily.push({
      date: key,
      sent: Math.round(invMap.get(key) ?? 0),
      errors: Math.round(errMap.get(key) ?? 0),
    });
  }
  // De-dupe any accidental repeats (DST edges) keeping the max seen
  const dedup = new Map<string, DailyPoint>();
  for (const d of daily) {
    const existing = dedup.get(d.date);
    if (!existing) dedup.set(d.date, d);
    else dedup.set(d.date, { date: d.date, sent: Math.max(existing.sent, d.sent), errors: Math.max(existing.errors, d.errors) });
  }
  const series = Array.from(dedup.values()).sort((a, b) => a.date.localeCompare(b.date));

  // Classify each day: "failed" (any error), "success" (ran, no error), or "norun".
  const status = (d: DailyPoint): "success" | "failed" | "norun" =>
    d.errors > 0 ? "failed" : d.sent > 0 ? "success" : "norun";

  const withStatus = series.map((d) => ({ ...d, status: status(d) }));

  const successDays = withStatus.filter((d) => d.status === "success").length;
  const failedDays = withStatus.filter((d) => d.status === "failed").length;
  const activeDays = successDays + failedDays; // days the function actually ran

  const totalSent = series.reduce((acc, d) => acc + d.sent, 0);
  const totalErrors = series.reduce((acc, d) => acc + d.errors, 0);

  // Success rate measured in days that ran (a daily email is a per-day event),
  // which is robust against ad-hoc manual invocations within a single day.
  const successRate =
    activeDays > 0 ? Math.round((successDays / activeDays) * 1000) / 10 : 100;

  // Average duration across days that actually ran
  const durValues = series
    .map((d) => durMap.get(d.date))
    .filter((v): v is number => typeof v === "number" && v > 0);
  const avgDurationMs =
    durValues.length > 0
      ? Math.round(durValues.reduce((a, b) => a + b, 0) / durValues.length)
      : null;

  // Current streak: consecutive most-recent days that succeeded. No-run days
  // (including today before the scheduled send) are skipped, not counted or
  // broken; a failed day ends the streak.
  let currentStreak = 0;
  for (let i = withStatus.length - 1; i >= 0; i--) {
    const s = withStatus[i].status;
    if (s === "norun") continue;
    if (s === "success") currentStreak++;
    else break;
  }

  // Longest run of successful days (no-run days don't extend or break it).
  let longestStreak = 0;
  let running = 0;
  for (const d of withStatus) {
    if (d.status === "success") {
      running++;
      longestStreak = Math.max(longestStreak, running);
    } else if (d.status === "failed") {
      running = 0;
    }
  }

  const sentDays = series.filter((d) => d.sent > 0);
  const errorDays = series.filter((d) => d.errors > 0);
  const lastSent = sentDays.length ? sentDays[sentDays.length - 1].date : null;
  const lastError = errorDays.length ? errorDays[errorDays.length - 1].date : null;

  return {
    currentStreak,
    longestStreak,
    totalSent,
    totalErrors,
    successDays,
    failedDays,
    successRate,
    avgDurationMs,
    lastSent,
    lastError,
    daysTracked: LOOKBACK_DAYS,
    // Trim the daily series to the last 30 days for a compact activity chart
    daily: withStatus.slice(-30),
  };
}

async function handler() {
  const stats = await computeStats();
  return {
    statusCode: 200,
    body: JSON.stringify(stats),
  };
}

export { handler };
