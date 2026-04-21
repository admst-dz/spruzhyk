from sqlalchemy import Column, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid


class Product(Base):
    __tablename__ = 'products'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dealer_id = Column(String, ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    name = Column(String, nullable=False)
    binding = Column(JSONB, default=list)
    spiral_colors = Column(JSONB, default=list)
    has_elastic = Column(Boolean, default=False)
    elastic_colors = Column(JSONB, default=list)
    formats = Column(JSONB, default=list)
    cover_colors = Column(JSONB, default=list)
    retail_price = Column(Float, nullable=True)
    wholesale_tiers = Column(JSONB, default=list)
    image_url = Column(String, nullable=True)

    dealer = relationship("User", back_populates="products")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
