"""
models.py — SQLAlchemy ORM models (database table definitions)

Each class here maps to a table in anywhere_parent.db.
SQLAlchemy reads these classes and creates the matching SQL schema
when `Base.metadata.create_all(engine)` is called in main.py.

Tables
------
  Place   — a venue (café, restaurant, museum, park, etc.) on the map
  User    — a registered parent or caregiver who submits reviews
  Review  — a parent's Awareness Checklist report for a specific Place
"""

from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Place(Base):
    """
    A physical venue that parents can discover and review.

    This is the core map pin entity.  Phase 3 will load these from the API
    and render them as Leaflet markers with Awareness Checklist popups.

    Columns
    -------
    id              — auto-incrementing primary key
    name            — venue name (e.g. "Café Olimpico")
    latitude        — geographic latitude  (e.g. 45.5231)
    longitude       — geographic longitude (e.g. -73.6203)
    address         — human-readable street address
    place_type      — category: "cafe" | "restaurant" | "park" | "museum" | etc.
    created_at      — timestamp when the record was created

    Relationships
    -------------
    reviews         — all parent reviews linked to this place
    """

    __tablename__ = "places"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(255), nullable=True)
    place_type = Column(String(50), nullable=True)  # "cafe" | "restaurant" | "park" | etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # One Place can have many Reviews
    reviews = relationship("Review", back_populates="place")


class User(Base):
    """
    A parent or caregiver who submits venue reviews.

    Kept intentionally minimal for Phase 1.  Authentication (JWT, OAuth)
    will be layered on in a later phase.

    Columns
    -------
    id          — auto-incrementing primary key
    display_name — the name shown next to their reviews (e.g. "Sarah M.")
    email       — unique email used for login
    created_at  — timestamp when the account was created

    Relationships
    -------------
    reviews     — all reviews submitted by this user
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    display_name = Column(String(80), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # One User can submit many Reviews
    reviews = relationship("Review", back_populates="reviewer")


class Review(Base):
    """
    A parent's Awareness Checklist report for a specific Place.

    This is the crowdsourced data that makes Anywhere Parent valuable.
    Each row is one parent's first-hand account of a venue visit.

    Columns
    -------
    id                  — auto-incrementing primary key
    place_id            — FK → places.id (which venue this review is about)
    user_id             — FK → users.id  (who submitted the review)
    created_at          — timestamp of submission

    Awareness Checklist fields (the core product data)
    ---------------------------------------------------
    noise_level         — "quiet" | "moderate" | "loud"
                          (loud can be a GOOD thing — masks a fussy baby)
    stroller_friendly   — True if a double stroller can navigate the space
    has_changing_table  — True if a changing table was present
    has_high_chairs     — True if high chairs are available
    kid_menu            — True if a dedicated kids' menu exists
    staff_attitude      — "welcoming" | "neutral" | "unwelcoming"
                          (the "vibe check" — how staff treat families)
    notes               — free-form parent observations
    """

    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys linking this review to a Place and a User
    place_id = Column(Integer, ForeignKey("places.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ── Awareness Checklist ──────────────────────────────────────────────────
    noise_level = Column(String(20), nullable=True)      # "quiet" | "moderate" | "loud"
    stroller_friendly = Column(Boolean, default=False)
    has_changing_table = Column(Boolean, default=False)
    has_high_chairs = Column(Boolean, default=False)
    kid_menu = Column(Boolean, default=False)
    staff_attitude = Column(String(20), nullable=True)   # "welcoming" | "neutral" | "unwelcoming"
    notes = Column(Text, nullable=True)

    # ORM back-references so you can do review.place or review.reviewer
    place = relationship("Place", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews")
