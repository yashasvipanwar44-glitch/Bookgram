import React, { useState } from 'react';
import { Mail, Phone, User, Clock, MessageSquare, Send, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    query: '',
    timeSlot: 'Morning (9 AM - 12 PM)'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('inquiries').insert([
        {
          full_name: formData.fullName,
          email: formData.email,
          mobile: formData.mobile,
          query: formData.query,
          time_slot: formData.timeSlot
        }
      ]);

      if (error) throw error;
      
      setIsSubmitted(true);
    } catch (err) {
      console.error("Error submitting inquiry:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6">
        <div className="bg-white dark:bg-bgDark p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-primaryGreen/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-primaryGreen" size={48} />
          </div>
          <h2 className="text-4xl font-serif font-bold text-gray-900 dark:text-cream mb-4">Message Sent!</h2>
          <p className="text-gray-500 dark:text-gray-300 text-lg mb-8">
            Thank you for contacting us, <span className="font-bold text-primaryGreen">{formData.fullName}</span>. 
            <br className="hidden sm:block" />
            Our admin team will review your query and reach out to you at <span className="font-mono bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-sm">{formData.email}</span> during your preferred time slot of <span className="font-bold">{formData.timeSlot}</span>.
          </p>
          <button 
            onClick={() => {
              setIsSubmitted(false);
              setFormData({ fullName: '', email: '', mobile: '', query: '', timeSlot: 'Morning (9 AM - 12 PM)' });
            }}
            className="text-primaryGreen font-bold hover:underline"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-cream mb-4">Get in Touch</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Have a question about a book, an order, or just want to say hello? 
          <br className="hidden sm:block" />
          Fill out the form below and our admin team will assist you.
        </p>
      </div>

      <div className="bg-white dark:bg-bgDark p-8 md:p-10 rounded-3xl shadow-xl border border-gray-200 dark:border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Full Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen focus:ring-1 focus:ring-primaryGreen transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen focus:ring-1 focus:ring-primaryGreen transition-all"
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="tel"
                  name="mobile"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen focus:ring-1 focus:ring-primaryGreen transition-all"
                />
              </div>
            </div>
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Preferred Time Slot for Callback</label>
            <div className="relative">
              <Clock className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <select
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen focus:ring-1 focus:ring-primaryGreen transition-all appearance-none cursor-pointer"
              >
                <option>Morning (9 AM - 12 PM)</option>
                <option>Afternoon (12 PM - 3 PM)</option>
                <option>Evening (3 PM - 6 PM)</option>
                <option>Late Evening (6 PM - 9 PM)</option>
              </select>
            </div>
          </div>

          {/* Query */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Your Query</label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <textarea
                name="query"
                required
                value={formData.query}
                onChange={handleChange}
                rows={4}
                placeholder="How can we help you today?"
                className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen focus:ring-1 focus:ring-primaryGreen transition-all resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primaryGreen hover:bg-opacity-90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primaryGreen/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;