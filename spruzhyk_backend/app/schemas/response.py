from pydantic import BaseModel
from typing import Generic, TypeVar, Optional

T = TypeVar("T")

class ResponseModel(BaseModel, Generic[T]):
    status: str = "success"
    data: Optional[T] = None
    error: Optional[str] = None