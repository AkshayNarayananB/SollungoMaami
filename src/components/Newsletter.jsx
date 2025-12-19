import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase'; 
// 1. Added getDoc to imports
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const Newsletter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  // Auto-Open Logic
  useEffect(() => {
    const hasSeen = sessionStorage.getItem("newsletter_seen");
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem("newsletter_seen", "true");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) return;

    setStatus("loading");

    try {
      const docRef = doc(db, "newsletters", email);
      
      // 2. CHECK IF ALREADY SUBSCRIBED
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setStatus("success");
        setMessage("Thanks for your love, you're already subscribed!");
        setEmail("");
        
        // Close modal after delay, but DO NOT send email or update DB
        setTimeout(() => {
          setIsOpen(false);
          setStatus("idle");
          setMessage("");
        }, 3000); // Gave them slightly more time to read this longer message
        return; 
      }

      // 3. IF NEW, PROCEED TO SAVE
      await setDoc(docRef, {
        email: email,
        subscribedAt: serverTimestamp()
      });

      // 4. Trigger Welcome Email
      fetch('/api/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      // 5. Success UI
      setStatus("success");
      setMessage("You're signed up! 🧡");
      setEmail("");
      
      setTimeout(() => {
        setIsOpen(false);
        setStatus("idle");
        setMessage("");
      }, 2500);

    } catch (error) {
      console.error("Error subscribing: ", error);
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-amber-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-amber-600 hover:scale-110 transition-all duration-300"
        title="Subscribe to Newsletter"
      >
        ✉️
      </button>

      {/* Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl p-8 border-2 border-amber-100 dark:border-amber-900/30">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>

            <div className="text-center">
              <div className="text-4xl mb-4">📬</div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Join the Family!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Get the latest recipes and stories delivered straight to your inbox.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-all outline-none"
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
                      : status === 'error'
                      ? 'bg-red-500'
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-95 shadow-md'
                  }`}
                >
                  {status === 'loading' ? 'Signing up...' : 
                   status === 'success' ? message : 
                   status === 'error' ? 'Error' :
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
