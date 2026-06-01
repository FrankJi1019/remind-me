import type { FC } from "react"
import { useMemo } from "react"
import DailyJobsPage from "./DailyJobsPage"
import { useNotification } from "../../providers/NotificationProvider"
import {
  useFetchDailyJobs,
  useToggleDailyJobMutation,
  useCreateDailyJobMutation,
  useDeleteDailyJobMutation,
} from "../../api-hooks/dailyJobs"

const DailyJobsPageBuilder: FC = () => {
  const notify = useNotification()
  const { data: jobs, setData } = useFetchDailyJobs()
  const { mutate: toggleJob } = useToggleDailyJobMutation(setData)
  const { mutate: createJob } = useCreateDailyJobMutation(setData)
  const { mutate: deleteJob } = useDeleteDailyJobMutation(setData)

  const completedCount = useMemo(() => jobs.filter((j) => j.isCompleted).length, [jobs])

  return (
    <DailyJobsPage
      jobs={jobs}
      completedCount={completedCount}
      onToggleComplete={(id) => { toggleJob(id); }}
      onAdd={(job) => { createJob(job); notify("Habit added", { type: "success" }); }}
      onDelete={(id) => { deleteJob(id); notify("Habit removed", { type: "success" }); }}
    />
  )
}

export default DailyJobsPageBuilder
