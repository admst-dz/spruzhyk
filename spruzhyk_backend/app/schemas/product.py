from pydantic import BaseModel
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime


class ProductCreate(BaseModel):
    dealer_id: Optional[str] = None
    name: str
    binding: List[str] = []
    spiral_colors: List[Any] = []
    has_elastic: bool = False
    elastic_colors: List[Any] = []
    formats: List[str] = []
    cover_colors: List[Any] = []
    retail_price: Optional[float] = None
    wholesale_tiers: List[Any] = []
    image_url: Optional[str] = None


class ProductUpdate(ProductCreate):
    pass


class ProductResponse(ProductCreate):
    id: UUID
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
