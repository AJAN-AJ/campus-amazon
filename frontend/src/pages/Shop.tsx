// src/pages/Shop.tsx
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { ArrowLeft, ShoppingCart, Truck, CheckCircle, MessageSquare, Loader2 } from 'lucide-react';
import type { Product, Vendor } from '../types/market';

interface ShopProps {
  vendorId: string;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  cartCount: number;
  vendors: Vendor[];
}

export default function Shop({ vendorId, onBack, onAddToCart, vendors }: ShopProps) {
  const vendor = vendors.find(v => v.id === vendorId);
  
  // Local state for dynamic database products
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await apiService.getProducts(vendorId);
        setProducts(data);
      } catch (err) {
        console.error("Failed to load shop items:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [vendorId]);

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

      {/* Products Catalog */}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-6 font-black">Available Items</h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-orange-500" size={32} />
            <p className="text-xs text-gray-400 mt-3 font-semibold">Retrieving stock list...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center border border-gray-100 shadow-sm">
            <p className="text-gray-400 text-sm">This vendor hasn't listed any items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product: Product) => (
              <div 
                key={product.id}
                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex space-x-4 items-center hover:shadow-md transition-shadow"
              >
                {/* Dynamic Product Image with Fallback handling */}
                <img 
                  src={product.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'} 
                  alt={product.name}
                  className="w-24 h-24 rounded-2xl object-cover bg-gray-50 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80';
                  }}
                />

                <div className="flex-1 min-w-0 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold text-gray-900 text-sm md:text-base leading-snug truncate">{product.name}</h4>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5 line-clamp-2">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3 gap-2">
                    <span className="font-black text-orange-600 text-xs md:text-sm whitespace-nowrap">
                      {product.price.toLocaleString()} MWK
                    </span>

                    <button 
                      disabled={!product.isAvailable}
                      onClick={() => onAddToCart(product)}
                      className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all duration-200 flex items-center justify-center space-x-1.5 ${
                        product.isAvailable 
                          ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-100 active:scale-95' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart size={12} />
                      <span>{product.isAvailable ? 'Add' : 'Out of Stock'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}