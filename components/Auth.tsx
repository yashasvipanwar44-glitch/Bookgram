import React, { useState } from 'react';
import { User, AuthMode } from '../types';
import { X, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
  // We don't strictly need onLogin prop here as App.tsx listens to onAuthStateChange,
  // but keeping it for compatibility if needed.
  onLogin?: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [mode, setMode] = useState<AuthMode>(AuthMode.LOGIN);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === AuthMode.SIGNUP) {
        // --- SIGN UP ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Check if session exists (auto-confirmed) or if email verification is required
          if (data.session) {
             onClose();
          } else {
             alert("Sign up successful! Please check your email to verify your account before logging in.");
             onClose();
          }
        }
      } else {
        // --- LOG IN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        // App.tsx's onAuthStateChange listener will handle the state update
        onClose();
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-bgDark w-full max-w-md rounded-3xl p-8 relative shadow-2xl border border-gray-200 dark:border-primaryGreen/30 animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-cream transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-serif font-bold text-center mb-2 text-gray-900 dark:text-cream">
          {mode === AuthMode.LOGIN ? 'Welcome Back' : 'Join Bookgram'}
        </h2>
        <p className="text-center text-gray-500 mb-8">
          {mode === AuthMode.LOGIN ? 'Curate your intellect today.' : 'Start your journey of knowledge.'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === AuthMode.SIGNUP && (
            <div className="relative">
              <UserIcon className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={mode === AuthMode.SIGNUP}
                className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen transition-colors"
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen transition-colors"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primaryGreen hover:bg-opacity-90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primaryGreen/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {mode === AuthMode.LOGIN ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            {mode === AuthMode.LOGIN ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setMode(mode === AuthMode.LOGIN ? AuthMode.SIGNUP : AuthMode.LOGIN);
                setError(null);
              }}
              className="text-primaryGreen font-bold hover:underline"
            >
              {mode === AuthMode.LOGIN ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;