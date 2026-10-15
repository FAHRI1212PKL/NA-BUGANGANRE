const U = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const T = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const K = 'bugangan-data';
const db = (path, body) => fetch(U + path, { method: body !== undefined ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + T }, body }).then(r => r.json());

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    if (!U || !T) return res.status(200).json(null);
    const j = await db('/get/' + K);
    return res.status(200).json(j.result ? JSON.parse(j.result) : null);
  }
  if (req.method !== 'POST') return res.status(405).end();
  if (req.headers['x-admin-pw'] !== (process.env.ADMIN_PASSWORD || '11111')) return res.status(401).json({ error: 'Password salah' });
  const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  if (b.check) return res.json({ ok: 1 });
  if (!U || !T) return res.status(503).json({ error: 'Database belum terhubung. Hubungkan Upstash Redis di Vercel.' });
  if (b.reset) { await db('/del/' + K); return res.json({ ok: 1 }); }
  if (!Array.isArray(b.groups)) return res.status(400).json({ error: 'Format data tidak valid' });
  await db('/set/' + K, JSON.stringify(b));
  res.json({ ok: 1 });
};
