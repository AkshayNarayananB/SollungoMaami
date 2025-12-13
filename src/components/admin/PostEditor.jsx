import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const ADMIN_EMAIL = "sollungomaami@gmail.com"; 

const PostEditor = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    slug: '', title: '', description: '', category: 'Recipe', image: '', tags: '', content: ''
  });

  // 1. Check Login Status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Login Function
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      alert(e.message);
    }
  };

  // 3. Form Handlers
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const safeSlug = formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const tagArray = formData.tags.split(',').map(tag => tag.trim());

      await setDoc(doc(db, "blog", safeSlug), {
        ...formData,
        slug: safeSlug,
        tags: tagArray,
        publishedAt: serverTimestamp(),
        author: user.displayName || "Sollungo Maami",
      }, { merge: true });

      alert("✅ Published!");
      window.location.href = `/posts/${safeSlug}`;
    } catch (error) {
      alert("Error: " + error.message);
    }
    setSubmitting(false);
  };

  // --- RENDERING ---

  // A. Loading State
  if (loading) return <div className="p-10 text-center">Loading...</div>;

  // B. Not Logged In -> Show Login Button
  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Admin Access</h2>
        <button 
          onClick={handleLogin}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // C. Logged In BUT Wrong Email -> Access Denied
  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-red-100 dark:bg-red-900 rounded-xl text-center">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-200">⛔ Access Denied</h2>
        <p className="mt-2 text-gray-700 dark:text-gray-300">You are logged in as {user.email}, but you are not the admin.</p>
      </div>
    );
  }

  // D. Admin Logged In -> Show Editor
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700">
      <h1 className="text-3xl font-bold mb-6 dark:text-white border-b pb-4">New Blog Post</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input name="slug" placeholder="slug-id" value={formData.slug} onChange={handleChange} required className="input-field" />
          <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required className="input-field" />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <input name="category" placeholder="Category" value={formData.category} onChange={handleChange} className="input-field" />
          <input name="tags" placeholder="Tags" value={formData.tags} onChange={handleChange} className="input-field" />
          <input name="image" placeholder="Image URL" value={formData.image} onChange={handleChange} className="input-field" />
        </div>

        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="input-field h-24" />
        
        <textarea 
          name="content" 
          value={formData.content} 
          onChange={handleChange} 
          required 
          placeholder="# Markdown Content" 
          className="input-field h-96 font-mono" 
        />

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition"
        >
          {submitting ? "Publishing..." : "Publish Post"}
        </button>
      </form>

      {/* Internal CSS for inputs to keep code short */}
      <style jsx>{`
        .input-field {
          @apply w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-green-500;
        }
      `}</style>
    </div>
  );
};

export default PostEditor;
