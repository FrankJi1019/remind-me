import type { FC, ReactNode } from "react"
import { NavLink } from "react-router-dom"
import { Routes } from "../../routes/routes"
import { useTheme } from "../../providers/ThemeProvider"

export interface PageProps {
  children: ReactNode
}

const navItems = [
  { label: "Habits", path: Routes.DAILY_TASKS.path, icon: "✓" },
  { label: "Email", path: Routes.EMAIL_PREVIEW.path, icon: "✉" },
  { label: "Settings", path: Routes.SETTINGS.path, icon: "⚙" },
]

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className="h-9 w-9 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow transition-all"
      aria-label="Toggle theme"
    >
      <span className="text-sm">{theme === "dark" ? "☀️" : "🌙"}</span>
    </button>
  )
}

const Page: FC<PageProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f8f8f6] dark:bg-slate-900 transition-colors">
      {/* Top header */}
      <header className="sticky top-0 z-30 h-14 border-b border-slate-200/70 dark:border-slate-800 bg-[#f8f8f6]/90 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            <span className="text-indigo-600 dark:text-indigo-400">⏰</span> remind-me
          </h1>

          {/* Desktop tabs */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map(({ label, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <ThemeToggle />
      </header>

      {/* Page content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-6">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#f8f8f6]/90 dark:bg-slate-900 border-t border-slate-200/70 dark:border-slate-800 backdrop-blur-md flex items-center justify-around z-40">
        {navItems.map(({ label, path, icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-400 dark:text-slate-500"
              }`
            }
          >
            <span className="text-xl">{icon}</span>
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Page
