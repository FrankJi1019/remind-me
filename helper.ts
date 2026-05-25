import { Client } from "@notionhq/client";

const NOTION_API_KEY = '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'
const TODO_DATA_SOURCE_ID = 'd456cb78-bed9-480f-a967-0e749ee6eeff'

async function getNotionTodos() {
    const notion = new Client({
        auth: NOTION_API_KEY
    })

    const response = await notion.dataSources.query({
        data_source_id: TODO_DATA_SOURCE_ID
    })

    const todos = response.results.map((item: any) => {
        const createdOn: string = item?.created_time
        const icon: string = item.icon?.emoji || ""
        const task: string = item.properties?.Task?.title?.[0]?.plain_text || ""
        const status: string = item.properties?.Status?.select?.name
        const statusColor: string = item.properties?.Status?.select?.color
        const category: string = item.properties?.Category?.select?.name
        const categoryColor: string = item.properties?.Category?.select?.color
        const dueDate: string = item.properties?.['Due Date']?.date?.start || ""

        return {
            createdOn, icon, task, status, statusColor, category, categoryColor, dueDate
        }
    })

    return todos
}

async function main() {
    const todos = await getNotionTodos()
    console.log(todos)
}

main()

