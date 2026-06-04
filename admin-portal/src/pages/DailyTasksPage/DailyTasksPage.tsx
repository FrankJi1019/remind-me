import type { FC } from "react"
import { useMemo, useState } from "react"
import StandardContainer from "../../containers/StandardContainer"
import type { DailyTask } from "../../types/domain"
import DailyTaskItem from "../../components/DailyTaskItem"
import {isTaskCompleted} from "../../utils/dailyTasks"

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
    const completedTasks = tasks.filter((task) => {
      return isTaskCompleted(task)
    })
    return completedTasks.length
  }, [tasks])

  const progress = tasks.length > 0 ? Math.round((completeCount / tasks.length) * 100) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Daily Habits</h2>
          <p className="text-sm text-slate-500 mt-0.5">{completeCount}/{tasks.length} completed today</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 active:bg-indigo-800"
        >
          {isAdding ? "Cancel" : "+ Add"}
        </button>
      </div>

      <div className="mb-4 h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {isAdding && (
        <StandardContainer className="mb-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Drink 8 glasses of water"
                className="flex-1 h-11 px-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <button onClick={handleAdd} className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 active:bg-indigo-800">
              Add Habit
            </button>
          </div>
        </StandardContainer>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <DailyTaskItem
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

export default DailyTasksPage
