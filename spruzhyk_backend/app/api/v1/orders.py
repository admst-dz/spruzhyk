from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi_pagination import Page, paginate
from app.database import get_db
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order_service import OrderService
from app.crud import order as crud_order
from app.core.deps import get_current_user

router = APIRouter()


@router.post("/", response_model=OrderResponse)
async def create_order(
        order: OrderCreate,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    return await OrderService.create_new_order(db, order, current_user.id)


@router.get("/all", response_model=Page[OrderResponse])
async def get_all_orders(
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    if current_user.role not in ["admin", "dealer", "owner"]:
        raise HTTPException(status_code=403, detail="Access denied")
    orders = await crud_order.get_all(db)
    return paginate(orders)


@router.get("/user/{user_id}", response_model=list[OrderResponse])
async def get_user_orders(
        user_id: str,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    if current_user.id != user_id and current_user.role not in ["admin", "dealer", "owner"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return await crud_order.get_orders_by_user(db, user_id)
