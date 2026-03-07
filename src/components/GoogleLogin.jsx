import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const GoogleLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      // 1. Authenticate with Google
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      // 2. Check if email exists in 'newsletters' collection
      const docRef = doc(db, "newsletters", email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Success! Redirect to the private page
        window.location.href = "/exclusive-content";
      } else {
        // Not a subscriber
        setError("Access Denied: You must be a newsletter subscriber to enter.");
        await auth.signOut(); // Log them out since they aren't authorized
      }
    } catch (err) {
      console.error(err);
      setError("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
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
          "Checking..."
        ) : (
          <>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </>
        )}
      </button>
    </div>
  );
};

export default GoogleLogin;
