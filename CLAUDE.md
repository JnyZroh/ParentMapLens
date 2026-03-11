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
- [ ] **Phase 1 (Current):** Project initialization and folder structure.
- [ ] **Phase 2:** Basic map rendering with Leaflet.
- [ ] **Phase 3:** Search bar and basic "Awareness" pins on the map.
- [ ] **Phase 4:** Parent Report form for crowdsourcing data.

## 🎨 UI & Logic Specifics
- **The Match Score:** This is a dynamic number (0.0–10.0) calculated by comparing the "Crew" requirements against the "Place Tags." It is distinct from the public star rating (out of 5). See `src/utils/scoreEngine.js` for the algorithm.
- **Crew State:** The app must track the number of Adults, Toddlers, and Infants in the current session. This state lives in `CrewContext` and defaults to the parent's saved profile counts. It can be adjusted per-session via the "Adjust" button in the FilterBar.
- **Location Snippet:** The top-left map box in HeroSection is a non-interactive (or severely limited-interaction) Leaflet map showing the immediate block around the venue. Disable dragging, zoom controls, scroll wheel zoom, double-click zoom, and tap zoom to keep it read-only.

## 💻 Development Commands
*(To be populated after project initialization)*
- **Start Frontend:** `npm run dev`
- **Start Backend:** `uvicorn main:app --reload`
