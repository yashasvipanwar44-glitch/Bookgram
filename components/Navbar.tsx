import React from 'react';
import { View, User } from '../types';
import { Moon, Sun, ShoppingCart, LogIn, LogOut, Plus, BookOpen } from 'lucide-react';

interface NavbarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onPostBookClick: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  cartItemCount: number;
}

const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  user,
  onLoginClick,
  onLogoutClick,
  onPostBookClick,
  isDarkMode,
  toggleTheme,
  cartItemCount,
}) => {
  const navItems = [
    { label: 'Store', value: View.STORE },
    { label: 'Community', value: View.COMMUNITY },
    { label: 'AI Helper', value: View.AI_HELPER },
    { label: 'Contact Us', value: View.CONTACT },
  ];

  if (user) {
    navItems.push({ label: 'Profile', value: View.PROFILE });
  }

  return (
    <nav className="sticky top-0 z-50 w-full transition-colors duration-300 bg-cream/90 dark:bg-bgDarker/90 backdrop-blur-md border-b border-gray-200 dark:border-primaryGreen/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setCurrentView(View.STORE)}
        >
          <div className="w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform bg-primaryGreen text-white rounded-xl shadow-md">
             <BookOpen size={24} />
          </div>
          <span className="text-2xl font-serif font-bold text-gray-800 dark:text-cream tracking-tight hidden sm:block">
            Bookgram
          </span>
        </div>

        {/* Center Tabs */}
        <div className="hidden md:flex items-center bg-gray-200/50 dark:bg-bgDark/50 rounded-full p-1 border border-gray-200 dark:border-white/10">
          {navItems.map((item) => (
            <button
              key={item.value}
              onClick={() => setCurrentView(item.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                currentView === item.value
                  ? 'bg-primaryGreen text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Cart Icon */}
          <button
            onClick={() => setCurrentView(View.CART)}
            className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <ShoppingCart size={22} className="text-gray-700 dark:text-cream" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-cream dark:border-bgDarker">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-400 group transition-all"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? (
              <span className="text-xl">🌞</span> 
            ) : (
              <span className="text-xl">🌛</span>
            )}
          </button>

          {/* Post Book Button - Visible on all screens now */}
          {/* Mobile: Plus Icon */}
          <button
            onClick={onPostBookClick}
            className="md:hidden w-10 h-10 bg-primaryGreen text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            title="Post Book"
          >
             <Plus size={24} />
          </button>
          
          {/* Desktop: Full Button */}
          <button
            onClick={onPostBookClick}
            className="hidden md:block px-6 py-2.5 bg-primaryGreen hover:bg-opacity-90 text-white rounded-xl font-medium shadow-lg shadow-primaryGreen/30 transition-all hover:scale-105 active:scale-95"
          >
            Post Book
          </button>

          {/* Login / Profile Actions */}
           {!user ? (
            <button
              onClick={onLoginClick}
              className="px-4 py-2.5 rounded-xl font-bold border-2 border-primaryGreen text-primaryGreen dark:text-lightGreen hover:bg-primaryGreen hover:text-white transition-all text-sm whitespace-nowrap flex items-center gap-2"
            >
              <LogIn size={18} />
              <span className="hidden sm:inline">Login / Sign Up</span>
              <span className="sm:hidden">Login</span>
            </button>
          ) : (
             <button 
              onClick={onLogoutClick} 
              className="px-4 py-2.5 rounded-xl font-bold border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all text-sm whitespace-nowrap flex items-center gap-2"
              title="Sign Out"
            >
                <LogOut size={18} />
                <span>Log Out</span>
             </button>
          )}
        </div>
      </div>
      
      {/* Mobile Nav */}
      <div className="md:hidden flex justify-around py-3 bg-white dark:bg-bgDark border-t border-gray-200 dark:border-white/5 overflow-x-auto">
         {navItems.map((item) => (
            <button
              key={item.value}
              onClick={() => setCurrentView(item.value)}
              className={`text-xs font-medium px-2 whitespace-nowrap ${currentView === item.value ? 'text-primaryGreen' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {item.label}
            </button>
          ))}
      </div>
    </nav>
  );
};

export default Navbar;