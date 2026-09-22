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

export const handler = async () => {
  const { NOTION_API_KEY, TODO_DATA_SOURCE_ID } = await getParameters();

  let cursor: string | undefined;
  const notion = new Client({ auth: NOTION_API_KEY });

  do {
    const res = await notion.dataSources.query({
      data_source_id: TODO_DATA_SOURCE_ID,
      start_cursor: cursor,
      filter: {
        and: [
          { property: "Daily", checkbox: { equals: true } },
          { property: "Status", select: { does_not_equal: "TODO" } },
        ],
      },
    });

    await Promise.all(
      res.results.map((page) =>
        notion.pages.update({
          page_id: page.id,
          properties: { Status: { select: { name: "Todo" } } },
        })
      )
    );

    cursor = res.has_more ? res.next_cursor ?? undefined : undefined;
  } while (cursor);
};
