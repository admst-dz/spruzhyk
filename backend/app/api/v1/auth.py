import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.crud import user as crud_user
from app.models.user import User
from app.schemas.user import (
    UserRegister,
    UserLogin,
    TokenResponse,
    UserResponse,
    GoogleAuthRequest,
    GoogleTokenResponse,
    TelegramAuthRequest,
)
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user
from app.core.google_verify import exchange_google_code
from app.core.telegram_auth import verify_telegram_login

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

router = APIRouter()


@router.post("/google", response_model=GoogleTokenResponse)
@limiter.limit("10/minute")
async def google_auth(request: Request, body: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = await exchange_google_code(body.google_code)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Недействительный Google токен: {e}")

    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email не найден в токене")


def _build_display_name(payload: dict) -> str:
    full_name = " ".join(filter(None, [payload.get("first_name"), payload.get("last_name")])).strip()
    if full_name:
        return full_name
    if payload.get("username"):
        return f"@{payload['username']}"
    return "Telegram User"


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
        # БЕЗОПАСНОСТЬ: Не даем перезаписать роль, если она уже есть
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
        role="client",  # ЖЕСТКО СТАВИМ КЛИЕНТА (Дилера назначает админ)
        sub_role=data.sub_role,
        token_balance=0.0,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    token = create_access_token(user.id, user.email, user.role)
    return {"access_token": token, "user": user}


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
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
        payload = await exchange_google_code(body.google_code)
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


@router.post("/telegram", response_model=GoogleTokenResponse)
@limiter.limit("10/minute")
async def telegram_auth(request: Request, body: TelegramAuthRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = await verify_telegram_login(body.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=401, detail=str(exc))

    telegram_id = str(payload["id"])
    user = await crud_user.get_user_by_telegram_id(db, telegram_id)
    if not user:
        email = _build_telegram_email(telegram_id)
        user = await crud_user.get_user_by_email(db, email)
        if user and not user.telegram_id:
            user.telegram_id = telegram_id
            if not user.display_name:
                user.display_name = _build_display_name(payload)
            db.add(user)
            await db.commit()
            await db.refresh(user)
        elif not user:
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                telegram_id=telegram_id,
                display_name=_build_display_name(payload),
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
    role = body.get("role")
    sub_role = body.get("sub_role")

    # Разрешаем выбор роли только при первичной настройке (sub_role ещё не задан)
    if current_user.sub_role is None:
        if role in ("client", "dealer"):
            current_user.role = role

        if sub_role:
            if sub_role not in ["PL", "PKL", "KL", "KPR", "PR"]:
                raise HTTPException(status_code=400, detail="Недопустимая роль")
            current_user.sub_role = sub_role

        db.add(current_user)
        await db.commit()
        await db.refresh(current_user)

    return current_user
