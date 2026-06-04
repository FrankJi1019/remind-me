import type { FC } from "react"
import { useCallback } from "react"
import EmailPreviewPage from "./EmailPreviewPage"
import PageLoader from "../../components/PageLoader"
import { useNotification } from "../../providers/NotificationProvider"
import { useFetchEmailPreview, useSendEmailMutation } from "../../api-hooks/email"
import { mockSchedule } from "../../utils/mockData"

const EmailPreviewPageBuilder: FC = () => {
  const notify = useNotification()
  const { data: email, isLoading } = useFetchEmailPreview()
  const { mutateAsync: sendEmail, isPending: isSendingEmail } = useSendEmailMutation()

  const sendNowHandler = useCallback(async () => {
    await sendEmail()
    notify("Email sent successfully!", { type: "success" })
  }, [sendEmail, notify])

  if (isLoading) return <PageLoader />

  return (
    <EmailPreviewPage
      email={email || ""}
      isSendingEmail={isSendingEmail}
      onSendNow={sendNowHandler}
      nextEmailTime={mockSchedule.nextEmailTime}
      timezone={mockSchedule.timezone}
    />
  )
}

export default EmailPreviewPageBuilder
