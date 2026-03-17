"""
main.py — FastAPI application entry point

Run with:
    uvicorn main:app --reload

The `--reload` flag restarts the server automatically whenever you save a file.

────────────────────────────────────────────────────────
WHAT YOU WILL SEE AT THESE URLS (once the server is running)
────────────────────────────────────────────────────────

http://localhost:8000/docs  ← Swagger UI
  A web page that FastAPI generates AUTOMATICALLY from your code.
  It lists every route in this file (e.g. GET /api/places) and lets
  you click "Try it out" to fire real requests and see the JSON
  responses — no separate tool like Postman or curl needed.
  Think of it as a live, interactive manual for your own API.
  You don't write or maintain it; it updates itself as you add routes.

http://localhost:8000/redoc  ← ReDoc (read-only alternative)
  A cleaner, read-only version of the same documentation.
  Good for sharing with teammates who only need to read the API spec,
  not test it.

http://localhost:8000/api/status  ← Server status (raw JSON)
  Returns a small JSON object like:
      { "status": "ok", "app": "Anywhere Parent", "version": "0.1.0" }
  This is what the green/red dot badge in your React Header reads.
  If you open this URL in a browser and see that JSON, your backend
  is running correctly and the frontend badge will turn green.
────────────────────────────────────────────────────────
"""

import json

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db
import models

# Create all database tables on startup if they don't exist yet.
# SQLAlchemy compares our ORM models against the existing SQLite file
# and creates any missing tables or columns.
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Anywhere Parent API",
    description="Backend for the Anywhere Parent situational-awareness tool.",
    version="0.1.0",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
# The React frontend runs on http://localhost:5173 during development.
# Without this middleware the browser blocks all cross-origin fetch() calls.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def place_to_dict(place: models.Place) -> dict:
    """
    Convert a Place ORM object into a plain dict suitable for JSON responses.

    WHY A HELPER?
      The `tags` column is stored as a JSON string in SQLite
      (e.g. '["stroller_friendly", "high_chairs"]').  We parse it here so
      the frontend receives a proper JSON array, not a raw string.

    The `coordinates` key mirrors the shape the React components already
    expect: [latitude, longitude].
    """
    return {
        "id":          place.id,
        "name":        place.name,
        "address":     place.address,
        "latitude":    place.latitude,
        "longitude":   place.longitude,
        # `coordinates` is a convenience alias used by the Leaflet components
        "coordinates": [place.latitude, place.longitude],
        "place_type":  place.place_type,
        "rating":      place.rating,
        # Parse the JSON string back into a Python list before serialising
        "tags":        json.loads(place.tags or "[]"),
    }


def review_to_dict(review: models.Review) -> dict:
    """
    Convert a Review ORM object into a plain dict for JSON responses.

    `user` is resolved to the reviewer's display_name so the frontend
    doesn't need to make a separate /api/users request.
    """
    return {
        "id":                review.id,
        "user":              review.reviewer.display_name,
        "noise_level":       review.noise_level,
        "stroller_friendly": review.stroller_friendly,
        "has_changing_table":review.has_changing_table,
        "has_high_chairs":   review.has_high_chairs,
        "kid_menu":          review.kid_menu,
        "staff_attitude":    review.staff_attitude,
        "notes":             review.notes,
    }


# ── System ────────────────────────────────────────────────────────────────────

@app.get("/api/status", tags=["System"])
def api_status():
    """
    Server status endpoint.

    The React Header component fetches this route once when the app loads
    to decide whether to show a green (online) or red (offline) dot badge.

    WHAT THE RESPONSE LOOKS LIKE:
        {
          "status": "ok",
          "app": "Anywhere Parent",
          "version": "0.1.0"
        }

    HOW TO VERIFY IT'S WORKING:
      1. Start the backend: uvicorn main:app --reload
      2. Open http://localhost:8000/api/status in your browser.
      3. You should see the JSON above — if you do, the backend is healthy.
      4. Start the frontend (npm run dev) and the header badge turns green.
    """
    return {
        "status": "ok",
        "app": "Anywhere Parent",
        "version": "0.1.0",
    }


# ── Places ────────────────────────────────────────────────────────────────────

@app.get("/api/places", tags=["Places"])
def list_places(db: Session = Depends(get_db)):
    """
    Return all venues (Places) stored in the database.

    WHAT THE RESPONSE LOOKS LIKE (Phase 5 — real data):
        {
          "places": [
            {
              "id": 1,
              "name": "Café Olimpico",
              "address": "124 Rue St-Viateur O, Montréal, H2T 2K8",
              "latitude": 45.5231,
              "longitude": -73.6203,
              "coordinates": [45.5231, -73.6203],
              "place_type": "cafe",
              "rating": 4.3,
              "tags": ["stroller_friendly", "changing_table", "high_chairs", "unisex_baby_duty"]
            },
            ...
          ]
        }

    The MapComponent reads this list and draws one Leaflet pin per place.
    The SuggestionsGrid uses `tags` to compute each venue's compatibility score.

    HOW `Depends(get_db)` WORKS:
      FastAPI calls `get_db()` before running this function and injects the
      resulting database session as `db`.  The session is automatically closed
      after the response is sent, even if an exception occurred.
    """
    places = db.query(models.Place).all()
    return {"places": [place_to_dict(p) for p in places]}


@app.get("/api/places/{place_id}", tags=["Places"])
def get_place(place_id: int, db: Session = Depends(get_db)):
    """
    Return a single Place by its ID, plus aggregated Awareness Checklist stats
    computed from all parent reviews for that venue.

    WHAT THE RESPONSE LOOKS LIKE:
        {
          "place": {
            "id": 1,
            "name": "Café Olimpico",
            ...
            "review_count": 2,
            "pct_stroller_friendly": 100,
            "pct_has_changing_table": 50,
            "pct_has_high_chairs": 100,
            "most_common_noise_level": "loud",
            "most_common_staff_attitude": "welcoming"
          }
        }

    Raises 404 if the place_id doesn't exist.
    """
    place = db.query(models.Place).filter(models.Place.id == place_id).first()
    if place is None:
        raise HTTPException(status_code=404, detail=f"Place {place_id} not found")

    result = place_to_dict(place)

    # ── Aggregate review stats ────────────────────────────────────────────────
    reviews = place.reviews
    count = len(reviews)
    result["review_count"] = count

    if count > 0:
        # Percentage of reviewers who confirmed each boolean amenity
        result["pct_stroller_friendly"]   = round(sum(r.stroller_friendly   for r in reviews) / count * 100)
        result["pct_has_changing_table"]  = round(sum(r.has_changing_table  for r in reviews) / count * 100)
        result["pct_has_high_chairs"]     = round(sum(r.has_high_chairs     for r in reviews) / count * 100)

        # Most commonly reported noise level
        noise_counts = {}
        for r in reviews:
            if r.noise_level:
                noise_counts[r.noise_level] = noise_counts.get(r.noise_level, 0) + 1
        result["most_common_noise_level"] = max(noise_counts, key=noise_counts.get) if noise_counts else None

        # Most commonly reported staff attitude
        attitude_counts = {}
        for r in reviews:
            if r.staff_attitude:
                attitude_counts[r.staff_attitude] = attitude_counts.get(r.staff_attitude, 0) + 1
        result["most_common_staff_attitude"] = max(attitude_counts, key=attitude_counts.get) if attitude_counts else None
    else:
        result["pct_stroller_friendly"]      = None
        result["pct_has_changing_table"]     = None
        result["pct_has_high_chairs"]        = None
        result["most_common_noise_level"]    = None
        result["most_common_staff_attitude"] = None

    return {"place": result}


# ── Reviews ───────────────────────────────────────────────────────────────────

@app.get("/api/places/{place_id}/reviews", tags=["Reviews"])
def list_reviews(place_id: int, db: Session = Depends(get_db)):
    """
    Return all parent Reviews for a given Place.

    The `{place_id}` in the URL is replaced with a real number when called.
    Example: GET /api/places/1/reviews  → all reviews for Place #1.

    WHAT THE RESPONSE LOOKS LIKE (Phase 5 — real data):
        {
          "place_id": 1,
          "reviews": [
            {
              "id": 1,
              "user": "Sarah M.",
              "noise_level": "loud",
              "stroller_friendly": true,
              "has_changing_table": true,
              "has_high_chairs": true,
              "kid_menu": false,
              "staff_attitude": "welcoming",
              "notes": "Packed on weekends but the baristas are super kind."
            },
            ...
          ]
        }

    Raises 404 if the place_id doesn't exist.
    """
    place = db.query(models.Place).filter(models.Place.id == place_id).first()
    if place is None:
        raise HTTPException(status_code=404, detail=f"Place {place_id} not found")

    return {
        "place_id": place_id,
        "reviews": [review_to_dict(r) for r in place.reviews],
    }


@app.post("/api/places/{place_id}/reviews", tags=["Reviews"])
def create_review(place_id: int):
    """
    Submit a new parent Awareness Checklist review for a Place.

    POST is used here (not GET) because we are SENDING data to the server
    to be saved, not just reading it.  The frontend Parent Report form
    (Phase 4) will send a JSON body like:
        {
          "user_id": 3,
          "noise_level": "moderate",
          "stroller_friendly": false,
          "has_changing_table": true,
          "has_high_chairs": true,
          "kid_menu": false,
          "staff_attitude": "neutral",
          "notes": "Only one high chair and no booster seats."
        }

    WHAT THE RESPONSE LOOKS LIKE RIGHT NOW (placeholder):
        { "message": "Review submission coming in Phase 4" }
    """
    # Placeholder — real implementation in Phase 4
    return {"message": "Review submission coming in Phase 4"}
