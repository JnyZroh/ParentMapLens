"""
Phase 5, Step 1 — Venue Discovery
Queries Google Places Nearby Search for cafes, restaurants, and parks
along the Verdun/Wellington corridor and writes raw_venues.json.

Run from the scripts/ directory:
    pip install requests python-dotenv
    echo "GOOGLE_PLACES_API_KEY=your_key" > .env
    python fetch_venues.py
"""

import json
import os
import time

import requests
from dotenv import load_dotenv

# Load API key from .env file in this directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
if not API_KEY:
    raise SystemExit("Error: GOOGLE_PLACES_API_KEY not set. Create scripts/.env with your key.")

# Center of the Wellington/Verdun corridor
SEARCH_CENTER = "45.4616,-73.5697"
SEARCH_RADIUS = 1000  # metres — covers the Wellington strip

# Three separate calls because Google only accepts one type per Nearby Search request
VENUE_TYPES = ["cafe", "restaurant", "park"]

NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"


def map_place_type(types: list[str]) -> str:
    """Map Google's types array to the app's simplified place_type enum."""
    for t in types:
        if t == "cafe":
            return "cafe"
        if t == "restaurant":
            return "restaurant"
        if t == "park":
            return "park"
    return "other"


def fetch_page(params: dict) -> dict:
    """Make one Nearby Search request and return the parsed JSON response."""
    response = requests.get(NEARBY_URL, params=params, timeout=10)
    response.raise_for_status()
    return response.json()


def fetch_all_for_type(venue_type: str) -> list[dict]:
    """
    Fetch up to 3 pages (max 60 results) for a single venue type.
    Google requires a 2-second pause before a next_page_token becomes valid.
    """
    results = []
    params = {
        "location": SEARCH_CENTER,
        "radius": SEARCH_RADIUS,
        "type": venue_type,
        "language": "en",
        "key": API_KEY,
    }

    page = 1
    while True:
        print(f"  Fetching {venue_type} — page {page}...")
        data = fetch_page(params)

        status = data.get("status")
        if status not in ("OK", "ZERO_RESULTS"):
            print(f"  Warning: API returned status '{status}' for type '{venue_type}'")
            break

        results.extend(data.get("results", []))

        next_token = data.get("next_page_token")
        if not next_token or page >= 3:
            break

        # Google requires ~2 seconds before the next_page_token becomes active
        time.sleep(2)
        params = {"pagetoken": next_token, "key": API_KEY}
        page += 1

    return results


def build_venue(raw: dict) -> dict:
    """Convert a raw Google Places result into the app's venue shape."""
    place_id = raw["place_id"]
    location = raw["geometry"]["location"]
    return {
        "place_id": place_id,
        "name": raw.get("name", ""),
        "lat": location["lat"],
        "lng": location["lng"],
        "address": raw.get("vicinity", ""),
        "place_type": map_place_type(raw.get("types", [])),
        "rating": raw.get("rating"),           # float 1.0–5.0, or None
        "user_ratings_total": raw.get("user_ratings_total"),  # int, or None
        "price_level": raw.get("price_level"),  # 0–4 ($–$$$$), or None
        "business_status": raw.get("business_status", "UNKNOWN"),
        "google_maps_url": f"https://www.google.com/maps/place/?q=place_id:{place_id}",
    }


def main():
    print("Fetching venues from Google Places Nearby Search...")
    print(f"Center: {SEARCH_CENTER}  Radius: {SEARCH_RADIUS}m")
    print()

    raw_results = []
    for venue_type in VENUE_TYPES:
        raw_results.extend(fetch_all_for_type(venue_type))

    print(f"\nRaw results before deduplication: {len(raw_results)}")

    # Deduplicate by place_id (a venue can appear in multiple type queries)
    seen = set()
    unique = []
    for r in raw_results:
        pid = r.get("place_id")
        if pid and pid not in seen:
            seen.add(pid)
            unique.append(r)

    # Keep only venues that are currently open/operating
    operational = [r for r in unique if r.get("business_status") == "OPERATIONAL"]

    print(f"After deduplication: {len(unique)}")
    print(f"After filtering OPERATIONAL only: {len(operational)}")

    venues = [build_venue(r) for r in operational]

    # Sort by name for easier manual review
    venues.sort(key=lambda v: v["name"].lower())

    output_path = os.path.join(os.path.dirname(__file__), "raw_venues.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(venues, f, ensure_ascii=False, indent=2)

    print(f"\nWrote {len(venues)} venues to {output_path}")
    print("\nSample (first 3 venues):")
    for v in venues[:3]:
        print(f"  {v['name']} ({v['place_type']}) — {v['address']}")


if __name__ == "__main__":
    main()
