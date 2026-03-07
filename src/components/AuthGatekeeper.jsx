import React, { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthGatekeeper = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Auth changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // No user logged in? Go to login.
        window.location.href = "/login";
        return;
      }

      // User exists, but are they a subscriber?
      try {
        const docRef = doc(db, "newsletters", user.email);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          // Not in the newsletter list? Kick them out.
          await auth.signOut();
          window.location.href = "/login?error=not_subscribed";
        } else {
          // Success! Stop the loading state and show the content.
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth Check Error:", err);
        window.location.href = "/login";
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-[#121212] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-amber-600 font-medium animate-pulse">Verifying Membership...</p>
        </div>
      </div>
    );
  }

  return null; // Renders nothing once authorized
};

export default AuthGatekeeper;
