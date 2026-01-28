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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.STORE);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [bookError, setBookError] = useState<string | null>(null);
  
  // New States for Shopping Flow
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

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
    setCart([...cart, item]);
    const { error } = await supabase.from('cart_items').insert([{
       user_id: user.id,
       book_id: item.bookId,
       title: item.title,
       author: item.author,
       image_url: item.imageUrl,
       type: item.type,
       rent_weeks: item.rentWeeks,
       price: item.price,
       quantity: item.quantity,
       unit_price: item.unitPrice
    }]);
    if (error) console.error("Error adding to cart:", error);
  };

  const handleRemoveFromCart = async (itemId: string) => {
    setCart(cart.filter(i => i.id !== itemId));
    await supabase.from('cart_items').delete().eq('id', itemId);
  };

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    setCart(cart.map(i => i.id === itemId ? { ...i, quantity: newQty, price: i.unitPrice * newQty * (i.type === 'RENT' && i.rentWeeks ? i.rentWeeks : 1) } : i));
    const item = cart.find(i => i.id === itemId);
    if(item) {
       const newPrice = item.unitPrice * newQty * (item.type === 'RENT' && item.rentWeeks ? item.rentWeeks : 1);
       await supabase.from('cart_items').update({ quantity: newQty, price: newPrice }).eq('id', itemId);
    }
  };
  
  const handleUpdateRentWeeks = async (itemId: string, newWeeks: number) => {
    if (newWeeks < 1) return;
     setCart(cart.map(i => i.id === itemId ? { ...i, rentWeeks: newWeeks, price: i.unitPrice * i.quantity * newWeeks } : i));
     const item = cart.find(i => i.id === itemId);
     if(item) {
        const newPrice = item.unitPrice * item.quantity * newWeeks;
        await supabase.from('cart_items').update({ rent_weeks: newWeeks, price: newPrice }).eq('id', itemId);
     }
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
    if (!user) return;
    const { data, error } = await supabase.from('books').insert([{
       title: book.title,
       author: book.author,
       description: book.description,
       category: book.category,
       price_buy: book.priceBuy,
       marked_price: book.markedPrice,
       price_rent: book.priceRent,
       quantity: book.quantity,
       image_url: book.imageUrl,
       images: book.images,
       owner_id: user.id
    }]).select().single();

    if (data) {
       const newBook = { ...book, id: data.id.toString() };
       setBooks([newBook, ...books]);
       setShowAddBookModal(false);
       const newListed = [...user.listedBooks, newBook.id];
       setUser({ ...user, listedBooks: newListed });
       await supabase.from('profiles').update({ listed_books: newListed }).eq('id', user.id);
    }
  };
  
  const handleAddReview = async (bookId: string, review: Review) => {
     setBooks(books.map(b => b.id === bookId ? { ...b, reviews: [...b.reviews, review] } : b));
     const book = books.find(b => b.id === bookId);
     if (book) {
        const newReviews = [...book.reviews, review];
        await supabase.from('books').update({ reviews: newReviews }).eq('id', bookId);
     }
  };

  const handleEditReview = async (bookId: string, updatedReview: Review) => {
    setBooks(books.map(b => b.id === bookId ? { ...b, reviews: b.reviews.map(r => r.id === updatedReview.id ? updatedReview : r) } : b));
    const book = books.find(b => b.id === bookId);
    if (book) {
      const newReviews = book.reviews.map(r => r.id === updatedReview.id ? updatedReview : r);
      await supabase.from('books').update({ reviews: newReviews }).eq('id', bookId);
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
              onUpdateRentWeeks={handleUpdateRentWeeks}
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