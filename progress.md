# Anywhere Parent — Session Progress

## Phase 2 Complete ✅
All five wireframe components render correctly in `SearchResultPage`. Crew state, compatibility scoring, and the Leaflet map snippet are all functional.

---

## Phase 2.5 — Location & Photo Data (Complete ✅)

Completed in session `review-project-plan-oxRNH`.

- [x] Replace placeholder addresses with real Verdun (Montréal) addresses on/near Rue Wellington around Métro Verdun
- [x] Main venue: **Café La Marmite** — 3975 Rue Wellington, Verdun, H4G 1V4 — `[45.4659, -73.5720]`
- [x] Four suggestions with H4G postal codes: La Cantine Verdunoise, Boulangerie Automne, Parc-Café Riverside, Brasserie du Quartier
- [x] Add `VENUE_PHOTOS` array (6 `picsum.photos` seed-stable URLs) — one photo per tag
  - `verdun-cafe-interior` → Venue
  - `restaurant-highchair` → High Chairs
  - `wide-cafe-entrance` → Stroller Access
  - `baby-change-station` → Changing Table
  - `toddler-play-corner` → Play Area
  - `family-restroom-sign` → Family Restroom
- [x] Update `HeroSection` `PhotoTile` to accept `{ src, label }` objects and render a tag-name overlay on each photo
- [x] Update `FilterBar` location chip to `H4G 1V4`
- [x] Update `MapComponent` default center to Métro Verdun `[45.4651, -73.5692]`, zoom 15

---

## Phase 3 — Wire Up SearchResultPage Interactivity with Fake Data (Complete ✅)

Completed in session `review-project-plan-oxRNH`.

### 1. Expand mock data in `SearchResultPage.jsx`
- [x] Add `photos` array (6 picsum.photos `{ src, label }` objects) to every venue including all suggestions
- [x] Combine main place + suggestions into a single `MOCK_PLACES` array
- [x] Track `activePlaceId` in local state (default: `MOCK_PLACES[0].id`)
- [x] Derive `activePlace` from `activePlaceId` + `MOCK_PLACES`
- [x] Lift `radiusKm` and `activeTagFilters` into page-level state so FilterBar changes affect the grid
- [x] Pass `onSelectPlace`, `onRadiusChange`, `onTagToggle` callbacks down to children

### 2. `SuggestionsGrid.jsx` / `SuggestionCard`
- [x] `SuggestionCard` is now a `<button>` that calls `onSelect(place.id)` on click
- [x] `cursor-pointer` + `hover:ring-2 hover:ring-purple-400` signal the card is tappable
- [x] `focus-visible` ring added for keyboard accessibility

### 3. `FilterBar.jsx`
- [x] Accept `radiusKm` + `onRadiusChange` props (replaced internal `useState`)
- [x] Accept `activeTagFilters` + `onTagToggle` props (replaced hardcoded default)
- [x] Tag chips in SHOWING section are now `<button>` elements with a × remove action
- [x] When `activeTagFilters` is empty, shows "All venues" placeholder text

### 4. Filter logic in `SearchResultPage.jsx`
- [x] Filter suggestions by `distance <= radiusKm`
- [x] Filter by tag: only show suggestions sharing at least one tag with `activeTagFilters`
- [x] Filter by `searchText`: case-insensitive name match (empty search passes all)
- [x] Active place is always excluded from suggestions (never shows current venue as a card)

### 5. `HeroSection.jsx`
- [x] Already accepts `center` and `photos` props — no structural changes needed
- [x] `SearchResultPage` now passes `activePlace.photos` so the grid updates on card click

### State flow (implemented)
```
SearchResultPage
  activePlaceId    → derives activePlace + filters suggestions
  searchText       → filters suggestions by name
  radiusKm         → filters suggestions by distance  (lifted from FilterBar)
  activeTagFilters → filters suggestions by tags      (lifted from FilterBar)
  │
  ├── SearchBar       (value=searchText, onChange=setSearchText)
  ├── HeroSection     (center=activePlace.coordinates, photos=activePlace.photos)
  ├── MainInfoCard    (place=activePlace)
  ├── FilterBar       (radiusKm, onRadiusChange, activeTagFilters, onTagToggle)
  └── SuggestionsGrid (suggestions=filteredSuggestions, onSelectPlace=setActivePlaceId)
```

### Verification steps
Run `cd frontend && npm run dev`, then confirm:
1. Click a suggestion card → MainInfoCard name, map pin, and photo grid all change
2. Drag distance slider to 0.5 km → only Café La Marmite (0.3 km) remains visible
3. Type "boul" in search bar → only Boulangerie Automne appears in suggestions
4. Click × on a tag chip in SHOWING → suggestions missing that tag disappear
5. Adjust crew → all compatibility scores update in real time

---

## Phase 4 — Homepage / Dashboard with Recommendations
> Largely complete. One item remaining (see below).

### Completed ✅
- [x] **Routing** — `App.jsx` uses `BrowserRouter`; `/` → `HomeDashboard`, `/search` → `SearchResultPage`
- [x] **`HomeDashboard.jsx`** — full layout implemented:
  - SearchBar (uncontrolled; pressing Search navigates to `/search`)
  - Full-width Leaflet `MapContainer` at 40vh, centered on Métro Verdun, draggable, `zoomControl={false}`
  - "Plan a Day with Your Crew" CTA heading
  - `FilterBar` with live `radiusKm` + `activeTagFilters` state
  - Large "Search" button → `navigate('/search')`
  - "Recommendations For You" section using `RecommendationsList` (sorted descending by Crew Match Score via `useMemo`)
- [x] **`FavoritesContext.jsx`** — `FavoritesProvider` + `useFavorites` hook; `favorites` is a `Set` of place IDs
- [x] **`FavoritesProvider`** wraps the entire app in `main.jsx` so favorites persist across navigation
- [x] **☆/★ star toggle** on `SuggestionCard` — calls `toggleFavorite` from `FavoritesContext`; filled ★ = `text-yellow-300`

### Remaining ⬜
- [ ] **Favorites surfaced first in recommendations** — `RecommendationsList` currently sorts by Crew Match Score only. It should also read `useFavorites` and float favorited venues to the top of the list before the score sort kicks in.

---

## Phase 5 — Parent Report Form
> Crowdsource awareness data via `POST /api/places/{id}/reviews`. Not yet started.
