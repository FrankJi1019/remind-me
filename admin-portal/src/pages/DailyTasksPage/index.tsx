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
  }, [createTaskMutation, fetchTasks, notify])

  const completeTask = useCallback(async (id: string, isTaskComplete = true) => {
    await completeTaskMutation.mutateAsync({id, isTaskComplete})
    await fetchTasks()
  }, [completeTaskMutation, fetchTasks, notify])

  const deleteTask = useCallback(async (id: string) => {
    await deleteTaskMutation.mutateAsync(id)
    await fetchTasks()
    notify("Daily task deleted", {type: "error"})
  }, [deleteTaskMutation, fetchTasks, notify])

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <DailyTasksPage
      tasks={tasks}
      onAdd={(task) => { createNewTask(task) }}
      onToggleComplete={(id, isCompleted) => { completeTask(id, isCompleted) }}
      onDelete={(id) => { deleteTask(id) }}
    />
  )
}

export default DailyTasksPageBuilder
