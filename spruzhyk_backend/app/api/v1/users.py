from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.crud import user as crud_user
from app.schemas import user as schema_user
from app.schemas.response import ResponseModel

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/{uid}", response_model=ResponseModel[schema_user.UserResponse])
async def get_user(uid: str, db: AsyncSession = Depends(get_db)):
    user = await crud_user.get_user(db, uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return ResponseModel(data=user)


@router.post("/", response_model=ResponseModel[schema_user.UserResponse])
async def create_user(
    user_in: schema_user.UserCreate,
    db: AsyncSession = Depends(get_db)
):
    user = await crud_user.upsert_user(db, user_in)
    return ResponseModel(data=user)