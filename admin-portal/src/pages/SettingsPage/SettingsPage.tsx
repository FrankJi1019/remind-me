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
      <h2 className="text-xl font-semibold text-slate-800 mb-4">SSM Parameters</h2>
      <div className="space-y-2">
        {parameters.map((param) => (
          <SsmParameterRow key={param.key} parameter={param} onSave={onSave} />
        ))}
      </div>
    </div>
  )
}

export default SettingsPage
