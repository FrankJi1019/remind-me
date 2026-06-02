import { useMutation, useQuery } from "@tanstack/react-query"
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
