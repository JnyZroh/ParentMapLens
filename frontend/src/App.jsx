/**
 * App.jsx — Root component
 *
 * Composes the Header (with API health check) and the full-screen MapComponent.
 * The Header is positioned absolutely on top of the map using Tailwind's
 * `relative` / `absolute` layout so the map fills the entire viewport.
 */

import Header from './components/Header'
import MapComponent from './components/MapComponent'

function App() {
  return (
    // `relative` here makes the Header's `absolute` positioning anchor to this div
    <div className="relative w-full h-screen">
      <Header />
      <MapComponent />
    </div>
  )
}

export default App
