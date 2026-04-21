from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime


class OrderCreate(BaseModel):
    user_id: Optional[str] = None
    user_email: str
    product_name: str
    configuration: Dict[str, Any]
    quantity: int = Field(default=1, ge=1)
    total_price: Optional[float] = None
    currency: str = Field(default="BYN")
    is_guest: bool = False


class OrderStatusUpdate(BaseModel):
    status: str


class ClaimGuestOrders(BaseModel):
    uid: str
    email: str


class OrderResponse(BaseModel):
    id: UUID
    user_id: Optional[str] = None
    user_email: str
    product_name: str
    configuration: Dict[str, Any]
    quantity: int
    total_price: Optional[float] = None
    currency: str
    is_guest: bool
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
