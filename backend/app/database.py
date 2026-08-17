from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import DATABASE_URL

engine = create_engine(DATABASE_URL, connect_args={'check_same_thread': False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def run_migrations():
    """Apply incremental schema migrations for SQLite (safe to run on every startup)."""
    with engine.connect() as conn:
        # Migration 1: add session_id column if missing
        result = conn.execute(text("PRAGMA table_info(conversion_jobs)"))
        existing_cols = {row[1] for row in result.fetchall()}
        if 'session_id' not in existing_cols:
            conn.execute(text("ALTER TABLE conversion_jobs ADD COLUMN session_id TEXT"))
            conn.commit()
