// src/types/mockData.ts
import type { Vendor, Product, CampusLandmark } from './market.ts';

export const MOCK_LANDMARKS: CampusLandmark[] = [
  { id: 'l1', name: 'Chancellor College Library - Main Entrance', latitude: -15.3875, longitude: 35.3333 },
  { id: 'l2', name: 'Chirunga Hostel - Block 3 Common Area', latitude: -15.3890, longitude: 35.3345 },
  { id: 'l3', name: 'The Great Hall foyer', latitude: -15.3860, longitude: 35.3320 },
  { id: 'l4', name: 'Science Blocks Cafeteria Square', latitude: -15.3870, longitude: 35.3310 },
  { id: 'l5', name: 'Mulunguzi Hostel Block A Gate', latitude: -15.3895, longitude: 35.3360 }
];

export const MOCK_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: "Tionge's Quick Bites",
    category: 'Food',
    location: 'Chirunga Hostel, Block 3, Room 12',
    isOpen: true,
    offersFreeDelivery: false, // Will require Campus-Amazon (You!)
    whatsAppNumber: '265888123456',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'v2',
    name: 'Chancoll Prints & Stationery',
    category: 'Stationery',
    location: 'Social Education Block, Ground Floor',
    isOpen: true,
    offersFreeDelivery: true, // They deliver their own prints
    whatsAppNumber: '265999123456',
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'v3',
    name: 'Drip & Thrift Campus Wear',
    category: 'Fashion',
    location: 'Nyika Hostel, Block B, Room 4',
    isOpen: false, // Closed for now
    offersFreeDelivery: false,
    whatsAppNumber: '265888987654',
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'v4',
    name: 'SmartPlug Electronics',
    category: 'Electronics',
    location: 'Kasungu Hostel, Block 1',
    isOpen: true,
    offersFreeDelivery: false,
    whatsAppNumber: '265999777888',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  // Tionge's Bites (Food)
  { id: 'p1', vendorId: 'v1', name: 'Fresh Beef Meat Pie', price: 1500, description: 'Baked fresh daily. Golden, flaky crust stuffed with seasoned minced beef.', isAvailable: true },
  { id: 'p2', vendorId: 'v1', name: 'Spiced Chicken Burger & Fries', price: 3500, description: 'Grilled chicken breast with secret house spices, served with crispy hand-cut chips.', isAvailable: true },
  { id: 'p3', vendorId: 'v1', name: 'Cold Fanta Orange (300ml)', price: 800, description: 'Ice cold glass bottle.', isAvailable: true },

  // Chancoll Prints (Stationery)
  { id: 'p4', vendorId: 'v2', name: 'B&W Double-Sided Printing (Per Page)', price: 100, description: 'High-quality black and white laser printing. Standard A4 size.', isAvailable: true },
  { id: 'p5', vendorId: 'v2', name: 'College Ruled Notebook (A4)', price: 2000, description: '120 pages, hardcover notebook perfect for lecture summaries.', isAvailable: true },

  // SmartPlug Electronics (Electronics)
  { id: 'p6', vendorId: 'v4', name: 'USB-C Fast Charging Cable (1.5m)', price: 4500, description: 'Durable nylon braided cable. Supports up to 20W fast charging.', isAvailable: true },
  { id: 'p7', vendorId: 'v4', name: '10,000mAh Portable Power Bank', price: 15000, description: 'Keep your phone charged during blackouts or long study sessions in the library.', isAvailable: true }
];