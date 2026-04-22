from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid


class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_email = Column(String, nullable=False)

    status = Column(String, default="new", index=True)

    # Храним всю 3D конфигурацию здесь
    configuration = Column(JSONB, nullable=False)

    quantity = Column(Integer, default=1)
    total_price = Column(Float, default=0.0)

    user = relationship("User", back_populates="orders")
    created_at = Column(DateTime(timezone=True), server_default=func.now())