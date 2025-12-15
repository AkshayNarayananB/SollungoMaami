// A simple global variable on the server
let categoryCache: any = null;
let lastFetch = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 Hour

import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function getCachedCategories() {
  const now = Date.now();

  // If we have data and it's fresh, use it
  if (categoryCache && (now - lastFetch < CACHE_DURATION)) {
    return categoryCache;
  }

  // Otherwise, fetch from Firebase
  console.log("Fetching Categories from Firestore (Server-Side)...");
  const snapshot = await getDocs(collection(db, "blog"));
  
  // Process your data here...
  const data = snapshot.docs.map(doc => doc.data());
  
  // Save to memory
  categoryCache = data;
  lastFetch = now;
  
  return data;
}
