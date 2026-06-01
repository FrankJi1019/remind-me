import type { FC, ReactNode } from "react"
import { NavLink } from "react-router-dom"
import { Routes } from "../../routes/routes"

export interface PageProps {
  children: ReactNode
}

const navItems = [
  { label: "Habits", path: Routes.DAILY_JOBS.path, icon: "✓" },
  { label: "Email", path: Routes.EMAIL_PREVIEW.path, icon: "✉" },
  { label: "Schedule", path: Routes.SCHEDULE.path, icon: "⏰" },
  { label: "Settings", path: Routes.SETTINGS.path, icon: "⚙" },
]

const Page: FC<PageProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-50">
      <nav className="hidden sm:flex w-56 flex-col bg-white border-r border-slate-200 p-4 shrink-0">
        <h1 className="text-lg font-bold text-indigo-700 mb-6">remind-me</h1>
        {navItems.map(({ label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm mb-1 ${isActive ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1 flex flex-col min-h-0">
        <main className="flex-1 overflow-auto p-4 sm:p-6 pb-20 sm:pb-6">{children}</main>

        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2 z-40">
          {navItems.map(({ label, path, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex flex-col items-center min-w-[64px] py-1 px-2 rounded-md ${isActive ? "text-indigo-700" : "text-slate-500"}`
              }
            >
              <span className="text-lg">{icon}</span>
              <span className="text-[10px] mt-0.5">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default Page
