import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BookStore from './components/BookStore';
import AIHelper from './components/AIHelper';
import Community from './components/Community';
import AuthModal from './components/Auth';
import AddBookModal from './components/AddBook';
import BookDetails from './components/BookDetails';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderSuccess from './components/OrderSuccess';
import Contact from './components/Contact';
import Profile from './components/Profile';
import { View, User, Book, CartItem, Review } from './types';
import { BookOpen } from 'lucide-react';
import { INITIAL_BOOKS } from './mockBooks';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.STORE);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);
  
  // New States for Shopping Flow
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // --- Splash Screen Timer ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleAddToCart = async (item: CartItem) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setCart([...cart, item]);
  };

  const handleRemoveFromCart = async (itemId: string) => {
    setCart(cart.filter(i => i.id !== itemId));
  };

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    
    // Calculate new total price
    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    let newPrice = 0;
    if (item.type === 'RENT') {
       // (Rent * Months + Security) * Qty
       const rentCost = item.unitPrice * (item.rentMonths || 1);
       const securityCost = item.securityDeposit || 0;
       newPrice = (rentCost + securityCost) * newQty;
    } else {
       newPrice = item.unitPrice * newQty;
    }

    setCart(cart.map(i => i.id === itemId ? { ...i, quantity: newQty, price: newPrice } : i));
  };
  
  const handleUpdateRentMonths = async (itemId: string, newMonths: number) => {
    if (newMonths < 1) return;
     
    const item = cart.find(i => i.id === itemId);
    if (!item || item.type !== 'RENT') return;

    // (Rent * NewMonths + Security) * Qty
    const rentCost = item.unitPrice * newMonths;
    const securityCost = item.securityDeposit || 0;
    const newPrice = (rentCost + securityCost) * item.quantity;

    setCart(cart.map(i => i.id === itemId ? { ...i, rentMonths: newMonths, price: newPrice } : i));
  };

  const handleToggleFavorite = async (bookId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const isFav = user.favoriteBooks.includes(bookId);
    const newFavs = isFav ? user.favoriteBooks.filter(id => id !== bookId) : [...user.favoriteBooks, bookId];
    setUser({ ...user, favoriteBooks: newFavs });
  };

  const handlePostBook = async (book: Book) => {
    if (!user) {
        alert("You must be logged in to post a book.");
        return;
    }

    const newBook = { ...book, id: Date.now().toString(), ownerId: user.id };
    setBooks([newBook, ...books]);
    setShowAddBookModal(false);
    const newListed = [...user.listedBooks, newBook.id];
    setUser({ ...user, listedBooks: newListed });
    alert("Book posted successfully!");
  };
  
  const calculateAverageRating = (reviews: Review[]) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  };

  const handleAddReview = async (bookId: string, review: Review) => {
     const book = books.find(b => b.id === bookId);
     if (book) {
        // Guard against duplicate reviews
        if (book.reviews.some(r => r.userId === review.userId)) {
             alert("You have already submitted a review for this book. You can edit your existing review.");
             return;
        }

        const newReviews = [...book.reviews, review];
        const newRating = calculateAverageRating(newReviews);
        
        const updatedBook = { ...book, reviews: newReviews, averageRating: newRating };

        // Optimistic update
        setBooks(books.map(b => b.id === bookId ? updatedBook : b));
        
        // Also update selectedBook if it matches to ensure UI updates immediately
        if (selectedBook && selectedBook.id === bookId) {
            setSelectedBook(updatedBook);
        }
     }
  };

  const handleEditReview = async (bookId: string, updatedReview: Review) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      const newReviews = book.reviews.map(r => r.id === updatedReview.id ? updatedReview : r);
      const newRating = calculateAverageRating(newReviews);
      
      const updatedBook = { ...book, reviews: newReviews, averageRating: newRating };

      setBooks(books.map(b => b.id === bookId ? updatedBook : b));

      // Also update selectedBook if it matches
      if (selectedBook && selectedBook.id === bookId) {
            setSelectedBook(updatedBook);
      }
    }
  };

  const handlePlaceOrder = async (address: any, paymentMethod: string) => {
    if (!user) return;
    setCart([]);
    setCurrentView(View.ORDER_SUCCESS);
  };

  if (showSplash) {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-creamLight dark:bg-bgDarker transition-colors duration-500`}>
        <div className="w-40 h-40 md:w-56 md:h-56 animate-in zoom-in fade-in duration-700 ease-out flex items-center justify-center bg-primaryGreen rounded-full text-white shadow-2xl">
           <BookOpen size={80} strokeWidth={1.5} />
        </div>
        <h1 className="mt-6 text-4xl md:text-5xl font-serif font-bold text-primaryGreen tracking-wider animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200">
          Bookgram
        </h1>
        <p className="mt-3 text-gray-500 dark:text-gray-400 font-medium animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300">
          Curate your intellect.
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <Navbar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        user={user}
        onLoginClick={() => setShowAuthModal(true)}
        onLogoutClick={() => setUser(null)}
        onPostBookClick={() => user ? setShowAddBookModal(true) : setShowAuthModal(true)}
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
        cartItemCount={cart.length}
      />
      
      <main className="container mx-auto px-4 py-8">
        {currentView === View.STORE && (
          <>
            <Hero onSearch={setSearchQuery} />
            <BookStore 
              books={books} 
              user={user}
              onBookClick={(book) => { setSelectedBook(book); setCurrentView(View.BOOK_DETAILS); }}
              onToggleFavorite={handleToggleFavorite}
              isLoading={isLoadingBooks}
              error={bookError}
              searchQuery={searchQuery}
            />
          </>
        )}
        
        {currentView === View.BOOK_DETAILS && selectedBook && (
          <BookDetails 
            book={selectedBook} 
            user={user} 
            onBack={() => setCurrentView(View.STORE)}
            onAddToCart={handleAddToCart}
            onAddReview={handleAddReview}
            onEditReview={handleEditReview}
          />
        )}

        {currentView === View.COMMUNITY && <Community user={user} />}
        {currentView === View.AI_HELPER && <AIHelper />}
        {currentView === View.CONTACT && <Contact />}
        
        {currentView === View.PROFILE && user && (
          <Profile 
             user={user} 
             books={books}
             onLogout={() => setUser(null)}
             onUpdateUser={(updatedUser) => {
                setUser(updatedUser);
             }}
             onBookClick={(book) => { setSelectedBook(book); setCurrentView(View.BOOK_DETAILS); }}
          />
        )}

        {currentView === View.CART && (
           <Cart 
              items={cart}
              onRemove={handleRemoveFromCart}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdateRentMonths={handleUpdateRentMonths}
              onCheckout={() => setCurrentView(View.CHECKOUT)}
              onContinueShopping={() => setCurrentView(View.STORE)}
           />
        )}

        {currentView === View.CHECKOUT && (
            <Checkout 
              total={cart.reduce((sum, item) => sum + item.price, 0) + Math.round(cart.reduce((sum, item) => sum + item.price, 0) * 0.05)}
              onPlaceOrder={handlePlaceOrder}
              onBack={() => setCurrentView(View.CART)}
            />
        )}

        {currentView === View.ORDER_SUCCESS && (
            <OrderSuccess onContinue={() => setCurrentView(View.STORE)} />
        )}
      </main>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onLogin={user => setUser(user)} />}
      
      {showAddBookModal && (
        <AddBookModal 
          onClose={() => setShowAddBookModal(false)} 
          onAddBook={handlePostBook}
        />
      )}
    </div>
  );
};

export default App;