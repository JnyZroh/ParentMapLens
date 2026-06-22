# Anywhere Parent — Current Features

## Map & Location
- **Read-only venue map snippet** — Leaflet map in HeroSection showing the block around the active venue. Interaction fully disabled (no drag, zoom, scroll, or tap).
- **Métro Verdun area data** — All current venues use real Verdun addresses and coordinates on or near Rue Wellington (H4G postal codes).

## Venue Display
- **Venue photo grid** — 2×3 grid of 6 picsum.photos images in HeroSection, each tagged with the amenity it represents (e.g. "High Chairs", "Stroller Access"). Seed-stable URLs mean the same photo loads every time.
- **Main info card** — Shows venue name, address, public star rating (out of 5), distance, and a list of verified amenity tags with shape icons.
- **Dual rating system** — Public star rating (generic 5-star) displayed separately from the Crew Match Score (0.0–10.0, personalized).

## Crew & Compatibility Scoring
- **Crew state** — Tracks Adults, Toddlers, and Infants via `CrewContext`. Shared globally across all components.
- **Crew adjuster** — "Adjust" button in FilterBar opens inline +/− steppers to change crew composition per session.
- **Crew Match Score** — Dynamic 0.0–10.0 score calculated by `scoreEngine.js`, comparing the crew's needs against the venue's tags. Recalculates instantly when crew changes.
- **Score-based card colours** — SuggestionCard background reflects match quality: dark blue (≥ 7.5), sky blue (≥ 5.5), white (< 5.5).

## Search & Filtering
- **Live search** — Typing in the SearchBar filters the suggestions grid by venue name (case-insensitive). Clears when the search box is empty.
- **Distance slider** — FilterBar range input (0.5–10 km) hides suggestions beyond the selected radius. Updates the grid in real time.
- **Tag filters with live removal** — Active tag filters shown as pill chips in the SHOWING column. Clicking × removes a tag and immediately updates the grid. Shows "All venues" when no filters are active.

## Suggestion Grid & Navigation
- **Suggestions grid** — 2-column grid of nearby venues, each showing name, distance, tag icons, and Crew Match Score.
- **Clickable venue cards** — Tapping a suggestion card promotes it to the active venue, updating the hero map pin, photo grid, info card, and score badge simultaneously.
- **Empty state** — Displays "No nearby venues match your filters" when all suggestions are filtered out.

## Navigation & Routing
- **Client-side routing** — `BrowserRouter` in `App.jsx`; `/` renders `HomeDashboard`, `/search` renders `SearchResultPage`.
- **Home Dashboard** — Landing page with a SearchBar, full-width draggable Leaflet map at 40vh centered on Métro Verdun (no zoom controls), "Plan a Day with Your Crew" CTA heading, `FilterBar` with live radius and tag state, and a "Search" button that navigates to `/search`.

## Favorites & Recommendations
- **Favorites context** — `FavoritesContext` with `FavoritesProvider` wrapping the full app in `main.jsx`. Favorites persist as a `Set` of place IDs across page navigation.
- **Favorite toggle** — ☆/★ button on each `SuggestionCard`. Filled star (`text-yellow-300`) indicates a saved favorite.
- **Recommendations sorting** — "Recommendations For You" section on `HomeDashboard` surfaces favorited venues first, then ranks the remainder by descending Crew Match Score. Recalculates when either crew composition or favorites change.
