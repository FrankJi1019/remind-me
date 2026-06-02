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
          <p className="text-xs text-slate-400 font-mono truncate">{parameter.key}</p>
          {isEditing ? (
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={"Enter new value"}
                className="flex-1 h-11 px-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 active:bg-indigo-800">
                  Save
                </button>
                <button onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none px-4 py-2.5 text-sm text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 active:bg-slate-100">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-700 mt-0.5 font-mono break-all">{maskValue(parameter.value)}</p>
          )}
        </div>
        {!isEditing && (
          <button onClick={startEdit} className="self-end sm:self-center px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 rounded-md shrink-0">
            Edit
          </button>
        )}
      </div>
    </StandardContainer>
  )
}

export default SsmParameterRow
