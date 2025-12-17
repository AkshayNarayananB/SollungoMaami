import redis from '@/lib/redis';
import { db } from '@/lib/firebaseAdmin'; // Your Admin SDK setup
import { sendEmail } from '@/lib/email'; // Your email sender

export default async function handler(req, res) {
  // --- A. SYNC COMMENTS ---
  // Pop up to 50 items from the queue
  const rawComments = await redis.lpop('queue:comments', 50);
  
  // Upstash returns null if empty, or an array if items exist
  // Note: lpop with count might return a single item if only 1 exists, 
  // so ensure we handle it as an array.
  const commentsToProcess = Array.isArray(rawComments) ? rawComments : (rawComments ? [rawComments] : []);

  if (commentsToProcess.length > 0) {
    const batch = db.batch();
    const emailsToTrigger = [];

    for (const raw of commentsToProcess) {
      // Data often comes out as a string from Redis, parse it
      // Note: If you stored it as object directly in Upstash, you might not need JSON.parse
      // but usually JSON.stringify/parse is safer for complex objects.
      const comment = typeof raw === 'string' ? JSON.parse(raw) : raw;

      const docRef = db.collection('comments').doc(); // Auto-ID
      
      batch.set(docRef, {
        ...comment,
        // Convert timestamp number back to Firestore Timestamp
        createdAt: new Date(comment.createdAt) 
      });

      emailsToTrigger.push(comment);
    }

    await batch.commit();
    console.log(`Synced ${commentsToProcess.length} comments.`);

    // --- B. SEND EMAILS (Only after successful DB write) ---
    await Promise.all(emailsToTrigger.map(async (c) => {
      // 1. Notify Admin for every new comment
      if (!c.isAdmin) {
         await sendEmail({ 
           to: process.env.ADMIN_EMAIL, 
           subject: "New Comment", 
           body: `${c.name} said: ${c.text}` 
         });
      }

      // 2. Notify User if Admin replied
      if (c.isAdmin && c.replyTo) {
        // Need to find the parent email. 
        // OPTIMIZATION: You might want to store parentEmail in the payload from frontend 
        // to avoid this read, but for security, reading DB is better.
        const parentDoc = await db.collection('comments').doc(c.replyTo).get();
        if (parentDoc.exists && parentDoc.data().email) {
          await sendEmail({
            to: parentDoc.data().email,
            subject: "Reply to your comment",
            body: `Admin replied: ${c.text}`
          });
        }
      }
    }));
  }

  // --- C. SYNC REACTIONS ---
  const slugs = await redis.smembers('dirty_reaction_slugs');
  
  if (slugs.length > 0) {
    const batch = db.batch();

    for (const slug of slugs) {
      const key = `pending_reactions:${slug}`;
      const counts = await redis.hgetall(key);

      if (counts) {
        // Prepare Firestore update (using increments for safety)
        const updateData = {};
        if (counts.like) updateData.like = admin.firestore.FieldValue.increment(Number(counts.like));
        if (counts.heart) updateData.heart = admin.firestore.FieldValue.increment(Number(counts.heart));
        if (counts.smile) updateData.smile = admin.firestore.FieldValue.increment(Number(counts.smile));

        const docRef = db.collection('emoticons').doc(slug);
        batch.set(docRef, updateData, { merge: true });

        // Delete the Redis key for this page so we start fresh for next hour
        await redis.del(key);
      }
    }

    await batch.commit();
    
    // Clear the dirty set
    await redis.del('dirty_reaction_slugs');
    console.log(`Synced reactions for ${slugs.length} pages.`);
  }

  res.status(200).json({ success: true });
}
