import { Client } from "@notionhq/client";
import { SSMClient, GetParametersByPathCommand } from "@aws-sdk/client-ssm";

async function getParameters() {
  const ssmClient = new SSMClient();
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

async function getNotionTodos() {
  const { NOTION_API_KEY, TODO_DATA_SOURCE_ID } = await getParameters();

  const notion = new Client({
    auth: NOTION_API_KEY,
  });

  const response = await notion.dataSources.query({
    data_source_id: TODO_DATA_SOURCE_ID,
  });

  const todos = response.results.map((item: any) => {
    const createdOn: string = item?.created_time;
    const icon: string = item.icon?.emoji || "";
    const task: string = item.properties?.Task?.title?.[0]?.plain_text || "";
    const status: string = item.properties?.Status?.select?.name;
    const statusColor: string = item.properties?.Status?.select?.color;
    const category: string = item.properties?.Category?.select?.name;
    const categoryColor: string = item.properties?.Category?.select?.color;
    const dueDate: string = item.properties?.["Due Date"]?.date?.start || "";

    return {
      createdOn,
      icon,
      task,
      status,
      statusColor,
      category,
      categoryColor,
      dueDate,
    };
  });

  return todos;
}

export { getNotionTodos };
