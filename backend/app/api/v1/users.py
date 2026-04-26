from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.user import UserResponse
from app.crud import user as crud_user
from app.core.deps import get_current_user

router = APIRouter()


@router.get("/{user_id}", response_model=UserResponse)
async def read_user(
        user_id: str,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user)  # только авторизованные!
):
    # зырить ток может пользователь
    # либо пускаем дилеров/админов для просмотра чужих
    if current_user.id != user_id and current_user.role not in ["admin", "dealer"]:
        raise HTTPException(status_code=403, detail="Нет прав для просмотра этого профиля")

    db_user = await crud_user.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return db_user