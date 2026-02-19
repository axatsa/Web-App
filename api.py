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
    
    # Products table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS master_products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        unit TEXT NOT NULL,
        last_price REAL
    )
    ''') 
    
    # Check if last_price column exists (migration)
    try:
        cursor.execute("SELECT last_price FROM master_products LIMIT 1")
    except sqlite3.OperationalError:
        cursor.execute("ALTER TABLE master_products ADD COLUMN last_price REAL")
        conn.commit()
    
    conn.commit()
    conn.close()

def seed_db():
    # Only seed if products table is empty
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM master_products")
    if cursor.fetchone()[0] == 0:
        products = [
            ('1', 'Молоко (Sut)', '🥛 Молочные продукты', 'л'),
            ('2', 'Кефир (Kefir)', '🥛 Молочные продукты', 'л'),
            ('3', 'Творог (Tvorog / Suzma)', '🥛 Молочные продукты', 'кг'),
            ('4', 'Каймак (Qaymoq)', '🥛 Молочные продукты', 'кг'),
            ('5', 'Сметана (Smetana / Qaymoqcha)', '🥛 Молочные продукты', 'кг'),
            ('6', 'Сыр твёрдый (Qattiq pishloq)', '🥛 Молочные продукты', 'кг'),
            ('7', 'Сыр плавленый (Eritilgan pishloq)', '🥛 Молочные продукты', 'кг'),
            ('8', 'Сыр моцарелла (Motsarella pishlog‘i)', '🥛 Молочные продукты', 'кг'),
            ('9', 'Сыр Ханский (Xon pishlog‘i)', '🥛 Молочные продукты', 'кг'),
            ('10', 'Сырок (Shirin pishloqcha)', '🥛 Молочные продукты', 'шт'),
            ('11', 'Сливочное масло (Sariyog‘)', '🥛 Молочные продукты', 'кг'),
            ('12', 'Маргарин «Шедрое лето» (Margarin)', '🥛 Молочные продукты', 'кг'),
            ('13', 'Яйца куриные (Tovuq tuxumi)', '🥚 Яйца и мясо', 'шт'),
            ('14', 'Яйца перепелиные (Bedana tuxumi)', '🥚 Яйца и мясо', 'шт'),
            ('15', 'Индейка (Kurka go‘shti)', '🥚 Яйца и мясо', 'кг'),
            ('16', 'Колбаса варёная (Qaynatilgan kolbasa)', '🥚 Яйца и мясо', 'кг'),
            ('17', 'Колбаса копчёная (Dudlangan kolbasa)', '🥚 Яйца и мясо', 'кг'),
            ('18', 'Сосиски (Sosiska)', '🥚 Яйца и мясо', 'кг'),
            ('19', 'Мука (Un)', '🍞 Хлеб и мучное', 'кг'),
            ('20', 'Лаваш (Lavash non)', '🍞 Хлеб и мучное', 'шт'),
            ('21', 'Хлеб (Non)', '🍞 Хлеб и мучное', 'шт'),
            ('22', 'Тостовый хлеб (Tost noni)', '🍞 Хлеб и мучное', 'шт'),
            ('23', 'Манпар (тесто) (Xamir)', '🍞 Хлеб и мучное', 'кг'),
            ('24', 'Макароны (Makaron)', '🍞 Хлеб и мучное', 'кг'),
            ('25', 'Спагетти (Spagetti)', '🍞 Хлеб и мучное', 'кг'),
            ('26', 'Вермишель (Vermishel)', '🍞 Хлеб и мучное', 'кг'),
            ('27', 'Фунчоза (Funchuza)', '🍞 Хлеб и мучное', 'кг'),
            ('28', 'Манная крупа (Manka yormasi)', '🍞 Хлеб и мучное', 'кг'),
            ('29', 'Овсянка (Suli yormasi)', '🍞 Хлеб и мучное', 'кг'),
            ('30', 'Рис (Guruch)', '🍚 Крупы и бобовые', 'кг'),
            ('31', 'Рис обычный (Oddiy guruch)', '🍚 Крупы и бобовые', 'кг'),
            ('32', 'Рис Лазер (Lazer guruch)', '🍚 Крупы и бобовые', 'кг'),
            ('33', 'Перловка (Arpa yormasi)', '🍚 Крупы и бобовые', 'кг'),
            ('34', 'Нут / горох (No‘xat)', '🍚 Крупы и бобовые', 'кг'),
            ('35', 'Горох (консерва) (Konserva no‘xat)', '🍚 Крупы и бобовые', 'шт'),
            ('36', 'Соль (Tuz)', '🧂 Специи и приправы', 'кг'),
            ('37', 'Корейская соль (Koreys tuzi)', '🧂 Специи и приправы', 'кг'),
            ('38', 'Зира (Zira)', '🧂 Специи и приправы', 'г'),
            ('39', 'Приправа для лагмана (Lag‘mon ziravori)', '🧂 Специи и приправы', 'г'),
            ('40', 'Лавровый лист (Dafna bargi)', '🧂 Специи и приправы', 'шт'),
            ('41', 'Роллтон (приправа) (Rollton ziravori)', '🧂 Специи и приправы', 'шт'),
            ('42', 'Кунжут (Kunjut)', '🧂 Специи и приправы', 'г'),
            ('43', 'Какао (Kakao)', '☕ Напитки и сладкое', 'кг'),
            ('44', 'Чёрный чай (Qora choy)', '☕ Напитки и сладкое', 'кг'),
            ('45', 'Сахар (Shakar)', '☕ Напитки и сладкое', 'кг'),
            ('46', 'Варенье (Murabbo)', '☕ Напитки и сладкое', 'кг'),
            ('47', 'Шоколадная паста (Shokolad pastasi)', '☕ Напитки и сладкое', 'шт'),
            ('48', 'Миллер (вафли) (Vafli)', '☕ Напитки и сладкое', 'шт'),
            ('49', 'Изюм (Mayiz)', '☕ Напитки и сладкое', 'кг'),
            ('50', 'Грецкий орех (Yong‘oq)', '☕ Напитки и сладкое', 'кг'),
            ('51', 'Майонез (Mayonez)', '🥫 Соусы и добавки', 'кг'),
            ('52', 'Соевый соус (Soya sousi)', '🥫 Соусы и добавки', 'л'),
            ('53', 'Уксус (Sirka)', '🥫 Соусы и добавки', 'л'),
            ('54', 'Томатная паста (Tomat pastasi)', '🥫 Соусы и добавки', 'кг'),
            ('55', 'Кетчуп (Ketchup)', '🥫 Соусы и добавки', 'шт'),
            ('56', 'Масло растительное (O‘simlik yog‘i)', '🥫 Соусы и добавки', 'л'),
            ('57', 'Сода (Soda)', '🥫 Соусы и добавки', 'шт'),
            ('58', 'Дрожжи (Xamirturush)', '🥫 Соусы и добавки', 'шт'),
            ('59', 'Разрыхлитель (Pishirish kukuni)', '🥫 Соусы и добавки', 'шт'),
            ('60', 'Картофель (Kartoshka)', '🥕 Овощи и зелень', 'кг'),
            ('61', 'Морковь красная (Qizil sabzi)', '🥕 Овощи и зелень', 'кг'),
            ('62', 'Морковь жёлтая (Sariq sabzi)', '🥕 Овощи и зелень', 'кг'),
            ('63', 'Капуста зелёная (Yashil karam)', '🥕 Овощи и зелень', 'кг'),
            ('64', 'Капуста красная (Qizil karam)', '🥕 Овощи и зелень', 'кг'),
            ('65', 'Капуста квашеная (Tuzlangan karam)', '🥕 Овощи и зелень', 'кг'),
            ('66', 'Помидоры (Pomidor)', '🥕 Овощи и зелень', 'кг'),
            ('67', 'Огурцы (Bodring)', '🥕 Овощи и зелень', 'кг'),
            ('68', 'Солёные огурцы (Tuzlangan bodring)', '🥕 Овощи и зелень', 'кг'),
            ('69', 'Болгарский перец (Bulgar qalampiri)', '🥕 Овощи и зелень', 'кг'),
            ('70', 'Болгарский перец «Светофор» (Rangli qalampir)', '🥕 Овощи и зелень', 'кг'),
            ('71', 'Лук (Piyoz)', '🥕 Овощи и зелень', 'кг'),
            ('72', 'Сельдерей (Selderey)', '🥕 Овощи и зелень', 'кг'),
            ('73', 'Корейская морковь (Koreyscha sabzi)', '🥕 Овощи и зелень', 'кг'),
            ('74', 'Укроп (Shivit)', '🥕 Овощи и зелень', 'кг'),
            ('75', 'Кинза (Kashnich)', '🥕 Овощи и зелень', 'кг'),
            ('76', 'Свекла красная (Qizil lavlagi)', '🥕 Овощи и зелень', 'кг'),
            ('77', 'Редька белая (Oq turup)', '🥕 Овощи и зелень', 'кг'),
            ('78', 'Бананы (Banan)', '🍎 Фрукты', 'кг'),
            ('79', 'Яблоки (Olma)', '🍎 Фрукты', 'кг'),
            ('80', 'Груша (Nok)', '🍎 Фрукты', 'кг'),
            ('81', 'Лимоны (Limon)', '🍎 Фрукты', 'кг')
        ]
        cursor.executemany("INSERT INTO master_products (id, name, category, unit) VALUES (?, ?, ?, ?)", products)
        conn.commit()
    conn.close()

init_db()
seed_db()

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
    deliveryDate: Optional[str] = None
    lastPrice: Optional[float] = None

class Order(BaseModel):
    id: str
    status: str
    products: List[Product]
    createdAt: str
    deliveredAt: Optional[str] = None
    estimatedDeliveryDate: Optional[str] = None
    branch: str

@app.get("/products")
async def get_products():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM master_products")
    rows = cursor.fetchall()
    conn.close()
    
    products = []
    for row in rows:
        # row: (id, name, category, unit, last_price)
        # Note: newer rows might have 5 columns, older table definitions might need migration if not handled by init_db
        last_price = row[4] if len(row) > 4 else None
        
        products.append({
            "id": row[0],
            "name": row[1],
            "category": row[2],
            "unit": row[3],
            "quantity": 0, # Default for selection
            "lastPrice": last_price
        })
    return products

@app.get("/orders")
async def get_orders():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders")
    rows = cursor.fetchall()
    conn.close()
    
    # Fetch last prices map
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, last_price FROM master_products")
    # Store as dict for O(1) access
    last_prices = {row[0]: row[1] for row in cursor.fetchall()}
    conn.close()

    orders = []
    for row in rows:
        order_products = json.loads(row[2])
        # Inject lastPrice into products if not present or just to be sure
        for p in order_products:
            if 'id' in p and p['id'] in last_prices:
                p['lastPrice'] = last_prices[p['id']]
                
        orders.append({
            "id": row[0],
            "status": row[1],
            "products": order_products,
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
    
    # Update last_price for products with valid price
    for p in order.products:
        if p.price and p.price > 0:
            cursor.execute("UPDATE master_products SET last_price = ? WHERE id = ?", (p.price, p.id))
    
    conn.commit()
    conn.close()
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
