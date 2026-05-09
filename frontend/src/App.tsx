// src/App.tsx
import React, { useState } from 'react';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Register from './pages/Register';
import Checkout from './pages/Checkout'; // Import the checkout page
import { MOCK_VENDORS } from './types/mockData';
import { ShoppingCart } from 'lucide-react';
import type { Product, Vendor } from './types/market';

type ActivePage = 'home' | 'shop' | 'register' | 'checkout';

function App() {
  const [currentPage, setCurrentPage] = useState<ActivePage>('home');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [vendorsList, setVendorsList] = useState<Vendor[]>(MOCK_VENDORS);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);

  const handleSelectVendor = (vendorId: string) => {
    setSelectedVendorId(vendorId);
    setCurrentPage('shop');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedVendorId(null);
  };

  const handleOpenRegister = () => {
    setCurrentPage('register');
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    setCurrentPage('checkout');
  };

  const handleRegisterSuccess = (newVendorData: Omit<Vendor, 'id' | 'isOpen'>) => {
    const newVendor: Vendor = {
      ...newVendorData,
      id: `v${vendorsList.length + 1}`,
      isOpen: true,
    };
    setVendorsList((prev) => [newVendor, ...prev]);
    alert(`Success! "${newVendor.name}" has been registered.`);
    handleBackToHome();
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

  const handlePlaceOrder = (orderData: { landmarkId: string; deliveryNotes: string; customerPhone: string }) => {
    console.log("Order submitted:", { cart, ...orderData });
    
    alert(`Order Placed Successfully!\n\nYour items will be processed. Arthur has been assigned as the runner. Keep your phone (${orderData.customerPhone}) close!`);
    
    // Clear the cart on successful checkout
    setCart([]);
    handleBackToHome();
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Get active vendor name for checkout header
  const activeVendorName = selectedVendorId 
    ? vendorsList.find(v => v.id === selectedVendorId)?.name || '' 
    : '';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Universal Campus-Amazon Navigation Header */}
      <header className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 
            onClick={handleBackToHome}
            className="text-xl md:text-2xl font-black tracking-tight cursor-pointer select-none"
          >
            campus<span className="text-orange-500">amazon</span>
          </h1>

          <div className="flex items-center space-x-4">
            {/* Clickable Cart Indicator to trigger checkout */}
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

      {/* Pages Render Frame */}
      {currentPage === 'home' && (
        <Home 
          onSelectVendor={handleSelectVendor} 
          onOpenRegister={handleOpenRegister} 
          vendors={vendorsList}
        />
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
    </div>
  );
}

export default App;