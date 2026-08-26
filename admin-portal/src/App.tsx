import { Route, Routes, Navigate } from "react-router-dom"
import { Routes as AppRoutes } from "./routes/routes"
import Page from "./containers/Page"
import EmailPreviewPageBuilder from "./pages/EmailPreviewPage"
import StatsPageBuilder from "./pages/StatsPage"
import ThemesPageBuilder from "./pages/ThemesPage"
import LogsPageBuilder from "./pages/LogsPage"
import SettingsPageBuilder from "./pages/SettingsPage"

const App = () => {
  return (
    <Page>
      <Routes>
        <Route path="/" element={<Navigate to={AppRoutes.STATS.path} replace />} />
        <Route path={AppRoutes.STATS.path} element={<StatsPageBuilder />} />
        <Route path={AppRoutes.EMAIL_PREVIEW.path} element={<EmailPreviewPageBuilder />} />
        <Route path={AppRoutes.THEMES.path} element={<ThemesPageBuilder />} />
        <Route path={AppRoutes.LOGS.path} element={<LogsPageBuilder />} />
        <Route path={AppRoutes.SETTINGS.path} element={<SettingsPageBuilder />} />
        <Route path="*" element={<Navigate to={AppRoutes.STATS.path} replace />} />
      </Routes>
    </Page>
  )
}

export default App
