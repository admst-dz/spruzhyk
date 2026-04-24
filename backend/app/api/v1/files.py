import os
import uuid
import aiofiles
from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter()

UPLOAD_DIR = "uploads/logos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload-logo")
async def upload_logo(file: UploadFile = File(...)):
    allowed_types = ["image/svg+xml", "image/png", "application/postscript"] # svg, png, eps
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Формат файла не поддерживается")

    file_ext = file.filename.split('.')[-1]
    new_filename = f"{uuid.uuid4().hex}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, new_filename)

    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)

    return {"url": f"/uploads/logos/{new_filename}"}