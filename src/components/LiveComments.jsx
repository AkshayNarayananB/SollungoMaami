import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, addDoc, query, where, orderBy, onSnapshot, 
  updateDoc, doc, increment, serverTimestamp 
} from 'firebase/firestore';

const EMOTES = {
  thumbsUp: "👍",
  smile: "😄",
  heart: "❤️"
};

const LiveComments = ({ slug }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Listen for Live Updates
  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("slug", "==", slug),
      orderBy("createdAt", "desc")
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

  // 2. Add a New Comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await addDoc(collection(db, "comments"), {
      slug: slug,
      text: newComment,
      createdAt: serverTimestamp(),
      reactions: { thumbsUp: 0, smile: 0, heart: 0 }
    });
    setNewComment("");
  };

  // 3. Handle Reaction Clicks
  const handleReaction = async (commentId, reactionType) => {
    const commentRef = doc(db, "comments", commentId);
    // Uses Firestore 'increment' for atomic updates (prevents race conditions)
    await updateDoc(commentRef, {
      [`reactions.${reactionType}`]: increment(1)
    });
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg mt-8">
      <h3 className="text-xl font-bold mb-4"> Live Comments</h3>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          className="w-full p-2 border rounded mb-2"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Post Comment
        </button>
      </form>

      {/* Comment List */}
      <div className="space-y-4">
        {loading && <p>Loading comments...</p>}
        {!loading && comments.length === 0 && <p className="text-gray-500">No comments yet. Be the first!</p>}
        
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white p-4 rounded shadow-sm border">
            <p className="mb-3 text-gray-800">{comment.text}</p>
            
            {/* Reaction Bar */}
            <div className="flex gap-4 border-t pt-2">
              {Object.keys(EMOTES).map((key) => (
                <button
                  key={key}
                  onClick={() => handleReaction(comment.id, key)}
                  className="flex items-center gap-1 text-sm hover:bg-gray-100 px-2 py-1 rounded transition"
                >
                  <span>{EMOTES[key]}</span>
                  <span className="font-semibold text-gray-600">
                    {comment.reactions?.[key] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveComments;
