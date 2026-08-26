import { Route, Routes, Navigate } from "react-router-dom"
import { Routes as AppRoutes } from "./routes/routes"
import Page from "./containers/Page"
import EmailPreviewPageBuilder from "./pages/EmailPreviewPage"
import SettingsPageBuilder from "./pages/SettingsPage"

const App = () => {
  return (
    <Page>
      <Routes>
        <Route path={AppRoutes.EMAIL_PREVIEW.path} element={<EmailPreviewPageBuilder />} />
        <Route path={AppRoutes.SETTINGS.path} element={<SettingsPageBuilder />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Page>
  )
}

export default App
