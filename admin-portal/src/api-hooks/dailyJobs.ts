import { useCallback, useState } from "react"
import { mockDailyJobs } from "../utils/mockData"
import type { DailyJob } from "../types/domain"

// TODO: Replace with @tanstack/react-query (v5)
// Install: npm install @tanstack/react-query
// Wrap app with <QueryClientProvider client={new QueryClient()}>
// Use useQuery({ queryKey: ["daily-jobs"], queryFn: () => fetch(...) }) for fetches
// Use useMutation({ mutationFn: ..., onSuccess: () => queryClient.invalidateQueries({ queryKey: ["daily-jobs"] }) }) for mutations

// TODO: Replace with real API call to fetch daily jobs
// e.g. GET /api/daily-jobs
export const useFetchDailyJobs = () => {
  const [data, setData] = useState<DailyJob[]>(mockDailyJobs)

  const reFetch = useCallback(() => {
    // TODO: Re-fetch from backend
    setData([...mockDailyJobs])
  }, [])

  return { data, setData, reFetch }
}

// TODO: Replace with real API call to toggle job completion
// e.g. PATCH /api/daily-jobs/:id/toggle
export const useToggleDailyJobMutation = (setData: React.Dispatch<React.SetStateAction<DailyJob[]>>) => {
  const mutate = useCallback((id: string) => {
    // TODO: Call backend, then update local state on success
    setData((prev) => prev.map((j) => (j.id === id ? { ...j, isCompleted: !j.isCompleted } : j)))
  }, [setData])

  return { mutate }
}

// TODO: Replace with real API call to create a daily job
// e.g. POST /api/daily-jobs
export const useCreateDailyJobMutation = (setData: React.Dispatch<React.SetStateAction<DailyJob[]>>) => {
  const mutate = useCallback((job: Omit<DailyJob, "id" | "isCompleted">) => {
    // TODO: Call backend, use returned id instead of Date.now()
    setData((prev) => [...prev, { ...job, id: Date.now().toString(), isCompleted: false }])
  }, [setData])

  return { mutate }
}

// TODO: Replace with real API call to delete a daily job
// e.g. DELETE /api/daily-jobs/:id
export const useDeleteDailyJobMutation = (setData: React.Dispatch<React.SetStateAction<DailyJob[]>>) => {
  const mutate = useCallback((id: string) => {
    // TODO: Call backend, then remove from local state on success
    setData((prev) => prev.filter((j) => j.id !== id))
  }, [setData])

  return { mutate }
}
