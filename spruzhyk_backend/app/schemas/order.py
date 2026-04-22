from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from uuid import UUID

class OrderCreate(BaseModel):
    user_id: Optional[str] = None
    user_email: str
    configuration: Dict[str, Any] # Сюда прилетит JSON из 3D
    quantity: int = 1
    total_price: float = 0.0

class OrderResponse(OrderCreate):
    id: UUID
    status: str

    model_config = ConfigDict(from_attributes=True)