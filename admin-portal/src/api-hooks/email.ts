import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import apiClient from "./axios"

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

export const useFetchEmailScheduleStatus = () => {

  const query = useQuery({
    queryKey: ['email-schedule-status'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ enabled: boolean }>("email/schedule")
      return data.enabled
    }
  })

  return query
}

export const useToggleEmailScheduleMutation = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data } = await apiClient.put<{ enabled: boolean }>("email/schedule", { enabled })
      return data.enabled
    },
    onSuccess: (enabled) => {
      queryClient.setQueryData(['email-schedule-status'], enabled)
    }
  })

  return mutation
}
