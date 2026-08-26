import type { FC } from "react"
import LogsPage from "./LogsPage"
import PageLoader from "../../components/PageLoader"
import { useFetchEmailLogs } from "../../api-hooks/logs"

const LogsPageBuilder: FC = () => {
  const { data: logs, isLoading } = useFetchEmailLogs()

  if (isLoading || !logs) return <PageLoader />

  return <LogsPage logs={logs} />
}

export default LogsPageBuilder
