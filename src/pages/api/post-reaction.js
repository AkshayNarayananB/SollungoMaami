import redis from '../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { slug, type } = req.body;

  // 1. Increment the specific emotion count in a Hash
  await redis.hincrby(`pending_reactions:${slug}`, type, 1);
  
  // 2. Add the slug to a Set so we know which pages to sync later
  await redis.sadd('dirty_reaction_slugs', slug);

  res.status(200).json({ success: true });
}
