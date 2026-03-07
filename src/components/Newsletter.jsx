import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const Newsletter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

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

    // Inside your Newsletter component...
  useEffect(() => {
    const handleOpenEvent = () => setIsOpen(true);
    
    // Listen for the custom "open-newsletter" event
    window.addEventListener('open-newsletter', handleOpenEvent);
    
    return () => window.removeEventListener('open-newsletter', handleOpenEvent);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) return;

    setStatus("loading");

    try {
      const docRef = doc(db, "newsletters", email);
      await setDoc(docRef, {
        email: email,
        subscribedAt: serverTimestamp()
      });

      fetch('/api/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      setStatus("success");
      setMessage("You're signed up! 🧡");
      setEmail("");
      
      setTimeout(() => {
        setIsOpen(false);
        setStatus("idle");
        setMessage("");
      }, 2500);

    } catch (error) {
      console.log("Subscription blocked:", error);
      setStatus("success"); 
      setMessage("Thanks for your love, you're already subscribed! 🧡");
      setEmail("");

      setTimeout(() => {
        setIsOpen(false);
        setStatus("idle");
        setMessage("");
      }, 3000);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-amber-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-amber-600 hover:scale-110 transition-all duration-300"
        title="Subscribe to Newsletter"
      >
        ✉️
      </button>

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
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-95 shadow-md'
                  }`}
                >
                  {status === 'loading' ? 'Signing up...' : 
                   status === 'success' ? message : 
                   'Subscribe Now'}
                </button>
              </form>
              
              <p className="mt-4 text-xs text-gray-400 italic">
                No spam, just love & spices. Unsubscribe anytime.
              </p>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already a subscriber?{" "}
                  <a 
                    href="/login" 
                    // --- THE FIX ---
                    onClick={() => setIsOpen(false)}
                    className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
                  >
                    Log in
                  </a>{" "}
                  for access to exclusive content.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Newsletter;
