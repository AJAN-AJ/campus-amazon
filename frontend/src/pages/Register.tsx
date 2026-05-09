// src/pages/Register.tsx
import React, { useState } from 'react';
import { ArrowLeft, Store, Phone, MapPin, CheckCircle, Truck } from 'lucide-react';
import type { Category } from '../types/market';

interface RegisterProps {
  onBack: () => void;
  onRegisterSuccess: (newVendor: {
    name: string;
    category: Category;
    location: string;
    offersFreeDelivery: boolean;
    whatsAppNumber: string;
  }) => void;
}

export default function Register({ onBack, onRegisterSuccess }: RegisterProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [location, setLocation] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [offersFreeDelivery, setOffersFreeDelivery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || !whatsAppNumber) {
      alert("Please fill in all fields!");
      return;
    }

    setIsSubmitting(true);

    // Simulate quick network latency for standard UX flow
    setTimeout(() => {
      onRegisterSuccess({
        name,
        category,
        location,
        offersFreeDelivery,
        whatsAppNumber
      });
      setIsSubmitting(false);
    }, 800);
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
            <span>Back to Dashboard</span>
          </button>
          <h2 className="text-2xl font-extrabold tracking-tight">Register Your Venture</h2>
          <p className="text-xs text-gray-400 mt-1">
            Get listed on campus-amazon in under a minute and stop losing track of orders on WhatsApp.
          </p>
        </div>
      </div>

      {/* Main Registration Container */}
      <main className="max-w-xl mx-auto px-4 mt-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Business Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Business Name
              </label>
              <div className="relative">
                <Store className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="e.g., Tionge's Quick Bites, Chancoll Prints"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm shadow-inner"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Primary Category
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm shadow-inner cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                <option value="Food">Food & Drinks</option>
                <option value="Stationery">Stationery & Printing</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Thrift & Fashion</option>
                <option value="Groceries">Groceries</option>
                <option value="Services">Other Campus Services</option>
              </select>
            </div>

            {/* Base Location */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Hostel Base / Location
              </label>
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

            {/* WhatsApp Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                WhatsApp Number (for orders)
              </label>
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
              <p className="text-[10px] text-gray-400 mt-1 pl-1">
                Include country code without the '+' (e.g., 265 for Malawi).
              </p>
            </div>

            {/* Delivery Switch Option */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                How will orders be delivered?
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Custom Delivery */}
                <div
                  onClick={() => setOffersFreeDelivery(true)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                    offersFreeDelivery
                      ? 'border-green-500 bg-green-50/50'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <CheckCircle className={offersFreeDelivery ? 'text-green-500' : 'text-gray-300'} size={20} />
                  <span className="text-xs font-bold text-gray-900 mt-2">Free Shop Delivery</span>
                  <p className="text-[10px] text-gray-400 mt-1">We will drop off orders ourselves</p>
                </div>

                {/* Campus Amazon Delivery */}
                <div
                  onClick={() => setOffersFreeDelivery(false)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                    !offersFreeDelivery
                      ? 'border-orange-500 bg-orange-50/50'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <Truck className={!offersFreeDelivery ? 'text-orange-500' : 'text-gray-300'} size={20} />
                  <span className="text-xs font-bold text-gray-900 mt-2">Campus-Amazon</span>
                  <p className="text-[10px] text-gray-400 mt-1">We need Arthur to deliver for us</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-orange-100 active:scale-98 mt-2"
            >
              {isSubmitting ? 'Creating Business Profile...' : 'Complete Free Registration'}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}