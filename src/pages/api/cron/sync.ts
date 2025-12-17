import type { APIRoute } from 'astro';
import { Redis } from '@upstash/redis';
import { db } from '../../../lib/firebase'; // Adjust path to your firebase config
import { doc, runTransaction, collection, addDoc, increment } from 'firebase/firestore';

export const GET: APIRoute = async ({ request }) => {
  // 1. Security Check (Only Vercel Cron should access this)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${import.meta.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const redis = new Redis({
    url: import.meta.env.UPSTASH_REDIS_REST_URL,
    token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
  });

  try {
    // --- A. SYNC VIEWS ---
    // Get all keys starting with "view:"
    const viewKeys = await redis.keys('view:*');
    
    // We'll use a transaction to be safe, or just batch updates
    for (const key of viewKeys) {
      const slug = key.split(':')[1]; // Extract slug from "view:kasi-halwa"
      const countStr = await redis.get(key);
      const count = Number(countStr);

      if (count > 0) {
        const postRef = doc(db, 'blog', slug);
        // Using Firestore 'increment' is cheaper/safer than reading + writing
        await runTransaction(db, async (transaction) => {
           transaction.update(postRef, { views: increment(count) });
        });
        
        // Delete the key from Redis after syncing
        await redis.del(key);
      }
    }

    // --- B. SYNC REACTIONS ---
    // Logic is similar to views but with "reaction:emoji:slug"
    // (Implementation omitted for brevity - ask if you need this specific block)

    // --- C. SYNC COMMENTS & SEND EMAILS ---
    const commentsRaw = await redis.lrange('comments_buffer', 0, -1);
    
    if (commentsRaw.length > 0) {
      const comments = commentsRaw.map((c) => JSON.parse(c as string));
      
      for (const comment of comments) {
        // 1. Write to Firestore
        await addDoc(collection(db, 'blog', comment.slug, 'comments'), {
          content: comment.content,
          user: comment.user,
          date: new Date(comment.createdAt), // Convert timestamp back to Date
          replies: []
        });

        // 2. TRIGGER EMAIL HERE
        // await sendMyEmailFunction(comment); 
      }

      // Clear the Redis buffer
      await redis.del('comments_buffer');
    }

    return new Response(JSON.stringify({ status: 'Synced' }), { status: 200 });

  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
