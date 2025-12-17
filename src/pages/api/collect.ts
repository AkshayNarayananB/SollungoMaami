import type { APIRoute } from 'astro';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: import.meta.env.UPSTASH_REDIS_REST_URL,
  token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { type, slug, data } = body; 
    // type: 'view' | 'reaction' | 'comment'

    if (!slug || !type) return new Response('Missing Data', { status: 400 });

    const timestamp = Date.now();

    if (type === 'view') {
      // Increment view counter in Redis immediately
      await redis.incr(`view:${slug}`);
    } 
    else if (type === 'reaction') {
      // Increment specific emoji reaction (e.g. "reaction:🔥:kasi-halwa")
      // We assume 'data' contains the emoji char
      await redis.incr(`reaction:${data.emoji}:${slug}`);
    }
    else if (type === 'comment') {
      // Store full comment object in a list
      const commentPayload = { ...data, createdAt: timestamp, slug };
      await redis.lpush('comments_buffer', JSON.stringify(commentPayload));
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Redis Error' }), { status: 500 });
  }
};
