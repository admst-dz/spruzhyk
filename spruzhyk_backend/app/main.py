from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.crud import order as crud_order
from app.schemas import order as schema_order

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Spruzhuk Backend API", version="1.0.0")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #домен
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "API Spruzhuk работает!"}


@app.post("/api/orders/", response_model=schema_order.OrderResponse, status_code=201)
async def create_new_order(
    order_in: schema_order.OrderCreate,
    db: AsyncSession = Depends(get_db)
):

    try:
        new_order = await crud_order.create_order(db=db, order_data=order_in)
        return new_order
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/orders/", response_model=List[schema_order.OrderResponse])
async def read_orders(db: AsyncSession = Depends(get_db)):
    orders = await crud_order.get_all_orders(db=db)
    return orders