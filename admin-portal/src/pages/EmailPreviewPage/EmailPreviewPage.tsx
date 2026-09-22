import type { FC } from "react"
import { useState } from "react"
import Icon from "../../components/Icon"

export interface EmailPreviewPageProps {
  email: string
  isSendingEmail: boolean
  onSendNow: () => void
  nextEmailTime: string
  timezone: string
  scheduleEnabled: boolean
  hour: number
  minute: number
  isTogglingSchedule: boolean
  isSettingTime: boolean
  onToggleSchedule: (enabled: boolean) => void
  onSetTime: (hour: number, minute: number) => void
}

const toTimeValue = (hour: number, minute: number): string =>
  `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`

const EmailPreviewPage: FC<EmailPreviewPageProps> = ({
  email,
  isSendingEmail,
  onSendNow,
  nextEmailTime,
  timezone,
  scheduleEnabled,
  hour,
  minute,
  isTogglingSchedule,
  isSettingTime,
  onToggleSchedule,
  onSetTime,
}) => {
  const serverValue = toTimeValue(hour, minute)
  const [timeValue, setTimeValue] = useState(serverValue)
  const [lastServerValue, setLastServerValue] = useState(serverValue)

  // Adjust local state during render when the server value changes (no effect needed)
  if (serverValue !== lastServerValue) {
    setLastServerValue(serverValue)
    setTimeValue(serverValue)
  }

  const isDirty = timeValue !== serverValue

  const handleSaveTime = () => {
    const [h, m] = timeValue.split(":").map(Number)
    if (Number.isInteger(h) && Number.isInteger(m)) {
      onSetTime(h, m)
    }
  }

  const formattedNext = new Date(nextEmailTime).toLocaleString("en-NZ", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="flex flex-col sm:h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] sm:overflow-hidden space-y-4">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Icon name="email" />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Email Preview</h1>
            <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              <Icon name={scheduleEnabled ? "clock" : "pause"} className="text-xs shrink-0" />
              <span>{scheduleEnabled ? `Next: ${formattedNext} (${timezone})` : "Scheduled sending is paused"}</span>
            </p>
          </div>
        </div>
        <button
          onClick={onSendNow}
          disabled={isSendingEmail}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 self-start"
        >
          <Icon name={isSendingEmail ? "spinner" : "send"} className="text-xs" spin={isSendingEmail} />
          {isSendingEmail ? "Sending…" : "Send now"}
        </button>
      </div>

      {/* Schedule card */}
      <div className="shrink-0 rounded-2xl border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
        {/* Enable / disable */}
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Daily scheduled email</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {scheduleEnabled ? "Sending automatically every day" : "Automatic sending is turned off"}
            </p>
          </div>
          <button
            role="switch"
            aria-checked={scheduleEnabled}
            aria-label="Toggle daily scheduled email"
            disabled={isTogglingSchedule}
            onClick={() => onToggleSchedule(!scheduleEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              scheduleEnabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                scheduleEnabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Send time */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Send time</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {timezone} · may shift by an hour across daylight saving
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              disabled={isSettingTime}
              className="h-10 px-3 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            {isDirty && (
              <button
                onClick={handleSaveTime}
                disabled={isSettingTime}
                className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name={isSettingTime ? "spinner" : "check"} className="text-xs" spin={isSettingTime} />
                Save
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview card */}
      <div className="flex flex-col min-h-[70vh] sm:min-h-0 flex-1 rounded-2xl border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <span className="h-9 w-9 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-500 dark:text-amber-400">
            <Icon name="sun" className="text-sm" />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Good morning!</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Daily briefing</p>
          </div>
        </div>
        <div
          className="p-5 bg-slate-50 dark:bg-slate-900 overflow-auto min-h-0 flex-1"
          dangerouslySetInnerHTML={{ __html: email }}
        />
      </div>
    </div>
  )
}

export default EmailPreviewPage
