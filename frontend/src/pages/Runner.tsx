// src/pages/Runner.tsx
import { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import { 
  ArrowLeft, 
  Loader2, 
  RefreshCw, 
  Phone, 
  MapPin, 
  CheckCircle, 
  Navigation, 
  PackageOpen 
} from 'lucide-react';

interface RunnerOrder {
  id: string;
  customerPhone: string;
  deliveryNotes: string;
  totalAmount: number;
  status: string; // Keep this flexible so lowercase statuses don't crash TypeScript
  landmarkName: string;
  vendorName: string;
  runnerName: string | null;
  createdAt: string;
}

interface RunnerProps {
  onBack: () => void;
}

export default function Runner({ onBack }: RunnerProps) {
  const [orders, setOrders] = useState<RunnerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const runnerName = "Arthur"; // Hardcoded to your profile!

  // Keep track of active geolocation watch instances by Order ID
  const activeWatches = useRef<{ [orderId: string]: number }>({});

  async function fetchQueue() {
    try {
      setRefreshing(true);
      const data = await apiService.getRunnerOrders();
      setOrders(data as RunnerOrder[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Effect to clean up any remaining GPS watchers when Arthur leaves the portal page
  useEffect(() => {
    fetchQueue();

    return () => {
      Object.values(activeWatches.current).forEach((watchId) => {
        navigator.geolocation.clearWatch(watchId);
      });
    };
  }, []);

  // --- START GEOLOCATION BACKEND STREAMING ---
  const startLocationSharing = (orderId: string) => {
    // If a watch is already active for this specific order, don't spin up another
    if (activeWatches.current[orderId]) return;

    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await fetch(`http://127.0.0.1:5000/api/orders/${orderId}/location`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lat: latitude, lng: longitude }),
            });
            console.log(`[GPS Stream] Shared coordinates for order ${orderId}: ${latitude}, ${longitude}`);
          } catch (err) {
            console.error("Failed to stream runner location to backend:", err);
          }
        },
        (error) => {
          console.error("GPS Tracking Error code:", error.code, error.message);
        },
        { 
          enableHighAccuracy: true, // Use GPS instead of approximate Wi-Fi locations
          timeout: 10000, 
          maximumAge: 0 
        }
      );

      // Store watch reference ID
      activeWatches.current[orderId] = watchId;
    } else {
      console.warn("Geolocation API is not supported by your browser/device.");
    }
  };

  // --- STOP GEOLOCATION STREAMING ---
  const stopLocationSharing = (orderId: string) => {
    const watchId = activeWatches.current[orderId];
    if (watchId !== undefined) {
      navigator.geolocation.clearWatch(watchId);
      delete activeWatches.current[orderId];
      console.log(`[GPS Stream] Stopped sharing coordinates for order ${orderId}`);
    }
  };

  const handleClaim = async (orderId: string) => {
    try {
      await apiService.claimOrder(orderId, runnerName);
      fetchQueue();
    } catch (err) {
      alert("Failed to claim order");
    }
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: 'DISPATCHED' | 'DELIVERED') => {
    try {
      await apiService.updateOrderStatus(orderId, nextStatus);
      
      if (nextStatus === 'DISPATCHED') {
        // Kick off live background GPS transmission
        startLocationSharing(orderId);
      } else if (nextStatus === 'DELIVERED') {
        // Kill background GPS tracking to save battery immediately
        stopLocationSharing(orderId);
      }
      
      fetchQueue();
    } catch (err) {
      alert("Failed to update tracking stage");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-orange-500" size={32} />
        <p className="text-xs text-gray-400 mt-2 font-semibold">Opening Dispatch Board...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Runner Header */}
      <div className="bg-gray-900 text-white py-6 px-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div>
            <button 
              onClick={onBack}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors mb-2 bg-gray-800 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft size={14} />
              <span>Exit Portal</span>
            </button>
            <h2 className="text-lg font-black">Chanco Runner Portal</h2>
            <p className="text-xs text-orange-400 font-extrabold mt-0.5">Logged in as: {runnerName} ⚡</p>
          </div>

          <button
            onClick={fetchQueue}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-gray-800 text-gray-300 hover:text-white transition-all"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <main className="max-w-xl mx-auto px-4 mt-6 space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Live Delivery Requests</h3>

        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
            <PackageOpen className="mx-auto text-gray-300 mb-2" size={32} />
            <p className="text-gray-400 text-sm font-semibold">All quiet on campus!</p>
            <p className="text-xs text-gray-400 mt-1">No active delivery requests at the moment.</p>
          </div>
        ) : (
          orders.map((order) => {
            const isMyJob = order.runnerName === runnerName;
            
            // Normalize status to uppercase to prevent case issues
            const statusUpper = order.status.toUpperCase();
            
            return (
              <div 
                key={order.id} 
                className={`p-5 rounded-3xl border transition-all ${
                  isMyJob 
                    ? 'bg-white border-orange-500/30 shadow-md ring-1 ring-orange-500/10' 
                    : 'bg-white border-gray-100 shadow-sm'
                }`}
              >
                {/* Top Vendor & Status Bar */}
                <div className="flex justify-between items-start border-b border-gray-50 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {order.vendorName}
                    </span>
                    <h4 className="text-xs text-gray-400 mt-1 font-bold">REF: CA-{order.id}</h4>
                  </div>
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      statusUpper === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      statusUpper === 'PREPARING' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {statusUpper}
                    </span>
                  </div>
                </div>

                {/* Logistics Info */}
                <div className="space-y-2.5 my-3 text-sm">
                  <div className="flex items-center space-x-2 text-gray-900 font-bold">
                    <MapPin size={16} className="text-orange-500" />
                    <span>Drop: {order.landmarkName}</span>
                  </div>

                  {order.deliveryNotes && (
                    <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl italic">
                      "{order.deliveryNotes}"
                    </p>
                  )}
                </div>

                {/* Actions Section */}
                <div className="border-t border-gray-50 pt-3 flex justify-between items-center gap-2">
                  <span className="font-extrabold text-sm text-gray-900">
                    {order.totalAmount.toLocaleString()} MWK
                  </span>

                  <div className="flex space-x-1.5">
                    {/* If unclaimed: show Claim button */}
                    {!order.runnerName ? (
                      <button
                        onClick={() => handleClaim(order.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5"
                      >
                        <Navigation size={12} />
                        <span>Claim Delivery</span>
                      </button>
                    ) : isMyJob ? (
                      /* If claimed by Arthur: show progression actions */
                      <div className="flex items-center space-x-1.5">
                        {/* Call Customer Button */}
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-xl transition-all"
                        >
                          <Phone size={14} />
                        </a>

                        {statusUpper === 'PREPARING' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'DISPATCHED')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2 rounded-xl transition-all"
                          >
                            Set Dispatched
                          </button>
                        )}
                        {statusUpper === 'DISPATCHED' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-black px-4 py-2 rounded-xl transition-all flex items-center space-x-1"
                          >
                            <CheckCircle size={12} />
                            <span>Mark Delivered</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Claimed by someone else */
                      <span className="text-[10px] text-gray-400 font-bold italic py-1.5">
                        Claimed by {order.runnerName}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </main>
    </div>
  );
}