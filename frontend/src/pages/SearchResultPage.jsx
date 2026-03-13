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

// ── Mock data ─────────────────────────────────────────────────────────────────
// All venues in the Verdun borough of Montréal, centred around
// Métro Verdun on Rue Wellington — the neighbourhood's main commercial strip.
//
// Each venue has a `photos` array of 6 { src, label } objects.
// src  → seed-stable picsum.photos URL (same seed = same photo every load)
// label → the amenity tag the photo illustrates, shown as a small overlay

const MOCK_PLACES = [
  {
    id: 1,
    name: 'Café La Marmite',
    address: '3975 Rue Wellington, Verdun, H4G 1V4',
    rating: 4.3,
    distance: 0.3,
    tags: ['stroller_friendly', 'changing_table', 'play_area', 'high_chairs', 'unisex_baby_duty'],
    // Rue Wellington, just west of Métro Verdun
    coordinates: [45.4659, -73.5720],
    photos: [
      { src: 'https://picsum.photos/seed/verdun-cafe-interior/400/300',  label: 'Venue'           },
      { src: 'https://picsum.photos/seed/restaurant-highchair/400/300',  label: 'High Chairs'     },
      { src: 'https://picsum.photos/seed/wide-cafe-entrance/400/300',    label: 'Stroller Access' },
      { src: 'https://picsum.photos/seed/baby-change-station/400/300',   label: 'Changing Table'  },
      { src: 'https://picsum.photos/seed/toddler-play-corner/400/300',   label: 'Play Area'       },
      { src: 'https://picsum.photos/seed/family-restroom-sign/400/300',  label: 'Family Restroom' },
    ],
  },
  {
    id: 2,
    name: 'La Cantine Verdunoise',
    address: '4102 Rue Wellington, Verdun, H4G 1V7',
    rating: 4.0,
    distance: 0.6,
    tags: ['stroller_friendly', 'changing_table', 'play_area', 'high_chairs'],
    coordinates: [45.4655, -73.5756],
    photos: [
      { src: 'https://picsum.photos/seed/cantine-verdun-interior/400/300', label: 'Venue'           },
      { src: 'https://picsum.photos/seed/cantine-highchair/400/300',       label: 'High Chairs'     },
      { src: 'https://picsum.photos/seed/cantine-wide-entrance/400/300',   label: 'Stroller Access' },
      { src: 'https://picsum.photos/seed/cantine-baby-change/400/300',     label: 'Changing Table'  },
      { src: 'https://picsum.photos/seed/cantine-play-corner/400/300',     label: 'Play Area'       },
      { src: 'https://picsum.photos/seed/cantine-menu-board/400/300',      label: 'Menu'            },
    ],
  },
  {
    id: 3,
    name: 'Boulangerie Automne',
    address: '3889 Rue Wellington, Verdun, H4G 1T9',
    rating: 4.5,
    distance: 0.4,
    tags: ['changing_table', 'high_chairs'],
    coordinates: [45.4663, -73.5697],
    photos: [
      { src: 'https://picsum.photos/seed/boulangerie-automne-shop/400/300', label: 'Venue'          },
      { src: 'https://picsum.photos/seed/boulangerie-highchair/400/300',    label: 'High Chairs'    },
      { src: 'https://picsum.photos/seed/boulangerie-change/400/300',       label: 'Changing Table' },
      { src: 'https://picsum.photos/seed/boulangerie-pastries/400/300',     label: 'Pastries'       },
      { src: 'https://picsum.photos/seed/boulangerie-counter/400/300',      label: 'Counter'        },
      { src: 'https://picsum.photos/seed/boulangerie-seating/400/300',      label: 'Seating'        },
    ],
  },
  {
    id: 4,
    name: 'Parc-Café Riverside',
    // Along the St. Lawrence River waterfront promenade in Verdun
    address: '600 Prom. Wellington, Verdun, H4G 1M4',
    rating: 4.2,
    distance: 0.8,
    tags: ['stroller_friendly', 'play_area', 'high_chairs', 'unisex_baby_duty'],
    coordinates: [45.4672, -73.5770],
    photos: [
      { src: 'https://picsum.photos/seed/parc-cafe-terrace/400/300',    label: 'Venue'           },
      { src: 'https://picsum.photos/seed/parc-cafe-highchair/400/300',  label: 'High Chairs'     },
      { src: 'https://picsum.photos/seed/parc-stroller-path/400/300',   label: 'Stroller Access' },
      { src: 'https://picsum.photos/seed/parc-play-area/400/300',       label: 'Play Area'       },
      { src: 'https://picsum.photos/seed/parc-family-restroom/400/300', label: 'Family Restroom' },
      { src: 'https://picsum.photos/seed/parc-riverside-view/400/300',  label: 'Riverside'       },
    ],
  },
  {
    id: 5,
    name: 'Brasserie du Quartier',
    address: '75 Rue Galt O., Verdun, H4G 1B8',
    rating: 3.8,
    distance: 1.2,
    tags: ['stroller_friendly', 'changing_table', 'high_chairs'],
    coordinates: [45.4645, -73.5668],
    photos: [
      { src: 'https://picsum.photos/seed/brasserie-quartier-interior/400/300', label: 'Venue'          },
      { src: 'https://picsum.photos/seed/brasserie-highchair/400/300',         label: 'High Chairs'    },
      { src: 'https://picsum.photos/seed/brasserie-stroller-space/400/300',    label: 'Stroller Access'},
      { src: 'https://picsum.photos/seed/brasserie-change-room/400/300',       label: 'Changing Table' },
      { src: 'https://picsum.photos/seed/brasserie-bar-area/400/300',          label: 'Bar Area'       },
      { src: 'https://picsum.photos/seed/brasserie-food-plate/400/300',        label: 'Food'           },
    ],
  },
]

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
