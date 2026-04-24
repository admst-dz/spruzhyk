FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ../spruzhyk_backend .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "4000"]