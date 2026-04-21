from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    id: str
    email: EmailStr
    display_name: Optional[str] = None
    role: str = "client"
    sub_role: Optional[str] = None
    company_name: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    display_name: Optional[str] = None
    role: str
    sub_role: Optional[str] = None
    token_balance: float = 0.0
    company_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
