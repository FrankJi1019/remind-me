import type { FC } from "react"
import StatsPage from "./StatsPage"
import PageLoader from "../../components/PageLoader"
import { useFetchEmailStats } from "../../api-hooks/stats"

const StatsPageBuilder: FC = () => {
  const { data: stats, isLoading } = useFetchEmailStats()

  if (isLoading || !stats) return <PageLoader />

  return <StatsPage stats={stats} />
}

export default StatsPageBuilder
