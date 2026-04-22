from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional


class UserCreate(BaseModel):
    id: str
    email: EmailStr
    display_name: Optional[str] = None
    role: Optional[str] = "client"


class UserResponse(UserCreate):
    token_balance: float

    model_config = ConfigDict(from_attributes=True)