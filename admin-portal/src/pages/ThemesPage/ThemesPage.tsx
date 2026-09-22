import type { FC } from "react"
import { useMemo, useState } from "react"
import Handlebars from "handlebars"
import type { EmailTemplateOption } from "../../types/domain"
import Icon from "../../components/Icon"
import { mockTemplateData } from "../../utils/mockTemplateData"

export interface ThemesPageProps {
  templates: EmailTemplateOption[]
  appliedTemplate: string
  isApplying: boolean
  onApply: (id: string) => void
}

const renderPreview = (html: string): string => {
  if (!html) return "<p style='font-family:sans-serif;color:#888;padding:24px'>Preview unavailable.</p>"
  try {
    return Handlebars.compile(html, { noEscape: false })(mockTemplateData)
  } catch {
    return "<p style='font-family:sans-serif;color:#c00;padding:24px'>Could not render this template.</p>"
  }
}

const ThemesPage: FC<ThemesPageProps> = ({ templates, appliedTemplate, isApplying, onApply }) => {
  // Pending (previewed) selection starts at the applied one.
  const [pending, setPending] = useState(appliedTemplate)
  const [lastApplied, setLastApplied] = useState(appliedTemplate)

  // If the applied value changes (after confirming), realign the baseline.
  if (appliedTemplate !== lastApplied) {
    setLastApplied(appliedTemplate)
    setPending(appliedTemplate)
  }

  const pendingTemplate = useMemo(
    () => templates.find((t) => t.id === pending) ?? templates[0],
    [templates, pending]
  )

  const previewHtml = useMemo(
    () => renderPreview(pendingTemplate?.html ?? ""),
    [pendingTemplate]
  )

  const hasChange = pending !== appliedTemplate

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
          <Icon name="themes" />
        </span>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Themes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Preview a design with sample data, then confirm to apply it
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        {/* Theme list */}
        <div className="order-2 lg:order-none flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
          {templates.map((template) => {
            const isPending = template.id === pending
            const isApplied = template.id === appliedTemplate
            return (
              <button
                key={template.id}
                onClick={() => setPending(template.id)}
                aria-pressed={isPending}
                className={`shrink-0 lg:w-full text-left rounded-xl border p-3 transition-colors ${
                  isPending
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 ring-1 ring-indigo-500"
                    : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2 whitespace-nowrap lg:justify-between lg:whitespace-normal">
                  <span className={`text-sm font-medium ${isPending ? "text-indigo-700 dark:text-indigo-300" : "text-slate-900 dark:text-white"}`}>
                    {template.name}
                  </span>
                  {isApplied && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                      <Icon name="check" className="text-[9px]" /> Active
                    </span>
                  )}
                </div>
                <p className="hidden lg:block text-xs text-slate-400 dark:text-slate-500 mt-1 leading-snug">
                  {template.description}
                </p>
              </button>
            )
          })}
        </div>

        {/* Preview + confirm */}
        <div className="order-1 lg:order-none rounded-2xl border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 min-w-0">
              <Icon name="email" className="text-xs text-slate-400 shrink-0" />
              <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {pendingTemplate?.name} preview
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">· sample data</span>
            </div>
            <button
              onClick={() => onApply(pending)}
              disabled={!hasChange || isApplying}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Icon name={isApplying ? "spinner" : "check"} className="text-xs" spin={isApplying} />
              {hasChange ? "Confirm & apply" : "Applied"}
            </button>
          </div>
          <iframe
            title="Email theme preview"
            srcDoc={previewHtml}
            className="w-full flex-1 min-h-[70vh] lg:min-h-[520px] bg-white"
            sandbox=""
          />
        </div>
      </div>
    </div>
  )
}

export default ThemesPage
