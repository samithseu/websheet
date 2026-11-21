import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "x-data-spreadsheet/dist/xspreadsheet.css";
import "./index.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Warm pages-cache on initial load for offline resilience
if ("caches" in window && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    caches
      .open("pages-cache")
      .then((cache) => cache.add(window.location.href))
      .catch(() => {});
  });
}
