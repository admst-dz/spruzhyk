from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # Firebase UID
    email = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=True)
    role = Column(String, default="client", nullable=False)

    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")

    created_at = Column(DateTime(timezone=True), server_default=func.now())