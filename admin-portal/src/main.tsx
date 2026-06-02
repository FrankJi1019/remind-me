import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import NotificationProvider from "./providers/NotificationProvider"
import App from "./App"
import "./index.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
    <QueryClientProvider client={new QueryClient()}>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
)
