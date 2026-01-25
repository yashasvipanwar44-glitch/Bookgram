import React, { useState, useEffect } from 'react';
import { User, ForumPost, ForumReply } from '../types';
import { MessageSquare, Heart, Share2, Send, Plus, Search, User as UserIcon, X, Copy, Facebook, Twitter, MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CommunityProps {
  user: User | null;
}

const CATEGORIES = [
  'All',
  'Competitive Exams',
  'College Subjects',
  'Book Reviews',
  'Study Tips',
  'Exam Guidance',
  'Recommendations'
];

const TRENDING_TAGS = ['#JEE2024', '#NEETPREP', '#UPSC2025', '#PYTHONNOTES', '#BOOKCLUB'];

const Community: React.FC<CommunityProps> = ({ user }) => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [replyText, setReplyText] = useState<{[key: string]: string}>({});
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  
  // Share Modal State
  const [sharePost, setSharePost] = useState<ForumPost | null>(null);

  // New Post Form State
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState(CATEGORIES[1]);
  const [isPosting, setIsPosting] = useState(false);

  // Fetch Posts from Supabase
  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          forum_replies (*)
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      if (postsData) {
        const mappedPosts: ForumPost[] = postsData.map((p: any) => ({
          id: p.id,
          authorId: p.author_id,
          authorName: p.author_name || 'Anonymous',
          title: p.title,
          content: p.content,
          category: p.category,
          likedBy: p.liked_by || [],
          tags: p.tags || [],
          timestamp: new Date(p.created_at).toLocaleDateString(),
          replies: (p.forum_replies || []).map((r: any) => ({
             id: r.id,
             postId: r.post_id,
             authorId: r.author_id,
             authorName: r.author_name || 'Anonymous',
             content: r.content,
             likedBy: r.liked_by || [],
             timestamp: new Date(r.created_at).toLocaleDateString()
          }))
        }));
        setPosts(mappedPosts);
      }
    } catch (error) {
      console.error("Error fetching community posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const handleLikePost = async (postId: string) => {
    if (!user) {
      alert("Please login to like posts.");
      return;
    }

    const postToUpdate = posts.find(p => p.id === postId);
    if (!postToUpdate) return;

    const isLiked = postToUpdate.likedBy.includes(user.id);
    const newLikedBy = isLiked
      ? postToUpdate.likedBy.filter(id => id !== user.id)
      : [...postToUpdate.likedBy, user.id];

    // Optimistic Update
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likedBy: newLikedBy } : post
    ));

    // DB Update
    await supabase
      .from('forum_posts')
      .update({ liked_by: newLikedBy })
      .eq('id', postId);
  };

  const handleLikeReply = async (postId: string, replyId: string) => {
    if (!user) {
      alert("Please login to like replies.");
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const reply = post.replies.find(r => r.id === replyId);
    if (!reply) return;

    const isLiked = reply.likedBy.includes(user.id);
    const newLikedBy = isLiked
      ? reply.likedBy.filter(id => id !== user.id)
      : [...reply.likedBy, user.id];

    // Optimistic Update
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          replies: p.replies.map(r => r.id === replyId ? { ...r, likedBy: newLikedBy } : r)
        };
      }
      return p;
    }));

    // DB Update
    await supabase
      .from('forum_replies')
      .update({ liked_by: newLikedBy })
      .eq('id', replyId);
  };

  const executeShare = (platform: string) => {
    if (!sharePost) return;
    
    const text = `Check out "${sharePost.title}" on Bookgram!\n${sharePost.content.substring(0, 100)}...`;
    const url = "https://bookgram.demo/post/" + sharePost.id; // Demo URL
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedText} ${encodedUrl}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
        break;
      case 'x':
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
        break;
      case 'message':
        window.location.href = `sms:?body=${encodedText} ${encodedUrl}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(`${text}\n${url}`);
        alert('Copied to clipboard!');
        break;
    }
    setSharePost(null);
  };

  const handleSubmitReply = async (postId: string) => {
    if (!user) {
      alert("Please login to reply.");
      return;
    }
    const text = replyText[postId];
    if (!text?.trim()) return;

    // Insert into DB
    const { data, error } = await supabase.from('forum_replies').insert([{
      post_id: postId,
      author_id: user.id,
      author_name: user.name,
      content: text,
      liked_by: []
    }]).select().single();

    if (error) {
      console.error("Error submitting reply:", error);
      return;
    }

    if (data) {
       const newReply: ForumReply = {
         id: data.id,
         postId: postId,
         authorId: user.id,
         authorName: user.name,
         content: text,
         likedBy: [],
         timestamp: 'Just now'
       };

       setPosts(posts.map(post => 
         post.id === postId ? { ...post, replies: [...post.replies, newReply] } : post
       ));
       setReplyText({ ...replyText, [postId]: '' });
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to post a question.");
      return;
    }
    setIsPosting(true);

    try {
      const { data, error } = await supabase.from('forum_posts').insert([{
        author_id: user.id,
        author_name: user.name,
        title: newPostTitle,
        content: newPostContent,
        category: newPostCategory,
        liked_by: [],
        tags: [] 
      }]).select().single();

      if (error) throw error;

      if (data) {
        const newPost: ForumPost = {
          id: data.id,
          authorId: user.id,
          authorName: user.name,
          title: newPostTitle,
          content: newPostContent,
          category: newPostCategory,
          likedBy: [],
          replies: [],
          timestamp: 'Just now',
          tags: []
        };
        setPosts([newPost, ...posts]);
        setIsAskModalOpen(false);
        setNewPostTitle('');
        setNewPostContent('');
        setSelectedCategory('All');
      }
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to post question.");
    } finally {
      setIsPosting(false);
    }
  };

  if (loading) {
    return (
       <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-primaryGreen" size={48} />
       </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 pb-12">
      {/* Sidebar Categories */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-24">
          <h3 className="text-xl font-serif font-bold mb-4 text-gray-800 dark:text-cream px-2">Categories</h3>
          <div className="space-y-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primaryGreen text-white shadow-lg shadow-primaryGreen/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Feed */}
      <div className="flex-grow space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-cream">Community Forum</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Ask questions, share notes, and connect with fellow students.</p>
          </div>
          <button
            onClick={() => {
              if (user) setIsAskModalOpen(true);
              else alert("Please login to ask a question.");
            }}
            className="bg-primaryGreen text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primaryGreen/20 hover:scale-105 transition-transform flex items-center gap-2 w-fit"
          >
            <Plus size={20} /> Ask Question
          </button>
        </div>

        {/* Trending Tags Banner */}
        <div className="bg-[#3d2b2b] dark:bg-[#2a1f1f] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
           <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
           <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
             Trending #Tags
           </h3>
           <div className="flex flex-wrap gap-2">
             {TRENDING_TAGS.map(tag => (
               <span key={tag} className="bg-white/10 hover:bg-white/20 cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm transition-colors border border-white/5">
                 {tag}
               </span>
             ))}
           </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
             <div className="text-center py-10 text-gray-500">No posts in this category yet.</div>
          ) : (
            filteredPosts.map(post => {
              const isLiked = user ? post.likedBy.includes(user.id) : false;

              return (
                <div key={post.id} className="bg-white dark:bg-bgDarker rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-white/5 transition-all hover:border-primaryGreen/30">
                  
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center">
                        <UserIcon size={20} className="text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-cream">{post.authorName}</h4>
                        <p className="text-xs text-gray-500">{post.timestamp} • {post.category}</p>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{post.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                      {post.content}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs text-primaryGreen bg-primaryGreen/10 px-2 py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-6 border-t border-gray-100 dark:border-white/5 pt-4">
                    <button 
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-2 transition-colors text-sm font-medium group ${
                        isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart size={18} className={isLiked ? 'fill-current' : 'group-hover:fill-current'} /> 
                      {post.likedBy.length}
                    </button>
                    <button 
                      onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                      className={`flex items-center gap-2 transition-colors text-sm font-medium ${expandedPostId === post.id ? 'text-primaryGreen' : 'text-gray-500 dark:text-gray-400 hover:text-primaryGreen'}`}
                    >
                      <MessageSquare size={18} /> {post.replies.length} Answers
                    </button>
                    <button 
                      onClick={() => setSharePost(post)}
                      className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors text-sm font-medium ml-auto"
                    >
                      <Share2 size={18} /> Share
                    </button>
                  </div>

                  {/* Expanded Replies Section */}
                  {expandedPostId === post.id && (
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 animate-in slide-in-from-top-2 duration-200">
                      {/* Existing Replies */}
                      <div className="space-y-4 mb-6 pl-4 border-l-2 border-gray-100 dark:border-white/5">
                        {post.replies.length === 0 ? (
                          <p className="text-sm text-gray-400 italic">No answers yet. Be the first!</p>
                        ) : (
                          post.replies.map(reply => {
                            const isReplyLiked = user ? reply.likedBy.includes(user.id) : false;
                            
                            return (
                              <div key={reply.id} className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                      <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{reply.authorName}</span>
                                      <span className="text-xs text-gray-500">• {reply.timestamp}</span>
                                  </div>
                                  <button 
                                    onClick={() => handleLikeReply(post.id, reply.id)} 
                                    className={`text-xs flex items-center gap-1 transition-colors ${
                                      isReplyLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                    }`}
                                  >
                                    <Heart size={12} className={isReplyLiked ? 'fill-current' : ''} /> 
                                    {reply.likedBy.length}
                                  </button>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{reply.content}</p>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Add Reply Input */}
                      <div className="relative">
                        <input
                          type="text"
                          value={replyText[post.id] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [post.id]: e.target.value })}
                          placeholder="Write an answer..."
                          className="w-full bg-gray-100 dark:bg-bgDark text-sm px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-primaryGreen/50 dark:text-cream pr-12"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSubmitReply(post.id);
                          }}
                        />
                        <button 
                          onClick={() => handleSubmitReply(post.id)}
                          className="absolute right-2 top-2 p-1.5 bg-primaryGreen text-white rounded-lg hover:bg-opacity-90 transition-all"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Ask Question Modal */}
      {isAskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-bgDark w-full max-w-lg rounded-3xl p-8 relative shadow-2xl border border-gray-200 dark:border-primaryGreen/30 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsAskModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-cream transition-colors"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-serif font-bold mb-6 text-gray-900 dark:text-cream">Ask the Community</h2>
            
            <form onSubmit={handleSubmitQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="e.g., Best organic chemistry book?"
                  className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen appearance-none"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  required
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={4}
                  placeholder="Elaborate on your question..."
                  className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPosting}
                className="w-full bg-primaryGreen hover:bg-opacity-90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primaryGreen/20 transition-all mt-2 flex justify-center items-center gap-2"
              >
                {isPosting && <Loader2 className="animate-spin" size={20} />}
                Post Question
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {sharePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-bgDark w-full max-w-sm rounded-3xl p-6 relative shadow-2xl border border-gray-200 dark:border-primaryGreen/30">
            <button 
              onClick={() => setSharePost(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-cream transition-colors"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-serif font-bold mb-6 text-gray-900 dark:text-cream text-center">Share this Post</h3>
            
            <div className="grid grid-cols-4 gap-4 mb-4">
              <button onClick={() => executeShare('whatsapp')} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <MessageCircle size={24} />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">WhatsApp</span>
              </button>

              <button onClick={() => executeShare('facebook')} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Facebook size={24} />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Facebook</span>
              </button>

              <button onClick={() => executeShare('x')} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Twitter size={24} />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">X</span>
              </button>

              <button onClick={() => executeShare('message')} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <MessageSquare size={24} />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Message</span>
              </button>
            </div>

            <button 
              onClick={() => executeShare('copy')}
              className="w-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-800 dark:text-cream font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Copy size={18} /> Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;