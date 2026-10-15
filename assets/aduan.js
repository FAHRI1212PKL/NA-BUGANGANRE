const AP = '/api/pengaduan';
const getLocalAduan = () => {
  try { return JSON.parse(localStorage.getItem('bugangan-aduan') || '[]'); } catch (e) { return []; }
};
const setLocalAduan = l => {
  try { localStorage.setItem('bugangan-aduan', JSON.stringify(l)); } catch (e) {}
};

if (page === 'pengaduan.html') {
  $('#af').onsubmit = async e => {
    e.preventDefault();
    try {
      const r = await fetch(AP, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(e.target))) });
      if (r.status !== 404 && r.status !== 502) {
        const j = await r.json().catch(() => ({}));
        $('#am').innerHTML = r.ok ? `Pengaduan terkirim. Kode tiket kamu <b>${esc(j.kode)}</b>. Simpan kode ini untuk mengecek status.` : esc(j.error || 'Gagal mengirim. Coba lagi.');
        if (r.ok) e.target.reset();
        return;
      }
    } catch (err) {}
    // Fallback lokal jika belum di-deploy
    const fd = Object.fromEntries(new FormData(e.target));
    if ((fd.isi || '').trim().length < 10) { $('#am').textContent = 'Isi pengaduan minimal 10 karakter'; return; }
    const kode = 'BGN-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    const l = getLocalAduan();
    l.unshift({ kode, tanggal: new Date().toISOString(), nama: (fd.nama || '').slice(0, 80), kontak: (fd.kontak || '').slice(0, 80), kategori: fd.kategori || 'Lainnya', isi: fd.isi, status: 'Baru', balasan: '' });
    setLocalAduan(l);
    $('#am').innerHTML = `Pengaduan terkirim (Mode Lokal). Kode tiket kamu <b>${esc(kode)}</b>. Simpan kode ini untuk mengecek status.`;
    e.target.reset();
  };
  $('#cf').onsubmit = async e => {
    e.preventDefault();
    const kodeInput = $('#kode').value.trim().toUpperCase();
    try {
      const r = await fetch(AP + '?kode=' + encodeURIComponent(kodeInput));
      if (r.status !== 404 && r.status !== 502) {
        const j = await r.json().catch(() => ({}));
        $('#cm').textContent = r.ok ? `Status: ${j.status}.` + (j.balasan ? ` Tanggapan desa: ${j.balasan}` : '') : (j.error || 'Gagal memeriksa kode.');
        return;
      }
    } catch (err) {}
    // Fallback lokal
    const l = getLocalAduan();
    const t = l.find(x => x.kode === kodeInput);
    $('#cm').textContent = t ? `Status: ${t.status}.` + (t.balasan ? ` Tanggapan desa: ${t.balasan}` : '') : 'Kode pengaduan tidak ditemukan.';
  };
}
window.aduanInit = async pw => {
  const box = $('#aduan'); if (!box) return;
  box.hidden = false;
  const h = { 'Content-Type': 'application/json', 'x-admin-pw': pw };
  const draw = async () => {
    let l = [];
    try {
      const r = await fetch(AP, { headers: h });
      if (r.status !== 404 && r.status !== 502) {
        l = r.ok ? await r.json() : [];
      } else {
        l = getLocalAduan();
      }
    } catch (e) {
      l = getLocalAduan();
    }
    $('#alist').innerHTML = l.length ? l.map(x => `<div class="ad" data-k="${esc(x.kode)}"><div><span class="tag">${esc(x.kategori)}</span> <b>${esc(x.kode)}</b> <small>${new Date(x.tanggal).toLocaleString('id-ID')}</small></div>
      <div>${esc(x.isi)}</div><small>Pengirim: ${esc(x.nama) || 'Tanpa nama'}${x.kontak ? ', ' + esc(x.kontak) : ''}</small>
      <select>${['Baru', 'Diproses', 'Selesai'].map(s => `<option ${s === x.status ? 'selected' : ''}>${s}</option>`).join('')}</select>
      <textarea rows="2" placeholder="Tanggapan untuk warga">${esc(x.balasan)}</textarea>
      <div class="toolbar"><button class="btn" data-a="ubah">Simpan tanggapan</button><button class="btn ghost" data-a="hapus">Hapus</button></div></div>`).join('') : '<p class="lead">Belum ada pengaduan masuk.</p>';
  };
  $('#alist').onclick = async e => {
    const a = e.target.dataset.a, c = e.target.closest('.ad'); if (!a) return;
    if (a === 'hapus' && !confirm('Hapus pengaduan ini?')) return;
    try {
      const r = await fetch(AP, { method: 'POST', headers: h, body: JSON.stringify({ aksi: a, kode: c.dataset.k, status: $('select', c).value, balasan: $('textarea', c).value }) });
      if (r.status !== 404 && r.status !== 502) { draw(); return; }
    } catch (e) {}
    // Fallback lokal
    let l = getLocalAduan();
    if (a === 'hapus') l = l.filter(x => x.kode !== c.dataset.k);
    else l.forEach(x => { if (x.kode === c.dataset.k) { x.status = $('select', c).value; x.balasan = $('textarea', c).value; } });
    setLocalAduan(l);
    draw();
  };
  draw();
};

