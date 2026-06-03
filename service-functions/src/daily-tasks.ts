import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { randomUUID } from "crypto";

const tableName = "daily-tasks";

type Task = {
  id: string;
  task: string;
  completionDates: Array<string>;
  fromDate: string;
};

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient());

async function getAllTasks() {
  const response = await dynamodb.send(
    new ScanCommand({
      TableName: tableName,
    })
  );

  return response;
}

async function createTask(taskContent: string) {
  const task: Task = {
    id: randomUUID(),
    task: taskContent,
    completionDates: [],
    fromDate: new Date().toISOString(),
  };

  const response = await dynamodb.send(
    new PutCommand({
      TableName: tableName,
      Item: task,
    })
  );

  return { response, task };
}

async function completeTask(id: string) {
  const response = await dynamodb.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { id },
      UpdateExpression: "SET completionDates = list_append(completionDates, :dates)",
      ExpressionAttributeValues: {
        ":dates": [new Date().toISOString()],
      },
      ReturnValues: "ALL_NEW",
    })
  );

  return response;
}

async function deleteTask(id: string) {
  const response = await dynamodb.send(
    new DeleteCommand({
      TableName: tableName,
      Key: { id },
    })
  );

  return response;
}

async function handler(event: APIGatewayProxyEventV2) {
  const method = event.requestContext.http.method.toUpperCase();

  if (method === "GET") {
    const tasks = await getAllTasks();
    return tasks;

  } else if (method === "POST") {
    const body = JSON.parse(event.body || "{}");
    const { task } = body;
    if (!task) {
      return {
        statusCode: 400,
        body: JSON.stringify({ msg: 'Error: missing property "task" from payload' }),
      };
    }
    const response = await createTask(task);
    return {
      statusCode: 201,
      body: JSON.stringify(response),
    };

  } else if (method === "PUT") {
    const key = event.pathParameters?.key;
    if (!key) {
      return {
        statusCode: 400,
        body: JSON.stringify({ msg: "Error: Invalid path param" }),
      };
    }
    const response = await completeTask(key);
    return {
      statusCode: 201,
      body: JSON.stringify(response),
    };

  } else if (method === "DELETE") {
    const key = event.pathParameters?.key;
    if (!key) {
      return {
        statusCode: 400,
        body: JSON.stringify({ msg: "Error: Invalid path param" }),
      };
    }
    const response = await deleteTask(key);
    return {
      statusCode: 201,
      body: JSON.stringify(response),
    };
    
  } else {
    return {
      statusCode: 400,
      body: `Unsupported method: ${method}`,
    };
  }
}

export { handler };
