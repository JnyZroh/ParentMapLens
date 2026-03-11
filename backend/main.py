"""
main.py — FastAPI application entry point

Run with:
    uvicorn main:app --reload

The `--reload` flag restarts the server automatically whenever you save a file.
Interactive API explorer (Swagger UI) is available at http://localhost:8000/docs
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

    The React Header component polls this route every time the app loads
    to display the green (online) or red (offline) API badge.
    Returns a simple JSON object confirming the server is reachable.
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

    Phase 3 will query the `places` table and return real venue data
    complete with coordinates for Leaflet map pins.
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

    Phase 4 will populate this from the `reviews` table after parents
    submit Awareness Checklist reports via the Parent Report form.
    """
    # Placeholder — real DB query added in Phase 4
    return {"place_id": place_id, "reviews": []}


@app.post("/api/places/{place_id}/reviews", tags=["Reviews"])
def create_review(place_id: int):
    """
    Submit a new parent Awareness Checklist review for a Place.

    Phase 4 will accept a full Review payload (noise_level,
    stroller_friendly, has_changing_table, etc.) and persist it.
    """
    # Placeholder — real implementation in Phase 4
    return {"message": "Review submission coming in Phase 4"}
