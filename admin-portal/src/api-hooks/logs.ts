import { useQuery } from "@tanstack/react-query"
import apiClient from "./axios"
import type { EmailLogs } from "../types/domain"

export const useFetchEmailLogs = () => {
  const query = useQuery({
    queryKey: ['email-logs'],
    queryFn: async () => {
      const { data } = await apiClient.get<EmailLogs>("email/logs")
      return data
    }
  })

  return query
}
