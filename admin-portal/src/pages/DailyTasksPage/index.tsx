import { useCallback, useMemo, type FC } from "react"
import DailyTasksPage from "./DailyTasksPage"
import { useNotification } from "../../providers/NotificationProvider"
import { useCreateDailyTaskMutation, useDeleteDailyTaskMutation, useFetchDailyTasks, useToggleDailyTaskMutation } from "../../api-hooks/dailyTasks"
import PageLoader from "../../components/PageLoader"

const DailyTasksPageBuilder: FC = () => {
  const notify = useNotification()

  const { data: tasks, refetch: fetchTasks } = useFetchDailyTasks()
  const createTaskMutation = useCreateDailyTaskMutation()
  const deleteTaskMutation = useDeleteDailyTaskMutation()
  const completeTaskMutation = useToggleDailyTaskMutation()

  const isLoading = useMemo(() => {
    return !tasks
  }, [tasks])

  const createNewTask = useCallback(async (task: string) => {
    await createTaskMutation.mutateAsync(task)
    await fetchTasks()
    notify("Daily task completed", {type: "success"})
  }, [createTaskMutation, notify])

  const completeTask = useCallback(async (id: string) => {
    await completeTaskMutation.mutateAsync(id)
    await fetchTasks()
    notify("Daily task completed", {type: "success"})
  }, [completeTaskMutation, notify])

  const deleteTask = useCallback(async (id: string) => {
    await deleteTaskMutation.mutateAsync(id)
    await fetchTasks()
    notify("Daily task deleted", {type: "error"})
  }, [deleteTaskMutation, notify])

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <DailyTasksPage
      tasks={tasks}
      completedCount={0}
      onAdd={(task) => { createNewTask(task) }}
      onToggleComplete={(id) => { completeTask(id) }}
      onDelete={(id) => { deleteTask(id) }}
    />
  )
}

export default DailyTasksPageBuilder
