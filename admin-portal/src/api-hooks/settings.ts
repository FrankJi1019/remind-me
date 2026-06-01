import { useCallback, useState } from "react"
import { mockSsmParameters } from "../utils/mockData"
import type { SsmParameter } from "../types/domain"

// TODO: Replace with @tanstack/react-query (v5)
// Use useQuery({ queryKey: ["ssm-parameters"], queryFn: ... }) for fetch
// Use useMutation({ mutationFn: ..., onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ssm-parameters"] }) }) for update

// TODO: Replace with real API call to fetch SSM parameters
// e.g. GET /api/settings (calls SSM GetParametersByPath for /remind-me/*)
export const useFetchSsmParameters = () => {
  const [data, setData] = useState<SsmParameter[]>(mockSsmParameters)

  const reFetch = useCallback(() => {
    // TODO: Re-fetch from backend
    setData([...mockSsmParameters])
  }, [])

  return { data, setData, reFetch }
}

// TODO: Replace with real API call to update an SSM parameter
// e.g. PUT /api/settings/:key (calls SSM PutParameter)
export const useUpdateSsmParameterMutation = (setData: React.Dispatch<React.SetStateAction<SsmParameter[]>>) => {
  const mutate = useCallback((updated: SsmParameter) => {
    // TODO: Call backend to update SSM parameter, then refresh local state
    setData((prev) => prev.map((p) => (p.key === updated.key ? updated : p)))
  }, [setData])

  return { mutate }
}
