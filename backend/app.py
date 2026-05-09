# backend/app.py
import os
from flask import Flask, jsonify
from flask_cors import CORS
from app.models import db, CampusLandmark
from app.routes import api as api_blueprint

app = Flask(__name__)
CORS(app)

# SQLite Configuration
DB_PATH = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'database.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize DB extension
db.init_app(app)

app.register_blueprint(api_blueprint, url_prefix='/api')

# Auto-generate tables and pre-populate landmarks on launch
with app.app_context():
    db.create_all()
    
    # Check if landmarks are empty, and seed them
    if not CampusLandmark.query.first():
        default_landmarks = [
            CampusLandmark(name='Chancellor College Library - Main Entrance'),
            CampusLandmark(name='Chirunga Hostel - Block 3 Common Area'),
            CampusLandmark(name='The Great Hall foyer'),
            CampusLandmark(name='Science Blocks Cafeteria Square'),
            CampusLandmark(name='Mulunguzi Hostel Block A Gate')
        ]
        db.session.bulk_save_objects(default_landmarks)
        db.session.commit()
        print("Database initialized and landmarks seeded successfully!")

        
    from app.models import Vendor, Product
    if not Vendor.query.first():
        tionge_bites = Vendor(
            name="Tionge's Quick Bites",
            category="Food",
            location="Chirunga Hostel, Block 3, Room 12",
            is_open=True,
            offers_free_delivery=False,
            whatsapp_number="265888123456",
            image_url="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80"
        )
        db.session.add(tionge_bites)
        db.session.commit()

        # Add initial items to Tionge's Bites
        items = [
            Product(vendor_id=tionge_bites.id, name="Fresh Beef Meat Pie", price=1500, description="Baked fresh daily. Golden, flaky crust stuffed with seasoned minced beef.", is_available=True),
            Product(vendor_id=tionge_bites.id, name="Spiced Chicken Burger & Chips", price=3500, description="Grilled chicken breast with secret house spices, served with crispy chips.", is_available=True)
        ]
        db.session.bulk_save_objects(items)
        db.session.commit()
        print("Initial vendors and products seeded successfully!")

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "database": "connected",
        "message": "Campus-Amazon API engine running smoothly!"
    }), 200

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)