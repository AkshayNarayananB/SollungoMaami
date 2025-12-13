import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const ADMIN_EMAIL = "sollungomaami@gmail.com"; 

const PostEditor = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    slug: '', title: '', description: '', category: 'Recipe', image: '', tags: '', content: ''
  });

  // 1. Check Auth State
  useEffect(() => {
    console.log("PostEditor: Checking Auth...");
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("PostEditor: User found:", currentUser?.email);
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Login Function
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert("Login Failed: " + error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Basic slug validation
      const safeSlug = formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const tagArray = formData.tags.split(',').map(tag => tag.trim());
      
      const docRef = doc(db, "blog", safeSlug); 

      await setDoc(docRef, {
        ...formData,
        slug: safeSlug, // Ensure slug is saved
        tags: tagArray,
        publishedAt: serverTimestamp(),
        author: user.displayName || "Sollungo Maami",
        authorEmail: user.email 
      }, { merge: true });

      alert("✅ Published! Redirecting to post...");
      window.location.href = `/posts/${safeSlug}`;
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    }
    setSubmitting(false);
  };

  // --- RENDER STATES ---

  // 1. Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        <p className="mt-4 text-gray-500">Checking permissions...</p>
      </div>
    );
  }

  // 2. Not Logged In -> Show Login Button
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center px-4">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Admin Access Required</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">You must be logged in to create posts.</p>
        <button 
          onClick={handleLogin}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // 3. Logged In BUT Not Admin
  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center px-4">
        <h2 className="text-2xl font-bold text-red-500 mb-2">⛔ Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Logged in as <strong>{user.email}</strong>.<br/>
          This account is not authorized to post.
        </p>
      </div>
    );
  }

  // 4. Authorized Admin -> Show Editor
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg my-10 border dark:border-gray-700">
      <div className="flex justify-between items-center mb-8 border-b pb-4 dark:border-gray-700">
        <h1 className="text-3xl font-bold dark:text-white">Write New Post</h1>
        <span className="text-xs font-mono bg-green-100 text-green-800 px-2 py-1 rounded-full">
          Admin: {user.displayName}
        </span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold mb-2 dark:text-gray-300">URL Slug (ID)</label>
            <input name="slug" placeholder="my-new-recipe" value={formData.slug} onChange={handleChange} required 
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white font-mono text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 dark:text-gray-300">Title</label>
            <input name="title" placeholder="Post Title" value={formData.title} onChange={handleChange} required 
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold mb-1 dark:text-gray-400">Category</label>
            <input name="category" placeholder="Recipe" value={formData.category} onChange={handleChange} 
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 dark:text-gray-400">Tags</label>
            <input name="tags" placeholder="Spicy, Tiffin" value={formData.tags} onChange={handleChange} 
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 dark:text-gray-400">Cover Image URL</label>
            <input name="image" placeholder="https://..." value={formData.image} onChange={handleChange} 
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold mb-2 dark:text-gray-300">Short Description</label>
          <textarea name="description" placeholder="SEO Description..." value={formData.description} onChange={handleChange} 
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white h-20 text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-bold mb-2 dark:text-gray-300">Markdown Content</label>
          <textarea 
            name="content" 
            value={formData.content} 
            onChange={handleChange}
            required
            className="w-full p-6 border rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-900 dark:text-gray-200 h-[500px] focus:ring-2 focus:ring-amber-500 outline-none resize-y"
            placeholder="# Introduction&#10;&#10;Write your post content here..."
          />
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg rounded-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:scale-100"
        >
          {submitting ? "Publishing..." : "🚀 Publish Live"}
        </button>
      </form>
    </div>
  );
};

export default PostEditor;
