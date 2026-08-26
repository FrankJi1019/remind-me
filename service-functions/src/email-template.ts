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
    name: "Terminal",
    description: "Dark developer console — monospace, prompts and shell output.",
  },
  {
    id: "remind-me-timeline",
    name: "Timeline",
    description: "Clean card with a vertical timeline rail and dotted markers.",
  },
  {
    id: "remind-me-digest",
    name: "Digest",
    description: "Feed layout with a stat summary and accent-bar item rows.",
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

// Fetch the raw Handlebars html/subject for each template so the client can
// render mock-data previews without hitting the live data pipeline.
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
