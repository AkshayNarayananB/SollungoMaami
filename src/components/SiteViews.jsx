import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore'; // Changed onSnapshot to getDoc

const SiteViews = () => {
  const [views, setViews] = useState(0);

  useEffect(() => {
    const docRef = doc(db, "analytics", "global");

    const handleViews = async () => {
      // 1. WRITE (Increment) - Only once per session
      const hasCounted = sessionStorage.getItem("viewCounted");
      if (!hasCounted) {
        // Fire and forget (we don't await this because we don't want to block the UI)
        setDoc(docRef, { count: increment(1) }, { merge: true });
        sessionStorage.setItem("viewCounted", "true");
      }

      // 2. READ (Fetch Once) - Replaces onSnapshot
      try {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setViews(snap.data().count || 0);
        }
      } catch (e) {
        console.error("Error fetching views:", e);
      }
    };

    handleViews();

    // No cleanup function needed because we aren't listening permanently
  }, []);

  return (
    <div className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
      <span>Views:</span>
      <span>{views.toLocaleString()}</span>
    </div>
  );
};

export default SiteViews;
