# Anywhere Parent — Data Strategy

## Tag Vocabulary (Canonical Reference)

Tags are short, lowercase strings from a fixed vocabulary. A venue can hold multiple tags from different categories. Tags marked **human-entry only** are never suggested by the LLM — they can only be added during manual review (Step 3) or via a parent report.

### Space
| Tag | Notes |
|-----|-------|
| `stroller_friendly` | Wide aisles, ground-floor access, room to park a stroller |
| `tight_space` | Cramped layout — a double stroller would struggle |
| `outdoor_seating` | Has a terrace, patio, or outdoor tables |
| `no_indoor_seating` | Take-out or counter service only — no tables inside. **Human-entry only** — do not infer from price level or review count; a new venue with few reviews may simply be new |

### Noise
| Tag | Notes |
|-----|-------|
| `noise_low` | Quiet — a sleeping infant is unlikely to be disturbed |
| `noise_moderate` | Typical café or casual restaurant background noise |
| `noise_high` | Loud — enough to mask a fussy baby, but also overstimulating for some kids |

### Needs
| Tag | Notes |
|-----|-------|
| `changing_table` | At least one changing table confirmed on-site |
| `high_chairs` | High chairs available |
| `kids_menu` | A dedicated kids menu or kids options offered |
| `play_area` | An indoor or outdoor play zone specifically for children |
| `unisex_baby_duty` | Changing/nursing facilities accessible to all genders |

### Vibe
| Tag | Notes |
|-----|-------|
| `kid_welcoming_low` | Has at least one family amenity (e.g., high chairs) but no strong signals |
| `kid_welcoming_medium` | Multiple family amenities present; venue feels designed for families |
| `kid_welcoming_high` | Family amenities + confirmed welcoming staff attitude. **Human-entry only** — requires a parent report or personal verification; the LLM cannot assess staff attitude from metadata |
| `adult_focused` | Venue is oriented toward adults — pubs, bars, cocktail lounges, upscale fine dining. A venue typed as a bar/pub or with a high price level is a strong candidate for this tag |

> **Score engine note:** `adult_focused` should be interpreted by the score engine relative to crew composition. A parent with a quiet newborn and a parent with an active toddler will have very different experiences at the same `adult_focused` venue. The penalty applied to the compatibility score should scale with toddler/infant count rather than being a flat deduction.

### Parks only
| Tag | Notes |
|-----|-------|
| `playground` | Has playground equipment |
| `splash_pad` | Has a splash pad or water play area |
| `covered_area` | Has a sheltered area (gazebo, roof, awning) — useful in rain or heat |

---

## Confirmation Model

Confirmation is **per-tag**, not per-venue. A venue can have a verified `stroller_friendly` tag (personally visited) alongside an unconfirmed `changing_table` tag (LLM-suggested). Treating the whole venue as confirmed or not would be false precision.

Each tag entry carries two fields:

| Field | Type | Notes |
|-------|------|-------|
| `confirmed_at` | `datetime \| null` | `null` = unconfirmed. Set to the date of manual review or parent report submission |
| `confirmed_by` | `user_id \| null` | `null` for seed data confirmed during manual review (no user account). Set to the reporting parent's ID for crowdsourced confirmations |

**Three states, derived at query time:**

| State | Condition | UI treatment |
|-------|-----------|-------------|
| `unconfirmed` | `confirmed_at` is null | Grey / hollow icon |
| `confirmed` | `confirmed_at` within 12 months | Green / filled icon |
| `stale` | `confirmed_at` beyond 12 months | Amber / icon with warning |

The 12-month threshold is a configurable constant — stored once in the app config, not hardcoded per query. If experience shows the threshold should be tighter or looser, changing the constant updates all derived states without a schema migration.

> **Rationale:** Venues change. Staff turn over, high chairs disappear, changing tables go out of service. A tag confirmed last month is trustworthy; the same tag from two years ago is a starting point, not a guarantee. The three-state model lets parents see this distinction at a glance without the app silently serving stale data as fact.

---

## How to think about Phase 5 data gathering

There are three sources of venue data, roughly in order of reliability:

1. **Your own visits** — the most accurate. You live near Verdun, so you can personally verify a changing table exists, whether the space fits a stroller, how loud it is. This is your unfair advantage for the MVP and the whole point of the `confirmed` system already built into the app.

2. **Existing review text** (Google, Yelp, TripAdvisor) — parents already mention strollers, high chairs, and changing tables in reviews. An AI can parse this text and suggest likely tags, but a human still needs to confirm them.

3. **Structured venue attributes** from APIs (Google Places, Yelp Fusion) — fields like "wheelchair accessible" or "good for kids" are available as structured data and map loosely onto the app's tags.

---

## The practical pipeline for Verdun

**Step 1 — Venue discovery via Google Places API** ✅ Done
Query the Verdun/Wellington corridor for cafés, restaurants, and parks. Outputs names, addresses, coordinates, rating, and price level for ~100 operational venues. See `scripts/fetch_venues.py`.

**Step 2 — Tag suggestion via LLM (metadata only)**
Send each venue's `name`, `place_type`, `address`, `rating`, and `price_level` to Claude and ask it to suggest candidate tags from the vocabulary above. No review text is used at this stage.

This approach works for Verdun because Claude's training data includes knowledge of well-documented Montréal neighbourhoods. Tags are candidates only — none are imported without passing manual review.

> **Future expansion:** Once the app grows beyond popular, well-documented neighbourhoods, the LLM will have little training knowledge of individual venues. At that point, Step 2 should be upgraded to pull Google Places review text (up to 5 reviews per venue via the Details API, included in the free-tier response) and use that as the signal source instead of metadata alone.

**Step 3 — Manual review**
Open `tagged_venues.json` in a text editor. Confirm or remove each suggested tag. Add any obvious ones the LLM missed. Cross-reference personal knowledge and on-site visits. This is the human gate — nothing reaches the database without passing through here.

**Step 4 — DB import**
The reviewed file seeds the SQLite database with `is_seed = true` on each row, distinguishing seed entries from parent-submitted reports. See `scripts/import_seed.py` (to be written).

**Step 5 — Replace mock data**
The confirmed seed data replaces `mockPlaces.js`, transitioning the app from fake data to real Verdun venues.

---

## What is overkill (for now)

- **A continuously running autonomous scraper** — there aren't enough venues to justify it yet; a one-time batch script is sufficient
- **Fine-tuning a model on parenting data** — Claude already understands "changing table," "stroller," and "family restroom" without any training
- **Complex agent orchestration** (multi-step agents, vector databases, tool chains) — unnecessary until the dataset grows to thousands of venues across multiple neighbourhoods
- **Scraping Google Maps HTML directly** — against ToS, brittle to layout changes, and the official Places API already surfaces what is needed
- **Real-time data freshness pipelines** — the `confirmed` system handles staleness through user reports (Phase 5.5); a scheduled re-scrape can wait until the user base exists to validate the investment

---

## API cost reference (Verdun MVP scale)

| API | What it provides | Cost at ~100 venues |
|-----|-----------------|---------------------|
| Google Places — Nearby Search | Venue list with names + coordinates | ~$0.02 |
| Google Places — Place Details | Address, hours, 5 reviews, attributes | ~$1.70 |
| Claude API — tag suggestion (metadata only) | Structured tag JSON per venue | ~$0.05–0.10 |
| **Total (current pipeline)** | | **< $0.15** |

If Step 2 is later upgraded to use review text, add the Place Details cost (~$1.70) to the total. Still well under $2.00 for the full Verdun dataset.
