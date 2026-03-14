/**
 * App.jsx — Root component
 *
 * Sets up client-side routing with React Router.
 *
 * Routes:
 *   /        → HomeDashboard  (landing screen with map + recommendations)
 *   /search  → SearchResultPage (venue search results + detail view)
 *
 * In a future phase, /place/:id will open a full-detail page with the
 * Parent Report form (Phase 5).
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeDashboard    from './pages/HomeDashboard'
import SearchResultPage from './pages/SearchResultPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<HomeDashboard />} />
        <Route path="/search" element={<SearchResultPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
