import React, { useState, useEffect } from 'react';
import { db, auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth"; 
import { 
  collection, addDoc, query, where, orderBy, onSnapshot, 
  serverTimestamp, doc, setDoc, increment 
} from 'firebase/firestore';

// 🔒 SECURITY: Only this email gets admin powers
const ADMIN_EMAIL = "sollungomaami@gmail.com"; 

const EMOTIONS = [
  { id: 'like', icon: '👍' },
  { id: 'heart', icon: '❤️' },
  { id: 'smile', icon: '😄' }
];

const LiveComments = ({ slug }) => {
  // Comment State
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Emoticon State
  const [reactions, setReactions] = useState({ like: 0, heart: 0, smile: 0 });

  // Admin State
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  // 1. SESSION PERSISTENCE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        setUser(currentUser);
        setIsAdmin(true);
        setName("Sollungo Maami");
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Listen for Comments
  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("slug", "==", slug),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(liveData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [slug]);

  // 3. Listen for Page Reactions
  useEffect(() => {
    const docRef = doc(db, "emoticons", slug);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setReactions(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, [slug]);

  const handleEmoteClick = async (type) => {
    const docRef = doc(db, "emoticons", slug);
    await setDoc(docRef, { [type]: increment(1) }, { merge: true });
  };

  // Handle Google Login (Manual Click)
  const handleAdminLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email === ADMIN_EMAIL) {
        // State updates handled by onAuthStateChanged automatically
      } else {
        await signOut(auth);
        alert("Access Denied.");
      }
    } catch (error) { console.error(error); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setName("");
  };

  // Submit Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const guestName = name.trim() || "Guest";

    // A. Add to Firebase DIRECTLY
    await addDoc(collection(db, "comments"), {
      slug: slug,
      text: newComment,
      name: guestName,
      email: email.trim(), 
      createdAt: serverTimestamp(),
      isAdmin: isAdmin,
      replyTo: replyingTo
    });

    // B. EMAIL LOGIC (Client Side Fetch)
    const currentPageLink = window.location.href;

    if (isAdmin && replyingTo) {
      const parentComment = comments.find(c => c.id === replyingTo);
      if (parentComment && parentComment.email) {
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'reply',        
            to: parentComment.email,
            link: currentPageLink,
            message: newComment
          })
        }).catch(err => console.error("Failed to notify user", err));
      }
    }

    if (!isAdmin) {
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_comment',    
          name: guestName,
          link: currentPageLink,
          message: newComment
        })
      }).catch(err => console.error("Failed to notify admin", err));
    }
    
    setNewComment("");
    setReplyingTo(null);
  };

  const rootComments = comments.filter(c => !c.replyTo);
  const getReplies = (parentId) => comments.filter(c => c.replyTo === parentId).sort((a,b) => a.createdAt - b.createdAt);

  return (
    <div className="p-3 bg-gray-50 rounded-lg mt-8 dark:bg-[var(--card-color)]">
      
      {/* PAGE REACTIONS */}
      <div className="flex justify-center items-center gap-8 mb-8 mt-2">
        {EMOTIONS.map((emote) => (
          <button
            key={emote.id}
            onClick={() => handleEmoteClick(emote.id)}
            className="relative group w-14 h-14 bg-white dark:bg-[var(--background-color)] rounded-full shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-amber-200 active:scale-95"
          >
            {emote.icon}
            {(reactions[emote.id] || 0) > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm ring-2 ring-white dark:ring-[#1e1e1e]">
                {reactions[emote.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ... Rest of the UI (Header, Form, List) is identical ... */}
      {/* I am omitting the JSX below because it is purely visual and identical to the new version */}
      <div className="flex justify-between items-center mb-3">
         {/* ... */}
      </div>
      
      {/* Input Form */}
      {!replyingTo && (
         <form onSubmit={handleSubmit} className="mb-4 space-y-2">
            {/* ... */}
         </form>
      )}
      
      {/* Comment List */}
      <div className="space-y-2">
         {rootComments.map((comment) => (
             // ...
             <div key={comment.id} className="group">
                 {/* ... */}
             </div>
         ))}
      </div>
    </div>
  );
};

export default LiveComments;
