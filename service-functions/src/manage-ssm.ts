import { SSMClient, GetParametersByPathCommand, PutParameterCommand } from "@aws-sdk/client-ssm";
import { APIGatewayProxyEventV2 } from "aws-lambda";

const ssmClient = new SSMClient();

async function getParameters() {
  const response = await ssmClient.send(
    new GetParametersByPathCommand({
      Path: "/remind-me",
      WithDecryption: true,
    }),
  );

  if (!response.Parameters) {
    return {}
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

async function updateParameter(key: string, value: string) {
  await ssmClient.send(new PutParameterCommand({
    Name: `/remind-me/${key}`,
    Value: value,
    Type: "SecureString",
    Overwrite: true
  }))
}

async function manageSSM(event: APIGatewayProxyEventV2) {

  const method = event.requestContext.http.method.toUpperCase()

  if (method === 'GET') {
    const params = await getParameters()

    return {
      statusCode: 200,
      body: JSON.stringify(params)
    }
  } else if (method === 'PUT') {
    const key = event.pathParameters?.key
    if (!key) {
      return {
        statusCode: 400,
        body: JSON.stringify({ msg: "Error: Invalid path param" })
      }
    }
    const body = JSON.parse(event.body || '{}')
    const { value } = body
    if (!value) {
      return {
        statusCode: 400,
        body: JSON.stringify({ msg: 'Error: missing property "value" from payload' })
      }
    }
    await updateParameter(key, value)
    return {
      statusCode: 200,
      body: JSON.stringify({ msg: "SSM parameter updated." })
    }
  } else {
    return {
      statusCode: 400,
      body: `Unsupported method: ${method}`
    }
  }

}

export { manageSSM }
