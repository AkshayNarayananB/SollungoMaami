import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, addDoc, query, where, orderBy, onSnapshot, 
  updateDoc, doc, increment, serverTimestamp 
} from 'firebase/firestore';

const EMOTES = { thumbsUp: "👍", smile: "😄", heart: "❤️" };
const ADMIN_PIN = "5821"; // 🔒 CHANGE THIS TO YOUR SECRET PIN

const LiveComments = ({ slug }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  // Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // ID of comment being replied to

  // 1. Listen for Live Updates
  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("slug", "==", slug),
      orderBy("createdAt", "desc") // Newest first
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(liveData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [slug]);

  // 2. Handle Login (Simple PIN check)
  const handleAdminLogin = () => {
    const input = prompt("Enter Admin PIN:");
    if (input === ADMIN_PIN) {
      setIsAdminMode(true);
      setName("Sollungo Maami"); // Auto-set your admin name
    } else {
      alert("Wrong PIN");
    }
  };

  // 3. Submit Comment (Parent or Reply)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const payload = {
      slug: slug,
      text: newComment,
      name: name.trim() || "Guest",
      createdAt: serverTimestamp(),
      reactions: { thumbsUp: 0, smile: 0, heart: 0 },
      isAdmin: isAdminMode, // Mark as admin comment
      replyTo: replyingTo // If null, it's a main comment. If ID, it's a reply.
    };

    await addDoc(collection(db, "comments"), payload);
    
    setNewComment("");
    setReplyingTo(null); // Close reply box
    if (!isAdminMode) setName(""); 
  };

  const handleReaction = async (commentId, reactionType) => {
    const commentRef = doc(db, "comments", commentId);
    await updateDoc(commentRef, { [`reactions.${reactionType}`]: increment(1) });
  };

  // Helper: Separate Parents and Replies
  // We filter out comments that have a 'replyTo' field for the main list
  const rootComments = comments.filter(c => !c.replyTo);
  const getReplies = (parentId) => comments.filter(c => c.replyTo === parentId).sort((a,b) => a.createdAt - b.createdAt);

  return (
    <div className="p-4 bg-gray-50 rounded-lg mt-8 dark:bg-[var(--card-color)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold dark:text-[var(--text-color)]">Live Comments</h3>
        {/* Secret Admin Button */}
        <button 
          onClick={handleAdminLogin}
          className="text-gray-300 hover:text-blue-500 text-xs"
          title="Admin Login"
        >
          {isAdminMode ? "🔓 Admin Active" : "🔒"}
        </button>
      </div>

      {/* Main Input Form (Only show if NOT replying to someone) */}
      {!replyingTo && (
        <form onSubmit={handleSubmit} className="mb-8 space-y-2">
           {!isAdminMode && (
             <input
              type="text"
              className="w-full p-2 border rounded dark:bg-[var(--background-color)] dark:text-[var(--text-color)]"
              placeholder="Name (Optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
           )}
          <textarea
            className="w-full p-2 border rounded dark:bg-[var(--background-color)] dark:text-[var(--text-color)]"
            placeholder={isAdminMode ? "Write an official reply..." : "Write a comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {isAdminMode ? "Post as Admin" : "Post Comment"}
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
                {/* Reply Button (Only visible if Admin is Logged In) */}
                {isAdminMode && (
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

            {/* REPLIES (Indented) */}
            {getReplies(comment.id).map(reply => (
               <div key={reply.id} className="ml-8 mt-2 p-3 rounded border-l-4 border-blue-200 bg-gray-50 dark:bg-[var(--background-color)] dark:border-blue-800">
                  <p className="font-bold text-xs text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2">
                    {reply.name}
                    {reply.isAdmin && <span className="text-blue-600 text-[10px]">● Admin</span>}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-[var(--text-color)]">{reply.text}</p>
               </div>
            ))}

            {/* REPLY INPUT (Only shows under the specific comment you clicked "Reply" on) */}
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
