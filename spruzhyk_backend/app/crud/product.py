from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
import uuid


async def get_all_products(db: AsyncSession):
    result = await db.execute(select(Product).order_by(Product.created_at.desc()))
    return result.scalars().all()


async def get_dealer_products(db: AsyncSession, dealer_id: str):
    result = await db.execute(select(Product).where(Product.dealer_id == dealer_id).order_by(Product.created_at.desc()))
    return result.scalars().all()


async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
    db_product = Product(
        dealer_id=data.dealer_id,
        name=data.name,
        binding=data.binding,
        spiral_colors=data.spiral_colors,
        has_elastic=data.has_elastic,
        elastic_colors=data.elastic_colors,
        formats=data.formats,
        cover_colors=data.cover_colors,
        retail_price=data.retail_price,
        wholesale_tiers=data.wholesale_tiers,
        image_url=data.image_url,
    )
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product


async def update_product(db: AsyncSession, product_id: str, data: ProductUpdate) -> Product | None:
    result = await db.execute(select(Product).where(Product.id == uuid.UUID(product_id)))
    product = result.scalar_one_or_none()
    if not product:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    await db.commit()
    await db.refresh(product)
    return product


async def delete_product(db: AsyncSession, product_id: str) -> bool:
    result = await db.execute(select(Product).where(Product.id == uuid.UUID(product_id)))
    product = result.scalar_one_or_none()
    if not product:
        return False
    await db.delete(product)
    await db.commit()
    return True
