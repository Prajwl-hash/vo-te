import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print("DATABASE_URL loaded:", DATABASE_URL is not None)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        

with engine.connect() as connection:
    result = connection.execute(text("""
        SELECT
            current_database(),
            current_schema(),
            COUNT(*)
        FROM public.notes
    """)).fetchone()

    print("Backend database:", result[0])
    print("Backend schema:", result[1])
    print("Backend notes count:", result[2])
    