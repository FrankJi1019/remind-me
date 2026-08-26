import type { FC } from "react"
import { useMemo, useState } from "react"
import type { EmailLogs, EmailRun, RunStatus } from "../../types/domain"
import Icon, { type IconName } from "../../components/Icon"

export interface LogsPageProps {
  logs: EmailLogs
}

const statusMeta: Record<RunStatus, { label: string; icon: IconName; badge: string; dot: string }> = {
  success: {
    label: "Success",
    icon: "success",
    badge: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  error: {
    label: "Error",
    icon: "error",
    badge: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400",
    dot: "bg-rose-500",
  },
  running: {
    label: "Running",
    icon: "spinner",
    badge: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
}

const formatDateTime = (ms: number | null): string => {
  if (!ms) return "—"
  return new Date(ms).toLocaleString("en-NZ", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

const formatRelative = (ms: number | null): string => {
  if (!ms) return ""
  const diff = Date.now() - ms
  const mins = Math.round(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

const formatDuration = (ms: number | null): string => {
  if (ms === null) return "—"
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(1)} s`
}

const formatTime = (ms: number): string =>
  new Date(ms).toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" })

const RunCard: FC<{ run: EmailRun }> = ({ run }) => {
  const [expanded, setExpanded] = useState(false)
  const meta = statusMeta[run.status]
  const hasMessages = run.messages.length > 0

  return (
    <div className="rounded-xl border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
        aria-expanded={expanded}
      >
        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${meta.dot}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-900 dark:text-white">{formatDateTime(run.startedAt)}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{formatRelative(run.startedAt)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Icon name="clock" className="text-[10px]" /> {formatDuration(run.durationMs)}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="memory" className="text-[10px]" /> {run.maxMemoryUsedMb ?? "—"}/{run.memorySizeMb ?? "—"} MB
            </span>
            {run.initDurationMs !== null && (
              <span className="text-slate-400 dark:text-slate-500">cold start +{formatDuration(run.initDurationMs)}</span>
            )}
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${meta.badge}`}>
          <Icon name={meta.icon} className="text-[10px]" spin={run.status === "running"} />
          {meta.label}
        </span>

        <Icon
          name="chevron"
          className={`text-xs text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3">
          {hasMessages ? (
            <div className="space-y-1 font-mono text-xs">
              {run.messages.map((line, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-slate-400 dark:text-slate-500 shrink-0 tabular-nums">{formatTime(line.timestamp)}</span>
                  <span className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-all">{line.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              No application log output — the run completed cleanly.
            </p>
          )}
          <p className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 font-mono break-all">
            Request ID: {run.requestId}
          </p>
        </div>
      )}
    </div>
  )
}

const LogsPage: FC<LogsPageProps> = ({ logs }) => {
  const [errorsOnly, setErrorsOnly] = useState(false)

  const visibleRuns = useMemo(
    () => (errorsOnly ? logs.runs.filter((r) => r.status === "error") : logs.runs),
    [errorsOnly, logs.runs]
  )
  const errorCount = useMemo(() => logs.runs.filter((r) => r.status === "error").length, [logs.runs])

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Icon name="logs" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Logs</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {logs.runs.length} run{logs.runs.length === 1 ? "" : "s"} in the last {logs.daysTracked} days
              {errorCount > 0 && <span className="text-rose-500 dark:text-rose-400"> · {errorCount} with errors</span>}
            </p>
          </div>
        </div>
        <button
          onClick={() => setErrorsOnly((v) => !v)}
          disabled={errorCount === 0}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
            errorsOnly
              ? "bg-rose-600 text-white hover:bg-rose-700"
              : "border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          }`}
        >
          <Icon name="warning" className="text-xs" />
          {errorsOnly ? "Showing errors" : "Errors only"}
        </button>
      </div>

      {/* Run list */}
      {visibleRuns.length > 0 ? (
        <div className="space-y-2">
          {visibleRuns.map((run) => (
            <RunCard key={run.requestId} run={run} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-16 px-6">
          <span className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
            <Icon name={errorsOnly ? "success" : "logs"} className="text-lg" />
          </span>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {errorsOnly ? "No errors" : "No runs yet"}
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            {errorsOnly ? "Every run in this window succeeded." : "Nothing has run in this window."}
          </p>
        </div>
      )}
    </div>
  )
}

export default LogsPage
