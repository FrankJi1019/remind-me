import { useCallback, useState } from "react"
import { mockSchedule } from "../utils/mockData"
import type { Schedule } from "../types/domain"

// TODO: Replace with @tanstack/react-query (v5)
// Use useQuery({ queryKey: ["schedule"], queryFn: ... }) for schedule fetch
// Use useMutation({ mutationFn: ..., onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedule"] }) }) for skip/resume

// TODO: Replace with real API call to fetch schedule status
// e.g. GET /api/schedule (reads CloudWatch rule state + next trigger time)
export const useFetchSchedule = () => {
  const [data, setData] = useState<Schedule>(mockSchedule)

  return { data, setData }
}

// TODO: Replace with real API call to skip next email
// e.g. POST /api/schedule/skip
export const useSkipNextMutation = (setData: React.Dispatch<React.SetStateAction<Schedule>>) => {
  const mutate = useCallback(() => {
    // TODO: Call backend to disable next scheduled trigger
    setData((prev) => ({ ...prev, isSkipped: true }))
  }, [setData])

  return { mutate }
}

// TODO: Replace with real API call to skip until a specific date
// e.g. POST /api/schedule/skip-until { date }
export const useSkipUntilMutation = (setData: React.Dispatch<React.SetStateAction<Schedule>>) => {
  const mutate = useCallback((date: string) => {
    // TODO: Call backend to disable scheduled triggers until date
    setData((prev) => ({ ...prev, isSkipped: true, skipUntil: date }))
  }, [setData])

  return { mutate }
}

// TODO: Replace with real API call to resume schedule
// e.g. POST /api/schedule/resume
export const useResumeMutation = (setData: React.Dispatch<React.SetStateAction<Schedule>>) => {
  const mutate = useCallback(() => {
    // TODO: Call backend to re-enable scheduled triggers
    setData((prev) => ({ ...prev, isSkipped: false, skipUntil: undefined }))
  }, [setData])

  return { mutate }
}
