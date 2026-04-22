from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.product import Product
from app.schemas.product import ProductCreate


async def get_product(db: AsyncSession, product_id: int):
    """
    Получить продукт по ID
    """
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    return result.scalar_one_or_none()  # Вернёт Product или None


async def get_products(db: AsyncSession, skip: int = 0, limit: int = 100):
    """
    Получить список продуктов с пагинацией
    """
    result = await db.execute(
        select(Product).offset(skip).limit(limit)
    )
    return result.scalars().all()  # Вернёт список продуктов


async def create_product(db: AsyncSession, product: ProductCreate):
    """
    Создать новый продукт
    """
    # Создаём объект Product из данных
    db_product = Product(
        name=product.name,
        price=product.price
        # Если есть другие поля, добавьте их здесь
    )

    # Добавляем в сессию
    db.add(db_product)

    # Сохраняем в БД
    await db.commit()

    # Обновляем объект (получаем ID, даты и т.д.)
    await db.refresh(db_product)

    return db_product