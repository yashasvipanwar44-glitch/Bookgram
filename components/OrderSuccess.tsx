import React from 'react';
import { Check, ShoppingBag, ArrowRight } from 'lucide-react';

interface OrderSuccessProps {
  onContinue: () => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ onContinue }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
      <div className="w-32 h-32 bg-primaryGreen rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-primaryGreen/30">
        <Check size={64} className="text-white" strokeWidth={3} />
      </div>
      
      <h1 className="text-5xl font-serif font-bold text-gray-900 dark:text-cream mb-4 text-center">
        Thank You!
      </h1>
      <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">
        Your order has been placed successfully.
      </p>
      <p className="text-sm text-gray-400 mb-10">
        Order ID: #{Math.floor(Math.random() * 1000000)}
      </p>

      <div className="flex gap-4">
        <button
          onClick={onContinue}
          className="px-8 py-4 bg-primaryGreen text-white rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-primaryGreen/20 flex items-center gap-2"
        >
          <ShoppingBag size={20} /> Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;