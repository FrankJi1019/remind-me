import type { DailyTask } from "../types/domain"

export function isTaskCompleted(task: DailyTask) {
    const res = task.completionDates.some(date => {
      return date.toDateString() === new Date().toDateString()
    })
    return res 
}
