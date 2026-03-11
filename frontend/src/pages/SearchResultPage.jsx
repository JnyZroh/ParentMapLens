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
 * ── Mock Data ─────────────────────────────────────────────────────────────────
 * MOCK_PLACE and MOCK_SUGGESTIONS stand in for real API responses.
 * In Phase 3 these will be replaced by a `useEffect` fetch to GET /api/places.
 *
 * ── Responsiveness ────────────────────────────────────────────────────────────
 * Mobile-first: the page is designed for ~375px wide screens.
 * `max-w-2xl mx-auto` centres and caps width on tablets and desktops so the
 * card layout doesn't stretch awkwardly on wide screens.
 */

import { useState }        from 'react'
import { CrewProvider }    from '../context/CrewContext'
import SearchBar           from '../components/SearchBar'
import HeroSection         from '../components/HeroSection'
import MainInfoCard        from '../components/MainInfoCard'
import FilterBar           from '../components/FilterBar'
import SuggestionsGrid     from '../components/SuggestionsGrid'

// ── Mock data ─────────────────────────────────────────────────────────────────
// This represents a single venue "result" that the user tapped in a list.
// Shape:
//   name     : display name
//   address  : street address + postal code
//   rating   : public star rating out of 5.0
//   distance : km from user's location
//   tags     : array of verified amenity tag keys
//   coordinates : [latitude, longitude] for the Leaflet map snippet

const MOCK_PLACE = {
  id: 1,
  name: 'Café Olimpico',
  address: '124 Rue St-Viateur O, H2T 2K8',
  rating: 4.1,
  distance: 1.1,
  tags: ['stroller_friendly', 'changing_table', 'play_area', 'high_chairs', 'unisex_baby_duty'],
  coordinates: [45.5231, -73.6203],
}

// Four nearby alternatives displayed in the SuggestionsGrid
const MOCK_SUGGESTIONS = [
  {
    id: 2,
    name: 'Resto du Quartier',
    address: '1111 address, h4e 1t6',
    distance: 1.1,
    tags: ['stroller_friendly', 'changing_table', 'play_area', 'high_chairs'],
    coordinates: [45.524, -73.621],
  },
  {
    id: 3,
    name: 'Boulangerie Locale',
    address: '1111 address, h4e 1t6',
    distance: 1.4,
    tags: ['changing_table', 'high_chairs'],
    coordinates: [45.522, -73.619],
  },
  {
    id: 4,
    name: 'Parc-Café',
    address: '1111 address, h4e 1t6',
    distance: 1.3,
    tags: ['stroller_friendly', 'play_area', 'high_chairs', 'unisex_baby_duty'],
    coordinates: [45.521, -73.623],
  },
  {
    id: 5,
    name: 'La Brasserie',
    address: '1111 address, h4e 1t6',
    distance: 2.1,
    tags: ['stroller_friendly', 'changing_table', 'high_chairs'],
    coordinates: [45.520, -73.618],
  },
]

// Active tag filters shown in the "Showing" column of the FilterBar
const ACTIVE_FILTERS = ['stroller_friendly', 'changing_table', 'play_area']

function SearchResultPage() {
  // Controlled search input value
  const [searchText, setSearchText] = useState('Café Olimpico')

  function handleSearch(text) {
    // Phase 3: replace with an API call to GET /api/places?q={text}
    console.log('Search for:', text)
  }

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

        {/* ── 1. Search Bar ──────────────────────────────────────────────── */}
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          onSearch={handleSearch}
        />

        {/* ── 2. Hero Section: Map Snippet + Photo Grid ──────────────────── */}
        <HeroSection
          center={MOCK_PLACE.coordinates}
          zoom={16}
          photos={[]} // Phase 3: populate with real venue photo URLs
        />

        {/* ── 3. Main Info Card: Venue Details + Dual Ratings ───────────── */}
        <div className="mt-3">
          <MainInfoCard place={MOCK_PLACE} />
        </div>

        {/* ── 4. Filter Bar: Crew · Filters · Showing ───────────────────── */}
        <FilterBar
          locationCode="H4E 1T5"
          activeTagFilters={ACTIVE_FILTERS}
        />

        {/* ── 5. Suggestions Grid: Nearby Venues ────────────────────────── */}
        <SuggestionsGrid suggestions={MOCK_SUGGESTIONS} />

      </div>
    </CrewProvider>
  )
}

export default SearchResultPage
