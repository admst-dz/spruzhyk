from fastapi import FastAPI, Request
from fastapi.responses import Response
from weasyprint import HTML
from jinja2 import Environment, FileSystemLoader
import os

app = FastAPI(title="PDF Generator Service")

env = Environment(loader=FileSystemLoader('templates'))


@app.post("/generate/tech-card")
async def generate_tech_card(request: Request):
    data = await request.json()

    template = env.get_template('tech_card.html')
    html_content = template.render(**data)

    pdf_bytes = HTML(string=html_content).write_pdf()

    return Response(content=pdf_bytes, media_type="application/pdf")