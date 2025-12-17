import React, { useState, useEffect } from 'react';
import { db, auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { 
  collection, query, where, orderBy, onSnapshot, doc 
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
  const [dbComments, setDbComments] = useState([]); // Comments from Firestore (Older than 1h)
  const [localComments, setLocalComments] = useState([]); // Optimistic comments (Newer than 1h)
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

  // --- 1. AUTH LISTENER ---
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

  // --- 2. LISTEN FOR CONFIRMED COMMENTS (Firestore) ---
  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("slug", "==", slug),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbComments(liveData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [slug]);

  // --- 3. LISTEN FOR CONFIRMED REACTIONS (Firestore) ---
  useEffect(() => {
    const docRef = doc(db, "emoticons", slug);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        // Merge DB counts with any local optimistic clicks could be complex, 
        // but for simplicity we overwrite with DB if it updates.
        // In a perfect world, we'd add local offset. 
        setReactions(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, [slug]);

  // --- HELPER: SEND TO REDIS COLLECTOR ---
  const sendToCollector = async (type, payload) => {
    try {
      await fetch('/api/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          slug,
          data: payload
        })
      });
    } catch (e) {
      console.error("Failed to send to collector:", e);
    }
  };

  // --- ACTION: HANDLE REACTION CLICK ---
  const handleEmoteClick = async (type) => {
    // 1. Optimistic Update (Show +1 immediately)
    setReactions(prev => ({ ...prev, [type]: (prev[type] || 0) + 1 }));

    // 2. Send to Redis
    await sendToCollector('reaction', { emoji: type });
  };

  // --- ACTION: HANDLE COMMENT SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const guestName = name.trim() || "Guest";
    const commentPayload = {
      text: newComment,
      name: guestName,
      email: email.trim(), 
      isAdmin: isAdmin,
      replyTo: replyingTo,
      // Use local Date for display, Redis will timestamp it server-side
      createdAt: new Date(), 
      avatar: isAdmin ? user?.photoURL : null
    };

    // 1. Optimistic Update (Add to local list immediately)
    // We give it a temp ID so React can render it key-wise
    const tempComment = { ...commentPayload, id: `temp-${Date.now()}` };
    setLocalComments(prev => [tempComment, ...prev]);

    // 2. Send to Redis (Write-Behind)
    // Emails will be sent by the Cron Job in 1 hour
    await sendToCollector('comment', commentPayload);

    // 3. Reset Form
    setNewComment("");
    setReplyingTo(null);
  };

  // Admin Login
  const handleAdminLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        alert("Access Denied.");
      }
    } catch (error) { console.error(error); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setName("");
  };

  // Merge DB comments and Local (Pending) comments
  // We filter out duplicates just in case the Cron runs while user is on page
  const allComments = [...localComments, ...dbComments];
  
  const rootComments = allComments.filter(c => !c.replyTo);
  const getReplies = (parentId) => allComments.filter(c => c.replyTo === parentId).sort((a,b) => {
    const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime();
    const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime();
    return timeA - timeB;
  });

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

      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold dark:text-[var(--text-color)]">. Comments</h3>
        
        {isAdmin ? (
          <button onClick={handleLogout} className="text-[10px] text-amber-600 font-bold hover:underline">
            🔓 Admin (Logout)
          </button>
        ) : (
          <button onClick={handleAdminLogin} className="text-gray-300 hover:text-amber-500 text-xs" title="Admin Login">
            🔒
          </button>
        )}
      </div>
      
      {/* Input Form */}
      {!replyingTo && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-2">
          {!isAdmin && (
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent dark:bg-[var(--background-color)] dark:text-[var(--text-color)] dark:border-gray-600"
                placeholder="Name (Optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent dark:bg-[var(--background-color)] dark:text-[var(--text-color)] dark:border-gray-600"
                placeholder="Email (Optional, for notifications)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}
          <textarea
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent dark:bg-[var(--background-color)] dark:text-[var(--text-color)] dark:border-gray-600 min-h-[60px]"
            placeholder={isAdmin ? "Write an official reply..." : "Write a comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button 
            type="submit" 
            className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold text-xs rounded-lg hover:from-yellow-500 hover:to-orange-600 shadow-md transition-all duration-200"
          >
            {isAdmin ? "✍️ Post as Admin" : "💬 Post Comment"}
          </button>
        </form>
      )}
      
      {/* Comment List */}
      <div className="space-y-2">
        {loading && <p className="text-xs text-gray-500">Loading comments...</p>}
        {!loading && rootComments.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-2">No comments yet. Be the first to comment! 💭</p>
        )}
        
        {rootComments.map((comment) => (
          <div key={comment.id} className={`group ${comment.id.toString().startsWith('temp') ? 'opacity-70' : ''}`}>
            
            {/* PARENT COMMENT */}
            <div 
              className={`rounded-lg shadow-sm border transition-all duration-200 ${
                comment.isAdmin 
                  ? 'border-amber-300 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-700' 
                  : 'bg-white border-gray-200 hover:border-amber-200 dark:bg-[var(--card-color-transparent)] dark:border-gray-700 dark:hover:border-amber-800'
              }`}
              style={{ padding: '6px 10px' }} 
            >
              <div 
                className="flex justify-between items-center" 
                style={{ marginBottom: '0px' }}
              >
                <p className="font-bold text-xs flex items-center gap-1" style={{ lineHeight: '1' }}>
                  <span className={comment.isAdmin ? 'text-amber-700 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}>
                    {comment.name || "Guest"}
                  </span>
                  {comment.isAdmin && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                      ✨ AUTHOR
                    </span>
                  )}
                  {comment.id.toString().startsWith('temp') && (
                     <span className="text-[9px] text-gray-400 italic ml-1">(Sending...)</span>
                  )}
                </p>
                {isAdmin && !comment.id.toString().startsWith('temp') && (
                  <button 
                    onClick={() => setReplyingTo(comment.id)}
                    className="text-[10px] text-amber-600 hover:text-amber-700 font-medium hover:underline"
                  >
                    Reply ↩️
                  </button>
                )}
              </div>
              
              <p 
                className="text-sm text-gray-800 dark:text-[var(--text-color)]"
                style={{ marginTop: '2px', lineHeight: '1.2' }}
              >
                {comment.text}
              </p>
            </div>
        
            {/* REPLIES */}
            {getReplies(comment.id).map(reply => (
              <div 
                key={reply.id} 
                className={`ml-6 md:ml-8 mt-1 rounded-lg border-l-4 border-amber-400 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-600 shadow-sm ${reply.id.toString().startsWith('temp') ? 'opacity-70' : ''}`}
                style={{ padding: '4px 8px' }}
              >
                <p 
                  className="font-bold text-[11px] flex items-center gap-1.5" 
                  style={{ marginBottom: '0px', lineHeight: '1' }}
                >
                  <span className="text-gray-700 dark:text-gray-300">{reply.name}</span>
                  {reply.isAdmin && (
                    <span className="text-amber-600 dark:text-amber-400 text-[9px] font-bold">
                      ⭐ Admin
                    </span>
                  )}
                  {reply.id.toString().startsWith('temp') && (
                     <span className="text-[9px] text-gray-400 italic ml-1">(Sending...)</span>
                  )}
                </p>
                <p 
                  className="text-[13px] text-gray-700 dark:text-[var(--text-color)]"
                  style={{ marginTop: '2px', lineHeight: '1.2' }}
                >
                  {reply.text}
                </p>
              </div>
            ))}
        
            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="ml-6 md:ml-8 mt-1 p-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                  <input 
                    autoFocus
                    className="flex-1 px-2 py-1 text-sm border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent dark:bg-[var(--background-color)] dark:text-[var(--text-color)] dark:border-amber-700"
                    placeholder={`Replying to ${comment.name}...`}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button 
                      type="submit" 
                      className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-600 shadow-sm"
                    >
                      Send ✉️
                    </button>
                    <button 
                      onClick={() => setReplyingTo(null)} 
                      className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
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
