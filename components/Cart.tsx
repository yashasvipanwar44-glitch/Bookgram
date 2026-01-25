import React from 'react';
import { CartItem } from '../types';
import { Trash2, ArrowRight, ShoppingBag, Plus, Minus, Clock } from 'lucide-react';

interface CartProps {
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onUpdateRentWeeks: (id: string, newWeeks: number) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}

const Cart: React.FC<CartProps> = ({ items, onRemove, onUpdateQuantity, onUpdateRentWeeks, onCheckout, onContinueShopping }) => {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-gray-400" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-gray-800 dark:text-cream mb-2">Your cart is empty</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          Looks like you haven't added any books yet. Explore our collection to find your next read.
        </p>
        <button
          onClick={onContinueShopping}
          className="px-8 py-3 bg-primaryGreen text-white rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-primaryGreen/20"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-cream mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-grow space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white dark:bg-bgDark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col sm:flex-row gap-6">
              <div className="w-24 h-32 flex-shrink-0 bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 dark:text-cream text-xl font-serif">{item.title}</h3>
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.author}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${item.type === 'BUY' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {item.type}
                    </span>
                    {item.type === 'RENT' && (
                       <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-lg border border-gray-200 dark:border-white/10">
                         <Clock size={12} className="text-gray-500" />
                         <button 
                            onClick={() => onUpdateRentWeeks(item.id, (item.rentWeeks || 1) - 1)}
                            className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 rounded font-bold"
                          >-</button>
                          <span className="text-xs font-medium w-12 text-center">{item.rentWeeks} wks</span>
                          <button 
                             onClick={() => onUpdateRentWeeks(item.id, (item.rentWeeks || 1) + 1)}
                             className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 rounded font-bold"
                          >+</button>
                       </div>
                    )}
                  </div>
                </div>

                <div className="flex items-end justify-between">
                   {/* Quantity Control */}
                   <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Qty:</span>
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-lg p-1 border border-gray-200 dark:border-white/10">
                         <button 
                           onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                           className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-white/10 shadow-sm hover:bg-gray-100 dark:hover:bg-white/20 transition-colors"
                         >
                           <Minus size={14} />
                         </button>
                         <span className="font-bold w-6 text-center">{item.quantity}</span>
                         <button 
                           onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                           className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-white/10 shadow-sm hover:bg-gray-100 dark:hover:bg-white/20 transition-colors"
                         >
                           <Plus size={14} />
                         </button>
                      </div>
                   </div>

                   <div className="text-right">
                     <span className="block text-xs text-gray-400 mb-0.5">
                       {item.type === 'RENT' ? `₹${item.unitPrice}/wk × ${item.rentWeeks}wks` : `₹${item.unitPrice}`} × {item.quantity}
                     </span>
                     <span className="block font-bold text-2xl text-primaryGreen font-serif">₹{item.price}</span>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white dark:bg-bgDark p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-white/5 sticky top-24">
            <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-cream mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <span className="font-medium">₹{total}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Taxes & Fees (5%)</span>
                <span className="font-medium">₹{Math.round(total * 0.05)}</span>
              </div>
              <div className="border-t-2 border-dashed border-gray-200 dark:border-white/10 my-4"></div>
              <div className="flex justify-between text-2xl font-bold text-primaryGreen">
                <span>Total</span>
                <span>₹{total + Math.round(total * 0.05)}</span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              className="w-full bg-primaryGreen text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-xl shadow-primaryGreen/20 flex items-center justify-center gap-2 group"
            >
              Proceed to Checkout <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;