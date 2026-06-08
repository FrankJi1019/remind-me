import type { FC } from "react"
import StandardContainer from "../../containers/StandardContainer"

export interface EmailPreviewPageProps {
  email: string
  isSendingEmail: boolean
  onSendNow: () => void
  nextEmailTime: string
  timezone: string
}

const EmailPreviewPage: FC<EmailPreviewPageProps> = ({ email, isSendingEmail, onSendNow, nextEmailTime, timezone }) => {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-6rem)] overflow-hidden">
      <StandardContainer className="mb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Email Preview</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Next: {new Date(nextEmailTime).toLocaleString("en-NZ", {
                weekday: "short", month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit",
              })} ({timezone})
            </p>
          </div>
          <button
            onClick={onSendNow}
            disabled={isSendingEmail}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSendingEmail ? "Sending…" : "Send Now"}
          </button>
        </div>
      </StandardContainer>

      <StandardContainer className="flex flex-col min-h-0 flex-1">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-sm">☀️</div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Good morning!</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Daily briefing</p>
          </div>
        </div>
        <div
          className="border border-slate-100 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900 overflow-auto min-h-0 flex-1"
          dangerouslySetInnerHTML={{ __html: email }}
        />
      </StandardContainer>
    </div>
  )
}

export default EmailPreviewPage
