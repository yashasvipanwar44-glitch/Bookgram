import React, { useState, useEffect } from 'react';
import { User, Book, Order } from '../types';
import { BookOpen, ShoppingBag, Heart, Bookmark, Camera, LogOut, X, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProfileProps {
  user: User;
  books: Book[];
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  onBookClick: (book: Book) => void;
}

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Zack',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Midnight',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Bella',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Liam',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Scooby',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=George',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Annie',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Bear'
];

const Profile: React.FC<ProfileProps> = ({ user, books, onLogout, onUpdateUser, onBookClick }) => {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
        setLoadingOrders(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (data) {
            const mappedOrders: Order[] = data.map((o: any) => ({
                id: o.id.toString(),
                items: o.items,
                totalAmount: o.total_amount,
                paymentMethod: o.payment_method,
                address: o.address,
                status: o.status,
                createdAt: new Date(o.created_at).toLocaleDateString()
            }));
            setOrders(mappedOrders);
        }
        setLoadingOrders(false);
    };
    fetchOrders();
  }, [user.id]);

  const handleAvatarSelect = (avatarUrl: string) => {
    onUpdateUser({ ...user, avatar: avatarUrl });
    setIsAvatarModalOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white dark:bg-bgDark p-8 rounded-3xl shadow-lg border border-gray-200 dark:border-primaryGreen/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar Section */}
          <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-lightGreen/20 group-hover:border-primaryGreen transition-colors shadow-lg bg-lightGreen flex items-center justify-center text-bgDarker text-5xl font-bold">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={32} />
            </div>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-3xl font-serif font-bold text-gray-800 dark:text-cream">{user.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-2">{user.email}</p>
            <p className="text-xs text-primaryGreen bg-primaryGreen/10 px-3 py-1 rounded-full inline-block font-medium">
              Click photo to change avatar
            </p>
          </div>
        </div>

        {/* Sign Out Button */}
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Rented Books */}
        <div className="bg-creamLight dark:bg-bgDarker p-6 rounded-2xl border border-transparent hover:border-primaryGreen/20 transition-colors">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primaryGreen">
             <BookOpen size={20} /> Rented Books
          </h3>
          {user.rentedBooks.length === 0 ? (
            <p className="text-sm opacity-70 italic">No active rentals.</p>
          ) : (
            <ul className="space-y-3">
              {user.rentedBooks.map((bid, i) => {
                const b = books.find(book => book.id === bid);
                return b ? (
                  <li key={i} className="flex items-center gap-3 text-sm p-2 bg-white dark:bg-white/5 rounded-lg">
                    <img src={b.imageUrl} className="w-8 h-12 object-cover rounded" alt="cover" />
                    <span className="font-medium text-gray-800 dark:text-cream">{b.title}</span>
                  </li>
                ) : null;
              })}
            </ul>
          )}
        </div>

        {/* Purchased Books */}
        <div className="bg-creamLight dark:bg-bgDarker p-6 rounded-2xl border border-transparent hover:border-primaryGreen/20 transition-colors">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primaryGreen">
             <ShoppingBag size={20} /> Purchased Books
          </h3>
          {user.boughtBooks.length === 0 ? (
            <p className="text-sm opacity-70 italic">No purchases yet.</p>
          ) : (
            <ul className="space-y-3">
              {user.boughtBooks.map((bid, i) => {
                const b = books.find(book => book.id === bid);
                return b ? (
                  <li key={i} className="flex items-center gap-3 text-sm p-2 bg-white dark:bg-white/5 rounded-lg">
                    <img src={b.imageUrl} className="w-8 h-12 object-cover rounded" alt="cover" />
                    <span className="font-medium text-gray-800 dark:text-cream">{b.title}</span>
                  </li>
                ) : null;
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Order History */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primaryGreen">
             <Package size={20} /> Order History
        </h3>
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/5">
            {loadingOrders ? (
                <div className="text-center py-4 text-gray-500">Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-4 text-gray-500 italic">No previous orders found.</div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white dark:bg-bgDarker rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                             <div 
                                className="p-4 flex flex-wrap gap-4 justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                             >
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400">Order ID: #{order.id}</span>
                                    <span className="font-bold text-gray-800 dark:text-cream">{order.createdAt}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400">Total</span>
                                    <span className="font-bold text-primaryGreen">₹{order.totalAmount}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                     <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                         {order.status}
                                     </span>
                                     <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded">
                                         {order.paymentMethod}
                                     </span>
                                </div>
                                {expandedOrderId === order.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                             </div>
                             
                             {expandedOrderId === order.id && (
                                <div className="p-4 bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5">
                                    <div className="mb-3">
                                        <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Delivery Address</h4>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {order.address.name}<br/>
                                            {order.address.houseNo}, {order.address.street}<br/>
                                            {order.address.city}, {order.address.state} - {order.address.zip}<br/>
                                            Phone: {order.address.phone}
                                        </p>
                                    </div>
                                    <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Items</h4>
                                    <ul className="space-y-2">
                                        {order.items.map((item, idx) => (
                                            <li key={idx} className="flex items-center gap-3 bg-white dark:bg-bgDark p-2 rounded-lg border border-gray-100 dark:border-white/5">
                                                <img src={item.imageUrl} className="w-10 h-14 object-cover rounded" alt="book" />
                                                <div className="flex-grow">
                                                    <p className="font-bold text-sm text-gray-800 dark:text-cream">{item.title}</p>
                                                    <p className="text-xs text-gray-500">{item.type} • Qty: {item.quantity}</p>
                                                </div>
                                                <div className="font-bold text-sm">₹{item.price}</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                             )}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Favorite Books */}
        <div className="bg-creamLight dark:bg-bgDarker p-6 rounded-2xl border border-transparent hover:border-primaryGreen/20 transition-colors">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primaryGreen">
             <Heart size={20} className="fill-primaryGreen" /> Favorite Books
          </h3>
          {user.favoriteBooks.length === 0 ? (
            <p className="text-sm opacity-70 italic">Your wishlist is empty.</p>
          ) : (
            <ul className="space-y-3">
              {user.favoriteBooks.map((bid, i) => {
                const b = books.find(book => book.id === bid);
                return b ? (
                  <li 
                    key={i} 
                    className="flex items-center gap-3 text-sm p-2 bg-white dark:bg-white/5 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                    onClick={() => onBookClick(b)}
                  >
                    <img src={b.imageUrl} className="w-8 h-12 object-cover rounded" alt="cover" />
                    <span className="font-medium text-gray-800 dark:text-cream">{b.title}</span>
                  </li>
                ) : null;
              })}
            </ul>
          )}
        </div>

        {/* Listed Books */}
        <div className="bg-creamLight dark:bg-bgDarker p-5 rounded-2xl border border-transparent hover:border-primaryGreen/20 transition-colors">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-primaryGreen">
             <Bookmark size={18} /> Listed for Sale/Rent
          </h3>
          {user.listedBooks.length === 0 ? (
            <p className="text-xs opacity-70 italic">You haven't listed any books.</p>
          ) : (
            <ul className="space-y-2">
              {user.listedBooks.map((bid, i) => {
                const b = books.find(book => book.id === bid);
                return b ? (
                  <li key={i} className="flex items-center gap-2 text-xs p-1.5 bg-white dark:bg-white/5 rounded-lg">
                    <img src={b.imageUrl} className="w-6 h-9 object-cover rounded-sm" alt="cover" />
                    <span className="font-medium text-gray-800 dark:text-cream truncate">{b.title}</span>
                  </li>
                ) : null;
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Avatar Selection Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-bgDark w-full max-w-lg rounded-3xl p-8 relative shadow-2xl border border-gray-200 dark:border-primaryGreen/30">
            <button 
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-cream transition-colors"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-serif font-bold mb-6 text-gray-900 dark:text-cream text-center">
              Choose your Avatar
            </h3>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-2">
              {AVATAR_OPTIONS.map((url, index) => (
                <button
                  key={index}
                  onClick={() => handleAvatarSelect(url)}
                  className="relative group rounded-full overflow-hidden aspect-square border-2 border-transparent hover:border-primaryGreen hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-primaryGreen"
                >
                  <img src={url} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover bg-gray-100" />
                  {user.avatar === url && (
                    <div className="absolute inset-0 bg-primaryGreen/40 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
               <button 
                 onClick={() => setIsAvatarModalOpen(false)}
                 className="text-gray-500 hover:text-gray-800 dark:hover:text-cream font-medium"
               >
                 Cancel
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;