import type { DailyJob, EmailPreview, Schedule, SsmParameter } from "../types/domain"

export const mockDailyJobs: DailyJob[] = [
  { id: "1", name: "Drink 8 glasses of water", icon: "💧", isCompleted: false },
  { id: "2", name: "30 minutes exercise", icon: "🏃", isCompleted: true },
  { id: "3", name: "Read for 20 minutes", icon: "📖", isCompleted: false },
  { id: "4", name: "Take vitamins", icon: "💊", isCompleted: true },
  { id: "5", name: "Meditate 10 minutes", icon: "🧘", isCompleted: false },
  { id: "6", name: "No social media before noon", icon: "📵", isCompleted: false },
]

export const mockEmailPreview: EmailPreview = {
  subject: "Good Morning ☀️ — Your Daily Briefing",
  html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
    <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:32px;border-radius:8px 8px 0 0">
      <h1 style="color:white;margin:0">Good Morning ☀️</h1>
      <p style="color:#e0e0e0;margin:8px 0 0">Tuesday, 2 June 2026</p>
    </div>
    <div style="padding:24px;background:#fff;border:1px solid #eee">
      <h2 style="color:#333">📅 Upcoming Events</h2>
      <ul>
        <li><strong>10:00 AM</strong> — Team standup</li>
        <li><strong>2:00 PM</strong> — Design review</li>
        <li><strong>4:30 PM</strong> — 1:1 with manager</li>
      </ul>
      <h2 style="color:#333">✅ Active Todos</h2>
      <ul>
        <li>🔴 Complete quarterly report — <em>已过期2天</em></li>
        <li>🟡 Review PR #142 — <em>明天</em></li>
        <li>🟢 Update documentation — <em>3 days left</em></li>
      </ul>
    </div>
  </div>`,
}

export const mockSchedule: Schedule = {
  nextEmailTime: "2026-06-03T07:00:00+12:00",
  timezone: "Pacific/Auckland",
  isSkipped: false,
}

export const mockSsmParameters: SsmParameter[] = [
  { key: "/remind-me/GOOGLE_CLIENT_ID", value: "123456789.apps.googleusercontent.com", isSecret: false },
  { key: "/remind-me/GOOGLE_CLIENT_SECRET", value: "ksf5hf****nbfdks", isSecret: true },
  { key: "/remind-me/GOOGLE_REFRESH_TOKEN", value: "1//04x****9dkWs", isSecret: true },
  { key: "/remind-me/NOTION_API_KEY", value: "ntn_5j****kL9m2", isSecret: true },
  { key: "/remind-me/TODO_DATA_SOURCE_ID", value: "abc123def456", isSecret: false },
  { key: "/remind-me/FROM_EMAIL", value: "briefing@example.com", isSecret: false },
  { key: "/remind-me/TO_EMAIL", value: "frank@example.com", isSecret: false },
]
