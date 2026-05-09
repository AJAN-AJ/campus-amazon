import React from 'react';
import { ShoppingBag } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-sm text-center">
        <div className="inline-flex p-4 bg-orange-100 text-orange-500 rounded-full mb-4">
          <ShoppingBag size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          campus<span className="text-orange-500">amazon</span>
        </h1>
        <p className="text-gray-500 mt-2">
          Environment setup complete! Frontend is ready for vibe coding.
        </p>
      </div>
    </div>
  );
}

export default App;