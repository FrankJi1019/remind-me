import type { FC } from "react"
import type { ContainerProps } from "../../types/props"

const StandardContainer: FC<ContainerProps> = ({ children, className = "" }) => {
  return (
    <div className={`rounded-xl bg-white shadow-sm border border-slate-200 p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  )
}

export default StandardContainer
