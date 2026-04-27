from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm.attributes import flag_modified

from app.models.order import Order
from app.models.user import User
from app.schemas.order import OrderCreate


async def create_order(db: AsyncSession, order: OrderCreate, processing_payload: Optional[dict] = None):
    data = order.model_dump()
    data["processing_payload"] = processing_payload
    data["stage_history"] = [{
        "status": "new",
        "comment": "Order accepted by the system, waiting for processing",
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }]
    db_order = Order(**data)
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    return db_order


async def get_orders_by_user(db: AsyncSession, user_id: str):
    result = await db.execute(select(Order).where(Order.user_id == user_id))
    return result.scalars().all()


async def get_all(db: AsyncSession, dealer_id: Optional[str] = None):
    stmt = select(Order)
    if dealer_id:
        stmt = stmt.join(User, Order.user_id == User.id).where(User.dealer_id == dealer_id)
    result = await db.execute(stmt.order_by(Order.created_at.desc()))
    return result.scalars().all()


async def get_order(db: AsyncSession, order_id: str):
    result = await db.execute(select(Order).where(Order.id == order_id))
    return result.scalar_one_or_none()


async def order_belongs_to_dealer(db: AsyncSession, order_id: str, dealer_id: str) -> bool:
    stmt = (
        select(Order.id)
        .join(User, Order.user_id == User.id)
        .where(Order.id == order_id, User.dealer_id == dealer_id)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none() is not None


async def update_status(db: AsyncSession, order_id: str, status: str, comment: Optional[str] = None):
    order = await get_order(db, order_id)
    if order:
        order.status = status
        history = list(order.stage_history or [])
        entry = {
            "status": status,
            "comment": comment or "",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        history.append(entry)
        order.stage_history = history
        flag_modified(order, "stage_history")
        await db.commit()
        await db.refresh(order)
    return order
