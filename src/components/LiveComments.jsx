import React, { useState, useEffect } from 'react';
// 1. Import auth tools
import { db, auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut } from "firebase/auth";
import { 
  collection, addDoc, query, where, orderBy, onSnapshot, 
  updateDoc, doc, increment, serverTimestamp 
} from 'firebase/firestore';

const EMOTES = { thumbsUp: "👍", smile: "😄", heart: "❤️" };

// 🔒 SECURITY: Only this email gets admin powers
const ADMIN_EMAIL = "sollungomaami@gmail.com"; 

const LiveComments = ({ slug }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  // Admin State
  const [user, setUser] = useState(null); // Holds the logged-in user object
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

  // 2. Handle Google Login
  const handleAdminLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      
      if (email === ADMIN_EMAIL) {
        setUser(result.user);
        setIsAdmin(true);
        setName("Sollungo Maami"); // Auto-set admin name
      } else {
        await signOut(auth); // Kick them out immediately
        alert("Access Denied: You are not the admin.");
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
    setName("");
  };

  // Submit Comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await addDoc(collection(db, "comments"), {
      slug: slug,
      text: newComment,
      name: name.trim() || "Guest",
      createdAt: serverTimestamp(),
      reactions: { thumbsUp: 0, smile: 0, heart: 0 },
      isAdmin: isAdmin, // Tag the comment as official
      replyTo: replyingTo
    });
    
    setNewComment("");
    setReplyingTo(null);
    // Only clear name if it's a guest
    if (!isAdmin) setName(""); 
  };

  const handleReaction = async (commentId, reactionType) => {
    const commentRef = doc(db, "comments", commentId);
    await updateDoc(commentRef, { [`reactions.${reactionType}`]: increment(1) });
  };

  // Helper filters
  const rootComments = comments.filter(c => !c.replyTo);
  const getReplies = (parentId) => comments.filter(c => c.replyTo === parentId).sort((a,b) => a.createdAt - b.createdAt);

  return (
    <div className="p-4 bg-gray-50 rounded-lg mt-8 dark:bg-[var(--card-color)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold dark:text-[var(--text-color)]"> Live Comments</h3>
        
        {/* 3. Secure Lock Icon */}
        {isAdmin ? (
          <button onClick={handleLogout} className="text-xs text-green-600 font-bold hover:underline">
            🔓 Admin Active (Logout)
          </button>
        ) : (
          <button onClick={handleAdminLogin} className="text-gray-300 hover:text-blue-500" title="Admin Login">
            🔒
          </button>
        )}
      </div>

      {/* Input Form */}
      {!replyingTo && (
        <form onSubmit={handleSubmit} className="mb-8 space-y-2">
           {!isAdmin && (
             <input
              type="text"
              className="w-full p-2 border rounded dark:bg-[var(--background-color)] dark:text-[var(--text-color)]"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
      <div className="space-y-6">
        {loading && <p>Loading comments...</p>}
        {!loading && rootComments.length === 0 && <p className="text-gray-500">No comments yet.</p>}
        
        {rootComments.map((comment) => (
          <div key={comment.id} className="group">
            {/* PARENT COMMENT */}
            <div className={`p-4 rounded shadow-sm border ${comment.isAdmin ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-[var(--card-color-transparent)]'}`}>
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
              <p className="mb-3 text-gray-800 dark:text-[var(--text-color)]">{comment.text}</p>
              
              <div className="flex gap-4 border-t pt-2 dark:border-gray-700">
                {Object.keys(EMOTES).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleReaction(comment.id, key)}
                    className="flex items-center gap-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition"
                  >
                    <span>{EMOTES[key]}</span>
                    <span className="font-semibold text-gray-600 dark:text-gray-400">{comment.reactions?.[key] || 0}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* REPLIES */}
            {getReplies(comment.id).map(reply => (
               <div key={reply.id} className="ml-8 mt-2 p-3 rounded border-l-4 border-blue-200 bg-gray-50 dark:bg-[var(--background-color)] dark:border-blue-800">
                  <p className="font-bold text-xs text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2">
                    {reply.name}
                    {reply.isAdmin && <span className="text-blue-600 text-[10px]">● Admin</span>}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-[var(--text-color)]">{reply.text}</p>
               </div>
            ))}

            {/* REPLY INPUT */}
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
