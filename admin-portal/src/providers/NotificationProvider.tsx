import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { FC } from "react"
import type { ProviderProps } from "../types/props"
import Icon, { type IconName } from "../components/Icon"

type NotificationType = "success" | "error" | "info"

interface NotificationOptions {
  type?: NotificationType
}

const context = createContext((() => {}) as (message: string, options?: NotificationOptions) => void)

const typeStyles: Record<NotificationType, { bg: string; icon: IconName }> = {
  success: { bg: "from-green-500 to-emerald-600", icon: "success" },
  error: { bg: "from-red-500 to-rose-600", icon: "error" },
  info: { bg: "from-indigo-500 to-purple-600", icon: "info" },
}

const NotificationProvider: FC<ProviderProps> = ({ children }) => {
  const [message, setMessage] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<NotificationType>("info")

  const notify = useCallback((message: string, options?: NotificationOptions) => {
    setMessage(message)
    setType(options?.type || "info")
    setIsOpen(true)
    setTimeout(() => setIsOpen(false), 4000)
  }, [])

  const style = useMemo(() => typeStyles[type], [type])

  return (
    <context.Provider value={notify}>
      {children}
      {isOpen && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r ${style.bg} text-white pl-4 pr-3 py-3 rounded-xl shadow-lg backdrop-blur-sm flex items-center gap-3 animate-[slideDown_0.3s_ease-out]`}
          role="status"
        >
          <Icon name={style.icon} className="text-base shrink-0" />
          <span className="text-sm font-medium">{message}</span>
          <button
            onClick={() => setIsOpen(false)}
            className="ml-1 h-6 w-6 flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Dismiss notification"
          >
            <Icon name="close" className="text-xs" />
          </button>
        </div>
      )}
    </context.Provider>
  )
}

export default NotificationProvider

export const useNotification = () => useContext(context)
