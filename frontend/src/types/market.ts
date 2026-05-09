// src/types/market.ts

export type Category = 'Food' | 'Stationery' | 'Electronics' | 'Fashion' | 'Groceries' | 'Services';

export interface Vendor {
  id: string;
  name: string;
  category: Category;
  location: string; // e.g., "Chirunga Hostel, Block 3"
  isOpen: boolean;
  offersFreeDelivery: boolean; // True = Shop delivers. False = Campus-Amazon delivers.
  whatsAppNumber: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  price: number; // in MWK (Malawian Kwacha)
  description: string;
  isAvailable: boolean;
  imageUrl?: string;
  category?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'picked_up' | 'delivered';

export interface CampusLandmark {
  id: string;
  name: string; // e.g., "Library Main Entrance"
  latitude: number;
  longitude: number;
}

export interface Order {
  id: string;
  customerId: string;
  vendorId: string;
  runnerId?: string; // If null, means the order is either shop-delivered or waiting in the pool
  status: OrderStatus;
  landmarkId: string;
  deliveryNotes?: string;
  totalAmount: number;
  createdAt: string;
}