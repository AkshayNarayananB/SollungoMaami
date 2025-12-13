import React, { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from "firebase/auth";

const ADMIN_EMAIL = "sollungomaami@gmail.com"; 

const AdminTools = () => {
  const [isAdmin, setIsAdmin] = useState(false);

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

  if (!isAdmin) return null;

  return (
    <a 
      href="/admin/create"
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform no-underline"
    >
      <span>✍️</span>
      <span className="hidden md:inline">Create</span>
    </a>
  );
};

export default AdminTools;
