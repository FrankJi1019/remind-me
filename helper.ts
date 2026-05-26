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

    // Sort by: overdue first, then by due date ascending, no-date last
    const filteredTodos = todos
        .sort((a, b) => {
            if (!a.dueDate && !b.dueDate) return 0
            if (!a.dueDate) return 1
            if (!b.dueDate) return -1
            return a.dueDate.localeCompare(b.dueDate)
        })

    const todosHtml = filteredTodos.length
        ? filteredTodos.map(t => `
            <tr data-category="${t.category || ''}" data-status="${t.status || ''}" data-due="${t.dueDate || '9999-12-31'}" data-created="${t.createdOn}">
                <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${t.icon} ${t.task}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">
                    <span style="background:${badgeColor(t.categoryColor)};color:${badgeTextColor(t.categoryColor)};padding:2px 8px;border-radius:12px;font-size:12px;">${t.category || '—'}</span>
                </td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">
                    <span style="background:${badgeColor(t.statusColor)};color:${badgeTextColor(t.statusColor)};padding:2px 8px;border-radius:12px;font-size:12px;">${t.status}</span>
                </td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${formatDueDate(t.dueDate)}</td>
            </tr>`).join('')
        : '<tr><td colspan="4" style="padding:12px;font-size:14px;color:#6b7280;">所有任务已完成 ✅</td></tr>'

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px;">
        <tr><td align="center">
            <table width="700" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <tr><td style="background:linear-gradient(135deg,#667eea,#764ba2);padding:24px 32px;">
                    <h1 style="margin:0;color:#fff;font-size:22px;">☀️ Good Morning! 今日简报</h1>
                    <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${today}</p>
                </td></tr>
                <tr><td style="padding:24px 32px;">
                    <h2 style="margin:0 0 12px;font-size:16px;color:#374151;">📅 接下来的日程 Upcoming Events</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                        <tr style="background:#f9fafb;">
                            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">Event</th>
                            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">日期</th>
                            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">时间</th>
                        </tr>
                        ${eventsHtml}
                    </table>
                </td></tr>
                <tr><td style="padding:0 32px 24px;">
                    <h2 style="margin:0 0 12px;font-size:16px;color:#374151;">✏️ 待办事项 TODOs</h2>
                    <div style="margin-bottom:8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                        <span style="font-size:11px;color:#9ca3af;">分类</span>
                        ${[...new Set(filteredTodos.map(t => t.category).filter(Boolean))].map(cat => {
                            const t = filteredTodos.find(x => x.category === cat)!
                            return `<button class="filter-btn" onclick="setFilter('category','${cat}')" data-filter="category" data-value="${cat}" data-bg="${badgeColor(t.categoryColor)}" data-color="${badgeTextColor(t.categoryColor)}" style="border:1px solid #e5e7eb;background:${badgeColor(t.categoryColor)};color:${badgeTextColor(t.categoryColor)};padding:3px 10px;border-radius:12px;font-size:12px;cursor:pointer;">${cat}</button>`
                        }).join('')}
                        <span style="font-size:11px;color:#9ca3af;margin-left:12px;">状态</span>
                        ${[...new Set(filteredTodos.map(t => t.status).filter(Boolean))].map(st => {
                            const t = filteredTodos.find(x => x.status === st)!
                            return `<button class="filter-btn" onclick="setFilter('status','${st}')" data-filter="status" data-value="${st}" data-bg="${badgeColor(t.statusColor)}" data-color="${badgeTextColor(t.statusColor)}" style="border:1px solid #e5e7eb;background:${badgeColor(t.statusColor)};color:${badgeTextColor(t.statusColor)};padding:3px 10px;border-radius:12px;font-size:12px;cursor:pointer;">${st}</button>`
                        }).join('')}
                    </div>
                    <div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">
                        <div style="display:flex;align-items:center;gap:6px;">
                            <span style="font-size:11px;color:#9ca3af;">排序</span>
                            <button class="filter-btn" onclick="sortTodos('due')" data-filter="sort" data-value="due" style="border:1px solid #e5e7eb;background:#fff;padding:3px 10px;border-radius:12px;font-size:12px;cursor:pointer;">截止日期</button>
                            <button class="filter-btn" onclick="sortTodos('category')" data-filter="sort" data-value="category" style="border:1px solid #e5e7eb;background:#fff;padding:3px 10px;border-radius:12px;font-size:12px;cursor:pointer;">分类</button>
                            <button class="filter-btn" onclick="sortTodos('status')" data-filter="sort" data-value="status" style="border:1px solid #e5e7eb;background:#fff;padding:3px 10px;border-radius:12px;font-size:12px;cursor:pointer;">状态</button>
                        </div>
                        <div onclick="toggleHideDone()" style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;color:#6b7280;user-select:none;">
                            <span id="hide-done-switch" style="pointer-events:none;width:32px;height:18px;background:#e5e7eb;border-radius:9px;position:relative;display:inline-block;transition:background 0.2s;">
                                <span id="hide-done-knob" style="pointer-events:none;position:absolute;top:2px;left:2px;width:14px;height:14px;background:#fff;border-radius:50%;transition:transform 0.2s;box-shadow:0 1px 2px rgba(0,0,0,0.15);"></span>
                            </span>
                            <span style="pointer-events:none;">隐藏已完成</span>
                        </div>
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;" id="todo-table">
                        <tr style="background:#f9fafb;">
                            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">Task</th>
                            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">分类</th>
                            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">Status</th>
                            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">截止日期</th>
                        </tr>
                        ${todosHtml}
                    </table>
                </td></tr>
                <tr><td style="padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;">加油，今天也要元气满满！🚀</p>
                </td></tr>
            </table>
        </td></tr>
    </table>
    <style>
        .filter-btn { transition: transform 0.1s, box-shadow 0.1s, filter 0.1s; }
        .filter-btn:hover { transform: translateY(-1px); filter: brightness(0.9); box-shadow: 0 2px 4px rgba(0,0,0,0.12); }
        .filter-btn.active { box-shadow: inset 0 0 0 2px currentColor; filter: brightness(0.85); font-weight: 600; }
    </style>
    <script>
        var filters = { category: '', status: '', hideDone: false };
        function setFilter(type, value) {
            if (filters[type] === value) {
                filters[type] = '';
            } else {
                filters[type] = value;
            }
            document.querySelectorAll('.filter-btn[data-filter="'+type+'"]').forEach(function(btn) {
                btn.classList.toggle('active', btn.getAttribute('data-value') === filters[type]);
            });
            applyFilters();
        }
        function toggleHideDone() {
            filters.hideDone = !filters.hideDone;
            document.getElementById('hide-done-switch').style.background = filters.hideDone ? '#667eea' : '#e5e7eb';
            document.getElementById('hide-done-knob').style.transform = filters.hideDone ? 'translateX(14px)' : 'translateX(0)';
            if (filters.hideDone && filters.status.toLowerCase() === 'done') {
                filters.status = '';
                document.querySelectorAll('.filter-btn[data-filter="status"]').forEach(function(btn) {
                    btn.classList.remove('active');
                });
            }
            applyFilters();
        }
        function applyFilters() {
            document.querySelectorAll('#todo-table tr[data-category]').forEach(function(row) {
                var catMatch = !filters.category || row.getAttribute('data-category') === filters.category;
                var statusMatch = !filters.status || row.getAttribute('data-status') === filters.status;
                var st = (row.getAttribute('data-status') || '').toLowerCase();
                var doneMatch = !filters.hideDone || (st !== 'done' && st !== 'completed' && st !== '完成');
                row.style.display = (catMatch && statusMatch && doneMatch) ? '' : 'none';
            });
        }
        var currentSort = '';
        var originalOrder = [];
        function sortTodos(key) {
            var table = document.getElementById('todo-table');
            var rows = Array.from(table.querySelectorAll('tr[data-category]'));
            if (!originalOrder.length) originalOrder = rows.slice();
            if (currentSort === key) {
                currentSort = '';
                originalOrder.forEach(function(row) { table.appendChild(row); });
            } else {
                currentSort = key;
                var statusOrder = { 'TODO': 0, 'DOING': 1, 'DONE': 2 };
                rows.sort(function(a, b) {
                    if (key === 'status') {
                        var as = statusOrder[a.getAttribute('data-status')] ?? 99;
                        var bs = statusOrder[b.getAttribute('data-status')] ?? 99;
                        return as - bs;
                    }
                    var av = a.getAttribute('data-' + key) || '';
                    var bv = b.getAttribute('data-' + key) || '';
                    return av.localeCompare(bv);
                });
                rows.forEach(function(row) { table.appendChild(row); });
            }
            document.querySelectorAll('.filter-btn[data-filter="sort"]').forEach(function(btn) {
                btn.classList.toggle('active', btn.getAttribute('data-value') === currentSort);
            });
        }
    </script>
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

