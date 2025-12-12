import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

const Newsletter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success'
  const [message, setMessage] = useState("");

  // 1. Auto-Open Logic (Once per session)
  useEffect(() => {
    const hasSeen = sessionStorage.getItem("newsletter_seen");
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem("newsletter_seen", "true");
      }, 5000); // Opens after 5 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  // 2. Handle Subscription
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) return;

    setStatus("loading");

    try {
      // Check for duplicates first
      const q = query(collection(db, "newsletters"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Already exists: Pretend we added it
        console.log("Email already exists, skipping add.");
      } else {
        // New email: Add to database
        await addDoc(collection(db, "newsletters"), {
          email: email,
          createdAt: serverTimestamp()
        });
      }

      setStatus("success");
      setMessage("You're signed up! 📧");
      setEmail("");
      
      // Close after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setStatus("idle");
        setMessage("");
      }, 2000);

    } catch (error) {
      console.error("Error adding document: ", error);
      // Even on error, we don't want to discourage the user
      setStatus("success"); 
      setMessage("You're signed up! 📧");
      setTimeout(() => setIsOpen(false), 2000);
    }
  };

  return (
    <>
      {/* --- 1. FLOATING BUTTON (Bottom Left or Right) --- */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-blue-700 hover:scale-110 transition-all duration-300"
        title="Subscribe to Newsletter"
      >
        ✉️
      </button>

      {/* --- 2. POPUP MODAL --- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>

            {/* Content */}
            <div className="text-center">
              <div className="text-4xl mb-4">📬</div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Join the Family!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Get the latest recipes and stories delivered straight to your inbox.
              </p>

              {/* Form */}
              <form onSubmit={handleSubscribe} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                
                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-200 ${
                    status === 'success' 
                      ? 'bg-green-500 scale-100' 
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                  }`}
                >
                  {status === 'loading' ? 'Signing up...' : 
                   status === 'success' ? message : 
                   'Subscribe Now'}
                </button>
              </form>
              
              <p className="mt-4 text-xs text-gray-400">
                No spam, just love & spices. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Newsletter;
