# backend/app/routes.py
from flask import Blueprint, jsonify, request
from app.models import db, Vendor, Product, CampusLandmark, Order
from functools import wraps

api = Blueprint('api', __name__)

RUNNER_SECRET_TOKEN = "ChancoRunner2026"

def runner_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if the request has the correct Authorization header
        token = request.headers.get('Authorization')
        if token != f"Bearer {RUNNER_SECRET_TOKEN}":
            return jsonify({"error": "Unauthorized access to Runner APIs"}), 403
        return f(*args, **kwargs)
    return decorated_function


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

# 2. Register a new vendor (UPDATED with password support)
@api.route('/vendors', methods=['POST'])
def register_vendor():
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('location') or not data.get('whatsAppNumber') or not data.get('password'):
        return jsonify({"error": "Missing required fields (including password)"}), 400
        
    new_vendor = Vendor(
        name=data['name'],
        category=data.get('category', 'Food'),
        location=data['location'],
        is_open=True,
        offers_free_delivery=data.get('offersFreeDelivery', False),
        whatsapp_number=data['whatsAppNumber'],
        password=data['password'], # Store custom registration password
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
        status='PENDING'
    )
    
    db.session.add(new_order)
    db.session.commit()
    
    return jsonify({
        "message": "Order created successfully!",
        "orderId": str(new_order.id),
        "status": new_order.status
    }), 201

# backend/app/routes.py (Continued)

# 6. Toggle vendor open/closed status
@api.route('/vendors/<int:vendor_id>/status', methods=['PATCH'])
def toggle_vendor_status(vendor_id):
    vendor = Vendor.query.get_or_404(vendor_id)
    data = request.get_json()
    
    if 'isOpen' in data:
        vendor.is_open = bool(data['isOpen'])
        db.session.commit()
        
    return jsonify({
        "message": f"Shop status updated to {'Open' if vendor.is_open else 'Closed'}",
        "isOpen": vendor.is_open
    }), 200

# 7. Add a new product to a vendor's catalog
@api.route('/vendors/<int:vendor_id>/products', methods=['POST'])
def add_product(vendor_id):
    vendor = Vendor.query.get_or_404(vendor_id)
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('price'):
        return jsonify({"error": "Missing product name or price"}), 400
        
    new_product = Product(
        vendor_id=vendor.id,
        name=data['name'],
        price=int(data['price']),
        description=data.get('description', ''),
        is_available=True
    )
    
    db.session.add(new_product)
    db.session.commit()
    
    return jsonify({
        "message": "Product added successfully!",
        "product": {
            "id": str(new_product.id),
            "name": new_product.name,
            "price": new_product.price
        }
    }), 201

# 8. Toggle product availability (In Stock / Out of Stock)
@api.route('/products/<int:product_id>/availability', methods=['PATCH'])
def toggle_product_availability(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
    
    if 'isAvailable' in data:
        product.is_available = bool(data['isAvailable'])
        db.session.commit()
        
    return jsonify({
        "message": f"Product status updated to {'In Stock' if product.is_available else 'Out of Stock'}",
        "isAvailable": product.is_available
    }), 200

# 9. Get active orders for a specific vendor
@api.route('/vendors/<int:vendor_id>/orders', methods=['GET'])
def get_vendor_orders(vendor_id):
    vendor = Vendor.query.get_or_404(vendor_id)
    # Fetch orders belonging to this vendor
    orders = Order.query.filter_by(vendor_id=vendor.id).order_by(Order.created_at.desc()).all()
    
    output = []
    for order in orders:
        # Resolve drop-off landmark name
        landmark = CampusLandmark.query.get(order.landmark_id)
        landmark_name = landmark.name if landmark else "Unknown Landmark"
        
        output.append({
            'id': str(order.id),
            'customerPhone': order.customer_phone,
            'deliveryNotes': order.delivery_notes,
            'totalAmount': order.total_amount,
            'status': order.status,
            'landmarkName': landmark_name,
            'createdAt': order.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    return jsonify(output), 200

# 10. Verify workspace login credentials (NEW)
@api.route('/vendors/<int:vendor_id>/login', methods=['POST'])
def verify_vendor_login(vendor_id):
    vendor = Vendor.query.get_or_404(vendor_id)
    data = request.get_json()
    
    password_attempt = data.get('password', '')
    
    if password_attempt == vendor.password:
        return jsonify({
            "success": True,
            "message": "Access granted to workspace!",
            "vendor": {
                "id": str(vendor.id),
                "name": vendor.name
            }
        }), 200
    else:
        return jsonify({
            "success": False,
            "error": "Incorrect password. Access denied."
        }), 401
    
# backend/app/routes.py (Append to bottom of file)

# 11. Fetch a single order's status and details
@api.route('/orders/<int:order_id>', methods=['GET'])
def get_single_order(order_id):
    order = Order.query.get_or_404(order_id)
    
    # Resolve landmark name
    landmark = CampusLandmark.query.get(order.landmark_id)
    landmark_name = landmark.name if landmark else "Unknown Landmark"
    
    return jsonify({
        'id': str(order.id),
        'customerPhone': order.customer_phone,
        'deliveryNotes': order.delivery_notes,
        'totalAmount': order.total_amount,
        'status': order.status, # PENDING, PREPARING, DISPATCHED, DELIVERED
        'landmarkName': landmark_name,
        'createdAt': order.created_at.strftime('%Y-%m-%d %H:%M:%S')
    }), 200

# backend/app/routes.py (Add this endpoint to handle status progression)

# 12. Update an order status
@api.route('/orders/<int:order_id>/status', methods=['PATCH'])
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
    
    new_status = data.get('status')
    if new_status in ['PENDING', 'PREPARING', 'DISPATCHED', 'DELIVERED']:
        order.status = new_status
        db.session.commit()
        return jsonify({"message": f"Order status updated to {new_status}", "status": order.status}), 200
        
    return jsonify({"error": "Invalid status value"}), 400


# backend/app/routes.py

# 13. Fetch all active orders for the Runner Portal
@api.route('/runner/orders', methods=['GET'])
def get_runner_orders():
    # Fetch orders that are not yet delivered
    active_orders = Order.query.filter(Order.status != 'DELIVERED').order_by(Order.created_at.desc()).all()
    
    orders_list = []
    for order in active_orders:
        landmark = CampusLandmark.query.get(order.landmark_id)
        vendor = Vendor.query.get(order.vendor_id)
        orders_list.append({
            'id': str(order.id),
            'customerPhone': order.customer_phone,
            'deliveryNotes': order.delivery_notes,
            'totalAmount': order.total_amount,
            'status': order.status,
            'landmarkName': landmark.name if landmark else "Unknown",
            'vendorName': vendor.name if vendor else "Unknown",
            'runnerName': order.runner_name,
            'createdAt': order.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    return jsonify(orders_list), 200

# 14. Claim an order as a runner
@api.route('/orders/<int:order_id>/claim', methods=['PATCH'])
def claim_order(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
    runner = data.get('runnerName', 'Arthur')
    
    order.runner_name = runner
    # Auto-advance to PREPARING when claimed if it was still PENDING
    if order.status == 'PENDING':
        order.status = 'PREPARING'
        
    db.session.commit()
    return jsonify({"message": f"Order claimed by {runner}", "status": order.status, "runnerName": order.runner_name}), 200

# 15. Submit customer rating for an order
@api.route('/orders/<int:order_id>/rate', methods=['POST'])
def rate_order(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
    
    rating = data.get('rating') # 1 to 5
    review = data.get('review', '')
    
    if not rating or not (1 <= int(rating) <= 5):
        return jsonify({"error": "Invalid rating score. Must be between 1 and 5"}), 400
        
    order.rating = int(rating)
    order.review_text = review
    db.session.commit()
    return jsonify({"message": "Rating submitted successfully!"}), 200