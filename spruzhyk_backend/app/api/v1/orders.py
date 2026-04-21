from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.database import get_db
from app.crud import order as crud_order
from app.schemas import order as schema_order
from app.schemas.response import ResponseModel

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=ResponseModel[schema_order.OrderResponse])
async def create_order(
    order_in: schema_order.OrderCreate,
    db: AsyncSession = Depends(get_db)
):
    order = await crud_order.create_order(db=db, order_data=order_in)
    return ResponseModel(data=order)


@router.get("/", response_model=ResponseModel[List[schema_order.OrderResponse]])
async def read_all_orders(db: AsyncSession = Depends(get_db)):
    orders = await crud_order.get_all_orders(db=db)
    return ResponseModel(data=orders)


@router.get("/user/{uid}", response_model=ResponseModel[List[schema_order.OrderResponse]])
async def read_user_orders(
    uid: str,
    email: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    orders = await crud_order.get_user_orders(db=db, uid=uid, email=email)
    return ResponseModel(data=orders)


@router.patch("/{order_id}/status", response_model=ResponseModel[schema_order.OrderResponse])
async def update_status(
    order_id: str,
    body: schema_order.OrderStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    order = await crud_order.update_order_status(
        db=db,
        order_id=order_id,
        status=body.status
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return ResponseModel(data=order)


@router.post("/claim", response_model=ResponseModel[dict])
async def claim_orders(
    body: schema_order.ClaimGuestOrders,
    db: AsyncSession = Depends(get_db)
):
    count = await crud_order.claim_guest_orders(
        db=db,
        uid=body.uid,
        email=body.email
    )
    return ResponseModel(data={"claimed": count})