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
      case "success": return "bg-green-600"
      case "error": return "bg-red-600"
      default: return "bg-indigo-600"
    }
  }, [type])

  return (
    <context.Provider value={notify}>
      {children}
      {isOpen && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3`}>
          <span>{message}</span>
          <button onClick={() => setIsOpen(false)} className="ml-2 text-white/80 hover:text-white">✕</button>
        </div>
      )}
    </context.Provider>
  )
}

export default NotificationProvider

export const useNotification = () => useContext(context)
