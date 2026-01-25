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

// Mock Initial Data (Fallback) - Only used if DB is empty/fails
const INITIAL_BOOKS: Book[] = [];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.STORE);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // New States for Shopping Flow
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // --- Supabase Integration ---

  // 1. Check for active session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user);
      }
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
      try {
        const { data, error } = await supabase.from('books').select('*').order('id', { ascending: false });
        if (error) {
          console.log("Using local books (Supabase table 'books' not found or error):", error.message);
          return;
        }
        if (data && data.length > 0) {
          const mappedBooks: Book[] = data.map((b: any) => ({
            id: b.id,
            title: b.title,
            author: b.author,
            description: b.description,
            category: b.category,
            priceBuy: b.price_buy || b.priceBuy,
            markedPrice: b.marked_price || b.price_buy || b.priceBuy, // Map Marked Price
            priceRent: b.price_rent || b.priceRent,
            quantity: b.quantity !== undefined ? b.quantity : 1, // Map Quantity
            imageUrl: b.image_url || b.imageUrl,
            images: b.images || [],
            reviews: b.reviews || [],
            averageRating: b.average_rating || b.averageRating || 0,
            ownerId: b.owner_id
          }));
          setBooks(mappedBooks);
        }
      } catch (err) {
        console.error("Error connecting to DB:", err);
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
          rentWeeks: item.rent_weeks,
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
    // Try to get profile from 'profiles' table
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
        // Fallback if profile table doesn't exist yet
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
      // Once user is loaded, fetch their persistent cart
      fetchUserCart(authUser.id);

    } catch (error) {
       // Fallback on error
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
      fetchUserCart(authUser.id);
    }
  };

  // --- End Supabase Integration ---

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCart([]);
    setCurrentView(View.STORE);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    
    // Persist to Supabase
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        rented_books: updatedUser.rentedBooks,
        bought_books: updatedUser.boughtBooks,
        favorite_books: updatedUser.favoriteBooks,
        listed_books: updatedUser.listedBooks
      });
      
      if (error) {
        console.error("Failed to update profile:", error.message);
      }
    } catch (err) {
      console.error("Error updating user profile:", err);
    }
  };

  const handleAddBook = async (newBook: Book) => {
    // Check auth
    if (!user) {
        setShowAuthModal(true);
        return;
    }

    const bookWithOwner = { ...newBook, ownerId: user.id };

    // Optimistic Update
    setBooks([bookWithOwner, ...books]);
    const updatedUser = { ...user, listedBooks: [newBook.id, ...user.listedBooks] };
    setUser(updatedUser);
    handleUpdateUser(updatedUser);

    // Attempt to save to Supabase
    try {
      const dbBook = {
        id: newBook.id, 
        title: newBook.title,
        author: newBook.author,
        description: newBook.description,
        category: newBook.category,
        price_buy: newBook.priceBuy,
        marked_price: newBook.markedPrice, // Save MRP
        price_rent: newBook.priceRent,
        quantity: newBook.quantity, // Save Stock
        image_url: newBook.imageUrl,
        images: newBook.images,
        average_rating: newBook.averageRating,
        reviews: newBook.reviews,
        owner_id: user.id
      };
      
      const { error } = await supabase.from('books').insert([dbBook]);
      if (error) console.error("Error saving book to DB:", error.message);
    } catch (e) {
      console.error("Failed to save book to Supabase");
    }

    setShowAddBookModal(false);
    setCurrentView(View.STORE);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Cart Functions
  const handleAddToCart = async (item: CartItem) => {
    // Basic check locally before adding
    const book = books.find(b => b.id === item.bookId);
    if (book && item.type === 'BUY' && book.quantity < item.quantity) {
      alert("Not enough stock available.");
      return;
    }

    if (user) {
      // Sync with Supabase
      try {
        const { data, error } = await supabase.from('cart_items').insert([{
          user_id: user.id,
          book_id: item.bookId,
          title: item.title,
          author: item.author,
          image_url: item.imageUrl,
          type: item.type,
          rent_weeks: item.rentWeeks,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          price: item.price
        }]).select().single();

        if (error) throw error;

        // Use the ID from the database
        const newItemWithDbId = { ...item, id: data.id.toString() };
        setCart([...cart, newItemWithDbId]);
        alert(`${item.title} added to cart!`);
      } catch (err) {
        console.error("Error adding to cart DB:", err);
        // Fallback to local state if DB fails? Or just alert error.
        alert("Failed to save item to cart.");
      }
    } else {
      // Guest mode (Local only)
      setCart([...cart, item]);
      alert(`${item.title} added to cart!`);
    }
  };

  const handleRemoveFromCart = async (itemId: string) => {
    // Optimistic update
    setCart(cart.filter(item => item.id !== itemId));

    if (user) {
      await supabase.from('cart_items').delete().eq('id', itemId);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    // Check stock limit for buy items
    const item = cart.find(i => i.id === itemId);
    if (item && item.type === 'BUY') {
        const book = books.find(b => b.id === item.bookId);
        if (book && newQuantity > book.quantity) {
            alert("Cannot add more than available stock.");
            return;
        }
    }

    const updatedPrice = item ? item.unitPrice * (item.rentWeeks || 1) * newQuantity : 0;

    // Optimistic update
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const weeks = item.type === 'RENT' ? (item.rentWeeks || 1) : 1;
        return {
          ...item,
          quantity: newQuantity,
          price: item.unitPrice * weeks * newQuantity
        };
      }
      return item;
    }));

    if (user) {
      await supabase.from('cart_items').update({ 
        quantity: newQuantity,
        price: updatedPrice
      }).eq('id', itemId);
    }
  };

  const handleUpdateRentWeeks = async (itemId: string, newWeeks: number) => {
    if (newWeeks < 1) return;
    
    const item = cart.find(i => i.id === itemId);
    const updatedPrice = item ? item.unitPrice * newWeeks * item.quantity : 0;

    // Optimistic Update
    setCart(cart.map(item => {
      if (item.id === itemId && item.type === 'RENT') {
        return {
          ...item,
          rentWeeks: newWeeks,
          price: item.unitPrice * newWeeks * item.quantity
        };
      }
      return item;
    }));

    if (user) {
      await supabase.from('cart_items').update({ 
        rent_weeks: newWeeks,
        price: updatedPrice
      }).eq('id', itemId);
    }
  };

  const handlePlaceOrder = async (address: any, paymentMethod: string) => {
    if (!user) {
      alert("Please login to complete purchase.");
      setShowAuthModal(true);
      return;
    }

    // 1. SAVE ORDER TO SUPABASE 'orders' TABLE
    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0) + Math.round(cart.reduce((sum, item) => sum + item.price, 0) * 0.05);
    
    try {
       const { error } = await supabase.from('orders').insert([{
         user_id: user.id,
         items: cart, // Supabase handles JSON automatically
         total_amount: totalAmount,
         payment_method: paymentMethod,
         address: address,
         status: 'Confirmed'
       }]);

       if (error) {
          console.error("Order DB Insert Error:", error);
          alert("Note: Order processed but failed to save to history. Please contact support.");
       }
    } catch (err) {
       console.error("Order save exception:", err);
    }

    // 2. Decrement Stock for bought items
    const stockUpdates: Promise<any>[] = [];
    const updatedBooks = [...books];

    for (const item of cart) {
        if (item.type === 'BUY') {
            const bookIndex = updatedBooks.findIndex(b => b.id === item.bookId);
            if (bookIndex > -1) {
                // Update Local State
                updatedBooks[bookIndex].quantity = Math.max(0, updatedBooks[bookIndex].quantity - item.quantity);
                
                // Update Supabase
                const currentQty = updatedBooks[bookIndex].quantity; 
                stockUpdates.push(
                    supabase.from('books').update({ quantity: currentQty }).eq('id', item.bookId)
                );
            }
        }
    }

    setBooks(updatedBooks);
    
    try {
        await Promise.all(stockUpdates);
    } catch (err) {
        console.error("Error updating stock:", err);
    }

    // 3. Update User Profile with purchased/rented books
    const newBought = [...user.boughtBooks];
    const newRented = [...user.rentedBooks];

    cart.forEach(item => {
      if (item.type === 'BUY') newBought.push(item.bookId);
      else newRented.push(item.bookId);
    });

    const updatedUser = { ...user, boughtBooks: newBought, rentedBooks: newRented };
    handleUpdateUser(updatedUser);

    // 4. Clear Cart in DB and State
    try {
       await supabase.from('cart_items').delete().eq('user_id', user.id);
    } catch (e) {
       console.error("Error clearing cart DB", e);
    }
    
    setCart([]);
    setCurrentView(View.ORDER_SUCCESS);
  };

  const handleToggleFavorite = (bookId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const isFavorite = user.favoriteBooks.includes(bookId);
    let newFavorites;

    if (isFavorite) {
      newFavorites = user.favoriteBooks.filter(id => id !== bookId);
    } else {
      newFavorites = [...user.favoriteBooks, bookId];
    }

    const updatedUser = { ...user, favoriteBooks: newFavorites };
    handleUpdateUser(updatedUser);
  };

  const handleAddReview = async (bookId: string, review: Review) => {
    // Update local state first
    setBooks(prevBooks => prevBooks.map(book => {
      if (book.id === bookId) {
        const newReviews = [review, ...book.reviews];
        const totalRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = Number((totalRating / newReviews.length).toFixed(1));
        
        const updatedBook = {
          ...book,
          reviews: newReviews,
          averageRating: avgRating
        };
        
        // Update Supabase
        supabase.from('books').update({
          reviews: newReviews,
          average_rating: avgRating
        }).eq('id', bookId).then(({ error }) => {
           if (error) console.log("Review DB save failed", error);
        });

        // Also update the currently selected book if it's open in details view
        if (selectedBook && selectedBook.id === bookId) {
           setSelectedBook(updatedBook);
        }
        
        return updatedBook;
      }
      return book;
    }));
  };

  const handleEditReview = async (bookId: string, updatedReview: Review) => {
    // Update local state first
    setBooks(prevBooks => prevBooks.map(book => {
      if (book.id === bookId) {
        const newReviews = book.reviews.map(r => r.userId === updatedReview.userId ? updatedReview : r);
        const totalRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = newReviews.length > 0 ? Number((totalRating / newReviews.length).toFixed(1)) : 0;
        
        const updatedBook = {
          ...book,
          reviews: newReviews,
          averageRating: avgRating
        };
        
        // Update Supabase
        supabase.from('books').update({
          reviews: newReviews,
          average_rating: avgRating
        }).eq('id', bookId).then(({ error }) => {
           if (error) console.log("Review update DB save failed", error);
        });

        // Also update the currently selected book if it's open in details view
        if (selectedBook && selectedBook.id === bookId) {
           setSelectedBook(updatedBook);
        }
        
        return updatedBook;
      }
      return book;
    }));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onLoginClick={() => setShowAuthModal(true)}
        onLogoutClick={handleLogout}
        onPostBookClick={() => {
          if (!user) {
            setShowAuthModal(true);
          } else {
            setShowAddBookModal(true);
          }
        }}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        cartItemCount={cart.length}
      />

      <main className="flex-grow container mx-auto px-4 py-8">
        {currentView === View.STORE && (
          <>
            <Hero />
            <BookStore
              books={books}
              user={user}
              onBookClick={(book) => {
                setSelectedBook(book);
                setCurrentView(View.BOOK_DETAILS);
              }}
              onToggleFavorite={handleToggleFavorite}
            />
          </>
        )}

        {currentView === View.BOOK_DETAILS && selectedBook && (
          <BookDetails 
            book={selectedBook} 
            user={user}
            onBack={() => {
              setSelectedBook(null);
              setCurrentView(View.STORE);
            }} 
            onAddToCart={handleAddToCart}
            onAddReview={handleAddReview}
            onEditReview={handleEditReview}
          />
        )}

        {currentView === View.CART && (
          <Cart 
            items={cart} 
            onRemove={handleRemoveFromCart}
            onUpdateQuantity={handleUpdateQuantity}
            onUpdateRentWeeks={handleUpdateRentWeeks}
            onCheckout={() => {
              if (cart.length > 0) setCurrentView(View.CHECKOUT);
            }}
            onContinueShopping={() => setCurrentView(View.STORE)}
          />
        )}

        {currentView === View.CHECKOUT && (
          <Checkout 
            total={cart.reduce((sum, item) => sum + item.price, 0) + Math.round(cart.reduce((sum, item) => sum + item.price, 0) * 0.05)}
            onBack={() => setCurrentView(View.CART)}
            onPlaceOrder={handlePlaceOrder}
          />
        )}

        {currentView === View.ORDER_SUCCESS && (
          <OrderSuccess onContinue={() => setCurrentView(View.STORE)} />
        )}

        {currentView === View.CONTACT && (
          <Contact />
        )}

        {currentView === View.AI_HELPER && (
          <AIHelper />
        )}

        {currentView === View.COMMUNITY && (
          <Community user={user} />
        )}

        {currentView === View.PROFILE && user && (
          <Profile 
            user={user} 
            books={books} 
            onLogout={handleLogout} 
            onUpdateUser={handleUpdateUser}
            onBookClick={(book) => {
              setSelectedBook(book);
              setCurrentView(View.BOOK_DETAILS);
            }}
          />
        )}
      </main>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
      {showAddBookModal && (
        <AddBookModal onClose={() => setShowAddBookModal(false)} onAddBook={handleAddBook} />
      )}
    </div>
  );
};

export default App;