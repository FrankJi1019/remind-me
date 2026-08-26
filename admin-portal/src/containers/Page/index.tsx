import type { FC, ReactNode } from "react"
import { NavLink } from "react-router-dom"
import { Routes } from "../../routes/routes"
import { useTheme } from "../../providers/ThemeProvider"
import Icon, { type IconName } from "../../components/Icon"

export interface PageProps {
  children: ReactNode
}

interface NavItem {
  label: string
  path: string
  icon: IconName
}

const navItems: NavItem[] = [
  { label: "Email", path: Routes.EMAIL_PREVIEW.path, icon: "email" },
  { label: "Settings", path: Routes.SETTINGS.path, icon: "settings" },
]

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
      aria-label="Toggle theme"
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} className="text-sm" />
    </button>
  )
}

const Page: FC<PageProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f8f8f6] dark:bg-slate-900 transition-colors">
      {/* Top header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 dark:border-slate-800 bg-[#f8f8f6]/90 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto h-14 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <span className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
                <Icon name="bell" className="text-sm" />
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">remind-me</span>
            </div>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-1">
              {navItems.map(({ label, path, icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === Routes.EMAIL_PREVIEW.path}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`
                  }
                >
                  <Icon name={icon} className="text-xs" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <ThemeToggle />
        </div>
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
            end={path === Routes.EMAIL_PREVIEW.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-400 dark:text-slate-500"
              }`
            }
          >
            <Icon name={icon} className="text-lg" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Page
