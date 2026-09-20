from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timedelta
from uuid import uuid4
import hashlib

from blockchain.blockchain import LocalBlockchain

from sqlalchemy import create_engine, Column, String, Float, Integer, text
from sqlalchemy.orm import declarative_base, sessionmaker


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="Blockchain Marketplace API",
    description="Backend API for a Blockchain Marketplace",
    version="3.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# SQLITE DATABASE
# ============================================================

DATABASE_URL = "sqlite:///./marketplace.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
blockchain = LocalBlockchain()


# ============================================================
# DATABASE TABLES
# ============================================================

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False, default="")
    role = Column(String, nullable=False, default="buyer")
    wallet_address = Column(String, nullable=True)
    created_at = Column(String, nullable=False)


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    seller_id = Column(String, nullable=False)
    stock = Column(Integer, nullable=False, default=1)
    created_at = Column(String, nullable=False)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True)
    buyer_id = Column(String, nullable=False)
    seller_id = Column(String, nullable=False)
    product_id = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)
    previous_hash = Column(String, nullable=False, default="GENESIS")
    transaction_hash = Column(String, nullable=False, default="")
    delivery_status = Column(String, nullable=False, default="Processing")
    estimated_delivery = Column(String, nullable=False, default="")


Base.metadata.create_all(bind=engine)


# ============================================================
# DATABASE MIGRATION
# ============================================================

# Your existing marketplace.db was created before
# password and role were added.
# These commands add the missing columns without deleting
# your existing products and transactions.

with engine.connect() as connection:

    try:
        connection.execute(
            text("ALTER TABLE users ADD COLUMN password VARCHAR DEFAULT ''")
        )
    except Exception:
        pass

    try:
        connection.execute(
            text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'buyer'")
        )
    except Exception:
        pass

    try:
        connection.execute(
            text("ALTER TABLE transactions ADD COLUMN previous_hash VARCHAR DEFAULT 'GENESIS'")
        )
    except Exception:
        pass

    try:
        connection.execute(
            text("ALTER TABLE transactions ADD COLUMN transaction_hash VARCHAR DEFAULT ''")
        )
    except Exception:
        pass

    try:
        connection.execute(
            text("ALTER TABLE transactions ADD COLUMN delivery_status VARCHAR DEFAULT 'Processing'")
        )
    except Exception:
        pass

    try:
        connection.execute(
            text("ALTER TABLE transactions ADD COLUMN estimated_delivery VARCHAR DEFAULT ''")
        )
    except Exception:
        pass

    connection.commit()


# ============================================================
# PASSWORD HASHING
# ============================================================

def hash_password(password: str):
    return hashlib.sha256(
        password.encode("utf-8")
    ).hexdigest()


def verify_password(password: str, hashed_password: str):
    return hash_password(password) == hashed_password


def create_transaction_hash(transaction_id, buyer_id, seller_id, product_id,
                            quantity, total_amount, timestamp, previous_hash):
    return blockchain.calculate_transaction_hash(
        transaction_id,
        buyer_id,
        seller_id,
        product_id,
        quantity,
        total_amount,
        timestamp,
        previous_hash,
    )


def seed_demo_products():
    db = SessionLocal()

    try:
        demo_seller = db.query(User).filter(
            User.email == "demo-seller@blockmart.com"
        ).first()

        if not demo_seller:
            demo_seller = User(
                id=str(uuid4()),
                name="BlockMart Store",
                email="demo-seller@blockmart.com",
                password=hash_password("blockmart123"),
                role="seller",
                wallet_address="demo-seller",
                created_at=datetime.utcnow().isoformat()
            )
            db.add(demo_seller)
            db.flush()

        demo_products = [
            ("Nova X1 Smartphone", "6.5-inch display, 128GB storage and all-day battery.", 18999, 24),
            ("PixelPro 5G Phone", "AMOLED display, 5G connectivity and a dual camera system.", 24999, 16),
            ("VoltMax Power Bank", "20000mAh fast-charging power bank with USB-C output.", 1499, 32),
            ("ClearView Smart TV", "43-inch 4K smart television with streaming apps.", 28999, 9),
            ("KeyCraft Mechanical Keyboard", "RGB mechanical keyboard with tactile switches.", 3499, 22),
            ("Glide Wireless Mouse", "Ergonomic wireless mouse with silent clicks.", 799, 45),
            ("SoundBeat Wireless Headphones", "Noise-cancelling headphones with 40-hour playback.", 2499, 40),
            ("BassBox Bluetooth Speaker", "Portable waterproof speaker with rich stereo sound.", 1999, 27),
            ("LensPro Action Camera", "4K action camera with wide-angle lens and stabilization.", 6999, 11),
            ("Urban Classic Sneakers", "Lightweight everyday sneakers with a comfortable fit.", 1799, 18),
            ("AeroRun Sports Shoes", "Breathable running shoes designed for everyday training.", 2299, 25),
            ("Northline Denim Jacket", "Classic blue denim jacket with a relaxed fit.", 1899, 20),
            ("SoftWeave Cotton T-Shirt", "Comfortable regular-fit cotton t-shirt for daily wear.", 599, 60),
            ("Luna Casual Handbag", "Structured handbag with spacious compartments.", 1499, 17),
            ("AeroBrew Coffee Maker", "Compact coffee maker for fresh brews at home.", 3299, 12),
            ("PureHome Air Purifier", "HEPA air purifier for cleaner indoor air.", 8499, 14),
            ("ChefMate Nonstick Cookware Set", "Six-piece nonstick cookware set for modern kitchens.", 3999, 13),
            ("GlowNest LED Desk Lamp", "Adjustable LED desk lamp with warm and cool light modes.", 899, 34),
            ("CloudRest Memory Foam Pillow", "Ergonomic memory foam pillow for comfortable sleep.", 1299, 29),
            ("The Focus Habit Planner", "Undated productivity planner for goals and daily routines.", 499, 41),
            ("World Atlas Illustrated Edition", "Illustrated reference book covering countries and cultures.", 899, 15),
            ("The Startup Handbook", "Practical guide to building and managing a new business.", 699, 21),
            ("Classic Mystery Collection", "A collection of five timeless mystery stories.", 549, 26),
            ("Everyday Laptop Backpack", "Water-resistant backpack with a padded laptop sleeve.", 999, 35),
            ("Travel Organizer Pouch", "Compact organizer pouch for cables, chargers and essentials.", 449, 50),
            ("SecureGuard Laptop Sleeve", "Protective padded sleeve for 13 to 15-inch laptops.", 799, 31),
            ("SteelEdge Analog Watch", "Minimal stainless-steel watch with a clean dial.", 2199, 19),
            ("FitTrack Smart Watch", "Fitness tracking, heart-rate monitoring and notifications.", 2799, 20),
            ("Everyday Sunglasses", "UV-protected sunglasses with a lightweight frame.", 699, 38),
        ]

        existing_names = {
            product.name for product in db.query(Product).filter(
                Product.seller_id == demo_seller.id
            ).all()
        }

        for name, description, price, stock in demo_products:
            if name not in existing_names:
                db.add(Product(
                    id=str(uuid4()),
                    name=name,
                    description=description,
                    price=price,
                    seller_id=demo_seller.id,
                    stock=stock,
                    created_at=datetime.utcnow().isoformat()
                ))

        db.commit()
    finally:
        db.close()


seed_demo_products()


# ============================================================
# PYDANTIC MODELS
# ============================================================

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2)
    email: str
    password: str = Field(..., min_length=4)
    role: str = "buyer"
    wallet_address: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str
    role: str


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2)
    description: str
    price: float = Field(..., gt=0)
    seller_id: str
    stock: int = Field(default=1, ge=0)


class TransactionCreate(BaseModel):
    buyer_id: str
    product_id: str
    quantity: int = Field(default=1, gt=0)


def evaluate_transaction_risk(db, transaction: TransactionCreate):
    risk_score = 0
    reasons = []

    buyer = db.query(User).filter(User.id == transaction.buyer_id).first()
    product = db.query(Product).filter(Product.id == transaction.product_id).first()

    if not buyer:
        return {
            "fraud": True,
            "risk_score": 100,
            "risk_level": "HIGH",
            "reasons": ["Buyer account does not exist"]
        }

    if buyer.role != "buyer":
        risk_score += 60
        reasons.append("Only buyer accounts can place orders")

    if not product:
        return {
            "fraud": True,
            "risk_score": 100,
            "risk_level": "HIGH",
            "reasons": ["Product does not exist"]
        }

    if product.seller_id == transaction.buyer_id:
        risk_score += 60
        reasons.append("Buyer cannot purchase their own product")

    if transaction.quantity > product.stock:
        risk_score += 60
        reasons.append("Requested quantity is greater than available stock")

    if transaction.quantity > 10:
        risk_score += 50
        reasons.append("Unusually large quantity")

    total_amount = product.price * transaction.quantity
    if total_amount > 100000:
        risk_score += 40
        reasons.append("High-value transaction requires additional review")

    recent_cutoff = (datetime.utcnow() - timedelta(hours=1)).isoformat()
    recent_transactions = db.query(Transaction).filter(
        Transaction.buyer_id == transaction.buyer_id,
        Transaction.product_id == transaction.product_id,
        Transaction.timestamp >= recent_cutoff
    ).count()

    if recent_transactions >= 3:
        risk_score += 30
        reasons.append("Repeated purchase activity detected")

    if risk_score >= 50:
        risk_level = "HIGH"
    elif risk_score >= 25:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "fraud": risk_score >= 50,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "reasons": reasons or ["No suspicious activity detected"]
    }


# ============================================================
# API STATUS
# ============================================================

@app.get("/api")
def api_home():
    return {
        "message": "Blockchain Marketplace Backend is Running",
        "version": "3.0.0"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "message": "API is working correctly"
    }


# ============================================================
# REGISTER USER / SELLER
# ============================================================

@app.post("/register")
def register_user(user: UserCreate):

    db = SessionLocal()

    try:

        if user.role not in ["buyer", "seller"]:
            raise HTTPException(
                status_code=400,
                detail="Role must be buyer or seller"
            )

        existing_user = db.query(User).filter(
            User.email == user.email
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        user_id = str(uuid4())

        new_user = User(
            id=user_id,
            name=user.name,
            email=user.email,
            password=hash_password(user.password),
            role=user.role,
            wallet_address=user.wallet_address,
            created_at=datetime.utcnow().isoformat()
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "message": "Registration successful",
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email,
                "role": new_user.role,
                "wallet_address": new_user.wallet_address
            }
        }

    finally:
        db.close()


# ============================================================
# LOGIN
# ============================================================

@app.post("/login")
def login_user(login: LoginRequest):

    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.email == login.email
        ).first()

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        if user.role != login.role:
            raise HTTPException(
                status_code=403,
                detail=f"This account is registered as {user.role}"
            )

        if not verify_password(
            login.password,
            user.password
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        return {
            "message": "Login successful",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "wallet_address": user.wallet_address
            }
        }

    finally:
        db.close()


# ============================================================
# USER APIs
# ============================================================

@app.post("/users")
def create_user(user: UserCreate):

    db = SessionLocal()

    try:

        existing_user = db.query(User).filter(
            User.email == user.email
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        user_id = str(uuid4())

        new_user = User(
            id=user_id,
            name=user.name,
            email=user.email,
            password=hash_password(user.password),
            role=user.role,
            wallet_address=user.wallet_address,
            created_at=datetime.utcnow().isoformat()
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "message": "User created successfully",
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email,
                "role": new_user.role,
                "wallet_address": new_user.wallet_address,
                "created_at": new_user.created_at
            }
        }

    finally:
        db.close()


@app.get("/users")
def get_users():

    db = SessionLocal()

    try:

        user_list = db.query(User).all()

        return {
            "count": len(user_list),
            "users": [
                {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": user.role,
                    "wallet_address": user.wallet_address,
                    "created_at": user.created_at
                }
                for user in user_list
            ]
        }

    finally:
        db.close()


@app.get("/users/{user_id}")
def get_user(user_id: str):

    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.id == user_id
        ).first()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "wallet_address": user.wallet_address,
            "created_at": user.created_at
        }

    finally:
        db.close()


# ============================================================
# PRODUCT APIs
# ============================================================

@app.post("/products")
def create_product(product: ProductCreate):

    db = SessionLocal()

    try:

        seller = db.query(User).filter(
            User.id == product.seller_id
        ).first()

        if not seller:
            raise HTTPException(
                status_code=404,
                detail="Seller not found"
            )

        if seller.role != "seller":
            raise HTTPException(
                status_code=403,
                detail="Only sellers can add products"
            )

        product_id = str(uuid4())

        new_product = Product(
            id=product_id,
            name=product.name,
            description=product.description,
            price=product.price,
            seller_id=product.seller_id,
            stock=product.stock,
            created_at=datetime.utcnow().isoformat()
        )

        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        return {
            "message": "Product created successfully",
            "product": {
                "id": new_product.id,
                "name": new_product.name,
                "description": new_product.description,
                "price": new_product.price,
                "seller_id": new_product.seller_id,
                "stock": new_product.stock,
                "created_at": new_product.created_at
            }
        }

    finally:
        db.close()


@app.get("/products")
def get_products():

    db = SessionLocal()

    try:

        product_list = db.query(Product).all()

        return {
            "count": len(product_list),
            "products": [
                {
                    "id": product.id,
                    "name": product.name,
                    "description": product.description,
                    "price": product.price,
                    "seller_id": product.seller_id,
                    "stock": product.stock,
                    "created_at": product.created_at
                }
                for product in product_list
            ]
        }

    finally:
        db.close()


@app.get("/products/{product_id}")
def get_product(product_id: str):

    db = SessionLocal()

    try:

        product = db.query(Product).filter(
            Product.id == product_id
        ).first()

        if not product:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        return {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "seller_id": product.seller_id,
            "stock": product.stock,
            "created_at": product.created_at
        }

    finally:
        db.close()


@app.delete("/products/{product_id}")
def delete_product(product_id: str):

    db = SessionLocal()

    try:

        product = db.query(Product).filter(
            Product.id == product_id
        ).first()

        if not product:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        db.delete(product)
        db.commit()

        return {
            "message": "Product deleted successfully"
        }

    finally:
        db.close()


# ============================================================
# TRANSACTION APIs
# ============================================================

@app.post("/transactions")
def create_transaction(transaction: TransactionCreate):

    db = SessionLocal()

    try:

        risk = evaluate_transaction_risk(db, transaction)

        if risk["fraud"]:
            raise HTTPException(
                status_code=409,
                detail={
                    "message": "Purchase blocked by fraud prevention",
                    "risk_score": risk["risk_score"],
                    "risk_level": risk["risk_level"],
                    "reasons": risk["reasons"]
                }
            )

        buyer = db.query(User).filter(
            User.id == transaction.buyer_id
        ).first()

        if not buyer:
            raise HTTPException(
                status_code=404,
                detail="Buyer not found"
            )

        if buyer.role != "buyer":
            raise HTTPException(
                status_code=403,
                detail="Only buyers can purchase products"
            )

        product = db.query(Product).filter(
            Product.id == transaction.product_id
        ).first()

        if not product:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        if product.seller_id == transaction.buyer_id:
            raise HTTPException(
                status_code=400,
                detail="Seller cannot buy their own product"
            )

        if product.stock < transaction.quantity:
            raise HTTPException(
                status_code=400,
                detail="Not enough stock available"
            )

        total_amount = product.price * transaction.quantity

        transaction_id = str(uuid4())
        timestamp = datetime.utcnow().isoformat()
        estimated_delivery = (datetime.utcnow() + timedelta(days=5)).date().isoformat()
        previous_transaction = db.query(Transaction).order_by(
            Transaction.timestamp.desc()
        ).first()
        previous_hash = (
            previous_transaction.transaction_hash
            if previous_transaction and previous_transaction.transaction_hash
            else "GENESIS"
        )
        transaction_hash = create_transaction_hash(
            transaction_id,
            transaction.buyer_id,
            product.seller_id,
            product.id,
            transaction.quantity,
            total_amount,
            timestamp,
            previous_hash,
        )

        new_transaction = Transaction(
            id=transaction_id,
            buyer_id=transaction.buyer_id,
            seller_id=product.seller_id,
            product_id=product.id,
            quantity=transaction.quantity,
            unit_price=product.price,
            total_amount=total_amount,
            status="completed",
            timestamp=timestamp,
            previous_hash=previous_hash,
            transaction_hash=transaction_hash,
            delivery_status="Processing",
            estimated_delivery=estimated_delivery
        )

        product.stock -= transaction.quantity

        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)

        return {
            "message": "Transaction completed successfully",
            "transaction": {
                "id": new_transaction.id,
                "buyer_id": new_transaction.buyer_id,
                "seller_id": new_transaction.seller_id,
                "product_id": new_transaction.product_id,
                "quantity": new_transaction.quantity,
                "unit_price": new_transaction.unit_price,
                "total_amount": new_transaction.total_amount,
                "status": new_transaction.status,
                "timestamp": new_transaction.timestamp,
                "previous_hash": new_transaction.previous_hash,
                "transaction_hash": new_transaction.transaction_hash,
                "delivery_status": new_transaction.delivery_status,
                "estimated_delivery": new_transaction.estimated_delivery
            }
        }

    finally:
        db.close()


@app.get("/transactions")
def get_transactions():

    db = SessionLocal()

    try:

        transaction_list = db.query(Transaction).all()

        return {
            "count": len(transaction_list),
            "transactions": [
                {
                    "id": transaction.id,
                    "buyer_id": transaction.buyer_id,
                    "seller_id": transaction.seller_id,
                    "product_id": transaction.product_id,
                    "quantity": transaction.quantity,
                    "unit_price": transaction.unit_price,
                    "total_amount": transaction.total_amount,
                    "status": transaction.status,
                    "timestamp": transaction.timestamp,
                    "previous_hash": transaction.previous_hash,
                    "transaction_hash": transaction.transaction_hash,
                    "delivery_status": transaction.delivery_status,
                    "estimated_delivery": transaction.estimated_delivery
                }
                for transaction in transaction_list
            ]
        }

    finally:
        db.close()


@app.get("/transactions/{transaction_id}")
def get_transaction(transaction_id: str):

    db = SessionLocal()

    try:

        transaction = db.query(Transaction).filter(
            Transaction.id == transaction_id
        ).first()

        if not transaction:
            raise HTTPException(
                status_code=404,
                detail="Transaction not found"
            )

        return {
            "id": transaction.id,
            "buyer_id": transaction.buyer_id,
            "seller_id": transaction.seller_id,
            "product_id": transaction.product_id,
            "quantity": transaction.quantity,
            "unit_price": transaction.unit_price,
            "total_amount": transaction.total_amount,
            "status": transaction.status,
            "timestamp": transaction.timestamp,
            "previous_hash": transaction.previous_hash,
            "transaction_hash": transaction.transaction_hash,
            "delivery_status": transaction.delivery_status,
            "estimated_delivery": transaction.estimated_delivery
        }

    finally:
        db.close()


@app.get("/blockchain/verify")
def verify_blockchain():
    """Verify every stored marketplace purchase in the local blockchain."""
    db = SessionLocal()

    try:
        transactions = db.query(Transaction).order_by(
            Transaction.timestamp.asc(), Transaction.id.asc()
        ).all()
        expected_previous_hash = "GENESIS"

        for position, transaction in enumerate(transactions, start=1):
            if not blockchain.verify_transaction(transaction, expected_previous_hash):
                return {
                    "valid": False,
                    "blocks": len(transactions),
                    "invalid_block": position,
                    "transaction_id": transaction.id,
                    "message": "The transaction chain is invalid",
                }

            expected_previous_hash = transaction.transaction_hash

        return {
            "valid": True,
            "blocks": len(transactions),
            "message": "All transaction blocks are linked and valid",
        }
    finally:
        db.close()


# ============================================================
# FRAUD DETECTION
# ============================================================

@app.post("/fraud/check")
def check_fraud(transaction: TransactionCreate):

    db = SessionLocal()

    try:
        return evaluate_transaction_risk(db, transaction)

    finally:
        db.close()


# ============================================================
# MARKETPLACE STATISTICS
# ============================================================

@app.get("/marketplace/stats")
def marketplace_stats():

    db = SessionLocal()

    try:

        total_users = db.query(User).count()
        total_products = db.query(Product).count()
        total_transactions = db.query(Transaction).count()

        transactions = db.query(Transaction).all()

        total_sales = sum(
            transaction.total_amount
            for transaction in transactions
        )

        return {
            "total_users": total_users,
            "total_products": total_products,
            "total_transactions": total_transactions,
            "total_sales": total_sales
        }

    finally:
        db.close()


BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_BUILD_DIR = BASE_DIR / "frontend" / "dist"

if FRONTEND_BUILD_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_BUILD_DIR), html=True), name="frontend")