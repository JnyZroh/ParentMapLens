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

## Phase 3 — Wire Up SearchResultPage Interactivity with Fake Data

> **Goal:** Make every visible control do something meaningful using expanded mock data — no backend required.

### 1. Expand mock data in `SearchResultPage.jsx`
- [ ] Add `photos` array (6 picsum.photos URLs) to each suggestion in `MOCK_SUGGESTIONS`
- [ ] Combine main place + suggestions into a single `MOCK_PLACES` array
- [ ] Track `activePlaceId` in local state (default: `MOCK_PLACE.id`)
- [ ] Derive `activePlace` and `nearbySuggestions` from `activePlaceId` + `MOCK_PLACES`
- [ ] Lift `radiusKm` and `activeTagFilters` into page-level state so FilterBar changes affect the grid
- [ ] Pass `onSelectPlace`, `onRadiusChange`, `onTagToggle` callbacks down to children

### 2. `SuggestionsGrid.jsx` / `SuggestionCard`
- [ ] Add `onClick` prop to `SuggestionCard` → calls `onSelectPlace(place.id)`
- [ ] Add hover/active cursor style to signal the card is clickable

### 3. `FilterBar.jsx`
- [ ] Accept `radiusKm` + `onRadiusChange` props (replace internal `useState`)
- [ ] Accept `activeTagFilters` + `onTagToggle` props (replace hardcoded prop)
- [ ] Tag chips in SHOWING section become clickable `<button>` elements with a remove (×) action

### 4. Filter logic in `SearchResultPage.jsx`
- [ ] Filter `nearbySuggestions` by `distance <= radiusKm`
- [ ] Filter by tag: only show suggestions that share at least one tag with `activeTagFilters`
- [ ] Filter by `searchText`: case-insensitive name match (if search text is non-empty)

### 5. `HeroSection.jsx`
- [x] Already accepts `center` and `photos` props — no structural changes needed
- [ ] `SearchResultPage` will pass photos from the active place in mock data

### State flow after changes
```
SearchResultPage
  activePlaceId    → derives activePlace + nearbySuggestions
  searchText       → filters suggestions by name
  radiusKm         → filters suggestions by distance  (lifted from FilterBar)
  activeTagFilters → filters suggestions by tags      (lifted from FilterBar)
  │
  ├── SearchBar       (searchText, onChange)
  ├── HeroSection     (center=activePlace.coordinates, photos=activePlace.photos)
  ├── MainInfoCard    (place=activePlace)
  ├── FilterBar       (radiusKm, onRadiusChange, activeTagFilters, onTagToggle)
  └── SuggestionsGrid (suggestions=filtered, onSelectPlace)
```

### Critical files
- `frontend/src/pages/SearchResultPage.jsx` — primary state owner; most logic lives here
- `frontend/src/components/FilterBar.jsx` — lift radiusKm + activeTagFilters to props
- `frontend/src/components/SuggestionsGrid.jsx` — add onClick to cards

### Verification steps
Run `cd frontend && npm run dev`, then confirm:
1. Click a suggestion card → MainInfoCard name + map pin change
2. Drag distance slider to 1 km → far cards disappear
3. Type in search bar → only matching venues remain in suggestions
4. Click × on a tag chip in SHOWING → suggestions missing that tag disappear
5. Adjust crew → all compatibility scores update in real time (already works)

---

## Phase 4 — Parent Report Form
> Crowdsource awareness data via `POST /api/places/{id}/reviews`. Not yet started.
