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
import { supabase } from './lib/supabase';
import { BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.STORE);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
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

  // --- Supabase Integration ---

  // 1. Check for active session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data && data.session) {
        fetchUserProfile(data.session.user);
      }
    }).catch(err => {
      console.warn("Session check failed:", err);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user);
      } else {
        setUser(null);
        setCart([]); // Clear cart on logout
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch Books from Supabase
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoadingBooks(true);
      setBookError(null);
      try {
        const { data, error } = await supabase.from('books').select('*').order('id', { ascending: false });
        
        if (error) {
          console.error("Error fetching books:", error);
          setBookError("Unable to load books. Please check your internet connection.");
          return;
        }
        
        if (data) {
          const mappedBooks: Book[] = data.map((b: any) => ({
            id: b.id.toString(),
            title: b.title,
            author: b.author,
            description: b.description,
            category: b.category,
            priceBuy: Number(b.price_buy || b.priceBuy),
            markedPrice: Number(b.marked_price || b.price_buy || b.priceBuy),
            priceRent: Number(b.price_rent || b.priceRent),
            securityDeposit: Number(b.security_deposit || 0),
            quantity: Number(b.quantity !== undefined ? b.quantity : 1),
            imageUrl: b.image_url || b.imageUrl,
            images: b.images || [],
            reviews: b.reviews || [],
            averageRating: Number(b.average_rating || b.averageRating || 0),
            ownerId: b.owner_id
          }));
          setBooks(mappedBooks);
        } else {
          setBooks([]);
        }
      } catch (err: any) {
        console.error("Error connecting to DB:", err);
        setBookError("Failed to connect to the bookstore.");
      } finally {
        setIsLoadingBooks(false);
      }
    };
    
    fetchBooks();
  }, []);

  // 3. Fetch Cart logic
  const fetchUserCart = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching cart:", error);
        return;
      }

      if (data) {
        const mappedCart: CartItem[] = data.map((item: any) => ({
          id: item.id.toString(),
          bookId: item.book_id,
          title: item.title,
          author: item.author,
          imageUrl: item.image_url,
          type: item.type,
          rentMonths: item.rent_months,
          securityDeposit: item.security_deposit || 0,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          price: item.price
        }));
        setCart(mappedCart);
      }
    } catch (err) {
      console.error("Failed to load cart");
    }
  };

  const fetchUserProfile = async (authUser: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      let userData: User;

      if (data && !error) {
        userData = {
          id: data.id,
          name: data.name || authUser.user_metadata?.full_name || 'User',
          email: authUser.email,
          avatar: data.avatar || authUser.user_metadata?.avatar_url,
          rentedBooks: data.rented_books || [],
          boughtBooks: data.bought_books || [],
          favoriteBooks: data.favorite_books || [],
          listedBooks: data.listed_books || [],
        };
      } else {
        userData = {
          id: authUser.id,
          name: authUser.user_metadata?.full_name || 'User',
          email: authUser.email,
          avatar: authUser.user_metadata?.avatar_url,
          rentedBooks: [],
          boughtBooks: [],
          favoriteBooks: [],
          listedBooks: [],
        };
      }
      setUser(userData);
      fetchUserCart(authUser.id);

    } catch (error) {
       const fallbackUser = {
        id: authUser.id,
        name: authUser.user_metadata?.full_name || 'User',
        email: authUser.email,
        avatar: authUser.user_metadata?.avatar_url,
        rentedBooks: [],
        boughtBooks: [],
        favoriteBooks: [],
        listedBooks: [],
      };
      setUser(fallbackUser);
    }
  };

  const handleAddToCart = async (item: CartItem) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // Optimistic update
    const previousCart = [...cart];
    setCart([...cart, item]);
    
    const { error } = await supabase.from('cart_items').insert([{
       user_id: user.id,
       book_id: item.bookId,
       title: item.title,
       author: item.author,
       image_url: item.imageUrl,
       type: item.type,
       rent_months: item.rentMonths,
       security_deposit: item.securityDeposit,
       price: item.price,
       quantity: item.quantity,
       unit_price: item.unitPrice
    }]);

    if (error) {
      console.error("Error adding to cart:", error);
      // Revert optimistic update
      setCart(previousCart);
      
      if (error.code === 'PGRST204' || error.message.includes('column')) {
         alert("Database Mismatch: Please run the SQL commands in 'supabase_setup.sql' to update your database schema.");
      } else {
         alert("Could not add to cart. Please check your connection.");
      }
    }
  };

  const handleRemoveFromCart = async (itemId: string) => {
    setCart(cart.filter(i => i.id !== itemId));
    await supabase.from('cart_items').delete().eq('id', itemId);
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
    
    await supabase.from('cart_items').update({ quantity: newQty, price: newPrice }).eq('id', itemId);
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
     
     await supabase.from('cart_items').update({ rent_months: newMonths, price: newPrice }).eq('id', itemId);
  };

  const handleToggleFavorite = async (bookId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const isFav = user.favoriteBooks.includes(bookId);
    const newFavs = isFav ? user.favoriteBooks.filter(id => id !== bookId) : [...user.favoriteBooks, bookId];
    setUser({ ...user, favoriteBooks: newFavs });
    await supabase.from('profiles').upsert({ id: user.id, favorite_books: newFavs });
  };

  const handlePostBook = async (book: Book) => {
    if (!user) {
        alert("You must be logged in to post a book.");
        return;
    }

    try {
        const { data, error } = await supabase.from('books').insert([{
           id: book.id, // Explicitly sending ID to fix "null value in column id" error
           title: book.title,
           author: book.author,
           description: book.description,
           category: book.category,
           price_buy: book.priceBuy,
           marked_price: book.markedPrice,
           price_rent: book.priceRent,
           security_deposit: book.securityDeposit,
           quantity: book.quantity,
           image_url: book.imageUrl,
           images: book.images,
           owner_id: user.id
        }]).select().single();

        if (error) {
            console.error("Error posting book:", error);
            
            // Check specifically for missing security_deposit column
            if (error.message && error.message.includes('security_deposit') && error.message.includes('column')) {
                alert("Database Update Required: The 'security_deposit' column is missing in your database. Please run the SQL commands from 'supabase_setup.sql'.");
            } 
            // Check for missing ID generation logic (though passing ID above fixes this)
            else if (error.code === '23502' && error.message.includes('id')) {
                alert("Database Error: ID generation failed. Please ensuring your 'books' table has a Primary Key.");
            }
            else {
                alert(`Failed to post book: ${error.message}`);
            }
            return;
        }

        if (data) {
           const newBook = { ...book, id: data.id.toString() };
           setBooks([newBook, ...books]);
           setShowAddBookModal(false);
           const newListed = [...user.listedBooks, newBook.id];
           setUser({ ...user, listedBooks: newListed });
           await supabase.from('profiles').update({ listed_books: newListed }).eq('id', user.id);
           alert("Book posted successfully!");
        }
    } catch (err: any) {
        console.error("Unexpected error posting book:", err);
        alert(`An unexpected error occurred: ${err.message}`);
    }
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
        
        // Update both reviews and average_rating column
        const { error } = await supabase.from('books').update({ 
            reviews: newReviews,
            average_rating: newRating
        }).eq('id', bookId);

        if (error) {
            console.error("Error adding review to Supabase:", error);
            // Optionally revert the optimistic update here if needed
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
      
      const { error } = await supabase.from('books').update({ 
          reviews: newReviews,
          average_rating: newRating
      }).eq('id', bookId);

       if (error) {
            console.error("Error updating review in Supabase:", error);
        }
    }
  };

  const handlePlaceOrder = async (address: any, paymentMethod: string) => {
    if (!user) return;
    const { error } = await supabase.from('orders').insert([{
      user_id: user.id,
      items: cart,
      total_amount: cart.reduce((sum, item) => sum + item.price, 0) + Math.round(cart.reduce((sum, item) => sum + item.price, 0) * 0.05),
      payment_method: paymentMethod,
      address: address,
      status: 'Confirmed'
    }]);
    if (!error) {
       setCart([]);
       await supabase.from('cart_items').delete().eq('user_id', user.id);
       setCurrentView(View.ORDER_SUCCESS);
    }
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
        onLogoutClick={() => supabase.auth.signOut()}
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
             onLogout={() => supabase.auth.signOut()}
             onUpdateUser={(updatedUser) => {
                setUser(updatedUser);
                supabase.from('profiles').update({ avatar: updatedUser.avatar }).eq('id', updatedUser.id);
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

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      
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