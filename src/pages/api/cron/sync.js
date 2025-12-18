import redis from '@/lib/redis';
import { db } from '@/lib/firebaseAdmin';
import { sendNotification } from '@/lib/email';
import * as admin from 'firebase-admin'; // Needed for FieldValue.increment

export default async function handler(req, res) {
  // ---------------------------------------------------------
  // 1. PROCESS COMMENTS (Queue -> Firestore + Email)
  // ---------------------------------------------------------
  
  // Pop up to 50 items from the queue
  const rawComments = await redis.lpop('queue:comments', 50);
  
  // Handle Upstash return types (null, single item, or array)
  const commentsToProcess = Array.isArray(rawComments) 
    ? rawComments 
    : (rawComments ? [rawComments] : []);

  if (commentsToProcess.length > 0) {
    const batch = db.batch();
    const emailsToTrigger = [];

    for (const raw of commentsToProcess) {
      // Parse if string, otherwise use object
      const comment = typeof raw === 'string' ? JSON.parse(raw) : raw;

      // Prepare Firestore Write
      const docRef = db.collection('comments').doc(); // Auto-ID
      batch.set(docRef, {
        ...comment,
        // Convert timestamp number back to Firestore Date
        createdAt: new Date(comment.createdAt) 
      });

      // Add to email queue
      emailsToTrigger.push(comment);
    }

    // Commit all comments to DB at once
    await batch.commit();
    console.log(`✅ Synced ${commentsToProcess.length} comments to Firestore.`);

    // Send Emails (After successful DB write)
    await Promise.all(emailsToTrigger.map(async (c) => {
      
      // A. Notify Admin (New Comment from Guest)
      if (!c.isAdmin) {
         await sendNotification({
           type: 'new_comment',
           name: c.name,
           message: c.text,
           link: c.link, // Passed from frontend
           // 'to' is undefined here, so email.js defaults to Admin Email
         });
      }

      // B. Notify Guest (Reply from Admin)
      if (c.isAdmin && c.replyTo) {
        // Fetch parent comment to get the guest's email
        const parentDoc = await db.collection('comments').doc(c.replyTo).get();
        
        if (parentDoc.exists) {
          const parentData = parentDoc.data();
          if (parentData.email) {
            await sendNotification({
              type: 'reply',
              to: parentData.email,
              name: "Sollungo Maami",
              message: c.text,
              link: c.link // Passed from frontend
            });
          }
        }
      }
    }));
  }

  // ---------------------------------------------------------
  // 2. PROCESS REACTIONS (Redis Hash -> Firestore Increment)
  // ---------------------------------------------------------
  
  const slugs = await redis.smembers('dirty_reaction_slugs');
  
  if (slugs.length > 0) {
    const batch = db.batch();

    for (const slug of slugs) {
      const key = `pending_reactions:${slug}`;
      const counts = await redis.hgetall(key);

      if (counts) {
        // Prepare Firestore update using atomic increments
        const updateData = {};
        if (counts.like) updateData.like = admin.firestore.FieldValue.increment(Number(counts.like));
        if (counts.heart) updateData.heart = admin.firestore.FieldValue.increment(Number(counts.heart));
        if (counts.smile) updateData.smile = admin.firestore.FieldValue.increment(Number(counts.smile));

        const docRef = db.collection('emoticons').doc(slug);
        batch.set(docRef, updateData, { merge: true });

        // Clean up Redis for this page
        await redis.del(key);
      }
    }

    await batch.commit();
    
    // Clear the "dirty" list
    await redis.del('dirty_reaction_slugs');
    console.log(`✅ Synced reactions for ${slugs.length} pages.`);
  }

  return res.status(200).json({ success: true, synced: commentsToProcess.length });
}
