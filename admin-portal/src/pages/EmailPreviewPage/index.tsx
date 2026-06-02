import type { FC } from "react"
import { useCallback } from "react"
import EmailPreviewPage from "./EmailPreviewPage"
import { useNotification } from "../../providers/NotificationProvider"
import { useFetchEmailPreview, useSendEmailMutation } from "../../api-hooks/email"

const EmailPreviewPageBuilder: FC = () => {
  const notify = useNotification()
  const { data: email } = useFetchEmailPreview()
  const { mutateAsync: sendEmail, isPending: isSendingEmail } = useSendEmailMutation()

  const sendNowHandler = useCallback(async () => {
    await sendEmail()
    notify("Email sent successfully!", { type: "success" })
  }, [sendEmail, notify])

  return <EmailPreviewPage email={email || ""} isSendingEmail={isSendingEmail} onSendNow={sendNowHandler} />
}

export default EmailPreviewPageBuilder
