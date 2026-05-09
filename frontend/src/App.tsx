// src/App.tsx
import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import Portal from './pages/Portal'; // Import the new Workspace Portal
import { apiService } from './services/api';
import { ShoppingCart, Loader2, Truck, X } from 'lucide-react';
import type { Product, Vendor } from './types/market';
import Tracker from './pages/Tracker';
import Runner from './pages/Runner';

type ActivePage = 'home' | 'shop' | 'register' | 'checkout' | 'portal' | 'tracker' | 'runner';

function App() {
  const [currentPage, setCurrentPage] = useState<ActivePage>('home');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [vendorsList, setVendorsList] = useState<Vendor[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  
  // Track order history locally in browser memory
  const [savedOrderIds, setSavedOrderIds] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hidden Dev/Runner tap count state
  const [logoClicks, setLogoClicks] = useState(0);

  // Load initial vendors and recover active orders on start
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        const data = await apiService.getVendors();
        setVendorsList(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Could not connect to the Campus-Amazon API server. Is Flask running?");
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();

    // Recover saved order IDs from browser Storage
    const stored = JSON.parse(localStorage.getItem('chanco_active_orders') || '[]');
    setSavedOrderIds(stored);
  }, []);

  const handleSelectVendor = (vendorId: string) => {
    setSelectedVendorId(vendorId);
    setCurrentPage('shop');
  };

  const handleSelectVendorWorkspace = (vendorId: string) => {
    setSelectedVendorId(vendorId);
    setCurrentPage('portal'); // Navigate to Vendor Workspace instead
  };

  const handleBackToHome = async () => {
    setCurrentPage('home');
    setSelectedVendorId(null);
    try {
      const data = await apiService.getVendors();
      setVendorsList(data);
      
      // Update saved order list states from storage when coming back home
      const stored = JSON.parse(localStorage.getItem('chanco_active_orders') || '[]');
      setSavedOrderIds(stored);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenRegister = () => {
    setCurrentPage('register');
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setCurrentPage('checkout');
  };

  // --- SECURED RUNNER PORTAL ENTRY ---
  const handleOpenRunnerPortal = () => {
    const isRunner = localStorage.getItem('is_chanco_runner') === 'true';

    if (isRunner) {
      setCurrentPage('runner');
    } else {
      const passcode = prompt("Enter Runner Access Passcode:");
      if (passcode === 'ChancoRunner2026') {
        localStorage.setItem('is_chanco_runner', 'true');
        setCurrentPage('runner');
      } else {
        alert("Unauthorized access. This area is restricted to campus delivery couriers.");
      }
    }
  };

  // Tap Logo 5 times secret gesture
  const handleLogoClick = () => {
    const currentClicks = logoClicks + 1;
    setLogoClicks(currentClicks);

    if (currentClicks >= 5) {
      setLogoClicks(0); // Reset tap counter
      handleOpenRunnerPortal();
    }
  };

  const handleRegisterSuccess = async (newVendorData: Omit<Vendor, 'id' | 'isOpen'>) => {
    try {
      setIsLoading(true);
      await apiService.registerVendor(newVendorData);
      const updatedVendors = await apiService.getVendors();
      setVendorsList(updatedVendors);
      alert(`Success! "${newVendorData.name}" has been registered.`);
      handleBackToHome();
    } catch (err) {
      console.error(err);
      alert("Failed to submit registration to the database.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      if (prevCart.length > 0 && prevCart[0].product.vendorId !== product.vendorId) {
        const confirmClear = window.confirm(
          "Your cart contains items from a different shop. Would you like to clear your cart to order from this vendor?"
        );
        if (confirmClear) return [{ product, quantity: 1 }];
        return prevCart;
      }

      const existingItemIndex = prevCart.findIndex(item => item.product.id === product.id);
      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += 1;
        return newCart;
      }

      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handlePlaceOrder = async (orderData: { landmarkId: string; deliveryNotes: string; customerPhone: string }) => {
    if (!selectedVendorId) return;

    try {
      setIsLoading(true);
      const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const deliveryFee = 800;
      
      const payload = {
        vendorId: parseInt(selectedVendorId),
        landmarkId: parseInt(orderData.landmarkId),
        customerPhone: orderData.customerPhone,
        deliveryNotes: orderData.deliveryNotes,
        totalAmount: subtotal + deliveryFee
      };

      const result = await apiService.placeOrder(payload);
      
      // Save order to browser storage immediately
      const currentStored = JSON.parse(localStorage.getItem('chanco_active_orders') || '[]');
      const orderIdStr = result.orderId.toString();
      if (!currentStored.includes(orderIdStr)) {
        const updatedStored = [...currentStored, orderIdStr];
        localStorage.setItem('chanco_active_orders', JSON.stringify(updatedStored));
        setSavedOrderIds(updatedStored);
      }
      
      alert(`Order Placed Successfully!\n\nOrder Ref ID: CA-${result.orderId}\nStatus: PENDING\nArthur has been assigned to coordinate delivery!`);
      
      setCart([]);
      setActiveOrderId(orderIdStr); // Track this order ID
      setCurrentPage('tracker');
    } catch (err) {
      console.error(err);
      alert("Failed to process order.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler to open tracker for a specific order
  const handleTrackSpecificOrder = (orderId: string) => {
    setActiveOrderId(orderId);
    setCurrentPage('tracker');
  };

  // Clean an order from storage manually (optional utility)
  const handleRemoveSavedOrder = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop navigation click
    const updated = savedOrderIds.filter(id => id !== orderId);
    localStorage.setItem('chanco_active_orders', JSON.stringify(updated));
    setSavedOrderIds(updated);
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);
  const activeVendorName = selectedVendorId 
    ? vendorsList.find(v => v.id === selectedVendorId)?.name || '' 
    : '';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Universal Header */}
      <header className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 
            onClick={handleLogoClick}
            className="text-xl md:text-2xl font-black tracking-tight cursor-pointer select-none active:scale-95 transition-transform"
            title="Tapped to unlock access panels"
          >
            campus<span className="text-orange-500">amazon</span>
          </h1>

          <div className="flex items-center space-x-4">
            <button 
              onClick={handleOpenCheckout}
              disabled={cart.length === 0}
              className={`relative p-2.5 transition-all rounded-xl border ${
                cart.length > 0 
                  ? 'text-white bg-orange-500 border-orange-500 cursor-pointer hover:bg-orange-600' 
                  : 'text-gray-400 bg-gray-800 border-gray-800 cursor-not-allowed'
              }`}
            >
              <ShoppingCart size={18} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-orange-500 animate-pulse">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Connection Indicator */}
      {isLoading && (
        <div className="bg-orange-50 border-b border-orange-100 py-2.5 text-center flex items-center justify-center space-x-2 text-xs font-bold text-orange-600">
          <Loader2 className="animate-spin" size={16} />
          <span>Syncing with Campus Database...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 text-center py-4 px-4 text-xs font-semibold border-b border-red-100">
          ⚠️ {error}
        </div>
      )}

      {!error && (
        <>
          {currentPage === 'home' && (
            <div className="flex-1 flex flex-col">
              {/* Dynamic Storage Delivery Banner */}
              {savedOrderIds.length > 0 && (
                <div className="max-w-6xl w-full mx-auto px-4 mt-4">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-3xl shadow-md space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2.5">
                        <div className="bg-white/20 p-2 rounded-2xl animate-pulse">
                          <Truck size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black">Active Campus Deliveries ({savedOrderIds.length})</h4>
                          <p className="text-[10px] text-orange-100 font-medium">Your orders are on their way across campus!</p>
                        </div>
                      </div>
                    </div>

                    {/* Horizontal scroll list of active tracking keys */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {savedOrderIds.map((id) => (
                        <div
                          key={id}
                          onClick={() => handleTrackSpecificOrder(id)}
                          className="flex items-center space-x-2 bg-black/10 hover:bg-black/20 text-xs font-bold py-2 px-3.5 rounded-xl cursor-pointer transition-all border border-white/5 flex-shrink-0"
                        >
                          <span>Track CA-{id}</span>
                          <button
                            onClick={(e) => handleRemoveSavedOrder(id, e)}
                            className="p-0.5 hover:bg-white/10 rounded-md text-orange-200 hover:text-white"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <Home 
                onSelectVendor={handleSelectVendor} 
                onSelectVendorWorkspace={handleSelectVendorWorkspace}
                onOpenRegister={handleOpenRegister} 
                vendors={vendorsList}
              />
            </div>
          )}

          {currentPage === 'shop' && selectedVendorId && (
            <Shop 
              vendorId={selectedVendorId}
              onBack={handleBackToHome}
              onAddToCart={handleAddToCart}
              cartCount={totalCartItems}
              vendors={vendorsList}
            />
          )}

          {currentPage === 'register' && (
            <Register 
              onBack={handleBackToHome}
              onRegisterSuccess={handleRegisterSuccess}
            />
          )}

          {currentPage === 'checkout' && (
            <Checkout 
              cart={cart}
              vendorName={activeVendorName}
              onBack={() => setCurrentPage('shop')}
              onPlaceOrder={handlePlaceOrder}
            />
          )}

          {currentPage === 'tracker' && activeOrderId && (
            <Tracker 
              orderId={activeOrderId}
              onBack={handleBackToHome}
            />
          )}

          {currentPage === 'portal' && selectedVendorId && (
            <Portal 
              vendorId={selectedVendorId}
              onBack={handleBackToHome}
            />
          )}

          {currentPage === 'runner' && (
            <Runner onBack={handleBackToHome} />
          )}
        </>
      )}
    </div>
  );
}

export default App;