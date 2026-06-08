import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { FC } from "react"
import type { ProviderProps } from "../types/props"

type NotificationType = "success" | "error" | "info"

interface NotificationOptions {
  type?: NotificationType
}

const context = createContext((() => {}) as (message: string, options?: NotificationOptions) => void)

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

  const bgColor = useMemo(() => {
    switch (type) {
      case "success": return "from-green-500 to-emerald-600"
      case "error": return "from-red-500 to-rose-600"
      default: return "from-indigo-500 to-purple-600"
    }
  }, [type])

  return (
    <context.Provider value={notify}>
      {children}
      {isOpen && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg backdrop-blur-sm flex items-center gap-3 animate-[slideDown_0.3s_ease-out]`}>
          <span className="text-sm font-medium">{message}</span>
          <button onClick={() => setIsOpen(false)} className="ml-2 text-white/70 hover:text-white transition-colors">✕</button>
        </div>
      )}
    </context.Provider>
  )
}

export default NotificationProvider

export const useNotification = () => useContext(context)
