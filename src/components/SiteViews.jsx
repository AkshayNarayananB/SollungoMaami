import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, increment } from 'firebase/firestore';

const SiteViews = () => {
  const [views, setViews] = useState(0);

  useEffect(() => {
    const docRef = doc(db, "analytics", "global");

    //Once per session
    const hasCounted = sessionStorage.getItem("viewCounted");
    if (!hasCounted) {
      setDoc(docRef, { count: increment(1) }, { merge: true });
      sessionStorage.setItem("viewCounted", "true");
    }

    //live count
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setViews(docSnap.data().count || 0);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
      <span>Views:</span>
      <span>{views.toLocaleString()}</span>
    </div>
  );
};

export default SiteViews;
