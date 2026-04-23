from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


async def get_product(db: AsyncSession, product_id):
    result = await db.execute(select(Product).where(Product.id == product_id))
    return result.scalar_one_or_none()


async def get_products(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(Product).offset(skip).limit(limit))
    return result.scalars().all()


async def get_products_by_dealer(db: AsyncSession, dealer_id: str):
    result = await db.execute(select(Product).where(Product.dealer_id == dealer_id))
    return result.scalars().all()


async def create_product(db: AsyncSession, product: ProductCreate):
    db_product = Product(
        name=product.name,
        dealer_id=product.dealerId,
        retail_price=product.retailPrice or 0,
        binding=product.binding or [],
        spiral_colors=product.spiralColors or [],
        has_elastic=product.hasElastic or False,
        elastic_colors=product.elasticColors or [],
        formats=product.formats or [],
        cover_colors=product.coverColors or [],
        wholesale_tiers=product.wholesaleTiers or [],
    )
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product


async def update_product(db: AsyncSession, product_id, product: ProductUpdate):
    result = await db.execute(select(Product).where(Product.id == product_id))
    db_product = result.scalar_one_or_none()
    if not db_product:
        return None
    db_product.name = product.name
    db_product.retail_price = product.retailPrice or 0
    db_product.binding = product.binding or []
    db_product.spiral_colors = product.spiralColors or []
    db_product.has_elastic = product.hasElastic or False
    db_product.elastic_colors = product.elasticColors or []
    db_product.formats = product.formats or []
    db_product.cover_colors = product.coverColors or []
    db_product.wholesale_tiers = product.wholesaleTiers or []
    await db.commit()
    await db.refresh(db_product)
    return db_product


async def delete_product(db: AsyncSession, product_id):
    result = await db.execute(select(Product).where(Product.id == product_id))
    db_product = result.scalar_one_or_none()
    if db_product:
        await db.delete(db_product)
        await db.commit()
    return db_product
