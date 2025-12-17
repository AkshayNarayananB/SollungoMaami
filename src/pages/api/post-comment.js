import redis from '../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { slug, text, name, email, isAdmin, replyTo } = req.body;

  const newComment = {
    slug,
    text,
    name: name || "Guest",
    email,
    isAdmin: !!isAdmin,
    replyTo: replyTo || null,
    createdAt: Date.now(),
    id: crypto.randomUUID() // Native Node.js UUID generation
  };

  try {
    // Push to a list called 'queue:comments'
    await redis.rpush('queue:comments', JSON.stringify(newComment));
    return res.status(200).json(newComment);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
