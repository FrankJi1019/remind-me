import { useMutation, useQuery } from "@tanstack/react-query"
import apiClient from './axios'

export const useFetchSsmParameters = () => {
  const query = useQuery({
    queryKey: ['fetch-ssm-params'],
    queryFn: async () => {
      console.log(123)
      const { data } = await apiClient.get('settings')
      return data
    }
  })

  return query
}

export const useUpdateSsmParameterMutation = () => {

  const mutation = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: string }) => {
      return await apiClient.put(`settings/${key}`, { value })
    }
  })

  return mutation
}
