# backend/app.py
import os
from flask import Flask, jsonify, request
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

# ==========================================
# LIVE LOCATION UPDATE ENDPOINT
# ==========================================
@app.route('/api/orders/<int:order_id>/location', methods=['POST'])
def update_runner_location(order_id):
    from app.models import Order  # Local import to prevent circular import issues
    
    data = request.get_json() or {}
    lat = data.get('lat')
    lng = data.get('lng')
    
    if lat is None or lng is None:
        return jsonify({"error": "Missing coordinates (lat, lng)"}), 400
        
    order = Order.query.get_or_404(order_id)
    order.runner_lat = float(lat)
    order.runner_lng = float(lng)
    
    db.session.commit()
    return jsonify({
        "success": True, 
        "message": f"Location updated successfully for Order CA-{order_id}"
    }), 200


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

    # ==========================================
    # SEED MULTI-CATEGORY VENDORS AND IMAGED PRODUCTS
    # ==========================================
    from app.models import Vendor, Product
    if not Vendor.query.first():
        # 1. Seed a Food Vendor (Tionge's Bites)
        tionge_bites = Vendor(
            name="Tionge's Quick Bites",
            category="Food",
            location="Chirunga Hostel, Block 3, Room 12",
            is_open=True,
            offers_free_delivery=False,
            whatsapp_number="265888123456",
            password="admin", # Simple password for testing
            image_url="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80"
        )
        db.session.add(tionge_bites)
        
        # 2. Seed a Stationery Vendor (Chanco Prints)
        chanco_print = Vendor(
            name="Chanco Stationery & Prints",
            category="Stationery",
            location="Shopping Centre, Shop 5",
            is_open=True,
            offers_free_delivery=True,
            whatsapp_number="265999789101",
            password="print",
            image_url="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80"
        )
        db.session.add(chanco_print)
        db.session.commit()
        
        # Add initial products with Unsplash images
        items = [
            # Tionge's Quick Bites Food Items
            Product(
                vendor_id=tionge_bites.id, 
                name="Fresh Beef Meat Pie", 
                price=1500, 
                description="Baked fresh daily. Golden, flaky crust stuffed with seasoned minced beef.", 
                is_available=True,
                image_url="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80"
            ),
            Product(
                vendor_id=tionge_bites.id, 
                name="Spiced Chicken Burger & Chips", 
                price=3500, 
                description="Grilled chicken breast with secret house spices, served with crispy chips.", 
                is_available=True,
                image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80"
            ),
            
            # Chanco Stationery Items
            Product(
                vendor_id=chanco_print.id, 
                name="Hardcover Notebook (A4)", 
                price=2500, 
                description="3-Subject ruled notebook, perfect for taking lecture notes and campus summaries.", 
                is_available=True,
                image_url="https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=300&q=80"
            ),
            Product(
                vendor_id=chanco_print.id, 
                name="Scientific Calculator (Casio)", 
                price=18000, 
                description="Standard university-approved calculator required for Science & Math modules.", 
                is_available=True,
                image_url="https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=300&q=80"
            )
        ]
        db.session.bulk_save_objects(items)
        db.session.commit()
        print("Initial Multi-Category Vendors and Products seeded successfully!")

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "database": "connected",
        "message": "Campus-Amazon API engine running smoothly!"
    }), 200

if __name__ == '__main__':
    # Using environment port for painless hosting deployments (e.g., on Render or Railway)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)