"""
models.py — SQLAlchemy ORM models (database table definitions)

Each class here maps to a table in anywhere_parent.db.
SQLAlchemy reads these classes and creates the matching SQL schema
when `Base.metadata.create_all(engine)` is called in main.py.

Phase 1: We define the `Location` table to hold parent-reported venue data.
         Fields will grow in Phase 3/4 as the "Awareness Checklist" is built out.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, Text
from database import Base


class Location(Base):
    """
    Represents a venue that parents can review.

    Columns
    -------
    id              — auto-incrementing primary key
    name            — venue name (e.g. "Café Olimpico")
    latitude        — geographic latitude  (e.g. 45.5231)
    longitude       — geographic longitude (e.g. -73.6203)
    address         — human-readable street address
    noise_level     — parent-reported noise: "quiet" | "moderate" | "loud"
    has_changing_table — True/False
    has_high_chairs    — True/False
    stroller_friendly  — True/False: can a double stroller navigate the space?
    notes           — free-form parent observations
    """

    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(255), nullable=True)

    # ── Awareness Checklist fields (Phase 3 will expose these via the API) ──
    noise_level = Column(String(20), nullable=True)          # "quiet" | "moderate" | "loud"
    has_changing_table = Column(Boolean, default=False)
    has_high_chairs = Column(Boolean, default=False)
    stroller_friendly = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
