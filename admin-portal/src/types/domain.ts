export interface DailyTask {
  id: string
  content: string
  createdOn: Date
  completionDates: Array<Date>
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
}
