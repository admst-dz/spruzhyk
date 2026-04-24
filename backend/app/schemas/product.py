from pydantic import BaseModel, ConfigDict, model_validator
from typing import Optional, List, Dict, Any
from uuid import UUID


class ProductCreate(BaseModel):
    name: str = 'Ежедневник'
    dealerId: Optional[str] = None
    retailPrice: Optional[float] = None
    binding: Optional[List[str]] = []
    spiralColors: Optional[List[Dict[str, Any]]] = []
    hasElastic: Optional[bool] = False
    elasticColors: Optional[List[Dict[str, Any]]] = []
    formats: Optional[List[str]] = []
    coverColors: Optional[List[Dict[str, Any]]] = []
    wholesaleTiers: Optional[List[Dict[str, Any]]] = []


class ProductUpdate(ProductCreate):
    pass


class ProductResponse(BaseModel):
    id: UUID
    name: str
    dealer_id: Optional[str] = None
    retailPrice: Optional[float] = None
    binding: List[str] = []
    spiralColors: List[Dict[str, Any]] = []
    hasElastic: bool = False
    elasticColors: List[Dict[str, Any]] = []
    formats: List[str] = []
    coverColors: List[Dict[str, Any]] = []
    wholesaleTiers: List[Dict[str, Any]] = []

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode='before')
    @classmethod
    def remap_orm_fields(cls, data):
        if not isinstance(data, dict):
            return {
                'id': data.id,
                'name': data.name,
                'dealer_id': data.dealer_id,
                'retailPrice': data.retail_price,
                'binding': data.binding or [],
                'spiralColors': data.spiral_colors or [],
                'hasElastic': data.has_elastic or False,
                'elasticColors': data.elastic_colors or [],
                'formats': data.formats or [],
                'coverColors': data.cover_colors or [],
                'wholesaleTiers': data.wholesale_tiers or [],
            }
        return data
