import type { FC } from "react"
import { useCallback } from "react"
import SchedulePage from "./SchedulePage"
import { useNotification } from "../../providers/NotificationProvider"
import {
  useFetchSchedule,
  useSkipNextMutation,
  useSkipUntilMutation,
  useResumeMutation,
} from "../../api-hooks/schedule"

const SchedulePageBuilder: FC = () => {
  const notify = useNotification()
  const { data: schedule, setData } = useFetchSchedule()
  const { mutate: skipNext } = useSkipNextMutation(setData)
  const { mutate: skipUntil } = useSkipUntilMutation(setData)
  const { mutate: resume } = useResumeMutation(setData)

  const skipNextHandler = useCallback(() => {
    skipNext()
    notify("Next email will be skipped", { type: "info" })
  }, [skipNext, notify])

  const skipUntilHandler = useCallback((date: string) => {
    skipUntil(date)
    notify(`Emails skipped until ${new Date(date).toLocaleDateString()}`, { type: "info" })
  }, [skipUntil, notify])

  const resumeHandler = useCallback(() => {
    resume()
    notify("Schedule resumed", { type: "success" })
  }, [resume, notify])

  return (
    <SchedulePage
      schedule={schedule}
      onSkipNext={skipNextHandler}
      onSkipUntil={skipUntilHandler}
      onResume={resumeHandler}
    />
  )
}

export default SchedulePageBuilder
