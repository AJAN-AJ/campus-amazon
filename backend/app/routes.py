# backend/app/routes.py
from flask import Blueprint, jsonify, request
from app.models import db, Vendor, Product, CampusLandmark, Order

api = Blueprint('api', __name__)

# 1. Get all vendors
@api.route('/vendors', methods=['GET'])
def get_vendors():
    vendors = Vendor.query.all()
    output = []
    for vendor in vendors:
        output.append({
            'id': str(vendor.id),
            'name': vendor.name,
            'category': vendor.category,
            'location': vendor.location,
            'isOpen': vendor.is_open,
            'offersFreeDelivery': vendor.offers_free_delivery,
            'whatsAppNumber': vendor.whatsapp_number,
            'imageUrl': vendor.image_url
        })
    return jsonify(output), 200

# 2. Register a new vendor
@api.route('/vendors', methods=['POST'])
def register_vendor():
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('location') or not data.get('whatsAppNumber'):
        return jsonify({"error": "Missing required fields"}), 400
        
    new_vendor = Vendor(
        name=data['name'],
        category=data.get('category', 'Food'),
        location=data['location'],
        is_open=True,
        offers_free_delivery=data.get('offersFreeDelivery', False),
        whatsapp_number=data['whatsAppNumber'],
        image_url=data.get('imageUrl')
    )
    
    db.session.add(new_vendor)
    db.session.commit()
    
    return jsonify({
        "message": "Vendor registered successfully!",
        "vendor": {
            "id": str(new_vendor.id),
            "name": new_vendor.name
        }
    }), 201

# 3. Get products for a specific vendor
@api.route('/vendors/<int:vendor_id>/products', methods=['GET'])
def get_vendor_products(vendor_id):
    vendor = Vendor.query.get_or_404(vendor_id)
    products = Product.query.filter_by(vendor_id=vendor.id).all()
    
    output = []
    for product in products:
        output.append({
            'id': str(product.id),
            'vendorId': str(product.vendor_id),
            'name': product.name,
            'price': product.price,
            'description': product.description,
            'isAvailable': product.is_available,
            'imageUrl': product.image_url
        })
    return jsonify(output), 200

# 4. Get all landmarks (for checkout screen dropdown)
@api.route('/landmarks', methods=['GET'])
def get_landmarks():
    landmarks = CampusLandmark.query.all()
    output = []
    for lm in landmarks:
        output.append({
            'id': str(lm.id),
            'name': lm.name,
            'latitude': lm.latitude,
            'longitude': lm.longitude
        })
    return jsonify(output), 200

# 5. Place an order
@api.route('/orders', methods=['POST'])
def place_order():
    data = request.get_json()
    
    if not data or not data.get('vendorId') or not data.get('landmarkId') or not data.get('customerPhone'):
        return jsonify({"error": "Missing order details"}), 400
        
    new_order = Order(
        vendor_id=int(data['vendorId']),
        landmark_id=int(data['landmarkId']),
        customer_phone=data['customerPhone'],
        delivery_notes=data.get('deliveryNotes', ''),
        total_amount=int(data['totalAmount']),
        status='pending'
    )
    
    db.session.add(new_order)
    db.session.commit()
    
    return jsonify({
        "message": "Order created successfully!",
        "orderId": str(new_order.id),
        "status": new_order.status
    }), 201