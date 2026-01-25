
export enum View {
  STORE = 'STORE',
  COMMUNITY = 'COMMUNITY',
  AI_HELPER = 'AI_HELPER',
  PROFILE = 'PROFILE',
  CART = 'CART',
  CHECKOUT = 'CHECKOUT',
  BOOK_DETAILS = 'BOOK_DETAILS',
  ORDER_SUCCESS = 'ORDER_SUCCESS',
  CONTACT = 'CONTACT',
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  timestamp: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  priceBuy: number; // Selling Price
  markedPrice: number; // MRP
  priceRent: number;
  quantity: number; // Stock
  imageUrl: string;
  images?: string[];
  reviews: Review[];
  averageRating: number;
  ownerId?: string; // Links to the user who listed it
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string; // URL for the avatar image
  rentedBooks: string[]; // Book IDs
  boughtBooks: string[]; // Book IDs
  favoriteBooks: string[]; // Book IDs
  listedBooks: string[]; // Book IDs
}

export interface CartItem {
  id: string; // Unique ID for cart item
  bookId: string;
  title: string;
  author: string;
  imageUrl: string;
  type: 'BUY' | 'RENT';
  rentWeeks?: number;
  price: number;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: string;
  address: any;
  status: string;
  createdAt: string;
}

export enum AuthMode {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
}

export interface ForumReply {
  id: string;
  postId?: string;
  authorId: string;
  authorName: string;
  content: string;
  likedBy: string[]; // Array of User IDs
  timestamp: string; // Display string or ISO date
}

export interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: string;
  likedBy: string[]; // Array of User IDs
  replies: ForumReply[];
  timestamp: string; // Display string or ISO date
  tags: string[];
}
