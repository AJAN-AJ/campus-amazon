// src/pages/Home.tsx
import React, { useState, useMemo } from 'react';
import { apiService } from '../services/api';
import { ChevronRight, Store, KeyRound, Loader2, X, Search, SlidersHorizontal, MapPin, Sparkles } from 'lucide-react';
import type { Vendor, Category } from '../types/market';

interface HomeProps {
  onSelectVendor: (vendorId: string) => void;
  onSelectVendorWorkspace: (vendorId: string) => void;
  onOpenRegister: () => void;
  vendors: Vendor[];
}

export default function Home({ onSelectVendor, onSelectVendorWorkspace, onOpenRegister, vendors }: HomeProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

  // Login modal control states
  const [authVendorId, setAuthVendorId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);

  const activeAuthVendor = vendors.find(v => v.id === authVendorId);

  // List of category filters with corresponding emojis
  const categories: { value: Category | 'All'; label: string; emoji: string }[] = [
    { value: 'All', label: 'All Items', emoji: '🛍️' },
    { value: 'Food', label: 'Food & Snacks', emoji: '🍔' },
    { value: 'Stationery', label: 'Stationery', emoji: '📝' },
    { value: 'Electronics', label: 'Electronics', emoji: '🔌' },
    { value: 'Books', label: 'Textbooks', emoji: '📚' },
    { value: 'Fashion', label: 'Clothing', emoji: '👕' },
    { value: 'Services', label: 'Services', emoji: '🛠️' },
  ];

  // Dynamic Search & Category Filtering Logic
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesCategory = selectedCategory === 'All' || vendor.category === selectedCategory;
      const matchesSearch = 
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [vendors, searchQuery, selectedCategory]);

  const handleOpenAuthModal = (e: React.MouseEvent, vendorId: string) => {
    e.stopPropagation(); // Avoid triggering shop selection
    setAuthVendorId(vendorId);
    setPasswordInput('');
    setAuthError(null);
  };

  const handleCloseAuthModal = () => {
    setAuthVendorId(null);
    setPasswordInput('');
    setAuthError(null);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authVendorId) return;

    try {
      setAuthenticating(true);
      setAuthError(null);
      
      const response = await apiService.loginToWorkspace(authVendorId, passwordInput);
      if (response.success) {
        handleCloseAuthModal();
        onSelectVendorWorkspace(authVendorId);
      }
    } catch (err: any) {
      setAuthError(err.message || "Invalid credentials. Try again.");
    } finally {
      setAuthenticating(false);
    }
  };

  return (
    /* Safeguarding layout alignment on all screens and containing unexpected overflows */
    <div className="max-w-6xl mx-auto px-4 py-8 flex-grow w-full overflow-x-hidden">
      {/* Hero Welcome Unit */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-6 md:p-10 text-white shadow-xl shadow-orange-100 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="max-w-md relative z-10">
          <span className="inline-flex items-center space-x-1.5 bg-white/10 text-orange-100 border border-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-4">
            <Sparkles size={12} />
            <span>Chanco's #1 Student Marketplace</span>
          </span>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
            Order food & campus essentials.
          </h2>
          <p className="text-white/80 text-xs md:text-sm mt-2 leading-relaxed">
            Running late for a lecture at Chancellor College? Get goods delivered directly to your library desk, hostel blocks, or class squares.
          </p>
        </div>
        <button 
          onClick={onOpenRegister}
          className="mt-6 md:mt-0 bg-white text-orange-600 hover:bg-orange-50 font-extrabold text-xs px-5 py-3 rounded-2xl transition-all shadow-md active:scale-95 relative z-10"
        >
          Sell on Campus-Amazon
        </button>
      </div>

      {/* Dynamic Search Bar Card */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-lg flex items-center space-x-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search food, books, electronics, printers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-sm font-semibold placeholder:text-gray-400"
          />
        </div>
        <button className="bg-gray-50 hover:bg-gray-100 p-3.5 rounded-2xl border border-gray-100 text-gray-500 transition-all active:scale-95">
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Categories Filter Carousel */}
      <div className="mb-8 overflow-x-hidden"> {/* Added overflow-x-hidden to prevent slide breakout */}
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3.5">Explore Categories</h3>
        <div className="flex space-x-2.5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 scroll-smooth">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap border transition-all duration-200 active:scale-95 ${
                selectedCategory === cat.value
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                  : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Vendor Marketplace Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Store className="text-gray-900" size={20} />
          <h3 className="text-lg font-black text-gray-900">
            Partner Shops
            {selectedCategory !== 'All' && <span className="text-orange-500 font-extrabold text-sm ml-1.5">• {selectedCategory}</span>}
          </h3>
        </div>
        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">
          {filteredVendors.length} found
        </span>
      </div>

      {/* Grid view of Shops with active Search and Filter applications */}
      {filteredVendors.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
          <div className="text-3xl mb-2">🔍</div>
          <h4 className="font-bold text-gray-800 text-sm">No shops found matching your criteria</h4>
          <p className="text-xs text-gray-400 mt-1">Try modifying your text search or selecting "All Items" above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div 
              key={vendor.id}
              onClick={() => vendor.isOpen && onSelectVendor(vendor.id)}
              className={`bg-white rounded-3xl border border-gray-100 p-5 shadow-sm transition-all duration-300 flex flex-col justify-between group ${
                vendor.isOpen 
                  ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <div>
                {/* Card Thumbnail */}
                {vendor.imageUrl ? (
                  <img 
                    src={vendor.imageUrl} 
                    alt={vendor.name} 
                    className="w-full h-32 object-cover rounded-2xl mb-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-32 bg-orange-50 rounded-2xl mb-4 flex items-center justify-center text-orange-400">
                    <Store size={36} />
                  </div>
                )}

                {/* Badges */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    vendor.isOpen 
                      ? 'bg-green-500/10 text-green-600' 
                      : 'bg-red-500/10 text-red-600'
                  }`}>
                    {vendor.isOpen ? 'Active Now' : 'Closed'}
                  </span>
                  {vendor.offersFreeDelivery && (
                    <span className="text-[10px] font-bold text-gray-400">
                      Free Delivery
                    </span>
                  )}
                </div>

                {/* Title Info */}
                <h4 className="font-extrabold text-gray-900 text-lg mt-3 group-hover:text-orange-600 transition-colors">
                  {vendor.name}
                </h4>
                <div className="flex items-center space-x-1.5 text-gray-500 mt-1">
                  <MapPin size={12} className="flex-shrink-0 text-gray-400" />
                  <p className="text-xs truncate">{vendor.location}</p>
                </div>
              </div>

              {/* Bottom Panel */}
              <div className="flex justify-between items-center text-xs text-gray-500 mt-4 pt-4 border-t border-gray-50">
                <span className="font-bold text-[10px] tracking-wider uppercase text-gray-400">
                  {vendor.category}
                </span>
                
                <button
                  onClick={(e) => handleOpenAuthModal(e, vendor.id)}
                  className="text-orange-500 font-bold hover:underline text-[10px] flex items-center space-x-1"
                >
                  <span>Workspace</span>
                  <ChevronRight size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WORKSPACE LOGIN MODAL */}
      {authVendorId && activeAuthVendor && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Close Button */}
            <button 
              onClick={handleCloseAuthModal}
              className="absolute right-4 top-4 p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Modal Heading */}
            <div className="flex flex-col items-center text-center mt-2">
              <div className="bg-orange-50 text-orange-600 p-3 rounded-2xl mb-4">
                <KeyRound size={24} />
              </div>
              <h3 className="font-extrabold text-gray-900 text-lg">Workspace Protection</h3>
              <p className="text-xs text-gray-500 mt-1">
                Enter credentials to log into <span className="font-bold text-orange-600">{activeAuthVendor.name}</span>
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1.5">Workspace Password</label>
                <input
                  type="password"
                  placeholder="e.g., ••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-inner"
                  required
                  autoFocus
                />
              </div>

              {authError && (
                <p className="text-red-500 text-[11px] font-bold text-center bg-red-50 py-2 rounded-xl border border-red-100">
                  ⚠️ {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={authenticating}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md active:scale-98 flex items-center justify-center space-x-1.5"
              >
                {authenticating ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Access Workspace</span>
                )}
              </button>
            </form>

            <p className="text-center text-[10px] text-gray-400 mt-4 leading-relaxed">
              Default password for testing seeded shops is <span className="font-bold text-gray-600">admin</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}