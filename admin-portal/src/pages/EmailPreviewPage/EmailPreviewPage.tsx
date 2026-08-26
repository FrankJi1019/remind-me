import type { FC } from "react"
import Icon from "../../components/Icon"

export interface EmailPreviewPageProps {
  email: string
  isSendingEmail: boolean
  onSendNow: () => void
  nextEmailTime: string
  timezone: string
}

const EmailPreviewPage: FC<EmailPreviewPageProps> = ({ email, isSendingEmail, onSendNow, nextEmailTime, timezone }) => {
  const formattedNext = new Date(nextEmailTime).toLocaleString("en-NZ", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] overflow-hidden space-y-4">
      {/* Heading */}
      <div className="flex items-start justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Icon name="email" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Email Preview</h1>
            <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              <Icon name="clock" className="text-xs" />
              <span>Next: {formattedNext} ({timezone})</span>
            </p>
          </div>
        </div>
        <button
          onClick={onSendNow}
          disabled={isSendingEmail}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Icon name={isSendingEmail ? "spinner" : "send"} className="text-xs" spin={isSendingEmail} />
          {isSendingEmail ? "Sending…" : "Send now"}
        </button>
      </div>

      {/* Preview card */}
      <div className="flex flex-col min-h-0 flex-1 rounded-2xl border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
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
