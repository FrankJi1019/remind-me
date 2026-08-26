import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { SESv2Client, GetEmailTemplateCommand } from "@aws-sdk/client-sesv2";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import Handlebars from "handlebars";

const DEFAULT_TEMPLATE = "remind-me-daily-briefing";
const TEMPLATE_PARAM = "/remind-me/EMAIL_TEMPLATE";
const ALLOWED_TEMPLATES = [
  "remind-me-daily-briefing",
  "remind-me-tech",
  "remind-me-timeline",
  "remind-me-digest",
];

const ses = new SESv2Client({ region: "ap-southeast-2" });
const ssm = new SSMClient();

async function getSelectedTemplate(): Promise<string> {
  try {
    const res = await ssm.send(new GetParameterCommand({ Name: TEMPLATE_PARAM }));
    const value = res.Parameter?.Value || "";
    return ALLOWED_TEMPLATES.includes(value) ? value : DEFAULT_TEMPLATE;
  } catch {
    return DEFAULT_TEMPLATE;
  }
}

interface Todo {
  createdOn: string;
  icon: string;
  task: string;
  status: string;
  statusColor: string;
  category: string;
  categoryColor: string;
  dueDate: string;
}

interface Event {
  summary: string;
  start: string;
  end: string;
}

// ---- Pre-computed shapes handed to the SES (Handlebars) template ----
interface TemplateEvent {
  summary: string;
  dateLabel: string;
  timeLabel: string;
}

interface TemplateTodo {
  icon: string;
  task: string;
  dueHtml: string; // pre-rendered (may be empty)
  dueLabel: string; // plain-text due label (may be empty)
  categoryLabel: string;
  categoryBg: string;
  categoryText: string;
  statusLabel: string;
  statusBg: string;
  statusText: string;
}

interface TemplateData {
  today: string;
  subjectDate: string;
  eventCount: number;
  todoCount: number;
  events: TemplateEvent[];
  todos: TemplateTodo[];
}

async function invokeLambdaFunction(functionName: string) {
  const lambda = new LambdaClient();
  const rawResponse = await lambda.send(
    new InvokeCommand({ FunctionName: functionName })
  );
  const response = Buffer.from(rawResponse.Payload!).toString();
  return JSON.parse(response);
}

function badgeColor(color: string): string {
  const map: Record<string, string> = {
    red: "#fee2e2",
    orange: "#ffedd5",
    yellow: "#fef9c3",
    green: "#dcfce7",
    blue: "#dbeafe",
    purple: "#f3e8ff",
    pink: "#fce7f3",
    gray: "#f3f4f6",
    default: "#f3f4f6",
  };
  return map[color] || map.default;
}

function badgeTextColor(color: string): string {
  const map: Record<string, string> = {
    red: "#991b1b",
    orange: "#9a3412",
    yellow: "#854d0e",
    green: "#166534",
    blue: "#1e40af",
    purple: "#6b21a8",
    pink: "#9d174d",
    gray: "#374151",
    default: "#374151",
  };
  return map[color] || map.default;
}

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  const month = parseInt(d.toLocaleDateString("en-CA", { month: "numeric", timeZone: "Pacific/Auckland" }));
  const day = parseInt(d.toLocaleDateString("en-CA", { day: "numeric", timeZone: "Pacific/Auckland" }));
  const weekday = d.toLocaleDateString("zh-CN", { weekday: "long", timeZone: "Pacific/Auckland" });
  return `${month}月${day}日（${weekday}）`;
}

function formatTime(dateStr: string): string {
  if (!dateStr.includes("T")) return "全天";
  return new Date(dateStr).toLocaleTimeString("en-NZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Pacific/Auckland",
  });
}

function formatDue(dateStr: string, now: Date): { html: string; label: string } {
  if (!dateStr) return { html: "", label: "" };
  const [y, m, d] = dateStr.split("-").map(Number);
  const due = new Date(y, m - 1, d);
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((due.getTime() - todayLocal.getTime()) / (1000 * 60 * 60 * 24));
  const dateCn = `${m}月${d}日`;
  let relative = "";
  if (diffDays === 0) relative = "今天";
  else if (diffDays === 1) relative = "明天";
  else if (diffDays === -1) relative = "昨天";
  else if (diffDays > 1) relative = `${diffDays}天后`;
  else relative = `已过期${Math.abs(diffDays)}天`;
  const color = diffDays < 0 ? "#ef4444" : diffDays === 0 ? "#f59e0b" : "#6b7280";
  return {
    label: `${dateCn} (${relative})`,
    html: `<div style="margin-top:3px;padding-left:1.5em;font-size:12px;color:#6b7280;">${dateCn} <span style="color:${color};font-weight:500;">(${relative})</span></div>`,
  };
}

function buildTemplateData(todos: Array<Todo>, events: Array<Event>): TemplateData {
  const now = new Date();

  const today = now.toLocaleDateString("en-NZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Pacific/Auckland",
  });

  const subjectDate = now.toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "Pacific/Auckland",
  });

  const templateEvents: TemplateEvent[] = events.map((e) => ({
    summary: e.summary,
    dateLabel: formatEventDate(e.start),
    timeLabel: `${formatTime(e.start)}${e.end && e.start.includes("T") ? " – " + formatTime(e.end) : ""}`,
  }));

  // Sort by due date asc (no-date last), then category, then newest first
  const sorted = [...todos].sort((a, b) => {
    const aDue = a.dueDate || "9999-12-31";
    const bDue = b.dueDate || "9999-12-31";
    if (aDue !== bDue) return aDue.localeCompare(bDue);
    if (a.category !== b.category) return (a.category || "").localeCompare(b.category || "");
    return b.createdOn.localeCompare(a.createdOn);
  });

  // Only active (non-done) todos are shown
  const activeTodos = sorted.filter(
    (t) => t.status !== "DONE" && t.status !== "Done" && t.status !== "Completed"
  );

  const templateTodos: TemplateTodo[] = activeTodos.map((t) => {
    const due = formatDue(t.dueDate, now);
    return {
      icon: t.icon,
      task: t.task,
      dueHtml: due.html,
      dueLabel: due.label,
      categoryLabel: t.category || "—",
      categoryBg: badgeColor(t.categoryColor),
      categoryText: badgeTextColor(t.categoryColor),
      statusLabel: t.status,
      statusBg: badgeColor(t.statusColor),
      statusText: badgeTextColor(t.statusColor),
    };
  });

  return {
    today,
    subjectDate,
    eventCount: templateEvents.length,
    todoCount: templateTodos.length,
    events: templateEvents,
    todos: templateTodos,
  };
}

async function assembleTemplateData(): Promise<TemplateData> {
  const [todos, events] = await Promise.all([
    invokeLambdaFunction("get-todos"),
    invokeLambdaFunction("get-calendar"),
  ]);
  return buildTemplateData(todos, events);
}

// assemble-email serves two callers:
//  - GET /email/preview (API Gateway): render the SES template with live data -> HTML
//  - direct invoke from remind-me: return the raw TemplateData for SES to render
async function assembleEmail(event?: { requestContext?: { http?: unknown } }) {
  const isApiRequest = Boolean(event?.requestContext?.http);
  const templateData = await assembleTemplateData();

  if (!isApiRequest) {
    // remind-me consumes this directly and passes it to SES as TemplateData
    return templateData;
  }

  const template = await ses.send(
    new GetEmailTemplateCommand({ TemplateName: await getSelectedTemplate() })
  );
  const html = template.TemplateContent?.Html || "";
  const compiled = Handlebars.compile(html, { noEscape: false });
  return compiled(templateData);
}

export { assembleEmail, assembleTemplateData, buildTemplateData, getSelectedTemplate };
export type { TemplateData };
