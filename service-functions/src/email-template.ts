import {
  SSMClient,
  GetParameterCommand,
  PutParameterCommand,
} from "@aws-sdk/client-ssm";
import { SESv2Client, GetEmailTemplateCommand } from "@aws-sdk/client-sesv2";
import { APIGatewayProxyEventV2 } from "aws-lambda";

const TEMPLATE_PARAM = "/remind-me/EMAIL_TEMPLATE";
const DEFAULT_TEMPLATE = "remind-me-daily-briefing";

interface TemplateOption {
  id: string;
  name: string;
  description: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: "remind-me-daily-briefing",
    name: "Classic",
    description: "Card layout with colour-coded tables and badges.",
  },
  {
    id: "remind-me-tech",
    name: "Boarding Pass",
    description: "Your day as a travel ticket — departures board and task manifest.",
  },
  {
    id: "remind-me-timeline",
    name: "Day Planner",
    description: "A planner page — ruled agenda with a time column and a checklist.",
  },
  {
    id: "remind-me-digest",
    name: "Minimal Note",
    description: "A quiet typographic letter — no cards, just clean type on paper.",
  },
];

const ALLOWED = TEMPLATES.map((t) => t.id);

const ssm = new SSMClient();
const ses = new SESv2Client({ region: "ap-southeast-2" });

async function getSelected(): Promise<string> {
  try {
    const res = await ssm.send(new GetParameterCommand({ Name: TEMPLATE_PARAM }));
    const value = res.Parameter?.Value || "";
    return ALLOWED.includes(value) ? value : DEFAULT_TEMPLATE;
  } catch {
    return DEFAULT_TEMPLATE;
  }
}

async function setSelected(id: string): Promise<void> {
  await ssm.send(
    new PutParameterCommand({
      Name: TEMPLATE_PARAM,
      Value: id,
      Type: "String",
      Overwrite: true,
    })
  );
}

async function withTemplateContent() {
  return Promise.all(
    TEMPLATES.map(async (t) => {
      try {
        const res = await ses.send(new GetEmailTemplateCommand({ TemplateName: t.id }));
        return {
          ...t,
          subject: res.TemplateContent?.Subject || "",
          html: res.TemplateContent?.Html || "",
        };
      } catch {
        return { ...t, subject: "", html: "" };
      }
    })
  );
}

async function handler(event: APIGatewayProxyEventV2) {
  const method = event.requestContext.http.method.toUpperCase();

  if (method === "GET") {
    const [selected, templates] = await Promise.all([
      getSelected(),
      withTemplateContent(),
    ]);
    return {
      statusCode: 200,
      body: JSON.stringify({ templates, selected }),
    };
  } else if (method === "PUT") {
    const body = JSON.parse(event.body || "{}");
    const { selected } = body;
    if (!ALLOWED.includes(selected)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          msg: `Error: "selected" must be one of ${ALLOWED.join(", ")}`,
        }),
      };
    }
    await setSelected(selected);
    return {
      statusCode: 200,
      body: JSON.stringify({ selected }),
    };
  } else {
    return {
      statusCode: 400,
      body: `Unsupported method: ${method}`,
    };
  }
}

export { handler };
