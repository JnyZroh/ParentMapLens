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

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
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
def list_places():
    """
    Return all venues (Places) stored in the database.

    WHAT THE RESPONSE LOOKS LIKE RIGHT NOW (Phase 1 placeholder):
        { "places": [] }
        ↑ Empty list — no venues have been added yet.

    WHAT IT WILL LOOK LIKE IN PHASE 3 (real data):
        {
          "places": [
            {
              "id": 1,
              "name": "Café Olimpico",
              "latitude": 45.5231,
              "longitude": -73.6203,
              "address": "124 Rue St-Viateur O, Montréal",
              "place_type": "cafe"
            },
            ...
          ]
        }

    The MapComponent will read this list and draw one Leaflet pin per place.
    """
    # Placeholder — real DB query added in Phase 3
    return {"places": []}


@app.get("/api/places/{place_id}", tags=["Places"])
def get_place(place_id: int):
    """
    Return a single Place by its ID, including aggregated review data.

    Phase 3 will join the `reviews` table to compute summary stats
    (e.g. % stroller-friendly, most common noise level).
    """
    # Placeholder — real DB query added in Phase 3
    return {"place": None}


# ── Reviews ───────────────────────────────────────────────────────────────────

@app.get("/api/places/{place_id}/reviews", tags=["Reviews"])
def list_reviews(place_id: int):
    """
    Return all parent Reviews for a given Place.

    The `{place_id}` in the URL is replaced with a real number when called.
    Example: GET /api/places/1/reviews  → all reviews for Place #1.

    WHAT THE RESPONSE LOOKS LIKE RIGHT NOW (Phase 1 placeholder):
        { "place_id": 1, "reviews": [] }

    WHAT IT WILL LOOK LIKE IN PHASE 4 (real data):
        {
          "place_id": 1,
          "reviews": [
            {
              "id": 7,
              "user": "Sarah M.",
              "noise_level": "loud",
              "stroller_friendly": true,
              "has_changing_table": true,
              "staff_attitude": "welcoming",
              "notes": "Great vibe, staff brought a high chair without being asked."
            }
          ]
        }
    """
    # Placeholder — real DB query added in Phase 4
    return {"place_id": place_id, "reviews": []}


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
