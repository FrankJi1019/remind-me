import type { FC } from "react"
import { useState } from "react"
import StandardContainer from "../../containers/StandardContainer"
import type { DailyJob } from "../../types/domain"

export interface DailyJobsPageProps {
  jobs: DailyJob[]
  completedCount: number
  onToggleComplete: (id: string) => void
  onAdd: (job: Omit<DailyJob, "id" | "isCompleted">) => void
  onDelete: (id: string) => void
}

const DailyJobsPage: FC<DailyJobsPageProps> = ({ jobs, completedCount, onToggleComplete, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState("")
  const [icon, setIcon] = useState("")

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd({ name, icon: icon || "✅" })
    setName("")
    setIcon("")
    setIsAdding(false)
  }

  const progress = jobs.length > 0 ? Math.round((completedCount / jobs.length) * 100) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Daily Habits</h2>
          <p className="text-sm text-slate-500 mt-0.5">{completedCount}/{jobs.length} completed today</p>
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
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🎯"
                className="w-12 h-11 px-2 border border-slate-300 rounded-md text-center text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                maxLength={2}
              />
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
        {jobs.map((job) => (
          <StandardContainer key={job.id}>
            <div className="flex items-center gap-3 min-h-[44px]">
              <button
                onClick={() => onToggleComplete(job.id)}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  job.isCompleted
                    ? "bg-indigo-500 border-indigo-500 text-white"
                    : "border-slate-300 hover:border-indigo-400 active:border-indigo-500"
                }`}
                aria-label={`Mark "${job.name}" as ${job.isCompleted ? "incomplete" : "complete"}`}
              >
                {job.isCompleted && <span className="text-xs">✓</span>}
              </button>
              <span className="text-lg">{job.icon}</span>
              <span className={`text-sm flex-1 ${job.isCompleted ? "line-through text-slate-400" : "text-slate-800"}`}>
                {job.name}
              </span>
              <button
                onClick={() => onDelete(job.id)}
                className="text-xs text-red-400 hover:text-red-600 active:text-red-700 px-2 py-1.5"
              >
                Remove
              </button>
            </div>
          </StandardContainer>
        ))}
      </div>
    </div>
  )
}

export default DailyJobsPage
