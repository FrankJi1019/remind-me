export interface EmailPreview {
  subject: string
  html: string
  sentAt?: string
}

export interface SsmParameter {
  key: string
  value: string
}

export interface EmailSchedule {
  enabled: boolean
  hour: number
  minute: number
  timezone: string
}

export interface EmailTemplateOption {
  id: string
  name: string
  description: string
  subject?: string
  html?: string
}

export interface EmailTemplates {
  templates: EmailTemplateOption[]
  selected: string
}

export interface DailyActivityPoint {
  date: string
  sent: number
  errors: number
  status: "success" | "failed" | "norun"
}

export interface EmailStats {
  totalSent: number
  totalErrors: number
  avgDurationMs: number | null
  lastSent: string | null
  lastError: string | null
  daysTracked: number
  daily: DailyActivityPoint[]
}

export type RunStatus = "success" | "error" | "running"

export interface RunLogLine {
  timestamp: number
  message: string
}

export interface EmailRun {
  requestId: string
  startedAt: number | null
  endedAt: number | null
  durationMs: number | null
  billedDurationMs: number | null
  maxMemoryUsedMb: number | null
  memorySizeMb: number | null
  initDurationMs: number | null
  status: RunStatus
  messages: RunLogLine[]
}

export interface EmailLogs {
  logGroup: string
  daysTracked: number
  runs: EmailRun[]
}
