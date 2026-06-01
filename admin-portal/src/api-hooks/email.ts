import { useCallback, useMemo } from "react"
import { mockEmailPreview } from "../utils/mockData"
import type { EmailPreview } from "../types/domain"

// TODO: Replace with @tanstack/react-query (v5)
// Use useQuery({ queryKey: ["email-preview"], queryFn: ... }) for preview fetch
// Use useMutation({ mutationFn: ... }) for send action

// TODO: Replace with real API call to fetch email preview
// e.g. invoke assemble-email Lambda or GET /api/email/preview
export const useFetchEmailPreview = () => {
  const data: EmailPreview = useMemo(() => mockEmailPreview, [])

  return { data }
}

// TODO: Replace with real API call to trigger email send
// e.g. invoke remind-me Lambda or POST /api/email/send
export const useSendEmailMutation = () => {
  const mutate = useCallback(async () => {
    // TODO: Call backend to trigger the email send
  }, [])

  return { mutate }
}
