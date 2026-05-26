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

async function getContentData(): Promise<string> {
    const todos = await getNotionTodos()
    const events = await getGoogleCalendarEvents()

    const now = new Date()
    const today = now.toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    const formatEventDate = (dateStr: string) => {
        const d = new Date(dateStr)
        const month = d.getMonth() + 1
        const day = d.getDate()
        const weekday = d.toLocaleDateString('zh-CN', { weekday: 'long' })
        return `${month}月${day}日（${weekday}）`
    }

    const formatTime = (dateStr: string) => {
        if (!dateStr.includes('T')) return '全天'
        return new Date(dateStr).toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', hour12: false })
    }

    const formatDueDate = (dateStr: string) => {
        if (!dateStr) return '—'
        const [y, m, d] = dateStr.split('-').map(Number)
        const due = new Date(y, m - 1, d)
        const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const diffDays = Math.round((due.getTime() - todayLocal.getTime()) / (1000 * 60 * 60 * 24))
        const dateCn = `${m}月${d}日`
        let relative = ''
        if (diffDays === 0) relative = '今天'
        else if (diffDays === 1) relative = '明天'
        else if (diffDays === -1) relative = '昨天'
        else if (diffDays > 1) relative = `${diffDays}天后`
        else relative = `已过期${Math.abs(diffDays)}天`
        const color = diffDays < 0 ? '#ef4444' : diffDays === 0 ? '#f59e0b' : '#6b7280'
        return `${dateCn} <span style="color:${color};font-weight:500;">(${relative})</span>`
    }

    const badgeColor = (color: string) => {
        const map: Record<string, string> = {
            red: '#fee2e2', orange: '#ffedd5', yellow: '#fef9c3', green: '#dcfce7',
            blue: '#dbeafe', purple: '#f3e8ff', pink: '#fce7f3', gray: '#f3f4f6', default: '#f3f4f6'
        }
        return map[color] || map.default
    }

    const badgeTextColor = (color: string) => {
        const map: Record<string, string> = {
            red: '#991b1b', orange: '#9a3412', yellow: '#854d0e', green: '#166534',
            blue: '#1e40af', purple: '#6b21a8', pink: '#9d174d', gray: '#374151', default: '#374151'
        }
        return map[color] || map.default
    }

    // Events HTML
    const eventsHtml = events.length
        ? events.map(e => `
            <tr>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${e.summary}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;white-space:nowrap;">${formatEventDate(e.start)}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;white-space:nowrap;">${formatTime(e.start)}${e.end && e.start.includes('T') ? ' – ' + formatTime(e.end) : ''}</td>
            </tr>`).join('')
        : '<tr><td colspan="3" style="padding:12px;font-size:14px;color:#6b7280;">最近没有活动 — 享受自由时间吧! 🎉</td></tr>'

    // Sort by: due date ascending (no-date last), then category, then newest first
    const filteredTodos = todos
        .sort((a, b) => {
            const aDue = a.dueDate || '9999-12-31'
            const bDue = b.dueDate || '9999-12-31'
            if (aDue !== bDue) return aDue.localeCompare(bDue)
            if (a.category !== b.category) return (a.category || '').localeCompare(b.category || '')
            return b.createdOn.localeCompare(a.createdOn)
        })

    // Filter out done items server-side since we can't do it client-side
    const activeTodos = filteredTodos.filter(t => t.status !== 'DONE' && t.status !== 'Done' && t.status !== 'Completed')
    const doneTodos = filteredTodos.filter(t => t.status === 'DONE' || t.status === 'Done' || t.status === 'Completed')

    const todoRowHtml = (t: typeof filteredTodos[0]) => `
        <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;">${t.icon} ${t.task}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;">
                <span style="background:${badgeColor(t.categoryColor)};color:${badgeTextColor(t.categoryColor)};padding:2px 8px;border-radius:12px;font-size:11px;">${t.category || '—'}</span>
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;">
                <span style="background:${badgeColor(t.statusColor)};color:${badgeTextColor(t.statusColor)};padding:2px 8px;border-radius:12px;font-size:11px;">${t.status}</span>
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;">${formatDueDate(t.dueDate)}</td>
        </tr>`

    const activeTodosHtml = activeTodos.length
        ? activeTodos.map(todoRowHtml).join('')
        : '<tr><td colspan="4" style="padding:12px;font-size:14px;color:#6b7280;">所有任务已完成 ✅</td></tr>'

    const doneTodosHtml = doneTodos.length
        ? doneTodos.map(todoRowHtml).join('')
        : ''

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @media only screen and (max-width: 600px) {
            .outer-pad { padding: 8px !important; }
            .main-card { border-radius: 8px !important; }
            .card-header { padding: 18px 16px !important; }
            .card-header h1 { font-size: 18px !important; }
            .card-section { padding: 16px !important; }
            .card-section-bottom { padding: 0 16px 16px !important; }
            .data-table td, .data-table th { padding: 8px 6px !important; font-size: 13px !important; }
        }
    </style>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" class="outer-pad" style="padding:24px;">
        <tr><td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" class="main-card" style="max-width:700px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <tr><td class="card-header" style="background:linear-gradient(135deg,#667eea,#764ba2);padding:24px 32px;">
                    <h1 style="margin:0;color:#fff;font-size:22px;">☀️ Good Morning! 今日简报</h1>
                    <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${today}</p>
                </td></tr>
                <tr><td class="card-section" style="padding:24px 32px;">
                    <h2 style="margin:0 0 12px;font-size:16px;color:#374151;">📅 接下来的日程 Upcoming Events</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" class="data-table" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                        <tr style="background:#f9fafb;">
                            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">Event</th>
                            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">日期</th>
                            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">时间</th>
                        </tr>
                        ${eventsHtml}
                    </table>
                </td></tr>
                <tr><td class="card-section-bottom" style="padding:0 32px 24px;">
                    <h2 style="margin:0 0 12px;font-size:16px;color:#374151;">✏️ 待办事项 TODOs</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" class="data-table" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                        <tr style="background:#f9fafb;">
                            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">Task</th>
                            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">分类</th>
                            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">Status</th>
                            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">截止日期</th>
                        </tr>
                        ${activeTodosHtml}
                    </table>
                    ${doneTodos.length ? `
                    <h3 style="margin:16px 0 8px;font-size:13px;color:#9ca3af;font-weight:500;">✅ 已完成</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" class="data-table" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;opacity:0.6;">
                        ${doneTodosHtml}
                    </table>` : ''}
                </td></tr>
                <tr><td style="padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;">加油，今天也要元气满满！🚀</p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body>
</html>`
}

async function main() {

    // console.log(await getGoogleCalendarEvents())
    // console.log(await getNotionTodos())
    // return
    const html = await getContentData()
    console.log(html)
}

main()

