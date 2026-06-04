import type { DailyTask } from "../types/domain"
import apiClient from "./axios"
import { useMutation, useQuery } from "@tanstack/react-query"

export const useFetchDailyTasks = () => {
  const query = useQuery({
    queryKey: ['all-daily-tasks'],
    queryFn: async () => {
      const { data } = await apiClient.get("tasks")
      const tasks: Array<DailyTask> = data.Items.map((item: any) => ({
        id: item.id,
        content: item.task,
        createdOn: new Date(item.fromDate),
        completionDates: item.completionDates.map((date: string) => new Date(date))
      }))
      return tasks
    }
  })

  return query
}

export const useCreateDailyTaskMutation = () => {
  const mutation = useMutation({
    mutationFn: async (task: string) => {
      const { data } = await apiClient.post("tasks", { task })
      return data
    }
  })
  return mutation
}

export const useToggleDailyTaskMutation = () => {
  const mutation = useMutation({
    mutationFn: async ({id, isTaskComplete}: {id: string, isTaskComplete: boolean}) => {
      const { data } = await apiClient.put(`tasks/${id}/complete`, {
        isComplete: isTaskComplete,
        datetime: new Date().toISOString()
      })
      return data
    }
  })
  return mutation
}

export const useDeleteDailyTaskMutation = () => {
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`tasks/${id}`)
      return data
    }
  })
  return mutation
}
