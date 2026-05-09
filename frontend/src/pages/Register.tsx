// src/pages/Register.tsx
import React, { useState } from 'react';
import { ArrowLeft, Store, MapPin, Phone, Image, Lock } from 'lucide-react';
import type { Category, Vendor } from '../types/market';

interface RegisterProps {
  onBack: () => void;
  onRegisterSuccess: (newVendor: Omit<Vendor, 'id' | 'isOpen'>) => void;
}

export default function Register({ onBack, onRegisterSuccess }: RegisterProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [location, setLocation] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [password, setPassword] = useState(''); // New State
  const [offersFreeDelivery, setOffersFreeDelivery] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || !whatsAppNumber || !password) {
      alert("Please fill out all required fields.");
      return;
    }

    onRegisterSuccess({
      name,
      category,
      location,
      whatsAppNumber,
      password, // Send password securely to callback
      offersFreeDelivery,
      imageUrl: imageUrl || undefined
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-xl mx-auto">
          <button 
            onClick={onBack}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors mb-4 bg-gray-800 px-3 py-1.5 rounded-lg"
          >
            <ArrowLeft size={14} />
            <span>Cancel</span>
          </button>
          <h2 className="text-2xl font-extrabold tracking-tight">Register Your Shop</h2>
          <p className="text-xs text-gray-400 mt-1">Start taking student orders online instantly</p>
        </div>
      </div>

      <main className="max-w-xl mx-auto px-4 mt-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Shop Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Shop / Kitchen Name</label>
              <div className="relative">
                <Store className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="e.g., Tionge's Quick Bites"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm shadow-inner"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Category selection - Updated to support multi-purpose campus marketplace */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Category</label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm shadow-inner cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                <option value="Food">🍔 Food & Snacks</option>
                <option value="Stationery">📝 Stationery & Printing</option>
                <option value="Electronics">🔌 Phones & Electronics</option>
                <option value="Books">📚 Textbooks & Study Materials</option>
                <option value="Fashion">👕 Clothing & Accessories</option>
                <option value="Services">🛠️ Services (Haircut, Repair, etc.)</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Location / Hostel Block</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="e.g., Chirunga Hostel, Block 3, Room 12"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm shadow-inner"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* WhatsApp Contact */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">WhatsApp Number (For Order Queries)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                <input
                  type="tel"
                  placeholder="e.g., 265888123456"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm shadow-inner"
                  value={whatsAppNumber}
                  onChange={(e) => setWhatsAppNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Secure Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Create Workspace Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                <input
                  type="password"
                  placeholder="Create a secure password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm shadow-inner"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Image URL (Optional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Cover Image Link (Optional)</label>
              <div className="relative">
                <Image className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                <input
                  type="url"
                  placeholder="e.g., https://images.unsplash.com/your-photo-link"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm shadow-inner"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Delivery Toggle Checkbox */}
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="freeDelivery"
                className="rounded text-orange-500 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                checked={offersFreeDelivery}
                onChange={(e) => setOffersFreeDelivery(e.target.checked)}
              />
              <label htmlFor="freeDelivery" className="text-xs text-gray-600 font-bold cursor-pointer select-none">
                I want to deliver my own orders (Self-delivery)
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-98 mt-4"
            >
              Verify & Register Shop
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}