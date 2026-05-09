// src/App.tsx
import React, { useState } from 'react';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Register from './pages/Register'; // Import the new register page
import { MOCK_VENDORS } from './types/mockData'; // Import mock vendors array to let us add to it
import { ShoppingCart } from 'lucide-react';
import type { Product, Vendor } from './types/market';

type ActivePage = 'home' | 'shop' | 'register';

function App() {
  const [currentPage, setCurrentPage] = useState<ActivePage>('home');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [vendorsList, setVendorsList] = useState<Vendor[]>(MOCK_VENDORS); // Turn vendors list into reactive state
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

  const handleRegisterSuccess = (newVendorData: Omit<Vendor, 'id' | 'isOpen'>) => {
    const newVendor: Vendor = {
      ...newVendorData,
      id: `v${vendorsList.length + 1}`, // Generate dynamic new id
      isOpen: true, // New vendors are online by default!
    };

    // Update state to append the new vendor instantly
    setVendorsList((prev) => [newVendor, ...prev]);
    
    alert(`Success! "${newVendor.name}" has been registered. You'll see it live on the homepage dashboard.`);
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

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

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
            <button className="relative p-2.5 text-gray-300 hover:text-white transition-all bg-gray-800 rounded-xl hover:bg-gray-700">
              <ShoppingCart size={18} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-gray-900 animate-pulse">
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
          vendors={vendorsList} // Pass the dynamic list state instead of static mock file
        />
      )}

      {currentPage === 'shop' && selectedVendorId && (
        <Shop 
          vendorId={selectedVendorId}
          onBack={handleBackToHome}
          onAddToCart={handleAddToCart}
          cartCount={totalCartItems}
          vendors={vendorsList} // Pass state-driven vendors list to check updates
        />
      )}

      {currentPage === 'register' && (
        <Register 
          onBack={handleBackToHome}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
    </div>
  );
}

export default App;