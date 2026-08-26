import type { FC } from "react"
import { useCallback } from "react"
import ThemesPage from "./ThemesPage"
import PageLoader from "../../components/PageLoader"
import { useNotification } from "../../providers/NotificationProvider"
import { useFetchEmailTemplates, useSelectEmailTemplateMutation } from "../../api-hooks/template"

const ThemesPageBuilder: FC = () => {
  const notify = useNotification()
  const { data: templates, isLoading } = useFetchEmailTemplates()
  const { mutateAsync: selectTemplate, isPending: isApplying } = useSelectEmailTemplateMutation()

  const applyHandler = useCallback(async (id: string) => {
    await selectTemplate(id)
    const name = templates?.templates.find((t) => t.id === id)?.name ?? id
    notify(`Theme applied: ${name}`, { type: "success" })
  }, [selectTemplate, templates, notify])

  if (isLoading || !templates) return <PageLoader />

  return (
    <ThemesPage
      templates={templates.templates}
      appliedTemplate={templates.selected}
      isApplying={isApplying}
      onApply={(id) => { applyHandler(id) }}
    />
  )
}

export default ThemesPageBuilder
