import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.crud import user as crud_user
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    existing = await crud_user.get_user_by_email(db, data.email)
    if existing:
        if existing.password_hash:
            raise HTTPException(status_code=400, detail="Email уже зарегистрирован")
        # Аккаунт существует без пароля (перенос с Firebase) — устанавливаем пароль
        existing.password_hash = hash_password(data.password)
        if data.display_name:
            existing.display_name = data.display_name
        if data.role:
            existing.role = data.role
        if data.sub_role:
            existing.sub_role = data.sub_role
        db.add(existing)
        await db.commit()
        await db.refresh(existing)
        token = create_access_token(existing.id, existing.email, existing.role)
        return {"access_token": token, "user": existing}

    user = User(
        id=str(uuid.uuid4()),
        email=data.email,
        password_hash=hash_password(data.password),
        display_name=data.display_name or "",
        role=data.role or "client",
        sub_role=data.sub_role,
        token_balance=0.0,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    token = create_access_token(user.id, user.email, user.role)
    return {"access_token": token, "user": user}


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await crud_user.get_user_by_email(db, data.email)
    if not user or not user.password_hash or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный Email или пароль")
    token = create_access_token(user.id, user.email, user.role)
    return {"access_token": token, "user": user}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    return current_user
