import type { FC } from "react"
import { useCallback } from "react"
import EmailPreviewPage from "./EmailPreviewPage"
import PageLoader from "../../components/PageLoader"
import { useNotification } from "../../providers/NotificationProvider"
import {
  useFetchEmailPreview,
  useSendEmailMutation,
  useFetchEmailSchedule,
  useToggleEmailScheduleMutation,
  useSetEmailTimeMutation,
} from "../../api-hooks/email"
import { getNextEmailTime } from "../../utils/getNextEmailTime"

const EmailPreviewPageBuilder: FC = () => {
  const notify = useNotification()
  const { data: email, isLoading } = useFetchEmailPreview()
  const { mutateAsync: sendEmail, isPending: isSendingEmail } = useSendEmailMutation()
  const { data: schedule, isLoading: isLoadingSchedule } = useFetchEmailSchedule()
  const { mutateAsync: toggleSchedule, isPending: isTogglingSchedule } = useToggleEmailScheduleMutation()
  const { mutateAsync: setTime, isPending: isSettingTime } = useSetEmailTimeMutation()

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

  const setTimeHandler = useCallback(async (hour: number, minute: number) => {
    await setTime({ hour, minute })
    const label = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
    notify(`Send time updated to ${label}`, { type: "success" })
  }, [setTime, notify])

  if (isLoading || isLoadingSchedule || !schedule) return <PageLoader />

  return (
    <EmailPreviewPage
      email={email || ""}
      isSendingEmail={isSendingEmail}
      onSendNow={sendNowHandler}
      nextEmailTime={getNextEmailTime(schedule.hour, schedule.minute)}
      timezone={schedule.timezone}
      scheduleEnabled={schedule.enabled}
      hour={schedule.hour}
      minute={schedule.minute}
      isTogglingSchedule={isTogglingSchedule}
      isSettingTime={isSettingTime}
      onToggleSchedule={(enabled) => { toggleScheduleHandler(enabled) }}
      onSetTime={(hour, minute) => { setTimeHandler(hour, minute) }}
    />
  )
}

export default EmailPreviewPageBuilder
