// src/pages/Home.tsx
import React, { useState } from 'react';
import { MOCK_VENDORS } from '../types/mockData';
import type { Category, Vendor } from '../types/market';
import { 
  Search, 
  Utensils, 
  BookOpen, 
  Smartphone, 
  Shirt, 
  ShoppingBag, 
  Activity,
  Truck,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const CATEGORIES: { name: Category | 'All'; icon: React.ReactNode }[] = [
  { name: 'All', icon: <ShoppingBag size={18} /> },
  { name: 'Food', icon: <Utensils size={18} /> },
  { name: 'Stationery', icon: <BookOpen size={18} /> },
  { name: 'Electronics', icon: <Smartphone size={18} /> },
  { name: 'Fashion', icon: <Shirt size={18} /> },
  { name: 'Groceries', icon: <ShoppingBag size={18} /> },
  { name: 'Services', icon: <Activity size={18} /> }
];

interface HomeProps {
  onSelectVendor: (vendorId: string) => void;
  onOpenRegister: () => void;
}

export default function Home({ onSelectVendor, onOpenRegister }: HomeProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic
  const filteredVendors = MOCK_VENDORS.filter(vendor => {
    const matchesCategory = selectedCategory === 'All' || vendor.category === selectedCategory;
    const matchesSearch = 
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Banner Section */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-12 px-4 shadow-inner">
        <div className="max-w-6xl mx-auto text-center md:text-left flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 max-w-lg">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
              Your Campus. Ordered. Delivered.
            </h2>
            <p className="text-orange-50 text-sm md:text-base">
              Support student-run ventures on campus. Get textbooks printed, electronics delivered, or snacks dropped straight to your hostel step.
            </p>
          </div>
          <button 
            onClick={onOpenRegister}
            className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-orange-50 active:scale-95 transition-all"
          >
            Register Your Campus Shop
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 mt-8">
        
        {/* Search & Filter Controls Container */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search hostel rooms, custom print services, beef pies..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Dynamic Category Pill Bar */}
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  selectedCategory === cat.name
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat.icon}
                <span>{cat.name === 'All' ? 'All Businesses' : cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vendors Grid Heading */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
            {selectedCategory === 'All' ? 'Featured Campus Ventures' : `${selectedCategory} Shops`}
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-semibold">
            {filteredVendors.length} active
          </span>
        </div>

        {/* Vendors Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor: Vendor) => (
            <div 
              key={vendor.id}
              onClick={() => vendor.isOpen && onSelectVendor(vendor.id)}
              className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all duration-300 ${
                vendor.isOpen 
                  ? 'cursor-pointer hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5' 
                  : 'opacity-75'
              }`}
            >
              {/* Image & Open Status Container */}
              <div className="h-44 bg-gray-200 relative">
                {vendor.imageUrl ? (
                  <img 
                    src={vendor.imageUrl} 
                    alt={vendor.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-400 text-lg font-black">
                    {vendor.category.toUpperCase()}
                  </div>
                )}
                {/* Status Badge */}
                <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                  vendor.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {vendor.isOpen ? 'Open Now' : 'Closed'}
                </span>
              </div>

              {/* Card Body Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900 text-lg leading-snug">{vendor.name}</h4>
                    <span className="text-[10px] font-bold tracking-wider text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md uppercase">
                      {vendor.category}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mb-3">📍 {vendor.location}</p>
                </div>

                {/* Delivery Option Highlights (The business logic in action) */}
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                  {vendor.offersFreeDelivery ? (
                    <div className="flex items-center space-x-1 text-green-600 bg-green-50/75 px-2.5 py-1.5 rounded-lg text-xs font-semibold">
                      <CheckCircle size={14} />
                      <span>Free Seller Delivery</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-orange-600 bg-orange-50/75 px-2.5 py-1.5 rounded-lg text-xs font-semibold">
                      <Truck size={14} />
                      <span>Campus-Amazon Delivery</span>
                    </div>
                  )}
                  
                  {vendor.isOpen && (
                    <span className="text-xs font-bold text-orange-500 group-hover:underline">
                      View items &rarr;
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}