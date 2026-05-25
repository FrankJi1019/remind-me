import path from 'node:path';
import process from 'node:process';
import { Client } from "@notionhq/client";
import { authenticate } from '@google-cloud/local-auth';
import { google } from "googleapis";

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

import fs from 'node:fs';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json')
const TOKEN_PATH = path.join(process.cwd(), 'token.json')

async function getAuthorizedClient() {
    const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8')
    const { installed } = JSON.parse(content)
    const { client_id, client_secret, redirect_uris } = installed
    const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

    if (fs.existsSync(TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'))
        oauth2Client.setCredentials(token)
        return oauth2Client
    }

    const auth = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    })
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(auth.credentials))
    return auth
}

async function getGoogleCalendarEvents() {
    const auth = await getAuthorizedClient()

    const calendar = google.calendar({ version: 'v3', auth })

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
    // const todos = await getNotionTodos()
    const events = await getGoogleCalendarEvents()
    console.log(events)
}

main()

