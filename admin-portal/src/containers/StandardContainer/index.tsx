import type { FC } from "react"
import type { ContainerProps } from "../../types/props"

const StandardContainer: FC<ContainerProps> = ({ children, className = "" }) => {
  return (
    <div className={`rounded-xl bg-[#fffffe] dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700 p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  )
}

export default StandardContainer
