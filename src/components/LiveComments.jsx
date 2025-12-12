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
        <h3 className="text-xl font-bold dark:text-[var(--text-color)]">Comments</h3>
        
        {isAdmin ? (
          <button onClick={handleLogout} className="text-xs text-green-600 font-bold hover:underline">
            🔓 Admin (Logout)
          </button>
        ) : (
          <button onClick={handleAdminLogin} className="text-gray-300 hover:text-blue-500" title="Admin Login">
            🔒
          </button>
        )}
      </div>

      {/* Main Input Form */}
      {!replyingTo && (
        <form onSubmit={handleSubmit} className="mb-8 space-y-2">
           {!isAdmin && (
             <div className="flex gap-2">
               <input
                type="text"
                className="flex-1 p-2 border rounded dark:bg-[var(--background-color)] dark:text-[var(--text-color)]"
                placeholder="Name (Optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                className="flex-1 p-2 border rounded dark:bg-[var(--background-color)] dark:text-[var(--text-color)]"
                placeholder="Email (Optional, for notifications)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
             </div>
           )}
          <textarea
            className="w-full p-2 border rounded dark:bg-[var(--background-color)] dark:text-[var(--text-color)]"
            placeholder={isAdmin ? "Write an official reply..." : "Write a comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {isAdmin ? "Post as Admin" : "Post Comment"}
          </button>
        </form>
      )}

      {/* Comment List */}
      <div className="space-y-3">
        {loading && <p>Loading comments...</p>}
        {!loading && rootComments.length === 0 && <p className="text-gray-500">No comments yet.</p>}
        
        {rootComments.map((comment) => (
          <div key={comment.id} className="group">
            <div className={`p-3 rounded shadow-sm border ${comment.isAdmin ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-[var(--card-color-transparent)]'}`}>
              <div className="flex justify-between items-start">
                <p className="font-bold text-sm text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2">
                  {comment.name || "Guest"}
                  {comment.isAdmin && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full border border-blue-200">
                      Author
                    </span>
                  )}
                </p>
                {isAdmin && (
                  <button 
                    onClick={() => setReplyingTo(comment.id)}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Reply
                  </button>
                )}
              </div>
              <p className="mb-1 text-gray-800 dark:text-[var(--text-color)]">{comment.text}</p>
            </div>

            {getReplies(comment.id).map(reply => (
               <div key={reply.id} className="ml-8 mt-2 p-2.5 rounded border-l-4 border-blue-200 bg-gray-50 dark:bg-[var(--background-color)] dark:border-blue-800">
                  <p className="font-bold text-xs text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2">
                    {reply.name}
                    {reply.isAdmin && <span className="text-blue-600 text-[10px]">● Admin</span>}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-[var(--text-color)]">{reply.text}</p>
               </div>
            ))}

            {replyingTo === comment.id && (
              <div className="ml-8 mt-2">
                <form onSubmit={handleSubmit} className="flex gap-2">
                   <input 
                      autoFocus
                      className="flex-1 p-2 text-sm border rounded dark:bg-[var(--background-color)] dark:text-[var(--text-color)]"
                      placeholder={`Replying to ${comment.name}...`}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                   />
                   <button type="submit" className="px-3 py-1 bg-blue-600 text-white text-sm rounded">Reply</button>
                   <button onClick={() => setReplyingTo(null)} className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded">Cancel</button>
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
