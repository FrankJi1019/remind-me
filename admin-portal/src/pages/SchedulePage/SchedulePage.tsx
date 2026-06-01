import type { FC } from "react"
import { useState } from "react"
import StandardContainer from "../../containers/StandardContainer"
import type { Schedule } from "../../types/domain"

export interface SchedulePageProps {
  schedule: Schedule
  onSkipNext: () => void
  onSkipUntil: (date: string) => void
  onResume: () => void
}

const SchedulePage: FC<SchedulePageProps> = ({ schedule, onSkipNext, onSkipUntil, onResume }) => {
  const [customDate, setCustomDate] = useState("")

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Schedule</h2>

      <StandardContainer className="mb-4">
        <p className="text-sm text-slate-500 mb-1">Next email scheduled for</p>
        <p className="text-lg font-medium text-slate-800">
          {new Date(schedule.nextEmailTime).toLocaleString("en-NZ", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
            hour: "2-digit", minute: "2-digit", timeZoneName: "short",
          })}
        </p>
        <p className="text-xs text-slate-400 mt-1">Timezone: {schedule.timezone}</p>
      </StandardContainer>

      <StandardContainer>
        <p className="text-sm text-slate-500 mb-3">Skip scheduling</p>
        {schedule.isSkipped ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm text-amber-600 font-medium">
              Skipped until {schedule.skipUntil ? new Date(schedule.skipUntil).toLocaleDateString() : "next send"}
            </span>
            <button onClick={onResume} className="w-full sm:w-auto px-4 py-2.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 active:bg-green-800">
              Resume
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
              <button onClick={onSkipNext} className="px-4 py-2.5 bg-amber-500 text-white text-sm rounded-md hover:bg-amber-600 active:bg-amber-700">
                Skip next email
              </button>
              <button
                onClick={() => {
                  const date = new Date()
                  date.setDate(date.getDate() + 3)
                  onSkipUntil(date.toISOString())
                }}
                className="px-4 py-2.5 bg-amber-500 text-white text-sm rounded-md hover:bg-amber-600 active:bg-amber-700"
              >
                Skip 3 days
              </button>
              <button
                onClick={() => {
                  const date = new Date()
                  date.setDate(date.getDate() + 7)
                  onSkipUntil(date.toISOString())
                }}
                className="px-4 py-2.5 bg-amber-500 text-white text-sm rounded-md hover:bg-amber-600 active:bg-amber-700"
              >
                Skip 1 week
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="h-11 px-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => {
                  if (customDate) {
                    onSkipUntil(new Date(customDate).toISOString())
                    setCustomDate("")
                  }
                }}
                disabled={!customDate}
                className="px-4 py-2.5 bg-amber-500 text-white text-sm rounded-md hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip until date
              </button>
            </div>
          </div>
        )}
      </StandardContainer>
    </div>
  )
}

export default SchedulePage
