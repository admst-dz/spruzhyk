from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.order import Order
from app.schemas.order import OrderCreate


async def create_order(db: AsyncSession, order_data: OrderCreate) -> Order:
    db_order = Order(
        user_id=order_data.user_id,
        user_email=order_data.user_email,
        product_name=order_data.product_name,
        configuration=order_data.configuration,
        quantity=order_data.quantity,
        total_price=order_data.total_price,
        currency=order_data.currency
    )

    # Добавляем в сессию и коммитим в базу
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)

    return db_order


async def get_all_orders(db: AsyncSession):
    result = await db.execute(select(Order).order_by(Order.created_at.desc()))
    return result.scalars().all()