import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import apiClient from "./axios"
import type { EmailTemplates } from "../types/domain"

const TEMPLATE_KEY = ['email-template']

export const useFetchEmailTemplates = () => {
  const query = useQuery({
    queryKey: TEMPLATE_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<EmailTemplates>("email/template")
      return data
    }
  })

  return query
}

export const useSelectEmailTemplateMutation = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (selected: string) => {
      const { data } = await apiClient.put<{ selected: string }>("email/template", { selected })
      return data.selected
    },
    onSuccess: (selected) => {
      // Keep the fetched template list, just update the applied selection.
      queryClient.setQueryData<EmailTemplates>(TEMPLATE_KEY, (prev) =>
        prev ? { ...prev, selected } : prev
      )
      // The Email page preview renders the selected template, so refresh it.
      queryClient.invalidateQueries({ queryKey: ['email-preview'] })
    }
  })

  return mutation
}
