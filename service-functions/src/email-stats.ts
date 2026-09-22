import {
  CloudWatchClient,
  GetMetricDataCommand,
  MetricDataQuery,
} from "@aws-sdk/client-cloudwatch";

const FUNCTION_NAME = "remind-me";
const TIMEZONE = "Pacific/Auckland";
const LOOKBACK_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;
const CHART_DAYS = 30;

const cloudwatch = new CloudWatchClient();

type DayStatus = "success" | "failed" | "norun";

interface DailyPoint {
  date: string;
  sent: number;
  errors: number;
  status?: DayStatus;
}

interface Stats {
  totalSent: number;
  totalErrors: number;
  avgDurationMs: number | null;
  lastSent: string | null;
  lastError: string | null;
  daysTracked: number;
  daily: Array<Required<DailyPoint>>;
}

function localDateKey(timestamp: Date): string {
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

  const dedup = new Map<string, DailyPoint>();
  for (const d of daily) {
    const existing = dedup.get(d.date);
    if (!existing) dedup.set(d.date, d);
    else
      dedup.set(d.date, {
        date: d.date,
        sent: Math.max(existing.sent, d.sent),
        errors: Math.max(existing.errors, d.errors),
      });
  }
  const series = Array.from(dedup.values()).sort((a, b) => a.date.localeCompare(b.date));

  const status = (d: DailyPoint): DayStatus =>
    d.errors > 0 ? "failed" : d.sent > 0 ? "success" : "norun";

  const withStatus = series.map((d) => ({ ...d, status: status(d) }));

  const totalSent = series.reduce((acc, d) => acc + d.sent, 0);
  const totalErrors = series.reduce((acc, d) => acc + d.errors, 0);

  const durValues = series
    .map((d) => durMap.get(d.date))
    .filter((v): v is number => typeof v === "number" && v > 0);
  const avgDurationMs =
    durValues.length > 0
      ? Math.round(durValues.reduce((a, b) => a + b, 0) / durValues.length)
      : null;

  const sentDays = series.filter((d) => d.sent > 0);
  const errorDays = series.filter((d) => d.errors > 0);
  const lastSent = sentDays.length ? sentDays[sentDays.length - 1].date : null;
  const lastError = errorDays.length ? errorDays[errorDays.length - 1].date : null;

  return {
    totalSent,
    totalErrors,
    avgDurationMs,
    lastSent,
    lastError,
    daysTracked: LOOKBACK_DAYS,
    daily: withStatus.slice(-CHART_DAYS),
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
