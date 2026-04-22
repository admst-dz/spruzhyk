from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.order import Order
from app.schemas.order import OrderCreate

async def create_order(db: AsyncSession, order: OrderCreate):
    db_order = Order(**order.model_dump())
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    return db_order

async def get_orders_by_user(db: AsyncSession, user_id: str):
    result = await db.execute(select(Order).where(Order.user_id == user_id))
    return result.scalars().all()