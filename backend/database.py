"""
database.py — SQLAlchemy engine and session setup

WHY SQLite?
  SQLite is a file-based database — zero config, zero separate process.
  It lives in a single file (anywhere_parent.db) in the backend folder.
  Perfect for local-first development; swap to PostgreSQL later with one
  connection-string change.

HOW it works:
  1.  `engine`      — the connection to the SQLite file.
  2.  `SessionLocal` — a factory that creates database session objects.
  3.  `Base`         — the declarative base that all ORM models inherit from.
  4.  `get_db()`     — a FastAPI dependency that opens/closes a session per request.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# The database file is created automatically next to this file when the app starts
SQLALCHEMY_DATABASE_URL = "sqlite:///./anywhere_parent.db"

# `check_same_thread=False` is required for SQLite when used with FastAPI's
# async request handling (multiple threads may share the same connection)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# SessionLocal is a class; calling SessionLocal() creates a new DB session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is used by ORM model classes:  class MyModel(Base): ...
Base = declarative_base()


def get_db():
    """
    FastAPI dependency — yields a database session and ensures it is closed
    after each request, even if an exception occurs.

    Usage in a route:
        @app.get("/items")
        def read_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
