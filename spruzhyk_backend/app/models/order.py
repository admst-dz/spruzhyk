from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid


class Order(Base):
    __tablename__ = "orders"
    id = Column(UUID, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), index=True) # ИНДЕКС ДЛЯ БЫСТРОГО ПОИСКА ЗАКАЗОВ ЮЗЕРА
    status = Column(String, default="new", index=True) # ИНДЕКС ДЛЯ ФИЛЬТРА ДИЛЕРА (Где status == 'new')
    created_at = Column(DateTime, server_default=func.now(), index=True) # ИНДЕКС ДЛЯ СОРТИРОВКИ ПО ДАТЕ