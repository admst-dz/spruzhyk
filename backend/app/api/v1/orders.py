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
from app.services.storage import s3_storage
from app.crud import order as crud_order
from app.crud import user as crud_user
from app.core.deps import get_current_user

from app.core.kafka import kafka_producer

router = APIRouter()

RENDERER_URL = os.getenv("RENDERER_URL", "http://renderer:3000/render")


async def generate_backend_render(config: dict) -> Optional[str]:
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(RENDERER_URL, json={"config": config}, timeout=20.0)
            res.raise_for_status()
    except httpx.HTTPError as e:
        print(f"Error generating render: {e}")
        return None

    filename = f"render_{uuid.uuid4().hex}.png"
    uploaded = await s3_storage.upload_bytes(
        content=res.content,
        folder="renders",
        filename=filename,
        content_type=res.headers.get("content-type") or "image/png",
    )
    return uploaded["url"]


@router.post("/", response_model=OrderResponse)
async def create_order(
        order: OrderCreate,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    configuration = order.configuration or {}
    config_for_3d = configuration.get("productConfig", {})
    render_url = await generate_backend_render(config_for_3d)

    new_order = await OrderService.create_new_order(db, order, current_user.id, render_url=render_url)

    # 3. ОТПРАВЛЯЕМ СОБЫТИЕ В KAFKA
    # Это позволяет другим микросервисам (например, сервису отправки email
    # или интеграции с Битрикс24) узнать, что заказ создан, и начать работу в фоне.
    await kafka_producer.send_message(
        topic="order_events",
        message={
            "event_type": "ORDER_CREATED",
            "order_id": str(new_order.id),
            "user_id": current_user.id,
            "user_email": current_user.email,
            "render_url": render_url,
            "status": new_order.status
        }
    )

    return new_order


@router.get("/all", response_model=Page[OrderResponse])
async def get_all_orders(
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
        dealer_id: Optional[str] = Query(default=None),
):
    if current_user.role not in ["admin", "dealer", "owner"]:
        raise HTTPException(status_code=403, detail="Access denied")

    effective_dealer_id = current_user.id if current_user.role == "dealer" else dealer_id
    orders = await crud_order.get_all(db, dealer_id=effective_dealer_id)
    return paginate(orders)


@router.get("/user/{user_id}", response_model=list[OrderResponse])
async def get_user_orders(
        user_id: str,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    if current_user.id == user_id:
        return await crud_order.get_orders_by_user(db, user_id)

    if current_user.role == "dealer":
        user = await crud_user.get_user(db, user_id)
        if not user or user.dealer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        return await crud_order.get_orders_by_user(db, user_id)

    if current_user.role not in ["admin", "owner"]:
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

    if current_user.role == "dealer":
        allowed = await crud_order.order_belongs_to_dealer(db, order_id, current_user.id)
        if not allowed:
            raise HTTPException(status_code=403, detail="Access denied")

    order = await crud_order.update_status(db, order_id, status_data.status, status_data.comment)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    await kafka_producer.send_message(
        topic="order_events",
        message={
            "event_type": "ORDER_STATUS_CHANGED",
            "order_id": str(order.id),
            "new_status": status_data.status,
            "comment": status_data.comment
        }
    )

    return order
