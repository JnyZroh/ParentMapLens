"""
Phase 5, Step 2 — Tag Suggestion
Reads raw_venues.json, sends each venue's metadata to Claude, and writes
tagged_venues.json with candidate parent-awareness tags for manual review.

Run from the scripts/ directory:
    pip install anthropic python-dotenv
    # Add ANTHROPIC_API_KEY to .env
    python suggest_tags.py

Output: tagged_venues.json — same venue objects as raw_venues.json,
each extended with a "suggested_tags" array.
"""

import json
import os
import time

import anthropic
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not API_KEY:
    raise SystemExit("Error: ANTHROPIC_API_KEY not set. Add it to scripts/.env")

# Haiku is sufficient for structured tag suggestion and is the most cost-effective
MODEL = "claude-haiku-4-5-20251001"

# Tags the LLM is allowed to suggest. Human-entry-only tags (no_indoor_seating,
# kid_welcoming_high) are intentionally excluded — they require in-person verification.
SUGGESTABLE_TAGS = {
    "space":      ["stroller_friendly", "tight_space", "outdoor_seating"],
    "noise":      ["noise_low", "noise_moderate", "noise_high"],
    "needs":      ["changing_table", "high_chairs", "kids_menu", "play_area", "unisex_baby_duty"],
    "vibe":       ["kid_welcoming_low", "kid_welcoming_medium", "adult_focused"],
    "parks_only": ["playground", "splash_pad", "covered_area"],
}

# Flat list used in the prompt
ALL_SUGGESTABLE = [tag for tags in SUGGESTABLE_TAGS.values() for tag in tags]

SYSTEM_PROMPT = """You are helping populate a parent-awareness app with venue tags for \
the Wellington/Verdun corridor in Montréal, Québec. You will receive venue metadata and \
must suggest which parent-awareness tags are likely applicable.

Rules:
- Suggest only from the provided tag list — never invent new tags.
- Every cafe and restaurant must get exactly one noise tag (noise_low / noise_moderate / noise_high).
- Every park must get at least one of: playground, splash_pad, covered_area.
- Cafes and restaurants must get at least one of: kid_welcoming_low, kid_welcoming_medium, adult_focused.
- Only suggest changing_table, high_chairs, kids_menu, play_area, or unisex_baby_duty when \
the venue type or name gives a reasonable signal — do not guess these for generic venues.
- adult_focused is appropriate for bars, pubs, cocktail lounges, and upscale fine dining \
(typically price_level 3–4 or a name that implies it).
- kid_welcoming_medium implies multiple family amenities; kid_welcoming_low means at least \
one amenity signal exists. When in doubt, use kid_welcoming_low over medium.
- stroller_friendly is reasonable for parks and larger casual venues; tight_space is \
reasonable for small cafes and take-out spots.
- Respond with ONLY valid JSON in this exact shape — no explanation, no markdown:
{"suggested_tags": ["tag1", "tag2"]}"""


def build_user_prompt(venue: dict) -> str:
    price = f"${venue['price_level'] * '$'}" if venue.get("price_level") else "unknown"
    rating = f"{venue['rating']} / 5.0 ({venue['user_ratings_total']} reviews)" \
        if venue.get("rating") else "no rating"

    return f"""Venue metadata:
- Name: {venue['name']}
- Type: {venue['place_type']}
- Address: {venue['address']}
- Rating: {rating}
- Price level: {price}

Available tags:
{', '.join(ALL_SUGGESTABLE)}

Suggest tags for this venue."""


def suggest_tags_for_venue(client: anthropic.Anthropic, venue: dict) -> list[str]:
    """Call Claude and return a list of suggested tag strings for one venue."""
    response = client.messages.create(
        model=MODEL,
        max_tokens=256,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": build_user_prompt(venue)}],
    )

    raw = response.content[0].text.strip()

    try:
        parsed = json.loads(raw)
        tags = parsed.get("suggested_tags", [])
    except json.JSONDecodeError:
        print(f"  Warning: could not parse response for '{venue['name']}': {raw!r}")
        return []

    # Silently drop any tag not in the approved vocabulary
    valid = [t for t in tags if t in ALL_SUGGESTABLE]
    invalid = set(tags) - set(valid)
    if invalid:
        print(f"  Warning: dropped unsupported tags for '{venue['name']}': {invalid}")

    return valid


def main():
    input_path = os.path.join(os.path.dirname(__file__), "raw_venues.json")
    output_path = os.path.join(os.path.dirname(__file__), "tagged_venues.json")

    with open(input_path, encoding="utf-8") as f:
        venues = json.load(f)

    print(f"Loaded {len(venues)} venues from {input_path}")
    print(f"Model: {MODEL}\n")

    client = anthropic.Anthropic(api_key=API_KEY)
    results = []

    for i, venue in enumerate(venues, 1):
        print(f"[{i:3}/{len(venues)}] {venue['name']}")

        # Retry once on transient API errors
        for attempt in range(2):
            try:
                tags = suggest_tags_for_venue(client, venue)
                break
            except anthropic.APIError as e:
                if attempt == 0:
                    print(f"  API error, retrying in 3s: {e}")
                    time.sleep(3)
                else:
                    print(f"  Failed after retry, skipping: {e}")
                    tags = []

        print(f"        → {tags}")
        results.append({**venue, "suggested_tags": tags})

        # Brief pause to stay well within rate limits
        time.sleep(0.3)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\nWrote {len(results)} tagged venues to {output_path}")
    print("Next step: open tagged_venues.json and manually confirm or remove each tag.")


if __name__ == "__main__":
    main()
