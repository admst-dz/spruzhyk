import os
import uuid
import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from pypdf import PdfReader, PdfWriter

app = FastAPI(title="Custom Block Builder Service")

TEMPLATES_DIR = "templates"
OUTPUT_DIR = "/app/uploads/blocks"

os.makedirs(TEMPLATES_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


class PageSection(BaseModel):
    template_type: str
    count: int


class BlockRequest(BaseModel):
    order_id: str
    sections: List[PageSection]


def _merge_pdf_sync(request_data: BlockRequest, output_filename: str) -> str:
    merger = PdfWriter()

    total_pages = 0

    for section in request_data.sections:
        template_path = os.path.join(TEMPLATES_DIR, f"{section.template_type}.pdf")

        if not os.path.exists(template_path):
            raise FileNotFoundError(f"Шаблон {section.template_type}.pdf не найден!")

        reader = PdfReader(template_path)
        page = reader.pages[0]

        for _ in range(section.count):
            merger.add_page(page)
            total_pages += 1

    if total_pages > 300:
        raise ValueError(f"Превышен лимит страниц. Запрошено: {total_pages}, Максимум: 300")

    output_path = os.path.join(OUTPUT_DIR, output_filename)

    with open(output_path, "wb") as f_out:
        merger.write(f_out)

    return f"/uploads/blocks/{output_filename}"


@app.post("/build-block")
async def build_custom_block(request: BlockRequest):
    filename = f"block_{request.order_id}_{uuid.uuid4().hex[:6]}.pdf"

    try:
        file_url = await asyncio.to_thread(_merge_pdf_sync, request, filename)
        return {
            "status": "success",
            "message": "Блок успешно сгенерирован",
            "file_url": file_url
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error building block: {e}")
        raise HTTPException(status_code=500, detail="Внутренняя ошибка склейки")