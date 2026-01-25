import React from 'react';
import { Search } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative w-full rounded-[2.5rem] overflow-hidden mb-12 bg-bgDark border border-primaryGreen/30 shadow-2xl">
      {/* Background Gradient/Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primaryGreen/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-lightGreen/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center justify-center py-20 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-serif text-cream mb-6 tracking-tight">
          Curate your <span className="italic text-lightGreen">intellect.</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 font-light">
          A modern exchange for students to buy, rent, and share knowledge sustainably.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/10 rounded-full p-2 flex items-center shadow-xl">
          <input
            type="text"
            placeholder="Find your next read..."
            className="flex-grow bg-transparent border-none outline-none text-cream placeholder-gray-500 px-6 text-lg"
          />
          <button className="bg-lightGreen hover:bg-primaryGreen text-bgDarker font-semibold px-8 py-3 rounded-full transition-colors flex items-center gap-2">
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
