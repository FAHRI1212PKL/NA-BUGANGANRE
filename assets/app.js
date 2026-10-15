const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const NAV = [['index.html', 'Beranda'], ['profil.html', 'Profil'], ['data.html', 'Data Desa'], ['pemerintahan.html', 'Pemerintahan'], ['pengaduan.html', 'Pengaduan'], ['lokasi.html', 'Lokasi']];
const page = document.body.dataset.page;

const DEFAULT_DATA = {"groups":[{"id":"profil","judul":"Profil singkat","items":[["Judul beranda","Desa Bugangan"],["Subjudul","Desa persawahan di Kecamatan Kedungwuni, Kabupaten Pekalongan, Jawa Tengah. Data kependudukan, pemerintahan, dan keuangan desa dalam satu tempat."],["Tentang","Desa Bugangan berada di Kecamatan Kedungwuni, Kabupaten Pekalongan, Provinsi Jawa Tengah, dengan luas wilayah 0,65201 km² dan tipologi persawahan. Mayoritas penduduknya bekerja sebagai petani. Menurut Papan Monografi Juli 2017, desa ini dihuni 2.656 jiwa dari 705 kepala keluarga dan berada pada tingkat perkembangan swadaya. Situs ini disusun sebagai media pengelolaan dan berbagi pengetahuan tentang desa."]]},{"id":"statistik","judul":"Angka utama","items":[["Jiwa","2656"],["Kepala keluarga","705"],["Luas wilayah (km²)","0,65"],["Perangkat desa","5"]]},{"id":"umum","judul":"Data umum","items":[["Nama desa","Bugangan"],["Kecamatan","Kedungwuni"],["Kabupaten","Pekalongan"],["Provinsi","Jawa Tengah"],["Kode pos","51173"],["Kode wilayah","2017"],["Tipologi desa","Persawahan"],["Tingkat perkembangan","Swadaya"],["Luas wilayah","0,65201 km²"],["Mayoritas pekerjaan","Petani"],["UMR kabupaten","Rp 1.463.000"],["Kantor desa","Permanen"]]},{"id":"batas","judul":"Batas wilayah","items":[["Utara","Tangkil Kulon"],["Selatan","Kemasan"],["Barat","Rengas"],["Timur","Karangdowo"]]},{"id":"demografi","judul":"Kependudukan","items":[["Laki-laki","1407"],["Perempuan","1249"],["Usia 0–15 tahun","754"],["Usia 15–65 tahun","1815"],["Usia 65 tahun ke atas","87"]]},{"id":"sarpras","judul":"Sarana dan prasarana","items":[["PAUD","1 buah"],["TK","1 buah"],["SD","1 buah"],["Masjid","1 buah"],["Mushola","4 buah"],["Sarana olahraga","3 buah"],["Kesenian/budaya","1 buah"],["Balai pertemuan","1 buah"]]},{"id":"personil","judul":"Pemerintah desa","items":[["Kepala Desa","Mustiyadi"],["Sekretaris Desa","Muchamad Taufik"],["Perangkat desa","5 orang"],["Anggota BPD","9 orang"],["Perdes yang ditetapkan","3"]]},{"id":"lembaga","judul":"Kelembagaan","items":[["LPM: pengurus / anggota","4 / 6 orang"],["LPM: kegiatan per tahun","3 kegiatan"],["LPM: dana dikelola","Rp 8.977.500"],["PKK: pengurus / anggota","6 / 16 orang"],["PKK: kegiatan per bulan","2 kegiatan"],["PKK: dana dikelola","Rp 22.810.000"],["Bantuan RT dan RW per bulan","Rp 70.000"]]},{"id":"keuangan","judul":"Keuangan desa (2017)","items":[["Pendapatan asli desa","Rp 93.500.000"],["Alokasi Dana Desa (ADD)","Rp 296.571.000"],["Bantuan pemerintah (Dana Desa)","Rp 798.485.000"],["Bantuan provinsi","Rp 35.000.000"],["Swadaya/gotong royong","Rp 17.000.000"],["Sumbangan/bantuan lain","Rp 16.981.891"],["Belanja desa","Rp 1.329.203.891"]]}]};

async function load() {
  try { const r = await fetch('/api/data'); if (r.ok) { const d = await r.json(); if (d && d.groups) return d; } } catch (e) {}
  try {
    const local = localStorage.getItem('bugangan-data');
    if (local) { const d = JSON.parse(local); if (d && d.groups) return d; }
  } catch (e) {}
  try { const r = await fetch('data/default.json'); if (r.ok) { const d = await r.json(); if (d && d.groups) return d; } } catch (e) {}
  return DEFAULT_DATA;
}
const grp = (d, id) => d.groups.find(g => g.id === id) || { judul: '', items: [] };
const item = (d, id, l) => (grp(d, id).items.find(i => i[0] === l) || [])[1] || '';
const num = v => parseFloat(String(v).replace(/\./g, '').replace(',', '.'));

document.body.insertAdjacentHTML('afterbegin', `<header id="hd"><div class="wrap hd">
<a class="brand" href="index.html">Desa Bugangan</a>
<button class="tg" aria-label="Menu" onclick="document.body.classList.toggle('open')">☰</button>
<nav>${NAV.map(([h, t]) => `<a href="${h}" class="${h === page ? 'on' : ''}">${t}</a>`).join('')}</nav><a class="adm ${page === 'admin.html' ? 'on' : ''}" href="admin.html">Admin</a></div></header>`);
document.body.insertAdjacentHTML('beforeend', `<footer><div class="wrap"><p>Desa Bugangan, Kec. Kedungwuni, Kab. Pekalongan, Jawa Tengah 51173</p>
<p>Sumber data: Papan Monografi Desa, keadaan Juli 2017. Tugas Sistem Manajemen Pengetahuan, Teknologi Informasi.</p></div></footer>`);
addEventListener('scroll', () => $('#hd').classList.toggle('s', scrollY > 30), { passive: true });

const table = g => `<section class="panel" data-g="${g.id}"><h3>${esc(g.judul)}</h3><dl>${g.items.map(([l, v]) => `<div class="row"><dt>${esc(l)}</dt><dd>${esc(v) || '-'}</dd></div>`).join('')}</dl></section>`;

function bars(g, el) {
  const max = Math.max(...g.items.map(i => num(i[1]) || 0));
  el.innerHTML = `<h3>${esc(g.judul)}</h3>` + g.items.map(([l, v]) => `<div class="bl"><span>${esc(l)}</span><i style="--w:${(num(v) / max * 100) || 0}%"></i><b>${esc(v)}</b></div>`).join('');
}

function counters(g, el) {
  el.innerHTML = g.items.map(([l, v]) => `<div class="stat"><strong data-v="${esc(v)}">${esc(v)}</strong><span>${esc(l)}</span></div>`).join('');
  $$('strong', el).forEach(s => {
    const n = num(s.dataset.v); if (isNaN(n)) return;
    const dec = /,/.test(s.dataset.v) ? 2 : 0, t0 = performance.now();
    (function f(t) {
      const p = Math.min((t - t0) / 1200, 1), e = 1 - Math.pow(1 - p, 3);
      s.textContent = (n * e).toLocaleString('id-ID', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  });
}

function filterable(d, ids, el) {
  el.innerHTML = ids.map(i => table(grp(d, i))).join('');
  const chips = $('#chips'), q = $('#q');
  chips.innerHTML = `<button class="on" data-f="">Semua</button>` + ids.map(i => `<button data-f="${i}">${esc(grp(d, i).judul)}</button>`).join('');
  let f = '';
  const apply = () => {
    const t = q.value.toLowerCase().trim(); let any = 0;
    $$('.panel', el).forEach(p => {
      let hit = 0;
      $$('.row', p).forEach(r => { const m = !t || r.textContent.toLowerCase().includes(t); r.hidden = !m; hit += m; });
      p.hidden = (f && p.dataset.g !== f) || !hit; any += !p.hidden;
    });
    $('#empty').hidden = any > 0;
  };
  chips.onclick = e => { if (e.target.dataset.f === undefined) return; f = e.target.dataset.f; $$('button', chips).forEach(b => b.classList.toggle('on', b === e.target)); apply(); };
  q.oninput = apply;
}

async function adminInit() {
  const root = $('#admin'); let pw = sessionStorage.pw || '', data, cur = 0;
  const api = async body => {
    try {
      const r = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-pw': pw }, body: JSON.stringify(body) });
      if (r.status !== 404 && r.status !== 502) {
        const j = await r.json().catch(() => ({}));
        return { ok: r.ok, ...j };
      }
    } catch (e) {}
    // Mode offline / lokal jika belum di-deploy ke Vercel
    if (pw === '11111') {
      if (body.check) return { ok: true };
      if (body.reset) { localStorage.removeItem('bugangan-data'); return { ok: true }; }
      if (body.groups) { localStorage.setItem('bugangan-data', JSON.stringify(body)); return { ok: true }; }
      return { ok: true };
    }
    return { ok: false, error: 'Password salah' };
  };
  const login = () => {
    root.innerHTML = `<form class="panel login" id="lf"><h3>Masuk admin</h3><input type="password" id="pw" placeholder="Password admin (11111)" autofocus><button class="btn">Masuk</button><p class="msg" id="m"></p></form>`;
    $('#lf').onsubmit = async e => { e.preventDefault(); pw = $('#pw').value; const r = await api({ check: 1 }); if (r.ok) { sessionStorage.pw = pw; editor(); } else $('#m').textContent = r.error || 'Password salah'; };
  };
  const editor = async () => {
    data = await load(); window.aduanInit && aduanInit(pw);
    const draw = () => {
      const g = data.groups[cur];
      root.innerHTML = `<div class="toolbar"><select id="sel">${data.groups.map((x, i) => `<option value="${i}" ${i === cur ? 'selected' : ''}>${esc(x.judul)}</option>`).join('')}</select>
      <button class="btn" id="save">Simpan perubahan</button><button class="btn ghost" id="rst">Pulihkan data awal</button><button class="btn ghost" id="out">Keluar</button></div><p class="msg" id="m"></p>
      <div class="panel" id="rows">${g.items.map((r, i) => `<div class="er"><input value="${esc(r[0])}" data-i="${i}" data-k="0" aria-label="Label"><textarea rows="2" data-i="${i}" data-k="1" aria-label="Isi">${esc(r[1])}</textarea><button class="x" data-del="${i}" title="Hapus baris">✕</button></div>`).join('')}
      <button class="btn ghost" id="add">Tambah baris</button></div>`;
      $('#sel').onchange = e => { cur = +e.target.value; draw(); };
      $('#rows').oninput = e => { const t = e.target; if (t.dataset.i) g.items[t.dataset.i][t.dataset.k] = t.value; };
      $('#rows').onclick = e => { if (e.target.dataset.del) { g.items.splice(e.target.dataset.del, 1); draw(); } };
      $('#add').onclick = () => { g.items.push(['', '']); draw(); };
      $('#out').onclick = () => { sessionStorage.removeItem('pw'); location.reload(); };
      $('#save').onclick = async () => { const r = await api(data); $('#m').textContent = r.ok ? 'Tersimpan. Perubahan langsung tampil di situs.' : r.error; };
      $('#rst').onclick = async () => { if (!confirm('Kembalikan semua data ke versi awal?')) return; const r = await api({ reset: 1 }); if (r.ok) editor(); else $('#m').textContent = r.error; };
    };
    draw();
  };
  pw ? ((await api({ check: 1 })).ok ? editor() : login()) : login();
}

(async () => {
  if (page === 'admin.html') return adminInit();
  const d = await load();
  if (page === 'index.html') {
    $('#judul').textContent = item(d, 'profil', 'Judul beranda');
    $('#sub').textContent = item(d, 'profil', 'Subjudul');
    counters(grp(d, 'statistik'), $('#stats'));
  }
  if (page === 'profil.html') {
    $('#tentang').textContent = item(d, 'profil', 'Tentang');
    $('#batas').innerHTML = grp(d, 'batas').items.map(([l, v]) => `<div class="dir"><span>${esc(l)}</span><b>${esc(v)}</b></div>`).join('');
    bars(grp(d, 'demografi'), $('#demo'));
  }
  if (page === 'data.html') filterable(d, ['umum', 'batas', 'demografi', 'sarpras'], $('#panels'));
  if (page === 'pemerintahan.html') $('#panels').innerHTML = ['personil', 'lembaga', 'keuangan'].map(i => table(grp(d, i))).join('');
})();
