import type { FC } from "react"
import { useMemo, useState } from "react"
import StandardContainer from "../../containers/StandardContainer"
import type { DailyTask } from "../../types/domain"
import DailyTaskItem from "../../components/DailyTaskItem"
import { isTaskCompleted } from "../../utils/dailyTasks"

export interface DailyTasksPageProps {
  tasks: DailyTask[]
  onToggleComplete: (id: string, isTaskCompleted: boolean) => void
  onAdd: (task: string) => void
  onDelete: (id: string) => void
}

const DailyTasksPage: FC<DailyTasksPageProps> = ({ tasks, onToggleComplete, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState("")

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd(name)
    setName("")
    setIsAdding(false)
  }

  const completeCount = useMemo(() => {
    return tasks.filter((task) => isTaskCompleted(task)).length
  }, [tasks])

  const progress = tasks.length > 0 ? Math.round((completeCount / tasks.length) * 100) : 0

  return (
    <div>
      {/* Summary card */}
      <StandardContainer className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Daily Habits</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {completeCount}/{tasks.length} completed today
            </p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium rounded-lg shadow-sm shadow-indigo-600/20 transition-all"
          >
            {isAdding ? "Cancel" : "+ Add"}
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress === 100 && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2">🎉 All done for today!</p>
        )}
      </StandardContainer>

      {/* Add form */}
      {isAdding && (
        <StandardContainer className="mb-4">
          <div className="flex items-center gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Drink 8 glasses of water"
              className="flex-1 h-11 px-3 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              autoFocus
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-indigo-600/20 transition-all"
            >
              Add
            </button>
          </div>
        </StandardContainer>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <DailyTaskItem key={task.id} task={task} onToggleComplete={onToggleComplete} onDelete={onDelete} />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm">No habits yet. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DailyTasksPage
