import { useMemo, type FC } from "react"
import StandardContainer from "../../containers/StandardContainer"
import type { DailyTask } from "../../types/domain"
import {isTaskCompleted} from '../../utils/dailyTasks'

export interface DailyTaskItemProps {
  task: DailyTask
  onToggleComplete: (id: string, isTaskCompleted: boolean) => void
  onDelete: (id: string) => void
}

const DailyTaskItem: FC<DailyTaskItemProps> = ({ task, onToggleComplete, onDelete }) => {

  const isCompleted = useMemo(() => {
    return isTaskCompleted(task)
  }, [task, isTaskCompleted])

  return <StandardContainer>
    <div className="flex items-center gap-3 min-h-[44px]">
      <button
        onClick={() => onToggleComplete(task.id, !isCompleted)}
        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          isCompleted
            ? "bg-indigo-500 border-indigo-500 text-white"
            : "border-slate-300 hover:border-indigo-400 active:border-indigo-500"
        }`}
        aria-label={`Mark "${task.content}" as ${isCompleted ? "incomplete" : "complete"}`}
      >
        {isCompleted && <span className="text-xs">✓</span>}
      </button>
      <span className={`text-sm flex-1 ${isCompleted ? "line-through text-slate-400" : "text-slate-800"}`}>
        {task.content}
      </span>
      <button
        onClick={() => onDelete(task.id)}
        className="text-xs text-red-400 hover:text-red-600 active:text-red-700 px-2 py-1.5"
      >
        Remove
      </button>
    </div>
  </StandardContainer>
}

export default DailyTaskItem
