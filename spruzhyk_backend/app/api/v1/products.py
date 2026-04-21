from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.database import get_db
from app.crud import product as crud_product
from app.schemas import product as schema_product
from app.schemas.response import ResponseModel

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", response_model=ResponseModel[List[schema_product.ProductResponse]])
async def read_products(
    dealer_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    if dealer_id:
        products = await crud_product.get_dealer_products(db=db, dealer_id=dealer_id)
    else:
        products = await crud_product.get_all_products(db=db)

    return ResponseModel(data=products)


@router.post("/", response_model=ResponseModel[schema_product.ProductResponse])
async def create_product(
    product_in: schema_product.ProductCreate,
    db: AsyncSession = Depends(get_db)
):
    product = await crud_product.create_product(db=db, data=product_in)
    return ResponseModel(data=product)


@router.put("/{product_id}", response_model=ResponseModel[schema_product.ProductResponse])
async def update_product(
    product_id: str,
    product_in: schema_product.ProductUpdate,
    db: AsyncSession = Depends(get_db)
):
    product = await crud_product.update_product(
        db=db,
        product_id=product_id,
        data=product_in
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return ResponseModel(data=product)


@router.delete("/{product_id}", response_model=ResponseModel[dict])
async def delete_product(
    product_id: str,
    db: AsyncSession = Depends(get_db)
):
    ok = await crud_product.delete_product(db=db, product_id=product_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Product not found")

    return ResponseModel(data={"deleted": True})