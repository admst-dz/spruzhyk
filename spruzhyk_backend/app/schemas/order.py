from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime


class OrderCreate(BaseModel):
    user_id: Optional[str] = None  # Может быть null для гостей
    user_email: EmailStr
    product_name: str

    configuration: Dict[str, Any]

    quantity: int = Field(default=1, ge=1)
    total_price: float = Field(ge=0)
    currency: str = Field(default="RUB")


# Схема для ответа (возвращаем фронтенду после создания)
class OrderResponse(OrderCreate):
    id: UUID
    status: str
    created_at: datetime

    class Config:
        from_attributes = True  #
