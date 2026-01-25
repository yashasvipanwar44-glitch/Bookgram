import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import { X, Upload, IndianRupee, Loader2, Tag, Layers } from 'lucide-react';

interface AddBookModalProps {
  onClose: () => void;
  onAddBook: (book: Book) => void;
}

const AddBookModal: React.FC<AddBookModalProps> = ({ onClose, onAddBook }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: 'Engineering',
    markedPrice: '', // MRP
    priceBuy: '',    // Selling Price
    priceRent: '',
    quantity: '1',   // Stock
  });

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Calculate discount whenever prices change
  useEffect(() => {
    const mrp = Number(formData.markedPrice);
    const sp = Number(formData.priceBuy);
    if (mrp > 0 && sp > 0 && mrp >= sp) {
      const discount = ((mrp - sp) / mrp) * 100;
      setDiscountPercent(Math.round(discount));
    } else {
      setDiscountPercent(0);
    }
  }, [formData.markedPrice, formData.priceBuy]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsProcessing(true);
      try {
        const files = Array.from(e.target.files) as File[];
        const base64Promises = files.map(file => convertToBase64(file));
        const base64Images = await Promise.all(base64Promises);
        setPreviewImages(prev => [...prev, ...base64Images]);
      } catch (error) {
        console.error("Error converting images:", error);
        alert("Failed to process images.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBook: Book = {
      id: Date.now().toString(),
      title: formData.title,
      author: formData.author,
      description: formData.description,
      category: formData.category,
      markedPrice: Number(formData.markedPrice),
      priceBuy: Number(formData.priceBuy),
      priceRent: Number(formData.priceRent),
      quantity: Number(formData.quantity),
      // Use the first uploaded image as main cover, or random fallback
      imageUrl: previewImages.length > 0 ? previewImages[0] : `https://picsum.photos/200/300?random=${Date.now()}`,
      images: previewImages,
      reviews: [],
      averageRating: 0,
    };
    onAddBook(newBook);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-bgDark w-full max-w-lg rounded-3xl p-8 relative shadow-2xl border border-gray-200 dark:border-primaryGreen/30 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-cream transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-serif font-bold mb-6 text-gray-900 dark:text-cream">
          Post a Book
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Book Title</label>
            <input
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen transition-colors"
              placeholder="e.g. Clean Code"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author</label>
            <input
              name="author"
              required
              value={formData.author}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen transition-colors"
              placeholder="e.g. Robert C. Martin"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen transition-colors appearance-none"
              >
                <option>Engineering</option>
                <option>Medical</option>
                <option>Arts & Humanities</option>
                <option>Fiction</option>
                <option>Non-Fiction</option>
                <option>Competitive Exams</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity (Stock)</label>
              <div className="relative">
                <Layers size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="number"
                  name="quantity"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen transition-colors"
                  placeholder="1"
                />
              </div>
            </div>
          </div>
            
          {/* Multiple Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Book Images</label>
            
            {/* Image Previews */}
            {previewImages.length > 0 && (
              <div className="flex gap-3 overflow-x-auto mb-3 pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {previewImages.map((img, index) => (
                  <div key={index} className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 group bg-gray-100 dark:bg-bgDarker">
                    <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl cursor-pointer hover:border-primaryGreen hover:bg-primaryGreen/5 transition-all h-28 group ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
               <div className="text-center p-2 text-gray-500 dark:text-gray-400 group-hover:text-primaryGreen transition-colors">
                  {isProcessing ? (
                     <Loader2 size={24} className="mx-auto mb-2 animate-spin" />
                  ) : (
                     <Upload size={24} className="mx-auto mb-2" />
                  )}
                  <span className="text-sm font-medium">{isProcessing ? 'Processing...' : 'Click to upload images'}</span>
                  <p className="text-xs text-gray-400 mt-1">Select multiple files (JPG, PNG)</p>
               </div>
               <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageUpload} 
                  disabled={isProcessing}
               />
            </label>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-4">
             <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marked Price (MRP)</label>
                <div className="relative">
                  <IndianRupee size={16} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="number"
                    name="markedPrice"
                    required
                    value={formData.markedPrice}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-bgDarker text-gray-900 dark:text-cream pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen transition-colors"
                    placeholder="e.g. 500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selling Price</label>
                <div className="relative">
                  <IndianRupee size={16} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="number"
                    name="priceBuy"
                    required
                    value={formData.priceBuy}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-bgDarker text-gray-900 dark:text-cream pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen transition-colors"
                    placeholder="e.g. 350"
                  />
                </div>
              </div>
             </div>
             
             {discountPercent > 0 && (
                <div className="flex items-center gap-2 text-sm">
                   <Tag size={16} className="text-primaryGreen" />
                   <span className="text-gray-600 dark:text-gray-300">Discount Percentage:</span>
                   <span className="font-bold text-white bg-primaryGreen px-2 py-0.5 rounded text-xs">{discountPercent}% OFF</span>
                </div>
             )}

             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rent Price (per week)</label>
                <div className="relative">
                  <IndianRupee size={16} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="number"
                    name="priceRent"
                    required
                    value={formData.priceRent}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-bgDarker text-gray-900 dark:text-cream pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen transition-colors"
                    placeholder="e.g. 50"
                  />
                </div>
              </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen transition-colors resize-none"
              placeholder="Describe the condition and contents..."
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-primaryGreen hover:bg-opacity-90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primaryGreen/20 transition-all transform active:scale-95 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post Book Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBookModal;