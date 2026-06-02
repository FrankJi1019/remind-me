import type { FC } from "react"
import StandardContainer from "../../containers/StandardContainer"

export interface EmailPreviewPageProps {
  email: string
  isSendingEmail: boolean
  onSendNow: () => void
}

const EmailPreviewPage: FC<EmailPreviewPageProps> = ({ email, isSendingEmail, onSendNow }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Email Preview</h2>
        <button
          onClick={onSendNow}
          disabled={isSendingEmail}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSendingEmail ? "Sending…" : "Send Now"}
        </button>
      </div>

      <StandardContainer>
        <p className="text-sm text-slate-500 mb-2">Subject</p>
        <p className="text-sm font-medium text-slate-800 mb-4">Good morning! ☀️</p>
        <p className="text-sm text-slate-500 mb-2">Preview</p>
        <div
          className="border border-slate-200 rounded-md p-4 bg-slate-50"
          dangerouslySetInnerHTML={{ __html: email }}
        />
      </StandardContainer>
    </div>
  )
}

export default EmailPreviewPage
