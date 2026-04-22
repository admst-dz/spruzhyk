import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.crud import user as crud_user
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user
from app.core.firebase_verify import verify_firebase_token

router = APIRouter()


# ─── Email/Password ───────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    existing = await crud_user.get_user_by_email(db, data.email)
    if existing:
        if existing.password_hash:
            raise HTTPException(status_code=400, detail="Email уже зарегистрирован")
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


@router.patch("/me/role", response_model=UserResponse)
async def update_role(
    body: dict,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    role = body.get("role")
    sub_role = body.get("sub_role")
    if role:
        current_user.role = role
    if sub_role is not None:
        current_user.sub_role = sub_role
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user


# ─── Google OAuth через Firebase ─────────────────────────────────────────────

@router.post("/google")
async def google_auth(body: dict, db: AsyncSession = Depends(get_db)):
    firebase_token = body.get("firebase_token")
    if not firebase_token:
        raise HTTPException(status_code=400, detail="firebase_token required")

    try:
        payload = await verify_firebase_token(firebase_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Недействительный Firebase токен")

    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google не вернул email")

    display_name = payload.get("name", "")
    user = await crud_user.get_user_by_email(db, email)
    is_new = user is None

    if is_new:
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            display_name=display_name,
            role="client",
            token_balance=0.0,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    jwt_token = create_access_token(user.id, user.email, user.role)
    return {
        "access_token": jwt_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "display_name": user.display_name,
            "role": user.role,
            "sub_role": user.sub_role,
            "token_balance": user.token_balance or 0.0,
        },
        "needs_role_setup": is_new,
    }
