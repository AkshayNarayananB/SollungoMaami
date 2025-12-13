import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const ADMIN_EMAIL = "sollungomaami@gmail.com"; 

const AdminTools = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    slug: '', title: '', description: '', category: 'Recipe', image: '', tags: '', content: ''
  });

  // 1. Check if Admin is Logged In
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tagArray = formData.tags.split(',').map(tag => tag.trim());
      const docRef = doc(db, "blog", formData.slug); // Slug is the ID

      await setDoc(docRef, {
        ...formData,
        tags: tagArray,
        publishedAt: serverTimestamp(),
      }, { merge: true });

      alert("Blog Post Created!");
      setIsModalOpen(false); // Close modal on success
      setFormData({ slug: '', title: '', description: '', category: 'Recipe', image: '', tags: '', content: '' });
    } catch (error) {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  // If not admin, render nothing (invisible)
  if (!isAdmin) return null;

  return (
    <>
      {/* --- THE BUTTON (Visible only to Admin) --- */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
      >
        <span>✍️</span>
        <span className="hidden md:inline">Create Post</span>
      </button>

      {/* --- THE POPUP MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          {/* Scrollable Container */}
          <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold z-10"
            >
              ✕
            </button>

            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 dark:text-white border-b pb-2">Create New Post</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Slugs & Titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 dark:text-gray-400">SLUG (ID)</label>
                    <input name="slug" placeholder="akki-roti-recipe" value={formData.slug} onChange={handleChange} required 
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white font-mono text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 dark:text-gray-400">TITLE</label>
                    <input name="title" placeholder="Akki Roti Recipe" value={formData.title} onChange={handleChange} required 
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input name="category" placeholder="Category (e.g. Recipe)" value={formData.category} onChange={handleChange} 
                    className="p-2 border rounded dark:bg-gray-700 dark:text-white" />
                  <input name="tags" placeholder="Tags (Spicy, Tiffin)" value={formData.tags} onChange={handleChange} 
                    className="p-2 border rounded dark:bg-gray-700 dark:text-white" />
                  <input name="image" placeholder="Image URL" value={formData.image} onChange={handleChange} 
                    className="p-2 border rounded dark:bg-gray-700 dark:text-white" />
                </div>

                {/* Description */}
                <textarea name="description" placeholder="SEO Description" value={formData.description} onChange={handleChange} 
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white h-16 text-sm" />

                {/* Content Editor */}
                <div>
                  <label className="block text-xs font-bold mb-1 dark:text-gray-400">MARKDOWN CONTENT</label>
                  <textarea 
                    name="content" 
                    value={formData.content} 
                    onChange={handleChange}
                    required
                    className="w-full p-4 border rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-900 dark:text-gray-200 h-96 focus:ring-2 focus:ring-amber-400 outline-none"
                    placeholder="# Header&#10;&#10;Your story here..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? "Publishing..." : "🚀 Publish Post"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminTools;
