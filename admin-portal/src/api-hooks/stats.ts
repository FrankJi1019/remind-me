import { useQuery } from "@tanstack/react-query"
import apiClient from "./axios"
import type { EmailStats } from "../types/domain"

export const useFetchEmailStats = () => {
  const query = useQuery({
    queryKey: ['email-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get<EmailStats>("email/stats")
      return data
    }
  })

  return query
}
