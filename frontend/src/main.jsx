import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Fix Leaflet default marker icon paths for Vite (must run before any map renders)
import './utils/leafletIconFix'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
