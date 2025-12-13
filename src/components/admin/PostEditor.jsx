import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const ADMIN_EMAIL = "sollungomaami@gmail.com"; 

const PostEditor = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // Start loading while checking auth
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    slug: '', title: '', description: '', category: 'Recipe', image: '', tags: '', content: ''
  });

  // 1. Auth Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      if (user && user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        // Optional: Redirect non-admins home
        // window.location.href = "/";
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const tagArray = formData.tags.split(',').map(tag => tag.trim());
      const docRef = doc(db, "blog", formData.slug); 

      await setDoc(docRef, {
        ...formData,
        tags: tagArray,
        publishedAt: serverTimestamp(),
      }, { merge: true });

      alert("✅ Published! Redirecting...");
      window.location.href = `/posts/${formData.slug}`; // Go to new post
    } catch (error) {
      alert("Error: " + error.message);
    }
    setSubmitting(false);
  };

  if (loading) return <div className="p-10 text-center">Checking permissions...</div>;
  if (!isAdmin) return <div className="p-10 text-center text-red-500 font-bold">⛔ Access Denied</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg my-10">
      <h1 className="text-3xl font-bold mb-8 dark:text-white border-b pb-4">Write New Post</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold mb-2 dark:text-gray-300">URL Slug (ID)</label>
            <input name="slug" placeholder="my-new-post" value={formData.slug} onChange={handleChange} required 
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 dark:text-gray-300">Title</label>
            <input name="title" placeholder="Post Title" value={formData.title} onChange={handleChange} required 
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input name="category" placeholder="Category" value={formData.category} onChange={handleChange} 
            className="p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
          <input name="tags" placeholder="Tags (comma separated)" value={formData.tags} onChange={handleChange} 
            className="p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
          <input name="image" placeholder="Image URL" value={formData.image} onChange={handleChange} 
            className="p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
        </div>

        {/* Description */}
        <textarea name="description" placeholder="Short description for SEO..." value={formData.description} onChange={handleChange} 
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white h-24" />

        {/* Content */}
        <div>
          <label className="block text-sm font-bold mb-2 dark:text-gray-300">Markdown Content</label>
          <textarea 
            name="content" 
            value={formData.content} 
            onChange={handleChange}
            required
            className="w-full p-6 border rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-900 dark:text-gray-200 h-[600px] focus:ring-2 focus:ring-amber-500 outline-none"
            placeholder="# Start writing..."
          />
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg rounded-lg hover:shadow-xl disabled:opacity-50 transition-all"
        >
          {submitting ? "Publishing..." : "🚀 Publish Live"}
        </button>
      </form>
    </div>
  );
};

export default PostEditor;
