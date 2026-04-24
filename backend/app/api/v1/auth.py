import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.crud import user as crud_user
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse, GoogleAuthRequest, \
    GoogleTokenResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user
from app.core.firebase_verify import verify_firebase_token

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

router = APIRouter()


# ─── Email/Password ───────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse)
@limiter.limit("5/minute")  # Защита от спам-регистраций
async def register(request: Request, data: UserRegister, db: AsyncSession = Depends(get_db)):
    existing = await crud_user.get_user_by_email(db, data.email)
    if existing:
        if existing.password_hash:
            raise HTTPException(status_code=400, detail="Email уже зарегистрирован")

        existing.password_hash = hash_password(data.password)
        if data.display_name:
            existing.display_name = data.display_name

        # БЕЗОПАСНОСТЬ: Разрешаем задать sub_role только если он пустой
        if data.sub_role and existing.sub_role is None:
            if data.sub_role in ["PL", "PKL", "KL", "KPR", "PR"]:
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
        role="client",  # БЕЗОПАСНОСТЬ: ЖЕСТКО СТАВИМ КЛИЕНТА
        sub_role=data.sub_role if data.sub_role in ["PL", "PKL", "KL", "KPR", "PR"] else None,
        token_balance=0.0,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    token = create_access_token(user.id, user.email, user.role)
    return {"access_token": token, "user": user}


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")  # Защита от брутфорса
async def login(request: Request, data: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await crud_user.get_user_by_email(db, data.email)
    if not user or not user.password_hash or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный Email или пароль")

    token = create_access_token(user.id, user.email, user.role)
    return {"access_token": token, "user": user}


@router.post("/google", response_model=GoogleTokenResponse)
@limiter.limit("10/minute")
async def google_auth(request: Request, body: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = await verify_firebase_token(body.firebase_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Недействительный Google токен")

    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email не найден в токене")

    user = await crud_user.get_user_by_email(db, email)
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            display_name=payload.get("name", ""),
            role="client",
            sub_role=None,
            token_balance=0.0,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    needs_role_setup = user.sub_role is None
    token = create_access_token(user.id, user.email, user.role)
    return {"access_token": token, "user": user, "needs_role_setup": needs_role_setup}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    return current_user


@router.patch("/me/role", response_model=UserResponse)
async def update_role(
        body: dict,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    sub_role = body.get("sub_role")

    if current_user.sub_role is None and sub_role:
        if sub_role not in ["PL", "PKL", "KL", "KPR", "PR"]:
            raise HTTPException(status_code=400, detail="Недопустимая под-роль")

        current_user.sub_role = sub_role
        db.add(current_user)
        await db.commit()
        await db.refresh(current_user)

    return current_user