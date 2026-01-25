import React, { useState, useEffect, useRef } from 'react';
import { Book, CartItem, User, Review } from '../types';
import { ChevronLeft, ChevronRight, ShoppingBag, Clock, IndianRupee, Star, User as UserIcon, Send, PenLine, Pencil } from 'lucide-react';

interface BookDetailsProps {
  book: Book;
  user: User | null;
  onBack: () => void;
  onAddToCart: (item: CartItem) => void;
  onAddReview: (bookId: string, review: Review) => void;
  onEditReview: (bookId: string, review: Review) => void;
}

const BookDetails: React.FC<BookDetailsProps> = ({ book, user, onBack, onAddToCart, onAddReview, onEditReview }) => {
  const [rentWeeks, setRentWeeks] = useState(1);
  const [mode, setMode] = useState<'BUY' | 'RENT'>('RENT');
  const reviewFormRef = useRef<HTMLDivElement>(null);

  // Image Slider State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const displayImages = book.images && book.images.length > 0 ? book.images : [book.imageUrl];

  // Check if user has already reviewed
  const existingReview = user ? book.reviews.find(r => r.userId === user.id) : undefined;

  // Review State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const isOutOfStock = book.quantity === 0;
  const discount = book.markedPrice > book.priceBuy 
    ? Math.round(((book.markedPrice - book.priceBuy) / book.markedPrice) * 100) 
    : 0;

  // Populate form if review exists (only when editing flag is true)
  useEffect(() => {
    if (existingReview && isEditing) {
      setRating(existingReview.rating);
      setReviewComment(existingReview.comment);
      // Scroll to form
      reviewFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [existingReview, isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleAddToCart = () => {
    if (mode === 'BUY' && isOutOfStock) {
        alert("Sorry, this book is out of stock.");
        return;
    }

    const unitPrice = mode === 'BUY' ? book.priceBuy : book.priceRent;
    const price = mode === 'BUY' ? unitPrice : unitPrice * rentWeeks;
    
    const cartItem: CartItem = {
      id: Date.now().toString(),
      bookId: book.id,
      title: book.title,
      author: book.author,
      imageUrl: displayImages[0], // Use the first image for cart
      type: mode,
      rentWeeks: mode === 'RENT' ? rentWeeks : undefined,
      price: price,
      quantity: 1,
      unitPrice: unitPrice
    };

    onAddToCart(cartItem);
    onBack();
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to write a review.");
      return;
    }
    if (rating === 0) {
      alert("Please select a star rating.");
      return;
    }

    const reviewData: Review = {
      id: existingReview ? existingReview.id : Date.now().toString(),
      userId: user.id,
      userName: user.name,
      rating: rating,
      comment: reviewComment,
      timestamp: existingReview ? 'Edited just now' : 'Just now'
    };

    if (existingReview) {
      onEditReview(book.id, reviewData);
      alert("Review updated successfully!");
    } else {
      onAddReview(book.id, reviewData);
    }
    
    // Reset edit state but keep review populated for viewing
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primaryGreen transition-colors font-medium"
      >
        <ChevronLeft size={20} /> Back to Store
      </button>

      <div className="bg-white dark:bg-bgDark rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5 flex flex-col md:flex-row min-h-[500px] mb-12">
        
        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-gray-100 dark:bg-bgDarker relative group select-none">
           {/* Main Image */}
           <div className="w-full h-full relative">
             <img 
              src={displayImages[currentImageIndex]} 
              alt={`${book.title} - View ${currentImageIndex + 1}`}
              className={`w-full h-full object-cover transition-opacity duration-300 ${isOutOfStock ? 'grayscale' : ''}`}
             />
             
             {/* Out of Stock Overlay */}
             {isOutOfStock && (
               <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 pointer-events-none">
                  <span className="bg-red-600 text-white px-6 py-2 text-2xl font-bold uppercase tracking-wider transform -rotate-12 border-4 border-white">Out of Stock</span>
               </div>
             )}

             {/* Navigation Arrows */}
             {displayImages.length > 1 && (
               <>
                 <button 
                   onClick={prevImage}
                   className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-black/50 text-gray-800 dark:text-white hover:bg-white dark:hover:bg-black transition-all opacity-0 group-hover:opacity-100 z-20"
                 >
                   <ChevronLeft size={24} />
                 </button>
                 <button 
                   onClick={nextImage}
                   className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-black/50 text-gray-800 dark:text-white hover:bg-white dark:hover:bg-black transition-all opacity-0 group-hover:opacity-100 z-20"
                 >
                   <ChevronRight size={24} />
                 </button>

                 {/* Dots Indicator */}
                 <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                   {displayImages.map((_, idx) => (
                     <button
                       key={idx}
                       onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                       className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === idx ? 'bg-primaryGreen w-6' : 'bg-white/60 hover:bg-white'}`}
                     />
                   ))}
                 </div>
               </>
             )}

             {/* Category Overlay */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8 pointer-events-none z-10">
               <div className="text-white">
                 <p className="font-bold text-lg">Category: {book.category}</p>
               </div>
             </div>
           </div>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
          <div className="mb-6">
            <span className="text-primaryGreen font-bold text-sm tracking-[0.2em] uppercase">{book.category}</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-cream mt-4 leading-tight">
              {book.title}
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 mt-2 font-medium">{book.author}</p>
            
            {/* Rating & Stock */}
            <div className="flex items-center gap-4 mt-4">
               <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} size={20} className={star <= Math.round(book.averageRating) ? 'fill-current' : 'text-gray-300 dark:text-gray-700'} />
                      ))}
                  </div>
                  <span className="font-bold text-lg text-gray-700 dark:text-gray-300">{book.averageRating}</span>
               </div>
               <span className="text-gray-400">|</span>
               <span className={`font-bold ${book.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                 {book.quantity > 0 ? `${book.quantity} left in stock` : 'Out of Stock'}
               </span>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-10">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
              {book.description}
            </p>
          </div>

          <div className="mt-auto space-y-8 bg-gray-50 dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/5">
            {/* Toggle Mode */}
            <div className="bg-white dark:bg-bgDarker p-1.5 rounded-2xl flex relative shadow-sm border border-gray-100 dark:border-white/5">
               <div 
                 className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-primaryGreen rounded-xl shadow-md transition-all duration-300 ${mode === 'BUY' ? 'left-1.5' : 'left-[50%]'}`}
               />
               <button 
                 onClick={() => setMode('BUY')}
                 className={`flex-1 relative z-10 py-3 text-center font-bold text-lg transition-colors ${mode === 'BUY' ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}
               >
                 Buy
               </button>
               <button 
                 onClick={() => setMode('RENT')}
                 className={`flex-1 relative z-10 py-3 text-center font-bold text-lg transition-colors ${mode === 'RENT' ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}
               >
                 Rent <span className="text-sm opacity-80">(₹{book.priceRent}/wk)</span>
               </button>
            </div>

            {/* Rent Logic */}
            {mode === 'RENT' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                 <div className="flex items-center justify-between mb-4">
                    <label className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 text-lg">
                      <Clock size={20} className="text-primaryGreen" /> Rent Duration
                    </label>
                    <div className="flex items-center gap-4 bg-white dark:bg-bgDarker rounded-xl p-1 border border-gray-200 dark:border-white/10">
                       <button 
                         onClick={() => setRentWeeks(Math.max(1, rentWeeks - 1))}
                         className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center font-bold text-xl"
                       >-</button>
                       <span className="font-bold w-16 text-center text-lg">{rentWeeks} wk</span>
                       <button 
                         onClick={() => setRentWeeks(rentWeeks + 1)}
                         className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center font-bold text-xl"
                       >+</button>
                    </div>
                 </div>
                 <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10">
                    <span className="text-gray-500 font-medium">Total Rent Price</span>
                    <span className="text-3xl font-serif font-bold text-primaryGreen flex items-center">
                      <IndianRupee size={24} strokeWidth={3} />{book.priceRent * rentWeeks}
                    </span>
                 </div>
              </div>
            )}

            {/* Total Price for Buy */}
            {mode === 'BUY' && (
              <div className="flex flex-col pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-lg">Purchase Price</span>
                    <div className="text-right">
                       {discount > 0 && (
                          <div className="text-gray-400 line-through text-sm flex justify-end items-center">
                             <IndianRupee size={12} />{book.markedPrice}
                          </div>
                       )}
                       <div className="flex items-center gap-2">
                           {discount > 0 && <span className="bg-primaryGreen/10 text-primaryGreen text-xs font-bold px-2 py-0.5 rounded">{discount}% OFF</span>}
                           <span className="text-3xl font-serif font-bold text-gray-900 dark:text-cream flex items-center">
                             <IndianRupee size={24} strokeWidth={3} />{book.priceBuy}
                           </span>
                       </div>
                    </div>
                  </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={mode === 'BUY' && isOutOfStock}
              className={`w-full font-bold py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] text-lg ${
                mode === 'BUY' && isOutOfStock 
                 ? 'bg-gray-300 dark:bg-white/10 cursor-not-allowed text-gray-500' 
                 : 'bg-primaryGreen hover:bg-[#466a32] text-white shadow-primaryGreen/20'
              }`}
            >
              {mode === 'BUY' && isOutOfStock ? (
                  'Out of Stock'
              ) : (
                <>
                  <ShoppingBag size={24} />
                  Add to Cart • ₹{mode === 'BUY' ? book.priceBuy : book.priceRent * rentWeeks}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="w-full bg-white dark:bg-bgDark rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-white/5">
         <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-cream mb-8">Ratings & Reviews</h2>

         {/* Reviews List */}
         <div className="space-y-6 mb-12">
            {book.reviews.length === 0 ? (
              <p className="text-center text-gray-500 italic py-8">No reviews yet. Be the first to review!</p>
            ) : (
              book.reviews.map((review) => (
                <div key={review.id} className={`border-b border-gray-100 dark:border-white/5 last:border-0 pb-6 last:pb-0 relative group ${review.userId === user?.id ? 'bg-primaryGreen/5 p-4 rounded-xl border-none' : ''}`}>
                  <div className="flex items-start justify-between mb-3 pr-8">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400">
                           <UserIcon size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-cream text-sm flex items-center gap-2">
                            {review.userName}
                            {review.userId === user?.id && <span className="text-[10px] bg-primaryGreen text-white px-2 py-0.5 rounded-full">You</span>}
                          </h4>
                          <span className="text-xs text-gray-400">{review.timestamp}</span>
                        </div>
                     </div>
                     <div className="flex text-yellow-400">
                        {[1,2,3,4,5].map(star => (
                           <Star key={star} size={14} className={star <= review.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-700'} />
                        ))}
                     </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed pl-13 ml-12">
                    {review.comment}
                  </p>
                  
                  {/* Edit Icon for Owner */}
                  {review.userId === user?.id && (
                    <button 
                      onClick={handleEditClick}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-primaryGreen hover:bg-white dark:hover:bg-bgDark rounded-full transition-all shadow-sm opacity-0 group-hover:opacity-100"
                      title="Edit Review"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
         </div>

         {/* Write/Edit Review Form */}
         {(user && (!existingReview || isEditing)) && (
            <div ref={reviewFormRef} className="bg-gray-50 dark:bg-bgDarker p-6 rounded-3xl border border-gray-100 dark:border-white/5 transition-all animate-in fade-in">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-cream flex items-center gap-2">
                {isEditing ? (
                  <><PenLine size={24} className="text-primaryGreen" /> Update Your Review</>
                ) : (
                  "Write a Review"
                )}
              </h3>
              <form onSubmit={handleSubmitReview}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Rating:</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(star => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star 
                            size={24} 
                            className={`${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <textarea 
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      placeholder={isEditing ? "Update your thoughts..." : "Share your thoughts about this book..."}
                      className="w-full bg-white dark:bg-bgDark rounded-xl p-4 min-h-[100px] border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen dark:text-cream resize-y"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                     {isEditing && (
                       <button 
                         type="button"
                         onClick={() => setIsEditing(false)}
                         className="px-6 py-3 text-gray-500 font-bold hover:text-gray-700 dark:hover:text-cream transition-all"
                       >
                         Cancel
                       </button>
                     )}
                     <button 
                        type="submit"
                        className="px-6 py-3 bg-primaryGreen text-white rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primaryGreen/20"
                      >
                        {isEditing ? (
                          <><PenLine size={18} /> Update Review</>
                        ) : (
                          <><Send size={18} /> Submit Review</>
                        )}
                      </button>
                  </div>
                </div>
              </form>
            </div>
         )}
         
         {!user && (
            <div className="text-center py-6 bg-gray-50 dark:bg-bgDarker rounded-xl">
               <p className="text-gray-500">Please log in to write a review.</p>
            </div>
         )}

      </div>
    </div>
  );
};

export default BookDetails;