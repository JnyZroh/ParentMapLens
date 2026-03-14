import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Fix Leaflet default marker icon paths for Vite (must run before any map renders)
import './utils/leafletIconFix'
import { FavoritesProvider } from './context/FavoritesContext'
import App from './App.jsx'

/*
 * FavoritesProvider wraps the entire app so the star toggle on SuggestionCard
 * shares the same favorites Set whether the user is on HomeDashboard or
 * SearchResultPage.  Favorites survive page navigation within the session.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FavoritesProvider>
      <App />
    </FavoritesProvider>
  </StrictMode>,
)
