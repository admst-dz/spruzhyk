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


async def get_all(db: AsyncSession):
    result = await db.execute(select(Order).order_by(Order.created_at.desc()))
    return result.scalars().all()


async def update_status(db: AsyncSession, order_id: str, status: str):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if order:
        order.status = status
        await db.commit()
        await db.refresh(order)
    return order
