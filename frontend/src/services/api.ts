// src/services/api.ts
import type { Vendor, Product, CampusLandmark } from '../types/market';

// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL|| 'https://campus-amazon.onrender.com/api' //|| 'http://127.0.0.1:5000/api';
export const apiService = {
  // 1. Fetch all active vendors from the SQLite DB
  async getVendors(): Promise<Vendor[]> {
    const response = await fetch(`${API_BASE_URL}/vendors`);
    if (!response.ok) throw new Error('Failed to fetch vendors');
    return response.json();
  },

  // 2. Fetch products specifically listed under a given vendor ID
  async getProducts(vendorId: string | number): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/vendors/${vendorId}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  // 3. Fetch pre-seeded landmarks for the checkout dropdown
  async getLandmarks(): Promise<CampusLandmark[]> {
    const response = await fetch(`${API_BASE_URL}/landmarks`);
    if (!response.ok) throw new Error('Failed to fetch landmarks');
    return response.json();
  },

  // 4. Register a new vendor profile
  async registerVendor(vendorData: Omit<Vendor, 'id' | 'isOpen'>): Promise<{ message: string; vendor: { id: string; name: string } }> {
    const response = await fetch(`${API_BASE_URL}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendorData),
    });
    if (!response.ok) throw new Error('Failed to register vendor');
    return response.json();
  },

  // 5. Submit a completed order payload to the SQLite DB
  async placeOrder(orderPayload: {
    vendorId: number;
    landmarkId: number;
    customerPhone: string;
    deliveryNotes: string;
    totalAmount: number;
  }): Promise<{ message: string; orderId: string; status: string }> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    if (!response.ok) throw new Error('Failed to submit order');
    return response.json();
  },

  // 6. Toggle shop's open/closed status
  async toggleVendorStatus(vendorId: string | number, isOpen: boolean): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/vendors/${vendorId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOpen }),
    });
    if (!response.ok) throw new Error('Failed to update shop status');
    return response.json();
  },

  // 7. Add item to vendor catalog (UPDATED with optional imageUrl)
  async addProduct(
    vendorId: string | number, 
    productData: { 
      name: string; 
      price: number; 
      description: string; 
      imageUrl?: string; // <-- Added optional type
    }
  ): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/vendors/${vendorId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Failed to add product');
    return response.json();
  },

  // 8. Toggle stock availability of a product
  async toggleProductAvailability(productId: string | number, isAvailable: boolean): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable }),
    });
    if (!response.ok) throw new Error('Failed to update product availability');
    return response.json();
  },

  // 9. Fetch active orders received by vendor
  async getVendorOrders(vendorId: string | number): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/vendors/${vendorId}/orders`);
    if (!response.ok) throw new Error('Failed to fetch vendor orders');
    return response.json();
  },

  // 10. Verify workspace password
  async loginToWorkspace(vendorId: string | number, password: string): Promise<{ success: boolean; vendor: any }> {
    const response = await fetch(`${API_BASE_URL}/vendors/${vendorId}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to authenticate');
    }
    return response.json();
  },

  // 11. Update order status (PENDING, PREPARING, DISPATCHED, DELIVERED)
  async updateOrderStatus(orderId: string | number, status: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  },

  // 12. Fetch orders for Runner Portal
  async getRunnerOrders(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/runner/orders`, {
      headers: {
        'Authorization': 'Bearer ChancoRunner2026'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch runner queue');
    return response.json();
  },

  // 13. Claim an order
  async claimOrder(orderId: string | number, runnerName: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/claim`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ runnerName }),
    });
    if (!response.ok) throw new Error('Failed to claim order');
    return response.json();
  },

  // 14. Submit Vendor/Service Rating
  async submitRating(orderId: string | number, rating: number, review: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, review }),
    });
    if (!response.ok) throw new Error('Failed to submit rating');
    return response.json();
  }
};