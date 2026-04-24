from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi_pagination import Page, paginate
import httpx
import uuid
import os

from app.database import get_db
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate
from app.services.order_service import OrderService
from app.crud import order as crud_order
from app.core.deps import get_current_user

router = APIRouter()

os.makedirs("uploads/renders", exist_ok=True)


async def generate_backend_render(config: dict) -> str:
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post("http://renderer:3000/render", json={"config": config}, timeout=20.0)
            res.raise_for_status()

            filename = f"render_{uuid.uuid4().hex}.png"
            filepath = f"uploads/renders/{filename}"
            with open(filepath, "wb") as f:
                f.write(res.content)

            return f"/uploads/renders/{filename}"
    except Exception as e:
        print(f"Error generating render: {e}")
        return None


@router.post("/", response_model=OrderResponse)
async def create_order(
        order: OrderCreate,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    config_for_3d = order.configuration.get("productConfig", {})
    render_url = await generate_backend_render(config_for_3d)

    if render_url:
        order.configuration["server_render_url"] = render_url

    return await OrderService.create_new_order(db, order, current_user.id)

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
        dealer_id: Optional[str] = Query(default=None),
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


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
        order_id: str,
        status_data: OrderStatusUpdate,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    if current_user.role not in ["admin", "dealer", "owner"]:
        raise HTTPException(status_code=403, detail="Access denied")
    order = await crud_order.update_status(db, order_id, status_data.status, status_data.comment)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
