export interface DailyJob {
  id: string
  name: string
  icon: string
  isCompleted: boolean
}

export interface EmailPreview {
  subject: string
  html: string
  sentAt?: string
}

export interface Schedule {
  nextEmailTime: string
  timezone: string
  isSkipped: boolean
  skipUntil?: string
}

export interface SsmParameter {
  key: string
  value: string
  isSecret: boolean
}
