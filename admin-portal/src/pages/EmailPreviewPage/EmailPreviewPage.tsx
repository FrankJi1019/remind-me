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
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Email Preview</h2>
          <p className="text-sm text-slate-500 mt-1">
            Next email: {new Date(nextEmailTime).toLocaleString("en-NZ", {
              weekday: "long", month: "long", day: "numeric",
              hour: "2-digit", minute: "2-digit",
            })} ({timezone})
          </p>
        </div>
        <button
          onClick={onSendNow}
          disabled={isSendingEmail}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSendingEmail ? "Sending…" : "Send Now"}
        </button>
      </div>

      <StandardContainer className="flex flex-col min-h-0 flex-1">
        <p className="text-sm text-slate-500 mb-2 shrink-0">Subject</p>
        <p className="text-sm font-medium text-slate-800 mb-4 shrink-0">Good morning! ☀️</p>
        <p className="text-sm text-slate-500 mb-2 shrink-0">Preview</p>
        <div
          className="border border-slate-200 rounded-md p-4 bg-slate-50 overflow-auto min-h-0 flex-1"
          dangerouslySetInnerHTML={{ __html: email }}
        />
      </StandardContainer>
    </div>
  )
}

export default EmailPreviewPage
