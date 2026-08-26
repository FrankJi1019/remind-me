import type { FC } from "react"
import { useCallback } from "react"
import EmailPreviewPage from "./EmailPreviewPage"
import PageLoader from "../../components/PageLoader"
import { useNotification } from "../../providers/NotificationProvider"
import {
  useFetchEmailPreview,
  useSendEmailMutation,
  useFetchEmailScheduleStatus,
  useToggleEmailScheduleMutation,
} from "../../api-hooks/email"
import { getNextEmailTime } from "../../utils/getNextEmailTime"

const TIMEZONE = "Pacific/Auckland"

const EmailPreviewPageBuilder: FC = () => {
  const notify = useNotification()
  const { data: email, isLoading } = useFetchEmailPreview()
  const { mutateAsync: sendEmail, isPending: isSendingEmail } = useSendEmailMutation()
  const { data: scheduleEnabled, isLoading: isLoadingSchedule } = useFetchEmailScheduleStatus()
  const { mutateAsync: toggleSchedule, isPending: isTogglingSchedule } = useToggleEmailScheduleMutation()

  const sendNowHandler = useCallback(async () => {
    await sendEmail()
    notify("Email sent successfully!", { type: "success" })
  }, [sendEmail, notify])

  const toggleScheduleHandler = useCallback(async (enabled: boolean) => {
    await toggleSchedule(enabled)
    notify(enabled ? "Scheduled email turned on" : "Scheduled email turned off", {
      type: enabled ? "success" : "info",
    })
  }, [toggleSchedule, notify])

  if (isLoading || isLoadingSchedule) return <PageLoader />

  return (
    <EmailPreviewPage
      email={email || ""}
      isSendingEmail={isSendingEmail}
      onSendNow={sendNowHandler}
      nextEmailTime={getNextEmailTime()}
      timezone={TIMEZONE}
      scheduleEnabled={scheduleEnabled ?? false}
      isTogglingSchedule={isTogglingSchedule}
      onToggleSchedule={(enabled) => { toggleScheduleHandler(enabled) }}
    />
  )
}

export default EmailPreviewPageBuilder
