// src/pages/Checkout.tsx
import React, { useState } from 'react';
import { MOCK_LANDMARKS } from '../types/mockData';
import { ArrowLeft, MapPin, Clipboard, CheckCircle, Smartphone } from 'lucide-react';
import type { Product, CampusLandmark } from '../types/market';

interface CheckoutProps {
  cart: { product: Product; quantity: number }[];
  onBack: () => void;
  onPlaceOrder: (orderData: {
    landmarkId: string;
    deliveryNotes: string;
    customerPhone: string;
  }) => void;
  vendorName: string;
}

export default function Checkout({ cart, onBack, onPlaceOrder, vendorName }: CheckoutProps) {
  const [selectedLandmarkId, setSelectedLandmarkId] = useState(MOCK_LANDMARKS[0]?.id || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute pricing
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = 800; // Flat 800 MWK rate for your deliveries
  const total = subtotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone) {
      alert("Please enter your phone number so we can contact you on arrival!");
      return;
    }

    setIsSubmitting(true);

    // Simulate placing order
    setTimeout(() => {
      onPlaceOrder({
        landmarkId: selectedLandmarkId,
        deliveryNotes,
        customerPhone
      });
      setIsSubmitting(false);
    }, 1200);
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
            <span>Review Items</span>
          </button>
          <h2 className="text-2xl font-extrabold tracking-tight">Checkout</h2>
          <p className="text-xs text-gray-400 mt-1">
            Ordering from <span className="text-orange-400 font-bold">{vendorName}</span>
          </p>
        </div>
      </div>

      <main className="max-w-xl mx-auto px-4 mt-8 grid grid-cols-1 gap-6">
        {/* Order Summary Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Order Summary</h3>
          <div className="space-y-3 divide-y divide-gray-50">
            {cart.map((item) => (
              <div key={item.product.id} className="flex justify-between items-center pt-3 first:pt-0">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">{item.product.name}</h4>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {(item.product.price * item.quantity).toLocaleString()} MWK
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Calculations */}
          <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{subtotal.toLocaleString()} MWK</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery Fee</span>
              <span>{deliveryFee.toLocaleString()} MWK</span>
            </div>
            <div className="flex justify-between text-gray-900 font-extrabold text-base pt-2 border-t border-dashed border-gray-100">
              <span>Estimated Total</span>
              <span className="text-orange-600">{total.toLocaleString()} MWK</span>
            </div>
          </div>
        </div>

        {/* Delivery Details Form */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Delivery Handover</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Landmark Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Drop-off Landmark (Map Spot)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 text-orange-500" size={16} />
                <select
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm shadow-inner cursor-pointer"
                  value={selectedLandmarkId}
                  onChange={(e) => setSelectedLandmarkId(e.target.value)}
                >
                  {MOCK_LANDMARKS.map((landmark) => (
                    <option key={landmark.id} value={landmark.id}>
                      {landmark.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone Number Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Your Contact Number (Airtel / Mpamba)
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                <input
                  type="tel"
                  placeholder="e.g., 0888123456"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm shadow-inner"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Delivery Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Handover Notes for Arthur
              </label>
              <div className="relative">
                <Clipboard className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                <textarea
                  placeholder="e.g., Sitting on the top terrace of the library. Wearing a blue hoodie."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm shadow-inner h-24 resize-none"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-orange-100 active:scale-98 mt-2"
            >
              {isSubmitting ? 'Processing Order...' : 'Confirm Cash/Mobile Money on Delivery'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}