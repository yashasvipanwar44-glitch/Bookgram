import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot } from 'lucide-react';
import { getBookRecommendation } from '../services/geminiService';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const AIHelper: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm your Bookgram AI curator. Tell me what you're interested in learning or reading today?", sender: 'ai' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await getBookRecommendation(userMsg.text);
      const aiMsg: Message = { id: Date.now() + 1, text: responseText, sender: 'ai' };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = { id: Date.now() + 1, text: "Something went wrong. Please try again.", sender: 'ai' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[600px] flex flex-col bg-white dark:bg-bgDarker rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-primaryGreen/20">
      {/* Header */}
      <div className="p-6 bg-cream dark:bg-bgDark border-b border-gray-200 dark:border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primaryGreen flex items-center justify-center text-white">
          <Sparkles size={20} />
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-gray-800 dark:text-cream">AI Curator</h2>
          <p className="text-xs text-primaryGreen font-medium">Powered by Gemini</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-bgDarker/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-primaryGreen text-white rounded-br-none'
                  : 'bg-white dark:bg-bgDark border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-bl-none'
              }`}
            >
              {msg.sender === 'ai' && <Bot size={16} className="mb-2 text-primaryGreen" />}
              <div className="markdown-body text-sm leading-relaxed whitespace-pre-wrap">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-bgDark p-4 rounded-2xl rounded-bl-none border border-gray-200 dark:border-white/10 flex items-center gap-2">
               <div className="w-2 h-2 bg-primaryGreen rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
               <div className="w-2 h-2 bg-primaryGreen rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
               <div className="w-2 h-2 bg-primaryGreen rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-bgDark border-t border-gray-200 dark:border-white/5">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for a book recommendation..."
            className="w-full bg-gray-100 dark:bg-bgDarker text-gray-900 dark:text-cream rounded-xl pl-4 pr-12 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primaryGreen/50 h-14"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-2 p-2 bg-primaryGreen text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIHelper;
