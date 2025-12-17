import type { APIRoute } from 'astro';
import { redis } from '../../lib/redis';

export const POST: APIRoute = async ({ request }) => {
  // Optional: Remove if testing locally
  if (import.meta.env.DEV) {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 });
  }

  try {
    const body = await request.json();
    const { type, slug, data } = body; 

    const timestamp = Date.now();
    
    // 2. REACTIONS (Specific to a post)
    if (type === 'reaction') {
      if (data?.emoji && slug) {
        await redis.incr(`reaction:${data.emoji}:${slug}`);
      }
    }
    
    // 3. COMMENTS (Flexible Fields)
    else if (type === 'comment') {
      // We allow name/email to be null/undefined as per your requirement
      const payload = { 
        content: data.text, // Assuming frontend sends 'text'
        name: data.name || null, // Explicitly null if missing
        email: data.email || null, // Explicitly null if missing
        user: data.user || null,   // For admin/auth users
        avatar: data.avatar || null,
        createdAt: timestamp, 
        slug: slug // We still need slug to know WHICH post this comment belongs to
      };
      
      await redis.lpush('comments_buffer', JSON.stringify(payload));
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Redis Error' }), { status: 500 });
  }
};
