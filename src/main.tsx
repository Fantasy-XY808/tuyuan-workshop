import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.css"

window.addEventListener("error", (e) => {
  console.error("[GLOBAL]", e.error || e.message)
})
window.addEventListener("unhandledrejection", (e) => {
  console.error("[UNHANDLED]", e.reason)
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
