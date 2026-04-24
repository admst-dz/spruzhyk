import hashlib
import hmac
import os
import time
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
MAX_AGE_SECONDS = int(os.getenv("TELEGRAM_AUTH_MAX_AGE_SECONDS", "86400"))

app = FastAPI(title="Telegram Auth Service", version="1.0.0")


class TelegramAuthPayload(BaseModel):
    id: int | str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    photo_url: Optional[str] = None
    auth_date: int
    hash: str


def _build_data_check_string(payload: dict) -> str:
    parts = []
    for key in sorted(payload.keys()):
        value = payload.get(key)
        if key == "hash" or value in (None, ""):
            continue
        parts.append(f"{key}={value}")
    return "\n".join(parts)


def _verify_hash(payload: dict) -> bool:
    secret_key = hashlib.sha256(BOT_TOKEN.encode("utf-8")).digest()
    data_check_string = _build_data_check_string(payload)
    computed_hash = hmac.new(
        secret_key,
        msg=data_check_string.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(computed_hash, payload["hash"])


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/verify")
async def verify(payload: TelegramAuthPayload):
    if not BOT_TOKEN:
        raise HTTPException(status_code=500, detail="TELEGRAM_BOT_TOKEN is not configured")

    data = payload.model_dump()
    if not _verify_hash(data):
        raise HTTPException(status_code=401, detail="Invalid Telegram signature")

    if int(time.time()) - int(data["auth_date"]) > MAX_AGE_SECONDS:
        raise HTTPException(status_code=401, detail="Telegram auth data is too old")

    return data
