// Mock data used to preview email templates on the Themes page.
// Shape mirrors the TemplateData produced by the assemble-email Lambda so the
// same Handlebars templates render faithfully — without touching live data.

export const mockTemplateData = {
  today: "Monday, 1 January 2035",
  subjectDate: "1月1日 周一",
  eventCount: 3,
  todoCount: 3,
  events: [
    { summary: "Team stand-up", dateLabel: "1月1日（周一）", timeLabel: "09:00 – 09:15" },
    { summary: "Dentist appointment", dateLabel: "1月3日（周三）", timeLabel: "14:30" },
    { summary: "Flight to Wellington", dateLabel: "1月5日（周五）", timeLabel: "全天" },
  ],
  todos: [
    {
      icon: "📝",
      task: "Finish the quarterly report",
      dueHtml:
        '<div style="margin-top:3px;padding-left:1.5em;font-size:12px;color:#6b7280;">1月1日 <span style="color:#f59e0b;font-weight:500;">(今天)</span></div>',
      dueLabel: "1月1日 (今天)",
      categoryLabel: "Work",
      categoryBg: "#dbeafe",
      categoryText: "#1e40af",
      statusLabel: "In Progress",
      statusBg: "#fef9c3",
      statusText: "#854d0e",
    },
    {
      icon: "🛒",
      task: "Buy groceries for the week",
      dueHtml:
        '<div style="margin-top:3px;padding-left:1.5em;font-size:12px;color:#6b7280;">1月2日 <span style="color:#6b7280;font-weight:500;">(明天)</span></div>',
      dueLabel: "1月2日 (明天)",
      categoryLabel: "Home",
      categoryBg: "#dcfce7",
      categoryText: "#166534",
      statusLabel: "To Do",
      statusBg: "#f3f4f6",
      statusText: "#374151",
    },
    {
      icon: "📞",
      task: "Call the insurance company",
      dueHtml: "",
      dueLabel: "",
      categoryLabel: "Personal",
      categoryBg: "#f3e8ff",
      categoryText: "#6b21a8",
      statusLabel: "To Do",
      statusBg: "#f3f4f6",
      statusText: "#374151",
    },
  ],
}
