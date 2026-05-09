# backend/app/models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# backend/app/models.py (Update the Vendor class)

class Vendor(db.Model):
    __tablename__ = 'vendors'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    is_open = db.Column(db.Boolean, default=True)
    offers_free_delivery = db.Column(db.Boolean, default=False)
    whatsapp_number = db.Column(db.String(30), nullable=False)
    image_url = db.Column(db.String(500), nullable=True)
    # Highlight: Added password field for workspace security
    password = db.Column(db.String(100), nullable=False, default='chanco123') 
    
    products = db.relationship('Product', backref='vendor', lazy=True, cascade="all, delete-orphan")

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Integer, nullable=False)  # in Malawian Kwacha (MWK)
    description = db.Column(db.String(500), nullable=True)
    is_available = db.Column(db.Boolean, default=True)
    image_url = db.Column(db.String(500), nullable=True)

class CampusLandmark(db.Model):
    __tablename__ = 'campus_landmarks'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False, unique=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

# backend/app/models.py

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_phone = db.Column(db.String(30), nullable=False)
    delivery_notes = db.Column(db.String(500), nullable=True)
    total_amount = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), default='PENDING') # PENDING, PREPARING, DISPATCHED, DELIVERED
    landmark_id = db.Column(db.Integer, db.ForeignKey('campus_landmarks.id'), nullable=False)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # NEW FIELDS: For tracking the runner & customer ratings
    runner_name = db.Column(db.String(100), nullable=True) # e.g., 'Arthur'
    rating = db.Column(db.Integer, nullable=True) # Customer rating (1-5 stars)
    review_text = db.Column(db.String(500), nullable=True)

    runner_lat = db.Column(db.Float, nullable=True)
    runner_lng = db.Column(db.Float, nullable=True)