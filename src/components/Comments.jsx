import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [user, setUser] = useState(null);

  // Constants
  const ADMIN_EMAIL = "sollungomaami@gmail.com";

  useEffect(() => {
    // 1. Auth State
    const unsubscribeAuth = auth.onAuthStateChanged((u) => setUser(u));

    // 2. Real-time Subscription
    const q = query(collection(db, "exclusive"), orderBy("createdAt", "desc"));
    const unsubscribeDocs = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(docs);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDocs();
    };
  }, []);

  const handleSubmit = async (e, parentId = null) => {
    e.preventDefault();
    const text = parentId ? e.target.replyText.value : newComment;
    
    if (!text.trim() || !user) return;

    try {
      await addDoc(collection(db, "exclusive"), {
        email: user.email,
        text: text,
        parentId: parentId, 
        createdAt: serverTimestamp(),
      });
      
      if (parentId) {
        e.target.reset();
        setReplyTo(null);
      } else {
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Helper: Truncate email to name
  const getName = (email) => email ? email.split('@')[0] : "Guest";

  // Organize threads
  const rootComments = comments.filter(c => !c.parentId);
  const getReplies = (parentId) => comments.filter(c => c.parentId === parentId).reverse(); 
  // .reverse() ensures replies show in chronological order under the comment

  return (
    <div className="mt-16 border-t border-amber-100 pt-10">
      <h3 className="text-2xl font-bold text-amber-900 mb-8 flex items-center gap-2">
        Member Discussion 💬
      </h3>

      {/* Main Posting Box */}
      {user ? (
        <form onSubmit={(e) => handleSubmit(e)} className="mb-10">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-4 border border-amber-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm bg-white/50"
            rows="3"
          />
          <button className="mt-3 bg-orange-600 hover:bg-orange-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95">
            Post to Library
          </button>
        </form>
      ) : (
        <p className="mb-8 text-amber-800 italic bg-amber-50 p-4 rounded-xl border border-amber-100">
          Please stay logged in to join the conversation.
        </p>
      )}

      {/* List */}
      <div className="space-y-8">
        {rootComments.map(comment => {
          const isMaami = comment.email === ADMIN_EMAIL;
          
          return (
            <div key={comment.id} className="group">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100/50 transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-amber-900 text-sm tracking-tight">
                      {getName(comment.email)}
                    </span>
                    {isMaami && (
                      <span className="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest">
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium uppercase">
                    {comment.createdAt?.toDate().toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                
                <button 
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="mt-4 text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  {replyTo === comment.id ? "Cancel" : "Reply to this"}
                </button>

                {/* Reply Form */}
                {replyTo === comment.id && (
                  <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-4 flex gap-2 animate-in fade-in slide-in-from-top-2">
                    <input 
                      name="replyText"
                      autoFocus
                      placeholder="Write your reply..."
                      className="flex-1 p-3 border border-orange-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button className="bg-amber-800 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-amber-900 transition-colors">
                      Reply
                    </button>
                  </form>
                )}

                {/* Nested Replies */}
                <div className="ml-4 md:ml-10 mt-6 space-y-4 border-l-2 border-orange-100 pl-4 md:pl-6">
                  {getReplies(comment.id).map(reply => {
                    const isReplyMaami = reply.email === ADMIN_EMAIL;
                    return (
                      <div key={reply.id} className="bg-orange-50/40 p-4 rounded-xl border border-orange-100/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-amber-800 text-xs">
                            {getName(reply.email)}
                          </span>
                          {isReplyMaami && (
                            <span className="bg-orange-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black uppercase">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{reply.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Comments;
