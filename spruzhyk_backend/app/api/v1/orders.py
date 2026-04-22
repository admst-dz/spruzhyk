from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi_pagination import Page, paginate
from app.database import get_db
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order_service import OrderService
from app.crud import order as crud_order

router = APIRouter()


@router.post("/", response_model=OrderResponse)
async def create_order(
        order: OrderCreate,
        db: AsyncSession = Depends(get_db),
        # TODO: dependency получения текущего юзера из токена
        current_user_id: str = "fake-firebase-uid"
):
    return await OrderService.create_new_order(db, order, current_user_id)


# --- ПАГИНАЦИЯ И ЗАКРЫТИЕ ОПАСНЫХ ЭНДПОИНТОВ ---
@router.get("/all", response_model=Page[OrderResponse])
async def get_all_orders(
        db: AsyncSession = Depends(get_db),
        # ЗАЩИТА: Сюда пускаем только админов или Владельца СР
        current_role: str = "client"
):
    if current_role not in ["admin", "owner"]:
        raise HTTPException(status_code=403, detail="Access denied")

    orders = await crud_order.get_all(db)
    return paginate(orders)  