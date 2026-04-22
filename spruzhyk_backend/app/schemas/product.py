from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID

class ProductCreate(BaseModel):
    name: str
    type_slug: str
    price_rub: float

class ProductResponse(ProductCreate):
    id: UUID
    is_active: bool

    model_config = ConfigDict(from_attributes=True)