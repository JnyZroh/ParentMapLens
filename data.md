# Anywhere Parent — Data Strategy

## How to think about Phase 5 data gathering

There are three sources of venue data, roughly in order of reliability:

1. **Your own visits** — the most accurate. You live near Verdun, so you can personally verify a changing table exists, whether the space fits a stroller, how loud it is. This is your unfair advantage for the MVP and the whole point of the `confirmed` system already built into the app.

2. **Existing review text** (Google, Yelp, TripAdvisor) — parents already mention strollers, high chairs, and changing tables in reviews. An AI can parse this text and suggest likely tags, but a human still needs to confirm them.

3. **Structured venue attributes** from APIs (Google Places, Yelp Fusion) — fields like "wheelchair accessible" or "good for kids" are available as structured data and map loosely onto the app's tags.

---

## The practical pipeline for Verdun (not overkill)

**Step 1 — Venue discovery via Google Places API**
Query the Verdun/Wellington corridor for cafés, restaurants, and family venues. This gives you names, addresses, coordinates, and some structured attributes for free (the Places API free tier is generous at this scale). You'd end up with roughly 30–60 venues.

**Step 2 — Review ingestion**
Google Places API returns up to 5 recent reviews per venue in the Place Details response at no extra cost. Yelp Fusion API can supplement with more. For 50 venues this is a one-time batch job.

**Step 3 — Claude API to suggest tags**
Send the review text for each venue to Claude with a structured prompt:

> *"Based on these reviews, which of the following are likely true: stroller_friendly, changing_table, play_area, high_chairs, unisex_baby_duty? Return JSON with a confidence level (high / medium / low / unlikely) for each."*

For 50 venues with ~5 reviews each, this costs a few cents — not a cost concern at this scale.

**Step 4 — Manual confirmation pass**
The output is a JSON file of candidate-tagged venues. The developer reviews the list, cross-references personal knowledge, visits a few spots on Wellington, and sets `confirmed: true` on entries they've personally verified. This is the entire job of Phase 5.

**Step 5 — Replace mock data**
The confirmed JSON replaces `mockPlaces.js` and seeds the SQLite database, transitioning the app from fake data to real Verdun venues.

---

## What is overkill (for now)

- **A continuously running autonomous scraper** — there aren't enough venues to justify it yet; a one-time batch script is sufficient
- **Fine-tuning a model on parenting data** — Claude already understands "changing table," "stroller," and "family restroom" without any training
- **Complex agent orchestration** (multi-step agents, vector databases, tool chains) — unnecessary until the dataset grows to thousands of venues across multiple neighbourhoods
- **Scraping Google Maps HTML directly** — against ToS, brittle to layout changes, and the official Places API already surfaces the review text needed
- **Real-time data freshness pipelines** — the `confirmed` system handles staleness through user reports (Phase 5.5); a scheduled re-scrape can wait until the user base exists to validate the investment

---

## API cost reference (Verdun MVP scale)

| API | What it provides | Cost at ~50 venues |
|---|---|---|
| Google Places — Nearby Search | Venue list with names + coordinates | ~$0.02 |
| Google Places — Place Details | Address, hours, 5 reviews, attributes | ~$0.85 |
| Yelp Fusion — Business Search | Supplemental reviews + ratings | Free tier (500 calls/day) |
| Claude API — tag suggestion | Structured tag JSON per venue | ~$0.05–0.10 |
| **Total** | | **< $1.00** |

Costs scale linearly if the pipeline is later extended to other Montréal neighbourhoods.
