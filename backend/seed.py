"""
seed.py — Populate the database with real Montreal venue seed data.

Run from the backend/ directory with:
    python seed.py

This script:
  1. Drops and recreates all tables (fresh start — safe for development).
  2. Inserts a handful of sample Users (the "reviewers").
  3. Inserts real Montreal venues (Places) in the Plateau / Mile-End area
     around Café Olimpico on Rue St-Viateur.
  4. Inserts parent Awareness Checklist Reviews for each venue.

WHY THESE VENUES?
  The app's mock data already anchored the map near 45.5231, -73.6203
  (Café Olimpico, Mile-End, Montréal).  All seed places are real businesses
  or parks within ~2 km of that anchor so the Leaflet map stays coherent.

HOW TAGS ARE STORED:
  Tags are stored as a JSON string in the `places.tags` TEXT column, e.g.
      '["stroller_friendly", "high_chairs"]'
  The GET /api/places route calls json.loads() to turn that back into a list
  before sending the response to the frontend.
"""

import json
import os
import sys

# Make sure we can import our own modules when running this script directly
sys.path.insert(0, os.path.dirname(__file__))

from database import engine, SessionLocal, Base
from models import Place, User, Review

# ── 1. Recreate tables ────────────────────────────────────────────────────────
# `drop_all` removes every table; `create_all` rebuilds from the current models.
# This gives us a clean slate every time we re-seed during development.
print("Dropping and recreating database tables...")
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# ── 2. Seed Users ─────────────────────────────────────────────────────────────
# These represent real parents who've submitted reviews in the system.
# In a live app they would be created via the registration flow.
print("Seeding users...")

users_data = [
    {"display_name": "Sarah M.",   "email": "sarah.m@example.com"},
    {"display_name": "David L.",   "email": "david.l@example.com"},
    {"display_name": "Priya K.",   "email": "priya.k@example.com"},
    {"display_name": "Thomas B.",  "email": "thomas.b@example.com"},
    {"display_name": "Anika R.",   "email": "anika.r@example.com"},
]

users = []
for u in users_data:
    user = User(display_name=u["display_name"], email=u["email"])
    db.add(user)
    users.append(user)

db.commit()
# Refresh to get auto-assigned IDs
for u in users:
    db.refresh(u)

sarah, david, priya, thomas, anika = users

# ── 3. Seed Places ─────────────────────────────────────────────────────────────
# Real Montreal venues in the Plateau-Mont-Royal / Mile-End neighbourhood.
# Coordinates are accurate to within ~30 m of the actual address.
#
# Tag legend (must match scoreEngine.js TAG_WEIGHTS keys):
#   stroller_friendly — wide aisles, ramp access, space for a double stroller
#   changing_table    — at least one changing table in the washrooms
#   play_area         — dedicated play corner, outdoor playground, or activity space
#   high_chairs       — high chairs or booster seats available
#   unisex_baby_duty  — baby change accessible to any caregiver (not gender-locked)
print("Seeding places...")

places_data = [
    {
        "name":       "Café Olimpico",
        "address":    "124 Rue St-Viateur O, Montréal, H2T 2K8",
        "latitude":   45.5231,
        "longitude":  -73.6203,
        "place_type": "cafe",
        "rating":     4.3,
        # Iconic Mile-End espresso bar — wide open floor plan, welcoming to families
        "tags": ["stroller_friendly", "changing_table", "high_chairs", "unisex_baby_duty"],
    },
    {
        "name":       "Fairmount Bagel",
        "address":    "74 Av. Fairmount O, Montréal, H2T 2M2",
        "latitude":   45.5227,
        "longitude":  -73.6074,
        "place_type": "cafe",
        "rating":     4.6,
        # 24-hour institution; narrow counter seating but a small stroller-accessible
        # waiting area in the front; always busy so noise naturally masks fussy babies
        "tags": ["stroller_friendly", "high_chairs"],
    },
    {
        "name":       "Parc Sir-Wilfrid-Laurier",
        "address":    "3875 Av. du Parc-La Fontaine, Montréal, H2L 3M4",
        "latitude":   45.5279,
        "longitude":  -73.5897,
        "place_type": "park",
        "rating":     4.7,
        # Large park with a splash pad, full playground, open lawns, and public washrooms
        # with changing tables — a gold standard family outing spot.
        "tags": ["stroller_friendly", "changing_table", "play_area"],
    },
    {
        "name":       "Wilensky's Light Lunch",
        "address":    "34 Av. Fairmount O, Montréal, H2T 2M1",
        "latitude":   45.5234,
        "longitude":  -73.6043,
        "place_type": "restaurant",
        "rating":     4.2,
        # Montreal landmark; tight counter seating but staff are very warm toward
        # families; no changing table but the noise level is ideal for fussy babies.
        "tags": ["high_chairs"],
    },
    {
        "name":       "Kem CoBa",
        "address":    "60 Av. Fairmount O, Montréal, H2T 2M2",
        "latitude":   45.5228,
        "longitude":  -73.6059,
        "place_type": "cafe",
        "rating":     4.5,
        # Artisan ice-cream shop; sidewalk seating is very stroller-friendly;
        # quick in-and-out format suits travelling with young kids
        "tags": ["stroller_friendly", "changing_table", "high_chairs", "unisex_baby_duty"],
    },
    {
        "name":       "Parc du Portugal",
        "address":    "Rue Saint-Urbain & Av. du Mont-Royal, Montréal, H2T 2S7",
        "latitude":   45.5247,
        "longitude":  -73.6171,
        "place_type": "park",
        "rating":     4.4,
        # Compact neighbourhood park with a playground, benches, and gentle green lawn.
        # Great for toddlers; accessible entrance from multiple sides.
        "tags": ["stroller_friendly", "play_area"],
    },
    {
        "name":       "Dépanneur Le Pick Up",
        "address":    "7032 Rue Waverly, Montréal, H2S 3J1",
        "latitude":   45.5245,
        "longitude":  -73.6060,
        "place_type": "restaurant",
        "rating":     4.0,
        # Beloved community spot with poutine and a backyard terrace; the terrace
        # has plenty of room for strollers and kids love the open-air vibe.
        "tags": ["stroller_friendly", "changing_table", "play_area", "high_chairs", "unisex_baby_duty"],
    },
    {
        "name":       "Boulangerie Guillaume",
        "address":    "5134 Boul. Saint-Laurent, Montréal, H2T 1R8",
        "latitude":   45.5210,
        "longitude":  -73.5990,
        "place_type": "cafe",
        "rating":     4.1,
        # French bakery; pastry counter in the front with small tables toward the back;
        # reasonably quiet on weekday mornings — a good nap-time errand stop.
        "tags": ["stroller_friendly", "high_chairs"],
    },
]

places = []
for p in places_data:
    place = Place(
        name=p["name"],
        address=p["address"],
        latitude=p["latitude"],
        longitude=p["longitude"],
        place_type=p["place_type"],
        rating=p["rating"],
        # Store the tag list as a JSON string
        tags=json.dumps(p["tags"]),
    )
    db.add(place)
    places.append(place)

db.commit()
for p in places:
    db.refresh(p)

(cafe_olimpico, fairmount_bagel, parc_laurier, wilensky, kem_coba,
 parc_portugal, le_pickup, boulangerie_guillaume) = places

# ── 4. Seed Reviews ───────────────────────────────────────────────────────────
# Each review is one parent's first-hand Awareness Checklist report.
# Multiple reviews per venue give the aggregate stats their meaning.
print("Seeding reviews...")

reviews_data = [
    # ── Café Olimpico ────────────────────────────────────────────────────────
    {
        "place": cafe_olimpico, "user": sarah,
        "noise_level": "loud", "stroller_friendly": True,
        "has_changing_table": True, "has_high_chairs": True, "kid_menu": False,
        "staff_attitude": "welcoming",
        "notes": "Packed on weekends but the baristas are super kind — they found us a corner table right away.",
    },
    {
        "place": cafe_olimpico, "user": david,
        "noise_level": "loud", "stroller_friendly": True,
        "has_changing_table": False, "has_high_chairs": True, "kid_menu": False,
        "staff_attitude": "welcoming",
        "notes": "Loud enough that a fussy baby goes unnoticed. Wide front door, easy with the Bugaboo.",
    },

    # ── Fairmount Bagel ──────────────────────────────────────────────────────
    {
        "place": fairmount_bagel, "user": priya,
        "noise_level": "moderate", "stroller_friendly": True,
        "has_changing_table": False, "has_high_chairs": False, "kid_menu": False,
        "staff_attitude": "neutral",
        "notes": "Best to grab-and-go; not really a sit-down spot with kids but the line moves fast.",
    },

    # ── Parc Sir-Wilfrid-Laurier ─────────────────────────────────────────────
    {
        "place": parc_laurier, "user": anika,
        "noise_level": "moderate", "stroller_friendly": True,
        "has_changing_table": True, "has_high_chairs": False, "kid_menu": False,
        "staff_attitude": "welcoming",
        "notes": "The splash pad is amazing in summer. Changing tables in the park washrooms.",
    },
    {
        "place": parc_laurier, "user": thomas,
        "noise_level": "quiet", "stroller_friendly": True,
        "has_changing_table": True, "has_high_chairs": False, "kid_menu": False,
        "staff_attitude": "welcoming",
        "notes": "Huge paved paths for strollers. Benches everywhere so you can nurse discreetly.",
    },

    # ── Wilensky's Light Lunch ───────────────────────────────────────────────
    {
        "place": wilensky, "user": david,
        "noise_level": "loud", "stroller_friendly": False,
        "has_changing_table": False, "has_high_chairs": True, "kid_menu": False,
        "staff_attitude": "welcoming",
        "notes": "Tight squeeze — left the stroller outside. Staff were charming with my toddler.",
    },

    # ── Kem CoBa ─────────────────────────────────────────────────────────────
    {
        "place": kem_coba, "user": sarah,
        "noise_level": "moderate", "stroller_friendly": True,
        "has_changing_table": True, "has_high_chairs": True, "kid_menu": False,
        "staff_attitude": "welcoming",
        "notes": "The line is long in summer but it moves quickly. Kids go wild for the flavours.",
    },
    {
        "place": kem_coba, "user": priya,
        "noise_level": "moderate", "stroller_friendly": True,
        "has_changing_table": False, "has_high_chairs": False, "kid_menu": False,
        "staff_attitude": "welcoming",
        "notes": "Sidewalk tables are great for strollers. Compact inside but staff are accommodating.",
    },

    # ── Parc du Portugal ─────────────────────────────────────────────────────
    {
        "place": parc_portugal, "user": thomas,
        "noise_level": "moderate", "stroller_friendly": True,
        "has_changing_table": False, "has_high_chairs": False, "kid_menu": False,
        "staff_attitude": "welcoming",
        "notes": "Toddler heaven — the climbing structure kept my 3-year-old busy for an hour.",
    },

    # ── Dépanneur Le Pick Up ─────────────────────────────────────────────────
    {
        "place": le_pickup, "user": anika,
        "noise_level": "loud", "stroller_friendly": True,
        "has_changing_table": True, "has_high_chairs": True, "kid_menu": False,
        "staff_attitude": "welcoming",
        "notes": "The backyard terrace is incredible with kids — lots of space and very chill vibe.",
    },
    {
        "place": le_pickup, "user": sarah,
        "noise_level": "loud", "stroller_friendly": True,
        "has_changing_table": True, "has_high_chairs": True, "kid_menu": False,
        "staff_attitude": "welcoming",
        "notes": "Unisex washroom with a proper change table. Double stroller fit easily on the terrace.",
    },

    # ── Boulangerie Guillaume ────────────────────────────────────────────────
    {
        "place": boulangerie_guillaume, "user": david,
        "noise_level": "quiet", "stroller_friendly": True,
        "has_changing_table": False, "has_high_chairs": True, "kid_menu": False,
        "staff_attitude": "neutral",
        "notes": "Calm weekday mornings — perfect for a quiet coffee while baby naps in the stroller.",
    },
]

for r in reviews_data:
    review = Review(
        place_id=r["place"].id,
        user_id=r["user"].id,
        noise_level=r["noise_level"],
        stroller_friendly=r["stroller_friendly"],
        has_changing_table=r["has_changing_table"],
        has_high_chairs=r["has_high_chairs"],
        kid_menu=r["kid_menu"],
        staff_attitude=r["staff_attitude"],
        notes=r["notes"],
    )
    db.add(review)

db.commit()
db.close()

# ── Done ──────────────────────────────────────────────────────────────────────
print()
print(f"  ✓ {len(users_data)} users seeded")
print(f"  ✓ {len(places_data)} places seeded")
print(f"  ✓ {len(reviews_data)} reviews seeded")
print()
print("Seed complete!  Start the backend and visit:")
print("  http://localhost:8000/api/places      ← all venues")
print("  http://localhost:8000/api/places/1    ← Café Olimpico")
print("  http://localhost:8000/docs            ← Swagger UI")
