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
 * ── State owned by this page (Phase 3) ───────────────────────────────────────
 *
 *   activePlaceId    Which venue is "selected" (shown in hero + info card).
 *                    Clicking a suggestion card updates this.
 *
 *   searchText       Controlled value of the SearchBar input.
 *                    Filters suggestions by case-insensitive name match.
 *
 *   radiusKm         Distance filter, driven by the FilterBar slider.
 *                    Suggestions beyond this distance are hidden.
 *                    Lifted here so the grid reacts to slider changes.
 *
 *   activeTagFilters Array of tag keys that must appear on a venue for it
 *                    to be shown. Driven by the FilterBar × buttons.
 *                    Lifted here so the grid reacts to tag removal.
 *
 * ── Mock Data ─────────────────────────────────────────────────────────────────
 * MOCK_PLACES is a single array containing every venue (active + suggestions).
 * In Phase 4 this will be replaced by a useEffect fetch to GET /api/places.
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
import { MOCK_PLACES }     from '../data/mockPlaces'

function SearchResultPage() {
  // ── Which venue is currently "open" in the hero + info card ──────────────────
  // Clicking a suggestion card calls setActivePlaceId, swapping out the main view.
  const [activePlaceId, setActivePlaceId] = useState(MOCK_PLACES[0].id)

  // ── Search text (filters suggestions by name) ────────────────────────────────
  const [searchText, setSearchText] = useState('')

  // ── Distance radius (km) — lifted from FilterBar so it affects the grid ──────
  // Default 3 km shows all mock venues; drag the slider down to hide far ones.
  const [radiusKm, setRadiusKm] = useState(3)

  // ── Active tag filters — lifted from FilterBar ────────────────────────────────
  // Only suggestions that have at least one of these tags are shown.
  // Clicking × on a chip removes that tag from the filter.
  const [activeTagFilters, setActiveTagFilters] = useState([
    'stroller_friendly',
    'changing_table',
    'play_area',
  ])

  // ── Derived data ──────────────────────────────────────────────────────────────
  // The "active" place is the one currently shown in HeroSection + MainInfoCard.
  const activePlace = MOCK_PLACES.find(p => p.id === activePlaceId) ?? MOCK_PLACES[0]

  // All other places are candidates for the SuggestionsGrid.
  // Apply three independent filters; all three must pass for a card to appear.
  const filteredSuggestions = MOCK_PLACES.filter(p => {
    // Never show the currently selected venue in the suggestions list
    if (p.id === activePlaceId) return false

    // 1. Distance filter — hide venues beyond the slider value
    if (p.distance > radiusKm) return false

    // 2. Tag filter — venue must share at least one tag with activeTagFilters
    //    (If no filters are active, all venues pass this check.)
    if (activeTagFilters.length > 0 && !activeTagFilters.some(t => p.tags.includes(t))) return false

    // 3. Search text filter — case-insensitive name match
    //    (Empty search box passes all venues.)
    const query = searchText.trim().toLowerCase()
    if (query && !p.name.toLowerCase().includes(query)) return false

    return true
  })

  // ── Callbacks ─────────────────────────────────────────────────────────────────

  // Toggle a tag: if it's already active, remove it; otherwise add it.
  function handleTagToggle(tag) {
    setActiveTagFilters(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  function handleSearch(text) {
    // Phase 4: replace with an API call to GET /api/places?q={text}
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
        {/*
          * searchText filters suggestions as you type.
          * onSearch is called when the user presses Enter (Phase 4: API call).
          */}
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          onSearch={handleSearch}
        />

        {/* ── 2. Hero Section: Map Snippet + Photo Grid ──────────────────── */}
        {/*
          * center and photos derive from the active place, so clicking a
          * suggestion card automatically updates the map pin and photo grid.
          */}
        <HeroSection
          center={activePlace.coordinates}
          zoom={16}
          photos={activePlace.photos}
        />

        {/* ── 3. Main Info Card: Venue Details + Dual Ratings ───────────── */}
        <div className="mt-3">
          <MainInfoCard place={activePlace} />
        </div>

        {/* ── 4. Filter Bar: Crew · Filters · Showing ───────────────────── */}
        {/*
          * radiusKm and activeTagFilters are now owned here and passed down
          * as props so FilterBar changes immediately affect filteredSuggestions.
          */}
        <FilterBar
          locationCode="H4G 1V4"
          radiusKm={radiusKm}
          onRadiusChange={setRadiusKm}
          activeTagFilters={activeTagFilters}
          onTagToggle={handleTagToggle}
        />

        {/* ── 5. Suggestions Grid: Nearby Venues ────────────────────────── */}
        {/*
          * filteredSuggestions is already filtered by radius, tags, and search.
          * onSelectPlace swaps the active venue when a card is clicked.
          */}
        <SuggestionsGrid
          suggestions={filteredSuggestions}
          onSelectPlace={setActivePlaceId}
        />

      </div>
    </CrewProvider>
  )
}

export default SearchResultPage
