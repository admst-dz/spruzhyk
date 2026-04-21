from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = 'users'

    # ID из Firebase (строка)
    id = Column(String, primary_key=True, index=True)

    email = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=True)
    role = Column(String, default="client", nullable=False)
    sub_role = Column(String, nullable=True)
    token_balance = Column(Float, default=0.0)
    company_name = Column(String, nullable=True)

    # Связь с заказами
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())