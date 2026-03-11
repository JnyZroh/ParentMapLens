"""
main.py — FastAPI application entry point

Run with:
    uvicorn main:app --reload

The `--reload` flag restarts the server automatically whenever you save a file.
Interactive API docs are available at http://localhost:8000/docs (Swagger UI)
and http://localhost:8000/redoc once the server is running.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
import models

# ── Create all database tables if they don't exist yet ───────────────────────
# This is called once at startup.  SQLAlchemy compares the ORM models against
# the existing SQLite schema and creates missing tables/columns.
models.Base.metadata.create_all(bind=engine)

# ── Initialise the FastAPI app ────────────────────────────────────────────────
app = FastAPI(
    title="Anywhere Parent API",
    description="Backend for the Anywhere Parent situational-awareness tool.",
    version="0.1.0",
)

# ── CORS configuration ────────────────────────────────────────────────────────
# During development the React frontend runs on http://localhost:5173.
# Without CORS middleware the browser blocks cross-origin requests.
# In production you would replace the wildcard with your real domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/api/health", tags=["System"])
def health_check():
    """
    Health Check endpoint.

    The React frontend polls this route to display the green/red API status
    badge in the Header component.  Returns a simple JSON object so the
    frontend can confirm the server is reachable and responding.
    """
    return {
        "status": "ok",
        "message": "Anywhere Parent API is running 🚀",
        "version": "0.1.0",
    }


@app.get("/api/locations", tags=["Locations"])
def list_locations():
    """
    Placeholder route — returns an empty list for now.

    Phase 3 will query the `locations` table and return real venue data
    with the full Awareness Checklist fields for the map pins.
    """
    return {"locations": []}
