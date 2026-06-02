import type { FC } from "react"

const PageLoader: FC = () => (
  <div className="flex items-center justify-center py-20">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
  </div>
)

export default PageLoader
