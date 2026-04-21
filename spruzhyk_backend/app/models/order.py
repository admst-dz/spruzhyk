from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid


class Order(Base):
    __tablename__ = 'orders'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    user_email = Column(String, nullable=False)

    product_name = Column(String, nullable=False)
    status = Column(String, default="new", index=True)

    configuration = Column(JSONB, nullable=False)

    quantity = Column(Integer, default=1)
    total_price = Column(Float, nullable=False)
    currency = Column(String, default="RUB")

    user = relationship("User", back_populates="orders")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())