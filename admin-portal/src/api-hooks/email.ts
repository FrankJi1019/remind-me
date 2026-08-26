import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import apiClient from "./axios"
import type { EmailSchedule } from "../types/domain"

const SCHEDULE_KEY = ['email-schedule']

export const useFetchEmailPreview = () => {

  const query = useQuery({
    queryKey: ['email-preview'],
    queryFn: async () => {
      const { data } = await apiClient.get("email/preview")
      return data
    }
  })

  return query
}

export const useSendEmailMutation = () => {

  const mutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('email/send')
    }
  })

  return mutation
}

export const useFetchEmailSchedule = () => {

  const query = useQuery({
    queryKey: SCHEDULE_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<EmailSchedule>("email/schedule")
      return data
    }
  })

  return query
}

export const useToggleEmailScheduleMutation = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data } = await apiClient.put<EmailSchedule>("email/schedule", { enabled })
      return data
    },
    onSuccess: (schedule) => {
      queryClient.setQueryData(SCHEDULE_KEY, schedule)
    }
  })

  return mutation
}

export const useSetEmailTimeMutation = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ hour, minute }: { hour: number; minute: number }) => {
      const { data } = await apiClient.put<EmailSchedule>("email/schedule", { hour, minute })
      return data
    },
    onSuccess: (schedule) => {
      queryClient.setQueryData(SCHEDULE_KEY, schedule)
    }
  })

  return mutation
}
