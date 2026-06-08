import type { FC } from "react"
import { useState } from "react"
import StandardContainer from "../../containers/StandardContainer"
import type { SsmParameter } from "../../types/domain"

export interface SsmParameterRowProps {
  parameter: SsmParameter
  onSave: (param: SsmParameter) => void
}

const maskValue = (value: string): string => {
  if (value.length <= 10) return "*****"
  return `${value.slice(0, 5)}*****${value.slice(-5)}`
}

const SsmParameterRow: FC<SsmParameterRowProps> = ({ parameter, onSave }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")

  const startEdit = () => {
    setIsEditing(true)
    setEditValue("")
  }

  const handleSave = () => {
    onSave({ ...parameter, value: editValue })
    setIsEditing(false)
    setEditValue("")
  }

  return (
    <StandardContainer>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate">{parameter.key}</p>
          {isEditing ? (
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Enter new value"
                className="flex-1 h-11 px-3 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                  Save
                </button>
                <button onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5 font-mono break-all">{maskValue(parameter.value)}</p>
          )}
        </div>
        {!isEditing && (
          <button onClick={startEdit} className="self-end sm:self-center px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg shrink-0 transition-colors">
            Edit
          </button>
        )}
      </div>
    </StandardContainer>
  )
}

export default SsmParameterRow
