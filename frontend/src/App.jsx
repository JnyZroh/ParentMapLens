/**
 * App.jsx — Root component
 *
 * Renders the SearchResultPage, which is the primary UI for Phase 2+.
 * The Header and full-screen MapComponent from Phase 1 have been superseded
 * by the SearchResultPage layout (which includes its own map snippet in
 * HeroSection and its own SearchBar).
 *
 * In later phases, App.jsx will host a router (e.g. React Router) to switch
 * between pages:
 *   /             → HomeScreen (full-screen map, Phase 1 style)
 *   /search       → SearchResultPage (this current view)
 *   /place/:id    → PlaceDetailPage (full detail + parent review form)
 */

import SearchResultPage from './pages/SearchResultPage'

function App() {
  return <SearchResultPage />
}

export default App
