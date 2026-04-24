import os

import httpx


TELEGRAM_AUTH_SERVICE_URL = os.getenv("TELEGRAM_AUTH_SERVICE_URL", "http://telegram-auth:4100")


async def verify_telegram_login(payload: dict) -> dict:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(f"{TELEGRAM_AUTH_SERVICE_URL}/verify", json=payload)

    if response.status_code != 200:
        detail = response.json().get("detail", "Telegram auth verification failed")
        raise ValueError(detail)

    return response.json()
