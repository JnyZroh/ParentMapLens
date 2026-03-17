/**
 * HomeDashboard.jsx
 *
 * The landing screen the user sees before running a search.
 * No venue is "selected" yet, so the top of the page is dominated by a
 * city-wide Leaflet map instead of a venue photo grid.
 *
 * ── Layout (top → bottom) ─────────────────────────────────────────────────────
 *
 *   ┌─────────────────────────────────┐
 *   │  [search by name ────────] 👤  │  ← SearchBar + profile
 *   ├─────────────────────────────────┤
 *   │                                 │
 *   │         full-width map          │  ← Leaflet, ~40vh, draggable
 *   │                                 │
 *   ├─────────────────────────────────┤
 *   │   Plan a Day with Your Crew     │  ← CTA heading
 *   │   [FilterBar — crew/filters]    │  ← same FilterBar as SearchResultPage
 *   │         [ Search ]              │  ← navigates to /search
 *   ├─────────────────────────────────┤
 *   │   Recommendations For You       │  ← heading
 *   │   [ card ] [ card ]             │  ← SuggestionsGrid, all venues by score
 *   │   [ card ] [ card ]             │
 *   └─────────────────────────────────┘
 *
 * ── Routing ───────────────────────────────────────────────────────────────────
 * Pressing Search or clicking a recommendation card navigates to /search via
 * React Router's `useNavigate`.
 *
 * ── Recommendations order ─────────────────────────────────────────────────────
 * All MOCK_PLACES sorted by two criteria:
 *   1. Favorited venues always float to the top (starred ★ = saved by this user)
 *   2. Within each group, sorted descending by Crew Match Score
 */

import { useState, useMemo }  from 'react'
import { useNavigate }        from 'react-router-dom'
import { MapContainer, TileLayer } from 'react-leaflet'
import { CrewProvider }       from '../context/CrewContext'
import { useCrew }            from '../context/CrewContext'
import { useFavorites }       from '../context/FavoritesContext'
import SearchBar              from '../components/SearchBar'
import FilterBar              from '../components/FilterBar'
import SuggestionsGrid        from '../components/SuggestionsGrid'
import { MOCK_PLACES }        from '../data/mockPlaces'
import { calculateCompatibilityScore } from '../utils/scoreEngine'

// Verdun city-level default — slightly more zoomed-out than the venue snippet
const CITY_CENTER  = [45.4651, -73.5692]
const CITY_ZOOM    = 14

/**
 * RecommendationsList
 *
 * Extracted into its own component so it can call useCrew() directly.
 * (useCrew requires a CrewProvider ancestor — which lives in HomeDashboard.)
 * Sorting by score inside the component means the list re-ranks automatically
 * whenever the user adjusts their crew in the FilterBar.
 */
function RecommendationsList({ onSelectPlace }) {
  const { crew }            = useCrew()
  const { favorites }       = useFavorites()

  // Sort by two criteria:
  //   1. Favorited venues first (starred by this user)
  //   2. Descending Crew Match Score within each group
  // useMemo re-runs only when crew or favorites change.
  const sorted = useMemo(() => {
    return [...MOCK_PLACES].sort((a, b) => {
      const aFav = favorites.has(a.id) ? 1 : 0
      const bFav = favorites.has(b.id) ? 1 : 0
      // If one is favorited and the other isn't, favorited wins
      if (bFav !== aFav) return bFav - aFav
      // Otherwise rank by Crew Match Score
      return (
        calculateCompatibilityScore(crew, b.tags) -
        calculateCompatibilityScore(crew, a.tags)
      )
    })
  }, [crew, favorites])

  return (
    <SuggestionsGrid
      suggestions={sorted}
      onSelectPlace={onSelectPlace}
    />
  )
}

function HomeDashboard() {
  const navigate = useNavigate()

  // ── Filter state (same shape as SearchResultPage) ──────────────────────────
  // These are set by the user before they hit Search.  The values will be
  // passed via router state in a future phase; for now Search just navigates.
  const [radiusKm, setRadiusKm]               = useState(3)
  const [activeTagFilters, setActiveTagFilters] = useState([
    'stroller_friendly',
    'changing_table',
    'play_area',
  ])

  function handleTagToggle(tag) {
    setActiveTagFilters(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  // Clicking Search or a recommendation card both land on SearchResultPage.
  function goToSearch() {
    navigate('/search')
  }

  return (
    /*
     * CrewProvider is needed so FilterBar's "Adjust" panel and
     * RecommendationsList can both read/write the same crew state.
     */
    <CrewProvider>
      <div className="min-h-screen bg-gray-100 max-w-2xl mx-auto pb-8">

        {/* ── 1. Search Bar ────────────────────────────────────────────────── */}
        {/*
          * Pressing Enter or the search icon on this page navigates to /search.
          * The input value is intentionally uncontrolled here — it's just a
          * visual affordance; real filtering happens on SearchResultPage.
          */}
        <SearchBar
          value=""
          onChange={() => {}}
          onSearch={goToSearch}
        />

        {/* ── 2. City-wide map ─────────────────────────────────────────────── */}
        {/*
          * Unlike the HeroSection venue snippet (fully locked), this map is
          * draggable so users can explore the city.  Zoom buttons are hidden
          * to keep the UI clean on mobile — pinch-to-zoom still works.
          */}
        <div style={{ height: '40vh' }} className="w-full">
          <MapContainer
            center={CITY_CENTER}
            zoom={CITY_ZOOM}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </MapContainer>
        </div>

        {/* ── 3. CTA block ─────────────────────────────────────────────────── */}
        <div className="mx-3 mt-5">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
            Plan a Day with Your Crew
          </h1>

          {/* FilterBar lets the user configure crew + filters before searching */}
          <FilterBar
            locationCode="H4G 1V4"
            radiusKm={radiusKm}
            onRadiusChange={setRadiusKm}
            activeTagFilters={activeTagFilters}
            onTagToggle={handleTagToggle}
          />

          {/* Search button — large tap target, navigates to SearchResultPage */}
          <button
            onClick={goToSearch}
            className="
              w-full mt-4 py-3
              bg-white border border-gray-300
              rounded-2xl shadow-sm
              text-gray-800 font-semibold text-lg
              hover:bg-purple-50 hover:border-purple-300
              active:scale-95
              transition-all
            "
          >
            Search
          </button>
        </div>

        {/* ── 4. Recommendations grid ──────────────────────────────────────── */}
        {/*
          * RecommendationsList sorts MOCK_PLACES by Crew Match Score using the
          * current crew from context, so adjusting the crew re-ranks the cards.
          * Clicking a card navigates to /search (SearchResultPage).
          */}
        <div className="mt-5">
          <p className="mx-3 mb-1 text-gray-500 text-xs font-semibold uppercase tracking-wide">
            Recommendations For You
          </p>
          <RecommendationsList onSelectPlace={goToSearch} />
        </div>

      </div>
    </CrewProvider>
  )
}

export default HomeDashboard
