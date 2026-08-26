import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { SSMClient, GetParametersByPathCommand } from "@aws-sdk/client-ssm";

const DEFAULT_TEMPLATE = "remind-me-daily-briefing";
const ALLOWED_TEMPLATES = [
  "remind-me-daily-briefing",
  "remind-me-tech",
  "remind-me-timeline",
  "remind-me-digest",
];

const ses = new SESv2Client({ region: "ap-southeast-2" });

async function getParameters() {
  const ssmClient = new SSMClient();
  const response = await ssmClient.send(
    new GetParametersByPathCommand({
      Path: "/remind-me",
      WithDecryption: true,
    }),
  );

  if (!response.Parameters) {
    return {};
  }

  const params = response.Parameters?.map((parameter) => {
    return {
      name: parameter.Name?.split("/").pop(),
      value: parameter.Value,
    };
  }).reduce(
    (acc, curr) => {
      if (!(curr.name && curr.value)) {
        return acc;
      }
      acc[curr.name] = curr.value;
      return acc;
    },
    {} as Record<string, string>,
  );

  return params;
}

async function invokeLambdaFunction(functionName: string) {
  const lambda = new LambdaClient();
  const rawResponse = await lambda.send(
    new InvokeCommand({
      FunctionName: functionName,
    }),
  );
  const response = Buffer.from(rawResponse.Payload!).toString();
  return JSON.parse(response);
}

export const handler = async (): Promise<{
  statusCode: number;
  body: string;
}> => {
  const [templateData, params] = await Promise.all([
    invokeLambdaFunction("assemble-email"),
    getParameters(),
  ]);
  const { FROM_EMAIL, TO_EMAIL, EMAIL_TEMPLATE } = params;
  const templateName = ALLOWED_TEMPLATES.includes(EMAIL_TEMPLATE || "")
    ? (EMAIL_TEMPLATE as string)
    : DEFAULT_TEMPLATE;

  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: FROM_EMAIL,
      Destination: { ToAddresses: [TO_EMAIL] },
      Content: {
        Template: {
          TemplateName: templateName,
          TemplateData: JSON.stringify(templateData),
        },
      },
    }),
  );

  return { statusCode: 200, body: "[SUCCESS] Email sent!" };
};
