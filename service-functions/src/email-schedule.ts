import {
  EventBridgeClient,
  DescribeRuleCommand,
  EnableRuleCommand,
  DisableRuleCommand,
  PutRuleCommand,
} from "@aws-sdk/client-eventbridge";
import { APIGatewayProxyEventV2 } from "aws-lambda";

const RULE_NAME = "remind-me-trigger";
const TIMEZONE = "Pacific/Auckland";

const eventbridge = new EventBridgeClient();

interface ScheduleState {
  enabled: boolean;
  hour: number; // local (Pacific/Auckland) hour, 0-23
  minute: number; // 0-59
  timezone: string;
  cron: string; // the underlying UTC cron expression
}

// Offset in minutes to add to UTC to get local time, for the given instant.
function tzOffsetMinutes(at: Date): number {
  const local = new Date(at.toLocaleString("en-US", { timeZone: TIMEZONE }));
  const utc = new Date(at.toLocaleString("en-US", { timeZone: "UTC" }));
  return Math.round((local.getTime() - utc.getTime()) / 60000);
}

function parseCronUtc(cron: string): { hour: number; minute: number } | null {
  // Expected form: cron(minute hour day-of-month month day-of-week year)
  const m = cron.match(/^cron\((\d+)\s+(\d+)\s+/);
  if (!m) return null;
  return { minute: parseInt(m[1], 10), hour: parseInt(m[2], 10) };
}

function utcToLocal(hourUtc: number, minuteUtc: number): { hour: number; minute: number } {
  const offset = tzOffsetMinutes(new Date());
  let total = hourUtc * 60 + minuteUtc + offset;
  total = ((total % 1440) + 1440) % 1440;
  return { hour: Math.floor(total / 60), minute: total % 60 };
}

function localToUtcCron(hourLocal: number, minuteLocal: number): string {
  const offset = tzOffsetMinutes(new Date());
  let total = hourLocal * 60 + minuteLocal - offset;
  total = ((total % 1440) + 1440) % 1440;
  const hourUtc = Math.floor(total / 60);
  const minuteUtc = total % 60;
  return `cron(${minuteUtc} ${hourUtc} * * ? *)`;
}

async function getState(): Promise<ScheduleState> {
  const response = await eventbridge.send(new DescribeRuleCommand({ Name: RULE_NAME }));
  const cron = response.ScheduleExpression || "cron(0 18 * * ? *)";
  const parsed = parseCronUtc(cron) || { hour: 18, minute: 0 };
  const local = utcToLocal(parsed.hour, parsed.minute);
  return {
    enabled: response.State === "ENABLED",
    hour: local.hour,
    minute: local.minute,
    timezone: TIMEZONE,
    cron,
  };
}

async function setEnabled(enabled: boolean): Promise<void> {
  if (enabled) {
    await eventbridge.send(new EnableRuleCommand({ Name: RULE_NAME }));
  } else {
    await eventbridge.send(new DisableRuleCommand({ Name: RULE_NAME }));
  }
}

async function setSendTime(hourLocal: number, minuteLocal: number): Promise<void> {
  // Preserve the current enabled/disabled state when updating the schedule.
  const current = await eventbridge.send(new DescribeRuleCommand({ Name: RULE_NAME }));
  await eventbridge.send(
    new PutRuleCommand({
      Name: RULE_NAME,
      ScheduleExpression: localToUtcCron(hourLocal, minuteLocal),
      State: current.State,
      Description: current.Description,
    })
  );
}

function isValidTime(hour: unknown, minute: unknown): boolean {
  return (
    typeof hour === "number" &&
    Number.isInteger(hour) &&
    hour >= 0 &&
    hour <= 23 &&
    typeof minute === "number" &&
    Number.isInteger(minute) &&
    minute >= 0 &&
    minute <= 59
  );
}

async function handler(event: APIGatewayProxyEventV2) {
  const method = event.requestContext.http.method.toUpperCase();

  if (method === "GET") {
    const state = await getState();
    return { statusCode: 200, body: JSON.stringify(state) };
  } else if (method === "PUT") {
    const body = JSON.parse(event.body || "{}");
    const hasEnabled = typeof body.enabled === "boolean";
    const hasTime = body.hour !== undefined || body.minute !== undefined;

    if (!hasEnabled && !hasTime) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          msg: 'Error: provide "enabled" (boolean) and/or "hour"+"minute" (integers)',
        }),
      };
    }

    if (hasTime && !isValidTime(body.hour, body.minute)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          msg: 'Error: "hour" must be 0-23 and "minute" must be 0-59',
        }),
      };
    }

    if (hasTime) await setSendTime(body.hour, body.minute);
    if (hasEnabled) await setEnabled(body.enabled);

    const state = await getState();
    return { statusCode: 200, body: JSON.stringify(state) };
  } else {
    return {
      statusCode: 400,
      body: `Unsupported method: ${method}`,
    };
  }
}

export { handler };
