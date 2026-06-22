# CLAUDE.md — Project Brain: Anywhere Parent

## 🌟 Project Vision & Philosophy
**Anywhere Parent** is a situational awareness tool for parents and caregivers.

### Core Philosophy: Parental Preparedness & Agency
- **Freedom to Explore:** This is NOT just a "kid-friendly" place finder. It is an app to help parents maintain their lifestyle and go **anywhere** by providing the context they need to plan ahead.
- **Situational Awareness:** The goal is to eliminate the "unknowns." Parents should know the environment (noise, space, amenities) so they can decide if a venue fits their current needs.
- **Agency over Limitation:** We empower parents to choose their own adventure by giving them the data to handle any situation.

## 🛠️ Tech Stack (The "Vibe Coding" Stack)
- **Frontend:** React (Vite) + Tailwind CSS (for modern, clean UI)
- **Backend:** FastAPI (Python)
- **Database:** SQLite (Simple, local-first)
- **Maps:** Leaflet + OpenStreetMap (Free, open-source alternative to Google Maps)

## ✨ Strategic Features (The "Awareness" Checklist)
The app tracks parent-verified data points for any location:
- **Spatial Awareness:** Can a double stroller fit? Are there high-top tables only?
- **Sensory Environment:** Noise levels (is it loud enough to mask a fussy baby?) and lighting.
- **Tactile Details:** Silverware types (plastic/wood options), kid menus, or coloring supplies.
- **Basic Needs:** Changing table locations and high-chair availability.
- **The "Vibe" Check:** Parent reports on staff attitude toward children.

## 📏 Coding Standards & Communication
- **Beginner-Friendly:** Write clean, modular React components.
- **Heavy Documentation:** Include comments explaining the "why" behind the code logic.
- **Modular Progress:** Build one feature at a time. Do not move to the next step until the current one is verified.
- **Verification:** Always provide the exact terminal command needed to test the current build.

## 🚧 Roadmap & Current Status
- [x] **Phase 1:** Project initialization and folder structure.
- [x] **Phase 2:** Basic map rendering with Leaflet.
- [x] **Phase 3:** Search bar and basic "Awareness" pins on the map.
- [x] **Phase 4:** Parent Report form for crowdsourcing data.
- [ ] **Phase 5 (Current):** Seed data pipeline — real Wellington/Verdun venues with parent-awareness tags baked in before launch.

## 🎨 UI & Logic Specifics
- **The Match Score:** This is a dynamic number (0.0–10.0) calculated by comparing the "Crew" requirements against the "Place Tags." It is distinct from the public star rating (out of 5). See `src/utils/scoreEngine.js` for the algorithm.
- **Crew State:** The app must track the number of Adults, Toddlers, and Infants in the current session. This state lives in `CrewContext` and defaults to the parent's saved profile counts. It can be adjusted per-session via the "Adjust" button in the FilterBar.
- **Location Snippet:** The top-left map box in HeroSection is a non-interactive (or severely limited-interaction) Leaflet map showing the immediate block around the venue. Disable dragging, zoom controls, scroll wheel zoom, double-click zoom, and tap zoom to keep it read-only.

## 🗂️ Phase 5 — Seed Data Pipeline

### Goal
Populate the SQLite database with ~100 real Wellington/Verdun venues that already carry plausible parent-awareness tags so the app is useful from day one, before real parents submit reports.

### Geographic Focus
Wellington corridor, Verdun, Montreal. Center point: `45.4616, -73.5697`, radius 1 km.

### Pipeline Steps
| Step | Script | Status | Output |
|------|--------|--------|--------|
| 1 — Venue Discovery | `scripts/fetch_venues.py` | Done | `scripts/raw_venues.json` (106 venues, gitignored) |
| 2 — Tag Suggestion | `scripts/suggest_tags.py` | Next | `scripts/tagged_venues.json` (gitignored) |
| 3 — Manual Review | human + text editor | Pending | edited `tagged_venues.json` |
| 4 — DB Import | `scripts/import_seed.py` | Pending | rows in `backend/db.sqlite3` |

### Tag Suggestion Approach (Step 2)
**Method: LLM with venue metadata only (Option A).**

We feed each venue's `name`, `place_type`, `address`, `rating`, and `price_level` to Claude and ask it to suggest a set of parent-awareness tags. No review text or photo analysis is used.

**Rationale:** Tag suggestions are *candidates only* — every tag must be manually confirmed before import. Adding more data sources (Google reviews, photos) would give a false sense of accuracy and undermine the principle that parent-verified reports are the only reliable source. The LLM pass is just a starting draft to speed up manual review, not a substitute for it.

### Tag Vocabulary
Tags are short, lowercase strings from a fixed vocabulary:
- **Space:** `stroller_friendly`, `high_tops_only`, `tight_space`, `outdoor_seating`
- **Noise:** `noise_low`, `noise_moderate`, `noise_high`
- **Needs:** `changing_table`, `high_chairs`, `kids_menu`
- **Vibe:** `kid_welcoming`, `mixed_vibe`, `adult_focused`
- **Type:** `playground`, `splash_pad`, `covered_area` (parks only)

### Key Files
- `scripts/fetch_venues.py` — Step 1 script (committed)
- `scripts/suggest_tags.py` — Step 2 script (to be written next session)
- `scripts/.env` — API keys (gitignored, never committed)
- `scripts/raw_venues.json` — raw Google Places output (gitignored)
- `scripts/tagged_venues.json` — LLM-suggested tags for manual review (gitignored)

## 💻 Development Commands
*(To be populated after project initialization)*
- **Start Frontend:** `npm run dev`
- **Start Backend:** `uvicorn main:app --reload`
