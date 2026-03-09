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
  const [replyTo, setReplyTo] = useState(null); // Stores ID of comment being replied to
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. Listen for Auth State
    const unsubscribeAuth = auth.onAuthStateChanged((u) => setUser(u));

    // 2. Listen for Real-time Comments
    const q = query(collection(db, "exclusive"), orderBy("createdAt", "asc"));
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
        parentId: parentId, // null for main comments, ID for replies
        createdAt: serverTimestamp(),
      });
      
      setNewComment("");
      setReplyTo(null);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Helper to organize nested comments
  const rootComments = comments.filter(c => !c.parentId);
  const getReplies = (parentId) => comments.filter(c => c.parentId === parentId);

  return (
    <div className="mt-12 border-t border-amber-100 pt-10">
      <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
        Community Discussion 💬
      </h3>

      {/* Main Comment Box */}
      <form onSubmit={(e) => handleSubmit(e)} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts or ask a question..."
          className="w-full p-4 border border-amber-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
          rows="3"
        />
        <button className="mt-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-xl font-medium transition-colors">
          Post Comment
        </button>
      </form>

      {/* Comment List */}
      <div className="space-y-6">
        {rootComments.map(comment => (
          <div key={comment.id} className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50">
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-amber-800 text-sm">{comment.email}</span>
              <span className="text-xs text-gray-400">
                {comment.createdAt?.toDate().toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700">{comment.text}</p>
            
            <button 
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="mt-3 text-xs font-bold text-orange-600 hover:underline"
            >
              {replyTo === comment.id ? "Cancel" : "Reply"}
            </button>

            {/* Reply Input Box */}
            {replyTo === comment.id && (
              <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-4 flex gap-2">
                <input 
                  name="replyText"
                  autoFocus
                  placeholder="Write a reply..."
                  className="flex-1 p-2 border border-orange-100 rounded-lg text-sm outline-none focus:border-amber-400"
                />
                <button className="bg-orange-100 text-orange-700 px-4 py-1 rounded-lg text-sm font-bold hover:bg-orange-200">
                  Send
                </button>
              </form>
            )}

            {/* Render Replies */}
            <div className="ml-8 mt-4 space-y-4 border-l-2 border-orange-50 pl-4">
              {getReplies(comment.id).map(reply => (
                <div key={reply.id} className="bg-orange-50/30 p-3 rounded-xl">
                   <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-amber-700 text-xs">{reply.email}</span>
                  </div>
                  <p className="text-sm text-gray-600">{reply.text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;
