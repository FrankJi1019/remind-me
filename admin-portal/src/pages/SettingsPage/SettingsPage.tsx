import type { FC } from "react"
import SsmParameterRow from "../../components/SsmParameterRow"
import Icon from "../../components/Icon"
import type { SsmParameter } from "../../types/domain"

export interface SettingsPageProps {
  parameters: SsmParameter[]
  onSave: (param: SsmParameter) => void
}

const SettingsPage: FC<SettingsPageProps> = ({ parameters, onSave }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
          <Icon name="parameters" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {parameters.length} SSM parameter{parameters.length === 1 ? "" : "s"} configured
          </p>
        </div>
      </div>

      {parameters.length > 0 ? (
        <div className="space-y-2">
          {parameters.map((param) => (
            <SsmParameterRow key={param.key} parameter={param} onSave={onSave} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-16 px-6">
          <span className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
            <Icon name="parameters" className="text-lg" />
          </span>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No parameters</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Nothing is configured yet.</p>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
