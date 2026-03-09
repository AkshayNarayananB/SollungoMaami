import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const GoogleLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 1. Prepare the subscriber document
      const docRef = doc(db, "newsletters", user.email);
      
      // 2. Add them to the collection if they aren't there, or update if they are
      // Using setDoc with merge: true makes this an "upsert" (Update or Insert)
      await setDoc(docRef, {
        email: user.email,
        displayName: user.displayName,
        joinedAt: serverTimestamp(), // This only stays the same if you use specific logic, but good for tracking
        lastLogin: serverTimestamp(),
        status: "active"
      }, { merge: true });

      // 3. Immediate redirect since they are now definitely in the database
      window.location.href = "/exclusive-content";

    } catch (err) {
      console.error("Auth Error:", err);
      setError("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const triggerNewsletter = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-newsletter'));
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 py-3 px-6 rounded-xl font-bold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95 shadow-sm"
      >
        {loading ? (
          "Granting Access..."
        ) : (
          <>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </>
        )}
      </button>

      <p className="mt-8 text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
        Sign in to join our newsletter and get <br />
        <span className="font-bold text-amber-600 dark:text-amber-400">immediate access</span> to the library.
      </p>
    </div>
  );
};

export default GoogleLogin;
