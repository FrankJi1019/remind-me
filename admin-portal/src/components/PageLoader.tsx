import type { FC } from "react"

const PageLoader: FC = () => (
  <div className="flex items-center justify-center py-20">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 dark:border-t-indigo-400" />
  </div>
)

export default PageLoader
