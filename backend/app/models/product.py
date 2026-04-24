from sqlalchemy import Column, String, Float, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.database import Base
import uuid


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dealer_id = Column(String, nullable=True, index=True)
    name = Column(String, nullable=False)
    binding = Column(JSONB, nullable=True)
    spiral_colors = Column(JSONB, nullable=True)
    has_elastic = Column(Boolean, nullable=True, default=False)
    elastic_colors = Column(JSONB, nullable=True)
    formats = Column(JSONB, nullable=True)
    cover_colors = Column(JSONB, nullable=True)
    retail_price = Column(Float, nullable=True)
    wholesale_tiers = Column(JSONB, nullable=True)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=True)
