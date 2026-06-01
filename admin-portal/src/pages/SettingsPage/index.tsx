import type { FC } from "react"
import { useCallback } from "react"
import SettingsPage from "./SettingsPage"
import { useNotification } from "../../providers/NotificationProvider"
import { useFetchSsmParameters, useUpdateSsmParameterMutation } from "../../api-hooks/settings"

const SettingsPageBuilder: FC = () => {
  const notify = useNotification()
  const { data: params, setData } = useFetchSsmParameters()
  const { mutate: updateParam } = useUpdateSsmParameterMutation(setData)

  const saveHandler = useCallback((updated: Parameters<typeof updateParam>[0]) => {
    updateParam(updated)
    notify(`Saved ${updated.key}`, { type: "success" })
  }, [updateParam, notify])

  return <SettingsPage parameters={params} onSave={saveHandler} />
}

export default SettingsPageBuilder
