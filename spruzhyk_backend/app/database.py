from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# ИЗМЕНИЛИ ПОРТ С 5432 НА 5433
DATABASE_URL = "postgresql+asyncpg://postgres:rootpassword@localhost:5433/spruzhuk"

engine = create_async_engine(DATABASE_URL, echo=True)

AsyncSessionLocal = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session