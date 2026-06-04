import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
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

function isSameDay(date1: Date, date2: Date) {
  const timeFormat: Intl.DateTimeFormatOptions = { 
    timeZone: 'Pacific/Auckland', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }
  return date1.toLocaleDateString('en-CA', timeFormat) === date2.toLocaleDateString('en-CA', timeFormat)
}

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

async function getTaskById(id: string) {
  const response = await dynamodb.send(
    new GetCommand({ TableName: tableName, Key: { id } })
  )
  const task = response.Item as any
  return task
}

async function completeTask(task: Task, datetime: string, isComplete = true) {
  const completionDates = task.completionDates
  const existingDate = completionDates.find(date => isSameDay(new Date(date), new Date(datetime)))
  if (existingDate) {
    task.completionDates = completionDates.filter(date => date !== existingDate)
  }
  if (isComplete) {
    task.completionDates.push(datetime)
  }
  await dynamodb.send(
    new PutCommand({ TableName: tableName, Item: task })
  )
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
    const task = await getTaskById(key)
    if (!task) {
      return {
        statusCode: 404,
        body: JSON.stringify({msg: `Error: task not found with id ${key}`})
      }
    }
    const body = JSON.parse(event.body || "{}");
    const { isComplete, datetime } = body;
    if (isComplete === undefined || !datetime) {
      return {
        statusCode: 400,
        body: JSON.stringify({ msg: "Error: Invalid payload structure" }),
      };
    }
    const response = await completeTask(task, datetime, isComplete);
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
