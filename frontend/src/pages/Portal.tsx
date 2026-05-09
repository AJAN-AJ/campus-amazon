// src/pages/Portal.tsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { ArrowLeft, Plus, ToggleLeft, ToggleRight, Package, ClipboardList, Loader2, DollarSign, Eye, EyeOff, Image } from 'lucide-react';
import type { Vendor, Product } from '../types/market';

// Explicitly define the Order structure for type safety
interface Order {
  id: string;
  customerPhone: string;
  deliveryNotes: string;
  totalAmount: number;
  status: 'PENDING' | 'PREPARING' | 'DISPATCHED' | 'DELIVERED';
  landmarkName: string;
  createdAt: string;
}

interface PortalProps {
  vendorId: string;
  onBack: () => void;
}

export default function Portal({ vendorId, onBack }: PortalProps) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [loading, setLoading] = useState(true);

  // Form states for adding a new product
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductImageUrl, setNewProductImageUrl] = useState(''); // Added Image URL state
  const [addingProduct, setAddingProduct] = useState(false);

  async function loadPortalData() {
    try {
      setLoading(true);
      // Fetch all vendors to find ours
      const vendors = await apiService.getVendors();
      const currentVendor = vendors.find(v => String(v.id) === String(vendorId));
      if (currentVendor) {
        setVendor(currentVendor);
        
        // Fetch products and orders concurrently
        const [productsData, ordersData] = await Promise.all([
          apiService.getProducts(vendorId),
          apiService.getVendorOrders(vendorId)
        ]);
        setProducts(productsData);
        setOrders(ordersData as Order[]);
      }
    } catch (err) {
      console.error("Error loading portal data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPortalData();
  }, [vendorId]);

  const handleToggleShopStatus = async () => {
    if (!vendor) return;
    try {
      const nextStatus = !vendor.isOpen;
      await apiService.toggleVendorStatus(vendor.id, nextStatus);
      setVendor({ ...vendor, isOpen: nextStatus });
    } catch (err) {
      alert("Failed to update shop status");
    }
  };

  const handleToggleProductStock = async (productId: string, currentStockStatus: boolean) => {
    try {
      const nextStatus = !currentStockStatus;
      await apiService.toggleProductAvailability(productId, nextStatus);
      // Update local state
      setProducts(products.map(p => p.id === productId ? { ...p, isAvailable: nextStatus } : p));
    } catch (err) {
      alert("Failed to update product status");
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;

    try {
      setAddingProduct(true);
      await apiService.addProduct(vendorId, {
        name: newProductName,
        price: parseInt(newProductPrice),
        description: newProductDesc,
        // Send image URL, falling back to a clean marketplace placeholder if empty
        imageUrl: newProductImageUrl.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'
      });
      
      // Reset form and reload list
      setNewProductName('');
      setNewProductPrice('');
      setNewProductDesc('');
      setNewProductImageUrl('');
      const updatedProducts = await apiService.getProducts(vendorId);
      setProducts(updatedProducts);
      alert("Product listed successfully!");
    } catch (err) {
      alert("Failed to list new item");
    } finally {
      setAddingProduct(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-orange-500" size={32} />
        <p className="text-xs text-gray-400 mt-2 font-semibold">Loading Vendor Workspace...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-bold">Workspace authentication failed.</p>
        <button onClick={onBack} className="mt-4 text-orange-500 font-bold">Back to App</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Workspace Header */}
      <div className="bg-gray-900 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <button 
              onClick={onBack}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors mb-3 bg-gray-800 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft size={14} />
              <span>Leave Workspace</span>
            </button>
            <h2 className="text-xl md:text-2xl font-black">{vendor.name} • Workspace</h2>
            <p className="text-xs text-gray-400 mt-0.5">Control center for processing orders & live listings</p>
          </div>

          {/* Real-time Shop Open Switch */}
          <button
            onClick={handleToggleShopStatus}
            className={`mt-4 md:mt-0 flex items-center space-x-2.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              vendor.isOpen
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}
          >
            <span>Shop Status: {vendor.isOpen ? 'ONLINE' : 'OFFLINE'}</span>
            {vendor.isOpen ? <ToggleRight size={20} className="text-green-400" /> : <ToggleLeft size={20} className="text-red-400" />}
          </button>
        </div>
      </div>

      {/* Tabs Switcher Navigation */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex border-b border-gray-100 space-x-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'orders' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <ClipboardList size={16} />
            <span>Incoming Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'products' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Package size={16} />
            <span>Manage Products ({products.length})</span>
          </button>
        </div>
      </div>

      {/* Primary Tab Displays */}
      <main className="max-w-4xl mx-auto px-4 mt-6">
        
        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center shadow-sm">
                <p className="text-gray-400 text-sm font-semibold">No orders received yet.</p>
                <p className="text-xs text-gray-400 mt-1">Once a customer checks out, details will pop up instantly here!</p>
              </div>
            ) : (
              orders.map((order: Order) => (
                <div 
                  key={order.id} 
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-extrabold text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded-md">
                        REF: CA-{order.id}
                      </span>
                      <span className="text-xs text-gray-400 font-bold">{order.createdAt}</span>
                    </div>

                    <p className="text-sm font-black text-gray-900 mt-2">
                      📍 {order.landmarkName}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      📱 Customer Phone: <span className="font-bold text-gray-900">{order.customerPhone}</span>
                    </p>
                    {order.deliveryNotes && (
                      <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl mt-2 italic leading-relaxed border border-gray-100">
                        "{order.deliveryNotes}"
                      </p>
                    )}
                  </div>

                  {/* Right Hand: Pricing & Status controls */}
                  <div className="mt-4 md:mt-0 text-right flex flex-col items-end justify-between space-y-3 min-w-[150px]">
                    <div>
                      <p className="text-lg font-black text-gray-900">
                        {order.totalAmount.toLocaleString()} MWK
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 px-2.5 py-1 rounded-full border border-orange-500/10">
                        {order.status}
                      </span>
                    </div>

                    {/* Action buttons to progress real-time order tracking */}
                    <div className="flex space-x-1.5">
                      {order.status === 'PENDING' && (
                        <button
                          onClick={async () => {
                            try {
                              await apiService.updateOrderStatus(order.id, 'PREPARING');
                              loadPortalData(); // Refresh list to show updated status
                            } catch (err) {
                              alert("Failed to accept order");
                            }
                          }}
                          className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-all"
                        >
                          Accept & Cook
                        </button>
                      )}
                      {order.status === 'PREPARING' && (
                        <button
                          onClick={async () => {
                            try {
                              await apiService.updateOrderStatus(order.id, 'DISPATCHED');
                              loadPortalData();
                            } catch (err) {
                              alert("Failed to dispatch order");
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-all"
                        >
                          Hand to Arthur
                        </button>
                      )}
                      {order.status === 'DISPATCHED' && (
                        <button
                          onClick={async () => {
                            try {
                              await apiService.updateOrderStatus(order.id, 'DELIVERED');
                              loadPortalData();
                            } catch (err) {
                              alert("Failed to mark as delivered");
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-all"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Hand: New Product Creation Panel with Image URL support */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm md:col-span-1 h-fit sticky top-24">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center space-x-1.5">
                <Plus size={14} />
                <span>List New Product</span>
              </h3>

              <form onSubmit={handleAddProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Item Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Cold Coca-Cola"
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 focus:bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all border-none"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Price (MWK)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                    <input
                      type="number"
                      placeholder="800"
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-gray-50 focus:bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all border-none"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Product Image Link (Optional)</label>
                  <div className="relative">
                    <Image className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                    <input
                      type="url"
                      placeholder="e.g., https://images.unsplash.com/your-image-url"
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-gray-50 focus:bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all border-none"
                      value={newProductImageUrl}
                      onChange={(e) => setNewProductImageUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Item Description</label>
                  <textarea
                    placeholder="Brief details about portion or variant..."
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 focus:bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all h-20 resize-none border-none"
                    value={newProductDesc}
                    onChange={(e) => setNewProductDesc(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingProduct}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-98"
                >
                  {addingProduct ? 'Adding...' : 'Add to Catalog'}
                </button>
              </form>
            </div>

            {/* Right Hand: Active Listings & Availability Toggles */}
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Live Inventory</h3>
              {products.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-xs text-gray-400">
                  Your shop has no items listed yet. Fill out the form on the left to start!
                </div>
              ) : (
                products.map((p) => (
                  <div key={p.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                      {/* Live Image rendering with error boundary fallback */}
                      <img 
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=80&q=80'} 
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover bg-gray-50 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=80&q=80';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{p.name}</h4>
                        <p className="text-xs text-orange-600 font-extrabold mt-0.5">{p.price.toLocaleString()} MWK</p>
                        {p.description && <p className="text-[10px] text-gray-400 mt-1 truncate">{p.description}</p>}
                      </div>
                    </div>

                    {/* Stock Status Controller */}
                    <button
                      onClick={() => handleToggleProductStock(p.id, p.isAvailable)}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[10px] font-extrabold border transition-all flex-shrink-0 ${
                        p.isAvailable
                          ? 'bg-green-500/5 text-green-600 border-green-500/10 hover:bg-green-500/10'
                          : 'bg-red-500/5 text-red-600 border-red-500/10 hover:bg-red-500/10'
                      }`}
                    >
                      {p.isAvailable ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{p.isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}</span>
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}