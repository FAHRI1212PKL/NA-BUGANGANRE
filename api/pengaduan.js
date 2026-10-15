const U = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const T = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const K = 'bugangan-aduan';
const KAT = ['Infrastruktur', 'Kebersihan', 'Pelayanan administrasi', 'Keamanan', 'Lainnya'];
const STA = ['Baru', 'Diproses', 'Selesai'];
const db = (path, body) => fetch(U + path, { method: body !== undefined ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + T }, body }).then(r => r.json());
const read = async () => { const j = await db('/get/' + K); return j.result ? JSON.parse(j.result) : []; };
const write = l => db('/set/' + K, JSON.stringify(l));
const cut = (v, n) => String(v || '').trim().slice(0, n);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!U || !T) return res.status(503).json({ error: 'Database belum terhubung' });
  const admin = req.headers['x-admin-pw'] === (process.env.ADMIN_PASSWORD || '11111');
  if (req.method === 'GET') {
    const l = await read();
    if (admin) return res.json(l);
    const t = l.find(x => x.kode === String(req.query.kode || '').trim().toUpperCase());
    return t ? res.json({ status: t.status, balasan: t.balasan || '' }) : res.status(404).json({ error: 'Kode tidak ditemukan' });
  }
  if (req.method !== 'POST') return res.status(405).end();
  const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  if (b.aksi) {
    if (!admin) return res.status(401).json({ error: 'Password salah' });
    let l = await read();
    if (b.aksi === 'hapus') l = l.filter(x => x.kode !== b.kode);
    else l.forEach(x => { if (x.kode === b.kode) { if (STA.includes(b.status)) x.status = b.status; x.balasan = cut(b.balasan, 1000); } });
    await write(l);
    return res.json({ ok: 1 });
  }
  if (b.website) return res.json({ kode: 'BGN-00000' });
  const isi = cut(b.isi, 1500);
  if (isi.length < 10) return res.status(400).json({ error: 'Isi pengaduan minimal 10 karakter' });
  const l = await read();
  const kode = 'BGN-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  l.unshift({ kode, tanggal: new Date().toISOString(), nama: cut(b.nama, 80), kontak: cut(b.kontak, 80), kategori: KAT.includes(b.kategori) ? b.kategori : 'Lainnya', isi, status: 'Baru', balasan: '' });
  await write(l.slice(0, 500));
  res.json({ kode });
};
