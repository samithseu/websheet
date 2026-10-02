import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'x-data-spreadsheet/dist/xspreadsheet.css'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
