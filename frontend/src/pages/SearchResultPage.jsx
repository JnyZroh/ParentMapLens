/**
 * SearchResultPage.jsx
 *
 * The main page the user sees after searching for a venue.
 * Composes all five components from the wireframe into a single scrollable
 * mobile-first layout, wrapped in the CrewProvider so all children share
 * the same Crew state without prop drilling.
 *
 * ── Component tree ────────────────────────────────────────────────────────────
 *
 *   CrewProvider  ← global crew state lives here
 *   └── SearchResultPage
 *       ├── SearchBar          ← search input + profile button
 *       ├── HeroSection        ← map snippet (left) + photo grid (right)
 *       ├── MainInfoCard       ← venue details + dual ratings + score badge
 *       ├── FilterBar          ← crew · filters · showing
 *       └── SuggestionsGrid    ← 2-column nearby venue cards
 *
 * ── Data Flow (Phase 5) ───────────────────────────────────────────────────────
 * On mount, a useEffect fetches GET /api/places from the FastAPI backend.
 * The first place in the list becomes the "featured" venue (MainInfoCard +
 * HeroSection); the rest populate the SuggestionsGrid.
 *
 * While the fetch is in-flight we show a loading spinner.
 * If the backend is unreachable we fall back to hardcoded fallback data so
 * the UI is never completely blank during development.
 *
 * ── Responsiveness ────────────────────────────────────────────────────────────
 * Mobile-first: the page is designed for ~375px wide screens.
 * `max-w-2xl mx-auto` centres and caps width on tablets and desktops so the
 * card layout doesn't stretch awkwardly on wide screens.
 */

import { useState, useEffect } from 'react'
import { CrewProvider }    from '../context/CrewContext'
import SearchBar           from '../components/SearchBar'
import HeroSection         from '../components/HeroSection'
import MainInfoCard        from '../components/MainInfoCard'
import FilterBar           from '../components/FilterBar'
import SuggestionsGrid     from '../components/SuggestionsGrid'

// ── API base URL ──────────────────────────────────────────────────────────────
// During development the FastAPI backend runs on port 8000.
// In production this would be replaced by the deployed API URL.
const API_BASE = 'http://localhost:8000'

// ── Fallback data ─────────────────────────────────────────────────────────────
// If the backend is not running (e.g. frontend-only dev session), we fall back
// to this data so the UI still renders with meaningful content instead of a
// blank screen.  These mirror the real seed data so the fallback looks authentic.
const FALLBACK_PLACES = [
  {
    id: 1,
    name: 'Café Olimpico',
    address: '124 Rue St-Viateur O, Montréal, H2T 2K8',
    rating: 4.3,
    distance: 0,
    tags: ['stroller_friendly', 'changing_table', 'high_chairs', 'unisex_baby_duty'],
    coordinates: [45.5231, -73.6203],
  },
  {
    id: 2,
    name: 'Fairmount Bagel',
    address: '74 Av. Fairmount O, Montréal, H2T 2M2',
    rating: 4.6,
    distance: 0.9,
    tags: ['stroller_friendly', 'high_chairs'],
    coordinates: [45.5227, -73.6074],
  },
  {
    id: 3,
    name: 'Parc Sir-Wilfrid-Laurier',
    address: '3875 Av. du Parc-La Fontaine, Montréal',
    rating: 4.7,
    distance: 2.1,
    tags: ['stroller_friendly', 'changing_table', 'play_area'],
    coordinates: [45.5279, -73.5897],
  },
  {
    id: 4,
    name: "Wilensky's Light Lunch",
    address: '34 Av. Fairmount O, Montréal, H2T 2M1',
    rating: 4.2,
    distance: 1.0,
    tags: ['high_chairs'],
    coordinates: [45.5234, -73.6043],
  },
  {
    id: 5,
    name: 'Kem CoBa',
    address: '60 Av. Fairmount O, Montréal, H2T 2M2',
    rating: 4.5,
    distance: 0.9,
    tags: ['stroller_friendly', 'changing_table', 'high_chairs', 'unisex_baby_duty'],
    coordinates: [45.5228, -73.6059],
  },
]

// Active tag filters shown in the "Showing" column of the FilterBar
const ACTIVE_FILTERS = ['stroller_friendly', 'changing_table', 'play_area']

/**
 * haversineKm
 *
 * Compute the straight-line distance (in km) between two lat/lng points.
 * Used to attach a `distance` value to each fetched place so the suggestion
 * cards can show "1.4 km".
 *
 * The anchor point is the first place returned by the API (the featured venue).
 *
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} distance in km, rounded to one decimal
 */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return Math.round(Math.sqrt(Math.asin(Math.sqrt(a))) * 2 * R * 10) / 10
}

function SearchResultPage() {
  // Controlled search input value
  const [searchText, setSearchText] = useState('')

  // `featuredPlace` is the venue shown in HeroSection + MainInfoCard
  const [featuredPlace, setFeaturedPlace] = useState(null)

  // `suggestions` is the list of nearby venues shown in SuggestionsGrid
  const [suggestions, setSuggestions] = useState([])

  // Loading and error state for the initial data fetch
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // ── Fetch places from the API on mount ──────────────────────────────────
  useEffect(() => {
    // AbortController lets us cancel the fetch if the component unmounts
    // before the response arrives (prevents "can't update state on unmounted
    // component" warnings during hot-reloads in development).
    const controller = new AbortController()

    async function fetchPlaces() {
      try {
        const response = await fetch(`${API_BASE}/api/places`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`)
        }

        const data = await response.json()
        const places = data.places

        if (!places || places.length === 0) {
          // Database seeded but empty — use fallback for UI preview
          loadFallback()
          return
        }

        // First place is the "featured" venue; the rest go in suggestions.
        // Attach a haversine distance from the featured venue to each suggestion.
        const [first, ...rest] = places
        const anchor = first.coordinates

        setFeaturedPlace({ ...first, distance: 0 })
        setSuggestions(
          rest.map(p => ({
            ...p,
            distance: haversineKm(anchor[0], anchor[1], p.coordinates[0], p.coordinates[1]),
          }))
        )
        setSearchText(first.name)
      } catch (err) {
        // AbortError is expected on cleanup — don't treat it as a real error
        if (err.name === 'AbortError') return

        // Backend unreachable: log the error and fall back to static data
        console.warn('Could not reach backend API — using fallback data.', err.message)
        loadFallback()
        setError('Backend offline — showing sample data.')
      } finally {
        setLoading(false)
      }
    }

    function loadFallback() {
      const [first, ...rest] = FALLBACK_PLACES
      setFeaturedPlace(first)
      setSuggestions(rest)
      setSearchText(first.name)
    }

    fetchPlaces()

    // Cleanup: cancel the in-flight request if the component is removed
    return () => controller.abort()
  }, []) // Empty deps array → run once on mount


  function handleSearch(text) {
    // Phase 6: replace with an API call to GET /api/places?q={text}
    console.log('Search for:', text)
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 max-w-2xl mx-auto flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading venues…</p>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    /*
     * CrewProvider wraps the entire page so every child component
     * (MainInfoCard, FilterBar, SuggestionsGrid) can call useCrew()
     * and get the same shared state.
     */
    <CrewProvider>
      {/*
        * Outer wrapper:
        *   min-h-screen    → page fills the viewport even with little content
        *   bg-gray-100     → subtle off-white background
        *   max-w-2xl       → cap width on large screens
        *   mx-auto         → centre horizontally on desktop
        *   pb-8            → bottom padding so last card isn't flush to edge
        */}
      <div className="min-h-screen bg-gray-100 max-w-2xl mx-auto pb-8">

        {/* Offline banner — shown when the backend is unreachable */}
        {error && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-xs text-yellow-700">
            {error}
          </div>
        )}

        {/* ── 1. Search Bar ──────────────────────────────────────────────── */}
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          onSearch={handleSearch}
        />

        {/* ── 2. Hero Section: Map Snippet + Photo Grid ──────────────────── */}
        {featuredPlace && (
          <HeroSection
            center={featuredPlace.coordinates}
            zoom={16}
            photos={[]} // Phase 6: populate with real venue photo URLs
          />
        )}

        {/* ── 3. Main Info Card: Venue Details + Dual Ratings ───────────── */}
        {featuredPlace && (
          <div className="mt-3">
            <MainInfoCard place={featuredPlace} />
          </div>
        )}

        {/* ── 4. Filter Bar: Crew · Filters · Showing ───────────────────── */}
        <FilterBar
          locationCode="H2T 2K8"
          activeTagFilters={ACTIVE_FILTERS}
        />

        {/* ── 5. Suggestions Grid: Nearby Venues ────────────────────────── */}
        <SuggestionsGrid suggestions={suggestions} />

      </div>
    </CrewProvider>
  )
}

export default SearchResultPage
