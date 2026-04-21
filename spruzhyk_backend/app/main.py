from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.database import get_db
from app.crud import order as crud_order
from app.crud import user as crud_user
from app.crud import product as crud_product
from app.schemas import order as schema_order
from app.schemas import user as schema_user
from app.schemas import product as schema_product

app = FastAPI(title="Spruzhuk Backend API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "API Spruzhuk работает!"}


# ─── USERS ───────────────────────────────────────────────────────────────────

@app.get("/api/users/{uid}", response_model=schema_user.UserResponse)
async def get_user(uid: str, db: AsyncSession = Depends(get_db)):
    user = await crud_user.get_user(db, uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/api/users/", response_model=schema_user.UserResponse, status_code=201)
async def create_user(user_in: schema_user.UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await crud_user.upsert_user(db, user_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ─── ORDERS ──────────────────────────────────────────────────────────────────

@app.post("/api/orders/", response_model=schema_order.OrderResponse, status_code=201)
async def create_order(order_in: schema_order.OrderCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await crud_order.create_order(db=db, order_data=order_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/orders/", response_model=List[schema_order.OrderResponse])
async def read_all_orders(db: AsyncSession = Depends(get_db)):
    return await crud_order.get_all_orders(db=db)


@app.get("/api/orders/user/{uid}", response_model=List[schema_order.OrderResponse])
async def read_user_orders(uid: str, email: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    return await crud_order.get_user_orders(db=db, uid=uid, email=email)


@app.patch("/api/orders/{order_id}/status", response_model=schema_order.OrderResponse)
async def update_status(order_id: str, body: schema_order.OrderStatusUpdate, db: AsyncSession = Depends(get_db)):
    order = await crud_order.update_order_status(db=db, order_id=order_id, status=body.status)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@app.post("/api/orders/claim")
async def claim_orders(body: schema_order.ClaimGuestOrders, db: AsyncSession = Depends(get_db)):
    count = await crud_order.claim_guest_orders(db=db, uid=body.uid, email=body.email)
    return {"claimed": count}


# ─── PRODUCTS ────────────────────────────────────────────────────────────────

@app.get("/api/products/", response_model=List[schema_product.ProductResponse])
async def read_products(dealer_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    if dealer_id:
        return await crud_product.get_dealer_products(db=db, dealer_id=dealer_id)
    return await crud_product.get_all_products(db=db)


@app.post("/api/products/", response_model=schema_product.ProductResponse, status_code=201)
async def create_product(product_in: schema_product.ProductCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await crud_product.create_product(db=db, data=product_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/api/products/{product_id}", response_model=schema_product.ProductResponse)
async def update_product(product_id: str, product_in: schema_product.ProductUpdate, db: AsyncSession = Depends(get_db)):
    product = await crud_product.update_product(db=db, product_id=product_id, data=product_in)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.delete("/api/products/{product_id}", status_code=204)
async def delete_product(product_id: str, db: AsyncSession = Depends(get_db)):
    ok = await crud_product.delete_product(db=db, product_id=product_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Product not found")
