import { Book } from './types';

export const INITIAL_BOOKS: Book[] = [
  {
    id: '1', title: 'Concepts of Physics', author: 'H.C. Verma', category: 'Engineering',
    description: 'A classic textbook for physics enthusiasts.',
    priceBuy: 450, markedPrice: 500, priceRent: 150, securityDeposit: 200, quantity: 10,
    imageUrl: 'https://picsum.photos/400/600?random=1', averageRating: 4.8, reviews: []
  },
  {
    id: '2', title: 'Gray\'s Anatomy', author: 'Henry Gray', category: 'Medical',
    description: 'The definitive anatomy textbook.',
    priceBuy: 1200, markedPrice: 1500, priceRent: 300, securityDeposit: 500, quantity: 5,
    imageUrl: 'https://picsum.photos/400/600?random=2', averageRating: 5.0, reviews: []
  },
  {
    id: '3', title: 'Sapiens: A Brief History', author: 'Yuval Noah Harari', category: 'Non-Fiction',
    description: 'A bold and provocative look at our species.',
    priceBuy: 500, markedPrice: 600, priceRent: 100, securityDeposit: 150, quantity: 8,
    imageUrl: 'https://picsum.photos/400/600?random=3', averageRating: 4.2, reviews: []
  },
  {
    id: '4', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction',
    description: 'A novel about the American dream.',
    priceBuy: 300, markedPrice: 400, priceRent: 50, securityDeposit: 100, quantity: 12,
    imageUrl: 'https://picsum.photos/400/600?random=4', averageRating: 3.8, reviews: []
  },
  {
    id: '5', title: 'Introduction to Algorithms', author: 'Cormen et al.', category: 'Engineering',
    description: 'Essential guide to algorithms.',
    priceBuy: 900, markedPrice: 1200, priceRent: 250, securityDeposit: 400, quantity: 6,
    imageUrl: 'https://picsum.photos/400/600?random=5', averageRating: 4.7, reviews: []
  },
  {
    id: '6', title: 'The Art of Computer Programming', author: 'Donald Knuth', category: 'Engineering',
    description: 'Comprehensive monograph on algorithms and programming.',
    priceBuy: 2500, markedPrice: 3000, priceRent: 500, securityDeposit: 1000, quantity: 2,
    imageUrl: 'https://picsum.photos/400/600?random=6', averageRating: 4.9, reviews: []
  },
  {
    id: '7', title: 'Clean Code', author: 'Robert C. Martin', category: 'Engineering',
    description: 'A Handbook of Agile Software Craftsmanship.',
    priceBuy: 800, markedPrice: 1000, priceRent: 200, securityDeposit: 300, quantity: 15,
    imageUrl: 'https://picsum.photos/400/600?random=7', averageRating: 4.6, reviews: []
  },
  {
    id: '8', title: '1984', author: 'George Orwell', category: 'Fiction',
    description: 'Dystopian social science fiction novel and cautionary tale.',
    priceBuy: 250, markedPrice: 350, priceRent: 60, securityDeposit: 100, quantity: 20,
    imageUrl: 'https://picsum.photos/400/600?random=8', averageRating: 4.5, reviews: []
  },
  {
    id: '9', title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction',
    description: 'A novel about the serious issues of rape and racial inequality.',
    priceBuy: 280, markedPrice: 380, priceRent: 70, securityDeposit: 120, quantity: 18,
    imageUrl: 'https://picsum.photos/400/600?random=9', averageRating: 4.8, reviews: []
  },
  {
    id: '10', title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Fiction',
    description: 'A romantic novel of manners.',
    priceBuy: 220, markedPrice: 300, priceRent: 50, securityDeposit: 100, quantity: 25,
    imageUrl: 'https://picsum.photos/400/600?random=10', averageRating: 4.4, reviews: []
  },
  {
    id: '11', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Non-Fiction',
    description: 'A book about two systems that drive the way we think.',
    priceBuy: 550, markedPrice: 700, priceRent: 150, securityDeposit: 200, quantity: 12,
    imageUrl: 'https://picsum.photos/400/600?random=11', averageRating: 4.5, reviews: []
  },
  {
    id: '12', title: 'Atomic Habits', author: 'James Clear', category: 'Non-Fiction',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones.',
    priceBuy: 450, markedPrice: 600, priceRent: 120, securityDeposit: 150, quantity: 30,
    imageUrl: 'https://picsum.photos/400/600?random=12', averageRating: 4.8, reviews: []
  },
  {
    id: '13', title: 'The Alchemist', author: 'Paulo Coelho', category: 'Fiction',
    description: 'A novel about following your dreams.',
    priceBuy: 300, markedPrice: 400, priceRent: 80, securityDeposit: 150, quantity: 22,
    imageUrl: 'https://picsum.photos/400/600?random=13', averageRating: 4.1, reviews: []
  },
  {
    id: '14', title: 'Design Patterns', author: 'Erich Gamma et al.', category: 'Engineering',
    description: 'Elements of Reusable Object-Oriented Software.',
    priceBuy: 1100, markedPrice: 1500, priceRent: 300, securityDeposit: 500, quantity: 7,
    imageUrl: 'https://picsum.photos/400/600?random=14', averageRating: 4.6, reviews: []
  },
  {
    id: '15', title: 'Cosmos', author: 'Carl Sagan', category: 'Non-Fiction',
    description: 'A popular science book about the universe.',
    priceBuy: 600, markedPrice: 800, priceRent: 180, securityDeposit: 250, quantity: 9,
    imageUrl: 'https://picsum.photos/400/600?random=15', averageRating: 4.8, reviews: []
  },
  {
    id: '16', title: 'The Lean Startup', author: 'Eric Ries', category: 'Business',
    description: 'How Today\'s Entrepreneurs Use Continuous Innovation.',
    priceBuy: 500, markedPrice: 700, priceRent: 150, securityDeposit: 200, quantity: 14,
    imageUrl: 'https://picsum.photos/400/600?random=16', averageRating: 4.4, reviews: []
  },
  {
    id: '17', title: 'Zero to One', author: 'Peter Thiel', category: 'Business',
    description: 'Notes on Startups, or How to Build the Future.',
    priceBuy: 450, markedPrice: 600, priceRent: 120, securityDeposit: 180, quantity: 16,
    imageUrl: 'https://picsum.photos/400/600?random=17', averageRating: 4.3, reviews: []
  },
  {
    id: '18', title: 'Principles', author: 'Ray Dalio', category: 'Business',
    description: 'Life and Work principles.',
    priceBuy: 700, markedPrice: 900, priceRent: 200, securityDeposit: 300, quantity: 11,
    imageUrl: 'https://picsum.photos/400/600?random=18', averageRating: 4.2, reviews: []
  },
  {
    id: '19', title: 'Meditations', author: 'Marcus Aurelius', category: 'Philosophy',
    description: 'A series of personal writings by Marcus Aurelius.',
    priceBuy: 200, markedPrice: 300, priceRent: 50, securityDeposit: 80, quantity: 15,
    imageUrl: 'https://picsum.photos/400/600?random=19', averageRating: 4.6, reviews: []
  },
  {
    id: '20', title: 'The Catcher in the Rye', author: 'J.D. Salinger', category: 'Fiction',
    description: 'A novel about teenage rebellion and alienation.',
    priceBuy: 350, markedPrice: 500, priceRent: 90, securityDeposit: 150, quantity: 13,
    imageUrl: 'https://picsum.photos/400/600?random=20', averageRating: 4.0, reviews: []
  }
];
