import type { FC } from "react"
import { useCallback, useMemo } from "react"
import SettingsPage from "./SettingsPage"
import { useNotification } from "../../providers/NotificationProvider"
import { useFetchSsmParameters, useUpdateSsmParameterMutation } from "../../api-hooks/settings"

const SettingsPageBuilder: FC = () => {
  const notify = useNotification()
  
  const { data: rawSsmParams, refetch: refetchSsmParams } = useFetchSsmParameters()
  const { mutateAsync: updateParam } = useUpdateSsmParameterMutation()

  const ssmParams = useMemo(() => {
    return rawSsmParams || []
  }, [rawSsmParams])

  const saveHandler = useCallback(async (updated: Parameters<typeof updateParam>[0]) => {
    await updateParam(updated)
    await refetchSsmParams()
    notify(`Saved ${updated.key}`, { type: "success" })
  }, [updateParam, notify])

  return <SettingsPage parameters={ssmParams} onSave={saveHandler} />
}

export default SettingsPageBuilder
