from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from app.schemas.user import UserCreate


async def get_user(db: AsyncSession, uid: str):
    result = await db.execute(select(User).where(User.id == uid))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
    db_user = User(
        id=user_data.id,
        email=user_data.email,
        display_name=user_data.display_name,
        role=user_data.role,
        sub_role=user_data.sub_role,
        company_name=user_data.company_name,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def upsert_user(db: AsyncSession, user_data: UserCreate) -> User:
    existing = await get_user(db, user_data.id)
    if existing:
        return existing
    return await create_user(db, user_data)
