import React, { useState } from 'react';
import { Book, User } from '../types';
import { Heart, Star, Loader2, Database } from 'lucide-react';

interface BookStoreProps {
  books: Book[];
  user: User | null;
  onBookClick: (book: Book) => void;
  onToggleFavorite: (bookId: string) => void;
  isLoading?: boolean;
  error?: string | null;
  searchQuery: string;
}

const CATEGORIES = ['All', 'Competitive Exams', 'Engineering', 'Medical', 'Arts & Humanities', 'Fiction', 'Non-Fiction'];

const BookStore: React.FC<BookStoreProps> = ({ books, user, onBookClick, onToggleFavorite, isLoading, error, searchQuery }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredBooks = books.filter(b => {
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    
    // Safe case-insensitive search with trimming
    const query = (searchQuery || '').toLowerCase().trim();
    
    // If no search query, only filter by category
    if (!query) return matchesCategory;

    const matchesSearch = b.title.toLowerCase().includes(query) || 
                          b.author.toLowerCase().includes(query);
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full space-y-8 min-h-[500px]">
      {/* Categories */}
      <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 md:px-5 md:py-2.5 rounded-2xl text-xs md:text-sm font-medium transition-all duration-200 border ${
              selectedCategory === cat
                ? 'bg-bgDarker text-cream border-bgDarker dark:bg-cream dark:text-bgDarker dark:border-cream'
                : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-300 dark:border-white/10 hover:border-primaryGreen hover:text-primaryGreen'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
         <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
            <Loader2 size={48} className="animate-spin text-primaryGreen mb-4" />
            <p>Fetching books from the archives...</p>
         </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
         <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-200 dark:border-red-900/30">
            <Database size={48} className="mb-4" />
            <p className="font-bold text-lg mb-2">Connection Error</p>
            <p className="text-sm max-w-md text-center">{error}</p>
         </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredBooks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
             <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Database size={32} />
             </div>
             <h3 className="text-xl font-bold mb-2">No books found</h3>
             <p className="max-w-md text-center text-sm">
                {searchQuery 
                  ? `We couldn't find any books matching "${searchQuery}".`
                  : "Try adjusting your category filter or check back later."
                }
             </p>
          </div>
      )}

      {/* Grid */}
      {!isLoading && !error && filteredBooks.length > 0 && (
        <div className="grid grid-cols-4 gap-2 md:gap-4 lg:gap-6">
          {filteredBooks.map((book) => {
            const isFavorite = user?.favoriteBooks.includes(book.id);
            const isOutOfStock = book.quantity === 0;
            const discount = book.markedPrice > book.priceBuy 
              ? Math.round(((book.markedPrice - book.priceBuy) / book.markedPrice) * 100) 
              : 0;
            
            return (
              <div 
                key={book.id}
                onClick={() => onBookClick(book)}
                className={`group cursor-pointer bg-white dark:bg-bgDarker rounded-xl md:rounded-3xl overflow-hidden border border-gray-200 dark:border-white/5 hover:border-primaryGreen/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primaryGreen/10 flex flex-col h-full relative ${isOutOfStock ? 'opacity-80' : ''}`}
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img 
                    src={book.imageUrl} 
                    alt={book.title}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'grayscale' : ''}`}
                    loading="lazy"
                  />
                  
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold uppercase tracking-wider transform -rotate-12 border-2 border-white">Out of Stock</span>
                    </div>
                  )}

                  {!isOutOfStock && discount > 0 && (
                    <div className="absolute top-0 left-0 bg-primaryGreen text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-br-lg z-10">
                      {discount}% OFF
                    </div>
                  )}

                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onToggleFavorite(book.id); 
                    }}
                    className={`absolute top-2 right-2 md:top-4 md:right-4 w-6 h-6 md:w-8 md:h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-colors z-20 ${
                      isFavorite 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-white/20 text-white hover:bg-red-500'
                    }`}
                  >
                    <Heart size={14} className={`md:w-4 md:h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 bg-bgDarker/80 backdrop-blur-sm text-cream text-[10px] md:text-xs px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase tracking-wider font-bold truncate max-w-[80%]">
                    {book.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-2 md:p-5 flex flex-col flex-grow">
                  <div className="mb-2">
                    <h3 className="font-serif text-xs sm:text-sm md:text-xl font-bold text-gray-900 dark:text-cream leading-tight mb-1 line-clamp-1 group-hover:text-primaryGreen transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-[10px] md:text-sm text-gray-500 dark:text-gray-400 font-medium truncate">{book.author}</p>
                  </div>
                  
                  <div className="hidden sm:flex items-center gap-1 mb-2 md:mb-4">
                    <div className="flex">
                      {[1,2,3,4,5].map(star => (
                        <Star 
                          key={star} 
                          size={12} 
                          className={`${
                            star <= Math.round(book.averageRating || 0) 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300 dark:text-gray-600'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 ml-1">({book.averageRating || 0})</span>
                  </div>

                  <div className="space-y-3 mt-auto">
                    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between p-2 md:p-3 bg-gray-50 dark:bg-white/5 rounded-lg md:rounded-xl gap-1">
                      <div className="flex flex-col">
                          <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Rent</span>
                          <span className="font-bold text-xs md:text-base text-primaryGreen">₹{book.priceRent}<span className="hidden md:inline text-[10px] md:text-xs text-gray-400 font-normal">/month</span></span>
                      </div>
                      <div className="hidden xl:block w-px h-8 bg-gray-200 dark:bg-white/10"></div>
                      <div className="flex flex-col xl:items-end">
                          <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Buy</span>
                          <div className="flex flex-col xl:items-end leading-tight">
                            {discount > 0 && <span className="text-[8px] md:text-[10px] text-gray-400 line-through">₹{book.markedPrice}</span>}
                            <span className="font-bold text-xs md:text-base text-gray-900 dark:text-cream">₹{book.priceBuy}</span>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookStore;