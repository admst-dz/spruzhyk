import os
import httpx
from jose import jwt, JWTError

FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "spruzhuk")
FIREBASE_KEYS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"


async def verify_firebase_token(token: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(FIREBASE_KEYS_URL)
        public_keys = resp.json()

    header = jwt.get_unverified_header(token)
    kid = header.get("kid")
    if kid not in public_keys:
        raise ValueError("Unknown Firebase key ID")

    payload = jwt.decode(
        token,
        public_keys[kid],
        algorithms=["RS256"],
        audience=FIREBASE_PROJECT_ID,
        issuer=f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}",
    )
    return payload
