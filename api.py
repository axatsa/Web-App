import sqlite3
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

app = FastAPI()

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "database.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        telegram_id INTEGER UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL,
        branch TEXT,
        language TEXT DEFAULT 'ru',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Orders table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        products TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        deliveredAt TEXT,
        estimatedDeliveryDate TEXT,
        branch TEXT NOT NULL
    )
    ''')
    
    conn.commit()
    conn.close()

init_db()

class Product(BaseModel):
    id: str
    name: str
    category: str
    quantity: float
    unit: str
    price: Optional[float] = None
    comment: Optional[str] = None
    checked: Optional[bool] = None
    chefComment: Optional[str] = None

class Order(BaseModel):
    id: str
    status: str
    products: List[Product]
    createdAt: str
    deliveredAt: Optional[str] = None
    estimatedDeliveryDate: Optional[str] = None
    branch: str

@app.get("/orders")
async def get_orders():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders")
    rows = cursor.fetchall()
    conn.close()
    
    orders = []
    for row in rows:
        orders.append({
            "id": row[0],
            "status": row[1],
            "products": json.loads(row[2]),
            "createdAt": row[3],
            "deliveredAt": row[4],
            "estimatedDeliveryDate": row[5],
            "branch": row[6]
        })
    return orders

@app.post("/orders/upsert")
async def upsert_order(order: Order):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    products_json = json.dumps([p.dict() for p in order.products])
    
    cursor.execute('''
    INSERT INTO orders (id, status, products, createdAt, deliveredAt, estimatedDeliveryDate, branch)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        status=excluded.status,
        products=excluded.products,
        createdAt=excluded.createdAt,
        deliveredAt=excluded.deliveredAt,
        estimatedDeliveryDate=excluded.estimatedDeliveryDate,
        branch=excluded.branch
    ''', (order.id, order.status, products_json, order.createdAt, order.deliveredAt, order.estimatedDeliveryDate, order.branch))
    
    conn.commit()
    conn.close()
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
