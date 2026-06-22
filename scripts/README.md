# scripts/ — Seed Data Pipeline

Populates the app database with real Wellington/Verdun venues before launch.
All intermediate JSON files are gitignored; only the scripts are committed.

## Setup

```bash
cd scripts/
pip install requests python-dotenv anthropic
cp .env.example .env          # then fill in your keys
```

`.env` format:
```
GOOGLE_PLACES_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

## Step 1 — Venue Discovery (`fetch_venues.py`)

Queries Google Places Nearby Search (cafes, restaurants, parks within 1 km of
the Wellington corridor) and writes deduplicated, operational venues to
`raw_venues.json`.

```bash
python fetch_venues.py
# Output: raw_venues.json — 106 venues as of 2026-06-22
```

**Result shape:**
```json
{
  "place_id": "ChIJ...",
  "name": "Archway",
  "lat": 45.4669,
  "lng": -73.5667,
  "address": "3683 Rue Wellington, Montréal",
  "place_type": "cafe",
  "rating": 4.7,
  "user_ratings_total": 1015,
  "price_level": 2,
  "business_status": "OPERATIONAL",
  "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ..."
}
```

## Step 2 — Tag Suggestion (`suggest_tags.py`) — TODO

Reads `raw_venues.json`, sends each venue's metadata to Claude, and writes
candidate parent-awareness tags to `tagged_venues.json`.

**Method:** LLM with venue metadata only (name, type, address, rating,
price_level). No review text or photo analysis — those signals are less
reliable than parent-verified reports and would be false precision.

**Tag vocabulary:**
- Space: `stroller_friendly`, `high_tops_only`, `tight_space`, `outdoor_seating`
- Noise: `noise_low`, `noise_moderate`, `noise_high`
- Needs: `changing_table`, `high_chairs`, `kids_menu`
- Vibe: `kid_welcoming`, `mixed_vibe`, `adult_focused`
- Parks only: `playground`, `splash_pad`, `covered_area`

```bash
python suggest_tags.py
# Output: tagged_venues.json — same venues + suggested_tags[]
```

## Step 3 — Manual Review

Open `tagged_venues.json` in a text editor and verify/edit each venue's
`suggested_tags` array. Remove tags that are clearly wrong; add any obvious
ones the LLM missed. This is the human gate before anything hits the database.

## Step 4 — DB Import (`import_seed.py`) — TODO

Reads the reviewed `tagged_venues.json` and upserts rows into the SQLite
database, setting `is_seed = true` so the app can distinguish seed data from
parent-submitted reports.

```bash
python import_seed.py
# Output: rows inserted/updated in ../backend/db.sqlite3
```
