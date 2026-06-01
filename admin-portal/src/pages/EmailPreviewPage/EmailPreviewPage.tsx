import type { FC } from "react"
import StandardContainer from "../../containers/StandardContainer"
import type { EmailPreview } from "../../types/domain"

export interface EmailPreviewPageProps {
  email: EmailPreview
  onSendNow: () => void
}

const EmailPreviewPage: FC<EmailPreviewPageProps> = ({ email, onSendNow }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Email Preview</h2>
        <button
          onClick={onSendNow}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
        >
          Send Now
        </button>
      </div>

      <StandardContainer>
        <p className="text-sm text-slate-500 mb-2">Subject</p>
        <p className="text-sm font-medium text-slate-800 mb-4">{email.subject}</p>
        <p className="text-sm text-slate-500 mb-2">Preview</p>
        <div
          className="border border-slate-200 rounded-md p-4 bg-slate-50 overflow-auto max-h-[600px]"
          dangerouslySetInnerHTML={{ __html: email.html }}
        />
      </StandardContainer>
    </div>
  )
}

export default EmailPreviewPage
