import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASS = os.getenv("POSTGRES_PASSWORD", "rootpassword")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = os.getenv("POSTGRES_PORT", "5433")
DB_NAME = os.getenv("POSTGRES_DB", "spruzhuk")

DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_async_engine(DATABASE_URL, echo=False)

AsyncSessionLocal = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
