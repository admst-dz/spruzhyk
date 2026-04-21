from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from app.models.order import Order
from app.schemas.order import OrderCreate
import uuid


async def create_order(db: AsyncSession, order_data: OrderCreate) -> Order:
    db_order = Order(
        user_id=order_data.user_id,
        user_email=order_data.user_email,
        product_name=order_data.product_name,
        configuration=order_data.configuration,
        quantity=order_data.quantity,
        total_price=order_data.total_price,
        currency=order_data.currency,
        is_guest=order_data.is_guest,
    )
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    return db_order


async def get_all_orders(db: AsyncSession):
    result = await db.execute(select(Order).order_by(Order.created_at.desc()))
    return result.scalars().all()


async def get_user_orders(db: AsyncSession, uid: str, email: str = None):
    conditions = [Order.user_id == uid]
    if email:
        conditions.append((Order.user_email == email) & (Order.is_guest == True))
    result = await db.execute(
        select(Order).where(or_(*conditions)).order_by(Order.created_at.desc())
    )
    return result.scalars().all()


async def update_order_status(db: AsyncSession, order_id: str, status: str) -> Order | None:
    result = await db.execute(select(Order).where(Order.id == uuid.UUID(order_id)))
    order = result.scalar_one_or_none()
    if not order:
        return None
    order.status = status
    await db.commit()
    await db.refresh(order)
    return order


async def claim_guest_orders(db: AsyncSession, uid: str, email: str):
    result = await db.execute(
        select(Order).where(Order.user_email == email, Order.is_guest == True)
    )
    orders = result.scalars().all()
    for order in orders:
        order.user_id = uid
        order.is_guest = False
    await db.commit()
    return len(orders)
