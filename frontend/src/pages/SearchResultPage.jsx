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
// All locations are in the Verdun borough of Montréal, centred around
// Métro Verdun on Rue Wellington — the neighbourhood's main commercial strip.
//
// Shape:
//   name     : display name
//   address  : street address + postal code (Verdun, H4G prefix)
//   rating   : public star rating out of 5.0
//   distance : km from user's location
//   tags     : array of verified amenity tag keys
//   coordinates : [latitude, longitude] for the Leaflet map snippet

const MOCK_PLACE = {
  id: 1,
  name: 'Café La Marmite',
  address: '3975 Rue Wellington, Verdun, H4G 1V4',
  rating: 4.3,
  distance: 0.3,
  tags: ['stroller_friendly', 'changing_table', 'play_area', 'high_chairs', 'unisex_baby_duty'],
  // Coordinates on Rue Wellington, just west of Métro Verdun
  coordinates: [45.4659, -73.5720],
}

// ── Venue photos ──────────────────────────────────────────────────────────────
// Six placeholder images sourced from picsum.photos (a free, seed-stable photo
// service).  Each photo is semantically linked to one of the venue's tags so
// parents can visually confirm the amenity they care about.
//
// Seed naming convention: <tag-key>-<descriptor> → stable URL per tag
// (same seed always returns the same photo, so the grid stays consistent).
const VENUE_PHOTOS = [
  {
    src: 'https://picsum.photos/seed/verdun-cafe-interior/400/300',
    label: 'Venue',           // General café shot
  },
  {
    src: 'https://picsum.photos/seed/restaurant-highchair/400/300',
    label: 'High Chairs',     // tag: high_chairs
  },
  {
    src: 'https://picsum.photos/seed/wide-cafe-entrance/400/300',
    label: 'Stroller Access', // tag: stroller_friendly
  },
  {
    src: 'https://picsum.photos/seed/baby-change-station/400/300',
    label: 'Changing Table',  // tag: changing_table
  },
  {
    src: 'https://picsum.photos/seed/toddler-play-corner/400/300',
    label: 'Play Area',       // tag: play_area
  },
  {
    src: 'https://picsum.photos/seed/family-restroom-sign/400/300',
    label: 'Family Restroom', // tag: unisex_baby_duty
  },
]

// Four nearby alternatives displayed in the SuggestionsGrid.
// All on or near Rue Wellington in Verdun, within walking distance of Métro Verdun.
const MOCK_SUGGESTIONS = [
  {
    id: 2,
    name: 'La Cantine Verdunoise',
    address: '4102 Rue Wellington, Verdun, H4G 1V7',
    distance: 0.6,
    tags: ['stroller_friendly', 'changing_table', 'play_area', 'high_chairs'],
    coordinates: [45.4655, -73.5756],
  },
  {
    id: 3,
    name: 'Boulangerie Automne',
    address: '3889 Rue Wellington, Verdun, H4G 1T9',
    distance: 0.4,
    tags: ['changing_table', 'high_chairs'],
    coordinates: [45.4663, -73.5697],
  },
  {
    id: 4,
    name: 'Parc-Café Riverside',
    // Along the St. Lawrence River waterfront promenade in Verdun
    address: '600 Prom. Wellington, Verdun, H4G 1M4',
    distance: 0.8,
    tags: ['stroller_friendly', 'play_area', 'high_chairs', 'unisex_baby_duty'],
    coordinates: [45.4672, -73.5770],
  },
  {
    id: 5,
    name: 'Brasserie du Quartier',
    address: '75 Rue Galt O., Verdun, H4G 1B8',
    distance: 1.2,
    tags: ['stroller_friendly', 'changing_table', 'high_chairs'],
    coordinates: [45.4645, -73.5668],
  },
]

// Active tag filters shown in the "Showing" column of the FilterBar
const ACTIVE_FILTERS = ['stroller_friendly', 'changing_table', 'play_area']

function SearchResultPage() {
  // Controlled search input value
  const [searchText, setSearchText] = useState('Café La Marmite')

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
          photos={VENUE_PHOTOS}
        />

        {/* ── 3. Main Info Card: Venue Details + Dual Ratings ───────────── */}
        <div className="mt-3">
          <MainInfoCard place={MOCK_PLACE} />
        </div>

        {/* ── 4. Filter Bar: Crew · Filters · Showing ───────────────────── */}
        <FilterBar
          locationCode="H4G 1V4"
          activeTagFilters={ACTIVE_FILTERS}
        />

        {/* ── 5. Suggestions Grid: Nearby Venues ────────────────────────── */}
        <SuggestionsGrid suggestions={MOCK_SUGGESTIONS} />

      </div>
    </CrewProvider>
  )
}

export default SearchResultPage
