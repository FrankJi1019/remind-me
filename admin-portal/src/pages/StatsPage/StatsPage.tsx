import type { FC, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react"
import { useState } from "react"
import type { EmailStats, DailyActivityPoint } from "../../types/domain"
import Icon, { type IconName } from "../../components/Icon"

export interface StatsPageProps {
  stats: EmailStats
}

const formatDate = (iso: string | null): string => {
  if (!iso) return "—"
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
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

interface DayBreakdown {
  date: string
  headline: string
  sent: number
  succeeded: number
  failed: number
}

const dayBreakdown = (point: DailyActivityPoint): DayBreakdown => {
  const failed = Math.min(point.errors, point.sent)
  const succeeded = point.sent - failed
  const plural = point.sent === 1 ? "email" : "emails"
  const headline = point.sent === 0 ? "No send" : `${point.sent} ${plural}`
  return { date: formatDate(point.date), headline, sent: point.sent, succeeded, failed }
}

const StatsPage: FC<StatsPageProps> = ({ stats }) => {
  const emailSuccessRate =
    stats.totalSent > 0
      ? Math.round(((stats.totalSent - stats.totalErrors) / stats.totalSent) * 1000) / 10
      : 100
  const [hovered, setHovered] = useState<{ index: number; x: number; y: number } | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
          <Icon name="stats" />
        </span>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Statistics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Delivery health over the last {stats.daysTracked} days
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon="gauge"
          label="Success rate"
          value={`${emailSuccessRate}%`}
          hint={`of emails · last ${stats.daysTracked} days`}
          tone={emailSuccessRate >= 99 ? "success" : emailSuccessRate >= 90 ? "default" : "warning"}
        />
        <StatCard
          icon="success"
          label="Emails sent"
          value={String(stats.totalSent)}
          hint={`last ${stats.daysTracked} days`}
          tone="success"
        />
        <StatCard
          icon="warning"
          label="Failed emails"
          value={String(stats.totalErrors)}
          hint={`last ${stats.daysTracked} days`}
          tone={stats.totalErrors === 0 ? "success" : "warning"}
        />
        <StatCard icon="clock" label="Avg duration" value={formatDuration(stats.avgDurationMs)} hint="per send" />
      </div>

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

      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
        <div className="mb-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-900 dark:text-white">Daily delivery</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 shrink-0">last {stats.daily.length} days</p>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            One bar per day — red means that day had a failure. Tap or hover for details.
          </p>
        </div>

        {stats.daily.length > 0 ? (
          <>
            <div className="relative" data-chart>
              <div className="flex items-stretch gap-1 h-28 sm:h-20">
                {stats.daily.map((d, i) => {
                  const dimmed = hovered !== null && hovered.index !== i
                  const color =
                    d.errors > 0
                      ? "bg-rose-500"
                      : d.sent > 0
                        ? "bg-emerald-500"
                        : "bg-slate-200 dark:bg-slate-700"

                  const track = (e: ReactMouseEvent<HTMLElement>) => {
                    const container = e.currentTarget.closest("[data-chart]") as HTMLElement | null
                    if (!container) return
                    const rect = container.getBoundingClientRect()
                    setHovered({ index: i, x: e.clientX - rect.left, y: e.clientY - rect.top })
                  }

                  const trackTouch = (e: ReactTouchEvent<HTMLElement>) => {
                    const container = e.currentTarget.closest("[data-chart]") as HTMLElement | null
                    const touch = e.touches[0]
                    if (!container || !touch) return
                    const rect = container.getBoundingClientRect()
                    setHovered({ index: i, x: touch.clientX - rect.left, y: touch.clientY - rect.top })
                  }

                  return (
                    <div
                      key={d.date}
                      onMouseMove={track}
                      onMouseLeave={() => setHovered(null)}
                      onTouchStart={trackTouch}
                      onTouchMove={trackTouch}
                      onTouchEnd={() => setHovered(null)}
                      className={`flex-1 h-full rounded-sm cursor-pointer transition-opacity ${color} ${
                        dimmed ? "opacity-40" : "opacity-100"
                      }`}
                    />
                  )
                })}
              </div>

              {hovered !== null && (
                <div
                  className="absolute z-10 -translate-x-1/2 -translate-y-full pointer-events-none"
                  style={{ left: hovered.x, top: hovered.y - 12 }}
                >
                  {(() => {
                    const b = dayBreakdown(stats.daily[hovered.index])
                    return (
                      <div className="rounded-lg bg-slate-900 dark:bg-slate-950 text-white shadow-xl ring-1 ring-white/10 px-3 py-2 whitespace-nowrap">
                        <p className="text-xs font-semibold tracking-tight">{b.date}</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">{b.headline}</p>
                        {b.sent > 0 && (
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] tabular-nums">
                            <span className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-sm bg-emerald-500" /> {b.succeeded} sent
                            </span>
                            {b.failed > 0 && (
                              <span className="flex items-center gap-1">
                                <span className="h-2 w-2 rounded-sm bg-rose-500" /> {b.failed} failed
                              </span>
                            )}
                          </div>
                        )}
                        <span className="absolute left-1/2 top-full -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-900 dark:border-t-slate-950" />
                      </div>
                    )
                  })()}
                </div>
              )}
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
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" /> Had failure
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
