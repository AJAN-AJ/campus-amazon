// src/pages/Tracker.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { apiService } from '../services/api';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  RefreshCw, 
  CheckCircle2, 
  //Clock, 
  //Truck, 
  //ShoppingBag, 
  Loader2, 
  Star, 
  Send, 
  MessageSquare 
} from 'lucide-react';

interface TrackerProps {
  orderId: string;
  onBack: () => void;
}

interface OrderDetails {
  id: string;
  customerPhone: string;
  deliveryNotes: string;
  totalAmount: number;
  status: 'PENDING' | 'PREPARING' | 'DISPATCHED' | 'DELIVERED';
  landmarkName: string;
  createdAt: string;
  // --- ADDED COORDINATES ---
  runnerLat?: number;
  runnerLng?: number;
  destLat?: number; // Optional: If you assign coordinates to landmarks (e.g. Chirimba / Ndirande landmarks)
  destLng?: number;
}

const mapContainerStyle = {
  width: '100%',
  height: '280px',
  borderRadius: '24px',
};

export default function Tracker({ orderId, onBack }: TrackerProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Rating and review states
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [ratedSuccessfully, setRatedSuccessfully] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Initialize Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY' // <-- Replace with your real API Key
  });

  async function fetchOrderStatus() {
    try {
      setRefreshing(true);
      const response = await fetch(`http://127.0.0.1:5000/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (err) {
      console.error("Error fetching order status:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchOrderStatus();
    // Auto-refresh order status and GPS location every 8 seconds for real-time smoothness
    const interval = setInterval(fetchOrderStatus, 8000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiService.submitRating(orderId, rating, review);
      setRatedSuccessfully(true);

      const stored = JSON.parse(localStorage.getItem('chanco_active_orders') || '[]');
      const filtered = stored.filter((id: string) => id !== orderId.toString());
      localStorage.setItem('chanco_active_orders', JSON.stringify(filtered));
      
    } catch (err) {
      alert("Failed to save your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Center map around the runner or the destination fallback (Blantyre, Malawi coordinates roughly)
  const mapCenter = useMemo(() => {
    if (order?.runnerLat && order?.runnerLng) {
      return { lat: order.runnerLat, lng: order.runnerLng };
    }
    // Default fallback center (e.g., central campus area)
    return { lat: -15.7861, lng: 35.0058 }; 
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-orange-500" size={32} />
        <p className="text-xs text-gray-400 mt-2 font-semibold">Locating your order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <p className="text-gray-500 font-bold">We couldn't find order ref: CA-{orderId}</p>
        <button onClick={onBack} className="mt-4 bg-orange-500 text-white font-bold px-4 py-2 rounded-xl text-xs">
          Back to Shops
        </button>
      </div>
    );
  }

  //const steps = [
    //{ key: 'PENDING', label: 'Order Placed', desc: 'Waiting for vendor confirmation', icon: Clock },
    //{ key: 'PREPARING', label: 'Preparing', desc: 'The kitchen is preparing your order', icon: ShoppingBag },
    //{ key: 'DISPATCHED', label: 'Out for Delivery', desc: 'Arthur is transit to your location', icon: Truck },
    //{ key: 'DELIVERED', label: 'Delivered', desc: 'Enjoy your meal/items!', icon: CheckCircle2 },
  //];

  const statusUpper = order.status.toUpperCase();
  const isDelivered = statusUpper === 'DELIVERED';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gray-900 text-white py-6 px-4">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div>
            <button 
              onClick={onBack}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors mb-2 bg-gray-800 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft size={14} />
              <span>Back to Shops</span>
            </button>
            <h2 className="text-lg font-black">Track Order CA-{order.id}</h2>
          </div>

          <button
            onClick={fetchOrderStatus}
            disabled={refreshing || isDelivered}
            className="p-2.5 rounded-xl bg-gray-800 text-gray-300 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <main className="max-w-xl mx-auto px-4 mt-6">
        
        {/* LIVE GOOGLE MAP BLOCK */}
        {!isDelivered && (
          <div className="bg-white p-3 rounded-3xl border border-gray-100 shadow-sm mb-6">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3 px-2 flex items-center justify-between">
              <span>Live Delivery Map</span>
              {order.runnerLat && (
                <span className="text-[10px] text-green-500 animate-pulse font-bold lowercase">● live tracking active</span>
              )}
            </h3>

            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={16}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                }}
              >
                {/* 1. Marker for Arthur (the Runner) if in transit */}
                {order.runnerLat && order.runnerLng && (
                  <MarkerF
                    position={{ lat: order.runnerLat, lng: order.runnerLng }}
                    title="Arthur (Courier)"
                    icon={{
                      url: "https://maps.google.com/mapfiles/kml/pal2/icon39.png", // Delivery truck icon
                      scaledSize: new window.google.maps.Size(32, 32)
                    }}
                  />
                )}

                {/* 2. Marker for Drop Point Landmark */}
                {order.destLat && order.destLng && (
                  <MarkerF
                    position={{ lat: order.destLat, lng: order.destLng }}
                    title={order.landmarkName}
                  />
                )}
              </GoogleMap>
            ) : (
              <div className="h-[280px] bg-gray-100 rounded-3xl flex items-center justify-center">
                <p className="text-xs text-gray-400 font-bold">Rendering Google Maps...</p>
              </div>
            )}
          </div>
        )}

        {/* Brand New: Interactive Reviews & Ratings Card */}
        {isDelivered && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-3xl shadow-xl border border-gray-800 mb-6 transition-all">
            {!ratedSuccessfully ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-2 text-amber-400">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-lg font-black">Delivered! 🎉</h3>
                  <p className="text-xs text-gray-300 mt-1">How was your ordering and delivery experience?</p>
                </div>

                <div className="flex justify-center items-center space-x-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const activeRating = hoverRating !== null ? hoverRating : rating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="transition-transform duration-100 focus:outline-none hover:scale-110 active:scale-95"
                      >
                        <Star
                          size={32}
                          className={`${star <= activeRating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Leave a note (Optional)</label>
                  <div className="relative">
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="e.g. Arthur arrived incredibly fast!"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none h-20"
                      maxLength={150}
                    />
                    <MessageSquare size={14} className="absolute right-3.5 bottom-3.5 text-gray-500" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-white font-black text-xs py-3.5 rounded-2xl transition-all flex items-center justify-center space-x-1.5"
                >
                  {submitting ? <Loader2 className="animate-spin" size={14} /> : (
                    <>
                      <Send size={12} />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="inline-flex p-3 bg-green-500/10 text-green-400 rounded-2xl">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-black animate-pulse">Review Submitted!</h3>
                <p className="text-xs text-gray-300">Thank you for rating!</p>
                <button
                  onClick={onBack}
                  className="mt-2 bg-white/10 hover:bg-white/20 text-white font-black text-xs px-6 py-2.5 rounded-xl transition-all"
                >
                  Back to Shops
                </button>
              </div>
            )}
          </div>
        )}

        {/* Deliverer Assigned Card (Customised for Arthur) */}
        {statusUpper === 'DISPATCHED' && (
          <div className="bg-orange-50 border border-orange-100 rounded-3xl p-5 mb-6 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black tracking-wider uppercase bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
                Courier Dispatched
              </span>
              <h3 className="font-extrabold text-gray-900 text-sm mt-2">Arthur is on his way!</h3>
              <p className="text-xs text-gray-500 mt-0.5">Shuttling your package straight to your drop landmark.</p>
            </div>
            <a 
              href="tel:+265888000000"
              className="bg-white p-3 rounded-2xl text-orange-600 shadow-sm hover:shadow-md transition-all border border-orange-100"
            >
              <Phone size={18} />
            </a>
          </div>
        )}

        {/* Drop-off Information */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Delivery Details</h3>
          
          <div className="flex items-start space-x-3 text-sm">
            <MapPin className="text-orange-500 mt-0.5" size={16} />
            <div>
              <p className="font-bold text-gray-900">{order.landmarkName}</p>
              <p className="text-xs text-gray-500">Chanco Campus Droppoint</p>
            </div>
          </div>

          {order.deliveryNotes && (
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
              <p className="text-[11px] font-bold uppercase text-gray-400 mb-1">Your Instruction Notes</p>
              <p className="text-xs text-gray-600 italic">"{order.deliveryNotes}"</p>
            </div>
          )}

          <div className="pt-3 border-t border-gray-50 flex justify-between items-center text-xs">
            <span className="text-gray-400 font-bold">Total Paid</span>
            <span className="font-black text-gray-900 text-sm">{order.totalAmount.toLocaleString()} MWK</span>
          </div>
        </div>

      </main>
    </div>
  );
}