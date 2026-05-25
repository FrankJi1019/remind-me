import 'dotenv/config';
import { calendar_v3, auth as googleAuth } from '@googleapis/calendar';
import { Client } from "@notionhq/client";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN!

const NOTION_API_KEY = process.env.NOTION_API_KEY!
const TODO_DATA_SOURCE_ID = process.env.TODO_DATA_SOURCE_ID!

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

async function getGoogleCalendarEvents() {
    const oauth2Client = new googleAuth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
    oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN })

    const calendar = new calendar_v3.Calendar({ auth: oauth2Client })

    const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        singleEvents: true,
        maxResults: 10,
        orderBy: 'startTime',
    })

    const events = (response.data.items || []).map((event) => ({
        summary: event.summary || "",
        start: event.start?.dateTime || event.start?.date || "",
        end: event.end?.dateTime || event.end?.date || "",
    }))

    return events
}

async function main() {
    const todos = await getNotionTodos()
    const events = await getGoogleCalendarEvents()
    console.log(todos)
    console.log(events)
}

main()

