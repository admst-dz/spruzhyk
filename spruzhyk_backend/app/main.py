import sentry_sdk
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.api.v1 import users, products, orders
from app.database import get_db

# --- 1. SENTRY (Мониторинг ошибок) ---
sentry_sdk.init(
    dsn="ТВОЙ_DSN_ИЗ_SENTRY", # Получи на sentry.io
    traces_sample_rate=1.0,
    environment="production"
)

# --- 2. ANTI-SPAM (Rate Limiter) ---
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Spruzhyk API", version="1.1.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- 3. ОГРАНИЧЕНИЕ РАЗМЕРА ЗАПРОСА (Защита от DDoS тяжелыми файлами) ---
class LimitUploadSize(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "POST":
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > 12_000_000: # Лимит 12 МБ
                return JSONResponse(status_code=413, content={"detail": "Payload too large"})
        return await call_next(request)

app.add_middleware(LimitUploadSize)
app.add_middleware(CORSMiddleware, allow_origins=["http://217.25.93.108"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# --- 4. ГЛОБАЛЬНЫЙ ПЕРЕХВАТЧИК ОШИБОК БД (Скрываем от юзеров) ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Логируем реальную ошибку в Sentry
    sentry_sdk.capture_exception(exc)
    # Пользователю отдаем стерильный ответ
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Our team is already fixing it."},
    )

# --- 5. DEVOPS HEALTHCHECK ---
@app.get("/api/health", tags=["DevOps"])
@limiter.limit("5/minute") # Антиспам: не больше 5 раз в минуту с одного IP
async def health_check(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        # Проверяем реальное соединение с БД
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        sentry_sdk.capture_exception(e)
        raise HTTPException(status_code=503, detail="Database connection failed")

# Подключаем роутеры
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["Orders"])