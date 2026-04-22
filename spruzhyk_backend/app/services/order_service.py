from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.crud import order as crud_order
from app.crud import user as crud_user
from app.schemas.order import OrderCreate


class OrderService:
    @staticmethod
    async def create_new_order(db: AsyncSession, order_data: OrderCreate, current_user_id: str):
        user = await crud_user.get_user(db, current_user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.sub_role == 'PL':
            if user.token_balance < order_data.total_price:
                raise HTTPException(status_code=400, detail="Not enough tokens (TK)")
            # Списываем токены
            user.token_balance -= order_data.total_price
            db.add(user)  # Подготавливаем обновление юзера

        new_order = await crud_order.create_order(db, order_data)

        await db.commit()

        # 5. TODO: Отправить уведомление Дилеру или в Битрикс24

        return new_order