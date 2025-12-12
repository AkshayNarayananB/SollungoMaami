import React, { useState, useEffect } from 'react';
import { db, auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut } from "firebase/auth";
import { 
  collection, addDoc, query, where, orderBy, onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';

// 🔒 SECURITY: Only this email gets admin powers
const ADMIN_EMAIL = "sollungomaami@gmail.com"; 

const LiveComments = ({ slug }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Admin State
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  // Listen for Live Updates
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

  // Handle Google Login
  const handleAdminLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email === ADMIN_EMAIL) {
        setUser(result.user);
        setIsAdmin(true);
        setName("Sollungo Maami"); 
      } else {
        await signOut(auth);
        alert("Access Denied.");
        setIsAdmin(false);
      }
    } catch (error) { console.error(error); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
    setName("");
  };

  // 2. Submit Logic (Handles Both Email Scenarios)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const guestName = name.trim() || "Guest";

    // A. Add to Firebase
    await addDoc(collection(db, "comments"), {
      slug: slug,
      text: newComment,
      name: guestName,
      email: email.trim(), 
      createdAt: serverTimestamp(),
      isAdmin: isAdmin,
      replyTo: replyingTo
    });

    // B. EMAIL LOGIC
    const currentPageLink = window.location.href;

    // SCENARIO 1: You (Admin) are replying -> Email the Guest
    if (isAdmin && replyingTo) {
      const parentComment = comments.find(c => c.id === replyingTo);
      if (parentComment && parentComment.email) {
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'reply',          // Tell API this is a reply
            to: parentComment.email,
            link: currentPageLink,
            message: newComment
          })
        }).catch(err => console.error("Failed to notify user", err));
      }
    }

    // SCENARIO 2: A Guest is commenting -> Email YOU (Admin)
    if (!isAdmin) {
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_comment',    // Tell API this is a new comment for you
          name: guestName,
          link: currentPageLink,
          message: newComment
        })
      }).catch(err => console.error("Failed to notify admin", err));
    }
    
    setNewComment("");
    setReplyingTo(null);
  };

  // Helper filters
  const rootComments = comments.filter(c => !c.replyTo);
  const getReplies = (parentId) => comments.filter(c => c.replyTo === parentId).sort((a,b) => a.createdAt - b.createdAt);

  return (
    <div className="p-3 bg-gray-50 rounded-lg mt-8 dark:bg-[var(--card-color)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold dark:text-[var(--text-color)]"> Comments</h3>
        
        {isAdmin ? (
          <button onClick={handleLogout} className="text-xs text-amber-600 font-bold hover:underline">
            🔓 Admin (Logout)
          </button>
        ) : (
          <button onClick={handleAdminLogin} className="text-gray-300 hover:text-amber-500" title="Admin Login">
            🔒
          </button>
        )}
      </div>
    
      {/* Main Input Form */}
      {!replyingTo && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-2">
          {!isAdmin && (
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent dark:bg-[var(--background-color)] dark:text-[var(--text-color)] dark:border-gray-600"
                placeholder="Name (Optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent dark:bg-[var(--background-color)] dark:text-[var(--text-color)] dark:border-gray-600"
                placeholder="Email (Optional, for notifications)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}
          <textarea
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent dark:bg-[var(--background-color)] dark:text-[var(--text-color)] dark:border-gray-600 min-h-[80px]"
            placeholder={isAdmin ? "Write an official reply..." : "Write a comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold text-sm rounded-lg hover:from-yellow-500 hover:to-orange-600 shadow-md transition-all duration-200"
          >
            {isAdmin ? "✍️ Post as Admin" : "💬 Post Comment"}
          </button>
        </form>
      )}
    
      {/* Comment List */}
      <div className="space-y-2.5">
        {loading && <p className="text-sm text-gray-500">Loading comments...</p>}
        {!loading && rootComments.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first to comment! 💭</p>
        )}
        
        {rootComments.map((comment) => (
          <div key={comment.id} className="group">
            <div className={`px-3 py-2 rounded-lg shadow-sm border transition-all duration-200 ${
              comment.isAdmin 
                ? 'border-amber-300 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-700' 
                : 'bg-white border-gray-200 hover:border-amber-200 dark:bg-[var(--card-color-transparent)] dark:border-gray-700 dark:hover:border-amber-800'
            }`}>
              <div className="flex justify-between items-start mb-0.7">
                <p className="font-semibold text-sm flex items-center gap-2">
                  <span className={comment.isAdmin ? 'text-amber-700 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}>
                    {comment.name || "Guest"}
                  </span>
                  {comment.isAdmin && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      ✨ AUTHOR
                    </span>
                  )}
                </p>
                {isAdmin && (
                  <button 
                    onClick={() => setReplyingTo(comment.id)}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium hover:underline"
                  >
                    Reply ↩️
                  </button>
                )}
              </div>
              <p className="text-sm leading-relaxed text-gray-800 dark:text-[var(--text-color)]">
                {comment.text}
              </p>
            </div>
    
            {/* Replies */}
            {getReplies(comment.id).map(reply => (
              <div 
                key={reply.id} 
                className="ml-6 md:ml-8 mt-2 px-3 py-1.5 rounded-lg border-l-4 border-amber-400 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-600 shadow-sm"
              >
                <p className="font-semibold text-xs flex items-center gap-1.5 mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{reply.name}</span>
                  {reply.isAdmin && (
                    <span className="text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                      ⭐ Admin
                    </span>
                  )}
                </p>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-[var(--text-color)]">
                  {reply.text}
                </p>
              </div>
            ))}
    
            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="ml-6 md:ml-8 mt-2 p-2.5 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                  <input 
                    autoFocus
                    className="flex-1 px-3 py-1.5 text-sm border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent dark:bg-[var(--background-color)] dark:text-[var(--text-color)] dark:border-amber-700"
                    placeholder={`Replying to ${comment.name}...`}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button 
                      type="submit" 
                      className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-600 shadow-sm"
                    >
                      Send ✉️
                    </button>
                    <button 
                      onClick={() => setReplyingTo(null)} 
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveComments;
