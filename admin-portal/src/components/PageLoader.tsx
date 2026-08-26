import type { FC } from "react"
import Icon from "./Icon"

const PageLoader: FC = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400 dark:text-slate-500">
    <Icon name="spinner" spin className="text-2xl text-indigo-600 dark:text-indigo-400" />
    <span className="text-sm">Loading…</span>
  </div>
)

export default PageLoader
