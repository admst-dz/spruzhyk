from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
from app.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.crud import product as crud_product
from app.core.deps import get_current_user

router = APIRouter()


@router.get("/", response_model=list[ProductResponse])
async def get_products(
    dealer_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    if dealer_id:
        return await crud_product.get_products_by_dealer(db, dealer_id)
    return await crud_product.get_products(db)


@router.post("/", response_model=ProductResponse)
async def create_product(
    product: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ["admin", "dealer", "owner"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return await crud_product.create_product(db, product)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID,
    product: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ["admin", "dealer", "owner"]:
        raise HTTPException(status_code=403, detail="Access denied")
    updated = await crud_product.update_product(db, product_id, product)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated


@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ["admin", "dealer", "owner"]:
        raise HTTPException(status_code=403, detail="Access denied")
    deleted = await crud_product.delete_product(db, product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
