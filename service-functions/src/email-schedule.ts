import {
  EventBridgeClient,
  DescribeRuleCommand,
  EnableRuleCommand,
  DisableRuleCommand,
} from "@aws-sdk/client-eventbridge";
import { APIGatewayProxyEventV2 } from "aws-lambda";

const RULE_NAME = "remind-me-trigger";

const eventbridge = new EventBridgeClient();

async function getScheduleEnabled(): Promise<boolean> {
  const response = await eventbridge.send(
    new DescribeRuleCommand({ Name: RULE_NAME })
  );
  return response.State === "ENABLED";
}

async function setScheduleEnabled(enabled: boolean): Promise<void> {
  if (enabled) {
    await eventbridge.send(new EnableRuleCommand({ Name: RULE_NAME }));
  } else {
    await eventbridge.send(new DisableRuleCommand({ Name: RULE_NAME }));
  }
}

async function handler(event: APIGatewayProxyEventV2) {
  const method = event.requestContext.http.method.toUpperCase();

  if (method === "GET") {
    const enabled = await getScheduleEnabled();
    return {
      statusCode: 200,
      body: JSON.stringify({ enabled }),
    };
  } else if (method === "PUT") {
    const body = JSON.parse(event.body || "{}");
    const { enabled } = body;
    if (typeof enabled !== "boolean") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          msg: 'Error: missing or invalid boolean property "enabled" from payload',
        }),
      };
    }
    await setScheduleEnabled(enabled);
    return {
      statusCode: 200,
      body: JSON.stringify({ enabled }),
    };
  } else {
    return {
      statusCode: 400,
      body: `Unsupported method: ${method}`,
    };
  }
}

export { handler };
