import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'x-data-spreadsheet/dist/xspreadsheet.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
