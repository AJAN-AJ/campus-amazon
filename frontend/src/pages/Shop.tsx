// src/pages/Shop.tsx
import React from 'react';
import { MOCK_PRODUCTS, MOCK_VENDORS } from '../types/mockData';
import { ArrowLeft, ShoppingCart, Truck, CheckCircle, MessageSquare } from 'lucide-react';
import type { Product, Vendor } from '../types/market';

interface ShopProps {
  vendorId: string;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  cartCount: number;
  vendors: Vendor[];
}

export default function Shop({ vendorId, onBack, onAddToCart, cartCount, vendors}: ShopProps) {
  // Find the selected vendor
  const vendor = vendors.find(v => v.id === vendorId);
  
  // Find products belonging to this vendor
  const products = MOCK_PRODUCTS.filter(p => p.vendorId === vendorId);

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <p className="text-gray-500 font-semibold">Vendor not found.</p>
        <button onClick={onBack} className="mt-4 text-orange-500 font-bold hover:underline">
          &larr; Back to Dashboard
        </button>
      </div>
    );
  }

  // Helper to generate quick WhatsApp message link for direct queries
  const whatsAppLink = `https://wa.me/${vendor.whatsAppNumber}?text=Hello%20${encodeURIComponent(vendor.name)}%2C%20I%20saw%20your%20shop%20on%20Campus-Amazon%20and%20had%20a%20question%21`;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Shop Header Banner */}
      <div className="bg-gray-900 text-white py-8 px-4 relative">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <button 
              onClick={onBack}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors mb-4 bg-gray-800 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft size={14} />
              <span>Back to Shops</span>
            </button>
            
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{vendor.name}</h2>
            <p className="text-xs text-gray-400 mt-1">📍 {vendor.location}</p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            {/* Delivery Status Badge */}
            {vendor.offersFreeDelivery ? (
              <span className="inline-flex items-center space-x-1 bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-xl text-xs font-bold">
                <CheckCircle size={14} />
                <span>Free Seller Delivery</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-xl text-xs font-bold">
                <Truck size={14} />
                <span>Campus-Amazon Delivery</span>
              </span>
            )}

            {/* Quick Chat with Vendor */}
            <a 
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <MessageSquare size={14} />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Products Catalog Grid */}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Available Items</h3>

        {products.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center border border-gray-100 shadow-sm">
            <p className="text-gray-400 text-sm">This vendor hasn't listed any items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product: Product) => (
              <div 
                key={product.id}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900 text-base leading-snug">{product.name}</h4>
                    <span className="font-black text-orange-600 text-sm whitespace-nowrap">
                      {product.price.toLocaleString()} MWK
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">{product.description}</p>
                </div>

                <button 
                  disabled={!product.isAvailable}
                  onClick={() => onAddToCart(product)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center space-x-2 ${
                    product.isAvailable 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-100 active:scale-98' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart size={14} />
                  <span>{product.isAvailable ? 'Add to Order' : 'Out of Stock'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}