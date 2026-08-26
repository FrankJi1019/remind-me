import type { FC } from "react"
import type { EmailStats } from "../../types/domain"
import Icon, { type IconName } from "../../components/Icon"

export interface StatsPageProps {
  stats: EmailStats
}

const formatDate = (iso: string | null): string => {
  if (!iso) return "—"
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

const formatDuration = (ms: number | null): string => {
  if (ms === null) return "—"
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(1)} s`
}

interface StatCardProps {
  icon: IconName
  label: string
  value: string
  hint?: string
  tone?: "default" | "success" | "warning"
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  success: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
}

const StatCard: FC<StatCardProps> = ({ icon, label, value, hint, tone = "default" }) => (
  <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
    <div className="flex items-center gap-3">
      <span className={`h-9 w-9 flex items-center justify-center rounded-lg shrink-0 ${toneClasses[tone]}`}>
        <Icon name={icon} className="text-sm" />
      </span>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</span>
    </div>
    <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{value}</p>
    {hint && <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
  </div>
)

const StatsPage: FC<StatsPageProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
          <Icon name="stats" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Statistics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Delivery health over the last {stats.daysTracked} days
          </p>
        </div>
      </div>

      {/* Streak hero */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700 bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-6">
        <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
          <Icon name="streak" />
          <span>Current streak</span>
        </div>
        <p className="mt-2 text-5xl font-bold tabular-nums">
          {stats.currentStreak}
          <span className="text-2xl font-semibold text-white/80 ml-2">
            {stats.currentStreak === 1 ? "day" : "days"}
          </span>
        </p>
        <p className="mt-1 text-sm text-white/80">
          error-free deliveries in a row · best ever: {stats.longestStreak} days
        </p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon="gauge"
          label="Success rate"
          value={`${stats.successRate}%`}
          hint="of days that ran"
          tone={stats.successRate >= 99 ? "success" : stats.successRate >= 90 ? "default" : "warning"}
        />
        <StatCard icon="success" label="Days sent OK" value={String(stats.successDays)} hint={`last ${stats.daysTracked} days`} tone="success" />
        <StatCard
          icon="warning"
          label="Failed days"
          value={String(stats.failedDays)}
          tone={stats.failedDays === 0 ? "success" : "warning"}
        />
        <StatCard icon="clock" label="Avg duration" value={formatDuration(stats.avgDurationMs)} hint="per send" />
      </div>

      {/* Last sent / last error */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 flex items-center gap-3">
          <span className="h-9 w-9 flex items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Icon name="success" className="text-sm" />
          </span>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Last sent</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{formatDate(stats.lastSent)}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 flex items-center gap-3">
          <span className="h-9 w-9 flex items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
            <Icon name="error" className="text-sm" />
          </span>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Last error</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{formatDate(stats.lastError)}</p>
          </div>
        </div>
      </div>

      {/* Daily activity status strip */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-slate-900 dark:text-white">Daily delivery</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">last {stats.daily.length} days</p>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
          One square per day — did that day's email go out?
        </p>
        {stats.daily.length > 0 ? (
          <>
            <div className="flex gap-1">
              {stats.daily.map((d) => {
                const cls =
                  d.status === "failed"
                    ? "bg-rose-500"
                    : d.status === "success"
                      ? "bg-emerald-500"
                      : "bg-slate-200 dark:bg-slate-700"
                const label =
                  d.status === "failed"
                    ? "failed"
                    : d.status === "success"
                      ? "sent"
                      : "no send"
                return (
                  <div
                    key={d.date}
                    className={`h-8 flex-1 rounded-md ${cls}`}
                    title={`${d.date} — ${label}`}
                  />
                )
              })}
            </div>
            <div className="flex justify-between mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <span>{formatDate(stats.daily[0].date)}</span>
              <span>{formatDate(stats.daily[stats.daily.length - 1].date)}</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500 py-8 text-center">No activity recorded yet.</p>
        )}
        <div className="flex items-center gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Sent OK
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" /> Failed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-200 dark:bg-slate-700" /> No send
          </span>
        </div>
      </div>
    </div>
  )
}

export default StatsPage
