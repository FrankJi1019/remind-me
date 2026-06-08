import type { FC } from "react"
import SsmParameterRow from "../../components/SsmParameterRow"
import type { SsmParameter } from "../../types/domain"

export interface SettingsPageProps {
  parameters: SsmParameter[]
  onSave: (param: SsmParameter) => void
}

const SettingsPage: FC<SettingsPageProps> = ({ parameters, onSave }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">SSM Parameters</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{parameters.length} parameters configured</p>
      <div className="space-y-2">
        {parameters.map((param) => (
          <SsmParameterRow key={param.key} parameter={param} onSave={onSave} />
        ))}
      </div>
    </div>
  )
}

export default SettingsPage
