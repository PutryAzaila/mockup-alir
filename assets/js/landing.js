const D = ALIR_DATA, S = Store.get();
initPage({active: 'index.html'});
FX.radar($('#radar'));
['hero-lapor', 'cta-lapor', 'mnew'].forEach(id => { const b = $('#' + id); if (b) b.onclick = openLapor; });

const SEVN = {1: 'Ringan', 2: 'Sedang', 3: 'Parah'};
const STN = {aktif: 'Aktif', ditangani: 'Ditangani', surut: 'Surut'};
const STC = {aktif: '#E5484D', ditangani: '#F5A524', surut: '#14B8A6'};
const urgCls = {Kritis: 'red', Mendesak: 'amber', Normal: 'teal'};

/* ---------- hero: ticker, feed berputar, counter ---------- */
const act = S.reports.filter(r => r.status === 'aktif');
const tk = ['Rob 60-90 cm di Panjang Wetan, Kandang Panjang & Pabean', 'Pasang tertinggi 18.40 WIB, warga pesisir harap waspada', 'Dapur Umum Krapyak butuh beras 50 kg'].map(t => `<span>${t}</span>`).join('');
$('#ticker').innerHTML = tk + tk;
let fo = 0;
function feed() {
  const list = [0, 1, 2].map(i => act[(fo + i) % act.length]);
  $('#feed').innerHTML = list.map((r, i) => `<button class="fi" data-id="${r.id}"><i class="d" style="background:${STC[r.status]}"></i><span><b>Kel. ${esc(r.kel)}</b><span class="s">${STN[r.status]} &middot; ${r.people} jiwa &middot; ${esc(r.ts)}</span></span><span class="n">${r.h}<small> cm</small></span></button>`).join('');
  $$('#feed .fi').forEach(b => b.onclick = () => pick(b.dataset.id, true));
}
feed();
const vol = S.teams.reduce((a, t) => a + t.cur, 0), ppl = S.reports.reduce((a, r) => a + r.people, 0);
$('#counters').innerHTML = [
  [act.length, 'Titik banjir aktif', 'diverifikasi BPBD', '', ''],
  [ppl, 'Jiwa terdampak', 'tercatat hari ini', '', ''],
  [vol, 'Relawan bertugas', S.teams.length + ' komunitas siaga', '', ''],
  [371, 'Donasi tersalur', 'dengan bukti foto', 'Rp', ' jt'],
].map(c => `<div><b data-count="${c[0]}" data-pre="${c[3]}" data-suf="${c[4]}">0</b><div class="l">${c[1]}</div><div class="m"><i></i>${c[2]}</div></div>`).join('');

/* ---------- peta ---------- */
let map, markers = {}, zones, poskos, tab = 'aktif', sel = null;
function drawMap() {
  map = AlirMap.create('map', {zoom: 14}); map.zoomControl.setPosition('topright');
  zones = L.layerGroup().addTo(map); poskos = L.layerGroup().addTo(map);
  D.poskos.forEach(p => {
    L.circle([p.lat, p.lng], {radius: p.r, color: '#14B8A6', weight: 1.5, dashArray: '6 6', fillColor: '#14B8A6', fillOpacity: .09, interactive: false}).addTo(zones);
    L.marker([p.lat, p.lng], {icon: AlirMap.poskoIcon()}).bindPopup(`<b>${esc(p.name)}</b><br>Radius layanan ${p.r} m`).addTo(poskos);
  });
  S.reports.forEach(r => { const m = L.marker([r.lat, r.lng], {icon: AlirMap.sevIcon(r.sev, r.status === 'surut')}); m.on('click', () => pick(r.id)); markers[r.id] = m; });
}
function tabs() {
  $('#mtabs').innerHTML = ['aktif', 'ditangani', 'surut'].map(k => `<button class="mt ${tab === k ? 'on' : ''}" data-k="${k}"><b>${S.reports.filter(r => r.status === k).length}</b><span><i style="background:${STC[k]}"></i>${STN[k]}</span></button>`).join('');
  $$('#mtabs .mt').forEach(b => b.onclick = () => { tab = b.dataset.k; tabs(); list(); showMarkers(); });
}
function list() {
  const l = S.reports.filter(r => r.status === tab);
  $('#mlist').innerHTML = l.length ? l.map((r, i) => `<button class="mr ${sel === r.id ? 'on' : ''}" data-id="${r.id}"><span><b>Kel. ${esc(r.kel)}</b><small>${SEVN[r.sev]} &middot; ${r.people} jiwa &middot; ${esc(r.ts)}</small></span><span class="n">${r.h}<small> cm</small></span></button>`).join('') : '<div class="empty">Tidak ada laporan.</div>';
  $$('#mlist .mr').forEach(b => b.onclick = () => pick(b.dataset.id, true));
}
function showMarkers() { S.reports.forEach(r => { const on = r.status === tab; on ? markers[r.id].addTo(map) : map.removeLayer(markers[r.id]); }); }
function pick(id, fly) {
  const r = S.reports.find(x => x.id === id); if (!r) return;
  if (r.status !== tab) { tab = r.status; tabs(); showMarkers(); }
  sel = id; list();
  if (fly && map) { const wide = innerWidth > 820, off = wide ? 180 : 0; map.flyTo(map.unproject(map.project([r.lat, r.lng], 16).subtract([off, 0]), 16), 16, {duration: 1.2}); }
  const mb = $('.mapbox'); if (mb) { const q = mb.getBoundingClientRect(); if (q.top < 70 || q.bottom > innerHeight - 20) mb.scrollIntoView({behavior: 'smooth', block: 'center'}); }
  const ps = D.poskos.map(p => ({p, d: haversine(r.lat, r.lng, p.lat, p.lng)})).sort((a, b) => a.d - b.d)[0];
  const f = $('#mfocus'); f.hidden = false; f.style.animation = 'none'; void f.offsetWidth; f.style.animation = '';
  f.innerHTML = `<div class="h"><div><div class="st"><i style="background:${STC[r.status]}"></i>${STN[r.status].toUpperCase()}</div><h3>Kel. ${esc(r.kel)}</h3><small class="xs muted">${r.id} &middot; ${esc(r.ts)}</small></div><button class="x" aria-label="Tutup"><i data-lucide="x"></i></button></div>
    <div class="g3"><div><b>${r.h}<small> cm</small></b><small>Ketinggian</small></div><div><b>${r.people}</b><small>Jiwa</small></div><div><b>${SEVN[r.sev]}</b><small>Keparahan</small></div></div>
    <div class="row small" style="padding:0 18px 14px;gap:8px;color:#2A4560"><i data-lucide="tent" style="color:var(--coral-dark)"></i>${esc(ps.p.name)} &middot; ${fmtDist(ps.d)}</div>
    <div class="ac"><a href="https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}" target="_blank" rel="noopener">Arahkan<i data-lucide="navigation"></i></a><a class="c" href="donasi.html">Bantu<i data-lucide="hand-heart"></i></a></div>`;
  $('.x', f).onclick = () => { f.hidden = true; sel = null; list(); };
  icons();
  if (innerWidth <= 820) setTimeout(() => f.scrollIntoView({behavior: 'smooth', block: 'center'}), 60);
}
if (window.L) {
  drawMap(); tabs(); list(); showMarkers();
  const tg = (id, layer) => { const b = $('#' + id); b.onclick = () => { b.classList.toggle('on'); b.classList.contains('on') ? layer().addTo(map) : map.removeLayer(layer()); }; };
  tg('tg-posko', () => poskos); tg('tg-zone', () => zones);
} else $('#map').innerHTML = '<div class="empty">Peta membutuhkan koneksi internet.</div>';

/* ---------- wishlist ---------- */
const rank = {Kritis: 0, Mendesak: 1, Normal: 2};
const top3 = S.wishlist.slice().sort((a, b) => rank[a.urg] - rank[b.urg] || (b.got / b.target) - (a.got / a.target)).slice(0, 3);
$('#wish').innerHTML = top3.map(w => {
  const p = Math.round(w.got / w.target * 100), col = {Kritis: 'var(--red-ink)', Mendesak: 'var(--coral-dark)', Normal: 'var(--teal-ink)'}[w.urg];
  return `<article class="w-card"><div class="ph"><img class="gs" src="${img(w.img)}" alt="${esc(w.name)}" loading="lazy"><span class="tag ${urgCls[w.urg]}">${w.urg}</span></div>
    <div class="bd"><b style="font-size:22px;letter-spacing:-.02em">${esc(w.name)}</b><span class="small muted">${esc(w.by)}</span>
      <span class="row between" style="align-items:flex-end;margin-top:12px"><span class="pct" style="color:${col}">${p}%</span><span class="xs muted" style="text-align:right">${rp(w.price * w.got)}<br>dari ${rp(w.price * w.target)}</span></span>
      <div class="bar ${w.urg === 'Kritis' ? 'coral' : w.urg === 'Mendesak' ? 'amber' : ''}"><i style="width:${p}%"></i></div></div>
    <a class="go" href="donasi.html?item=${w.id}">Donasi<i data-lucide="arrow-right" class="arr"></i></a></article>`;
}).join('');

/* ---------- transparansi: timeline batch ---------- */
const BX = {
  'DST-0415': {amt: 8160000, kk: '120 KK penerima', time: '15 Apr, 09.40 WIB', team: 'Komunitas Sigap Pantura'},
  'DST-0412': {amt: 5100000, kk: '60 KK penerima', time: '12 Apr, 14.10 WIB', team: 'PMI Relawan Kota'},
  'DST-0409': {amt: 2480000, kk: '40 KK penerima', time: '09 Apr, 11.25 WIB', team: 'Banser Peduli Banjir'},
  'DST-0405': {amt: 5700000, kk: '2 unit pompa terpasang', time: '05 Apr, 16.00 WIB', team: 'Mapala Bahari'},
};
let bsel = D.batches[0].id;
function batchTabs() {
  $('#btabs').innerHTML = D.batches.map(b => `<button class="bb ${b.id === bsel ? 'on' : ''}" data-id="${b.id}"><small>${b.id} &middot; ${b.date}</small><b>${esc(b.item)}</b></button>`).join('');
  $$('#btabs .bb').forEach(b => b.onclick = () => withProgress(() => { bsel = b.dataset.id; batchTabs(); batchDet(); }, 300));
}
function batchDet() {
  const b = D.batches.find(x => x.id === bsel), x = BX[b.id], done = i => b.stage >= i;
  const step = (i, ic, t, v, m, cls) => `<div class="ts" style="animation-delay:${i * .15}s"><span class="o ${done(i + 1) ? '' : 'pend'}"><i data-lucide="${ic}"></i></span><div class="t">${t}</div>${v}<div class="m">${m}</div></div>`;
  $('#bdet').style.animation = 'none'; void $('#bdet').offsetWidth; $('#bdet').style.animation = '';
  $('#bdet').innerHTML = `<div class="tl">
    ${step(0, 'shopping-bag', 'BARANG DIBELI', `<div class="v">${rp(x.amt)}</div><div>${esc(b.item)}</div>`, `${esc(b.vendor)} &middot; ${esc(b.inv)}`)}
    ${step(1, 'map-pin', 'LOKASI DISTRIBUSI', `<div class="v2">${esc(b.loc)}</div><div>${x.kk}</div>`, `${x.time} &middot; ${esc(x.team)}`)}
    ${step(2, done(3) ? 'camera' : 'hourglass', 'DOKUMENTASI', `<div style="margin-top:4px">${done(3) ? 'Foto bergeotag diunggah relawan dan telah dimoderasi admin.' : 'Menunggu unggahan dokumentasi dari relawan.'}</div>`, '')}
  </div>
  <figure><div class="pic"><img class="gs" src="${img(b.doc)}" alt="Dokumentasi ${b.id}"></div><figcaption><span>${b.id} &middot; ${esc(b.item)}</span><span class="row" style="gap:6px"><i data-lucide="locate-fixed" style="width:13px;height:13px"></i>Geotag terverifikasi</span></figcaption></figure>`;
  icons();
}
batchTabs(); batchDet();

/* ---------- galeri & kontak ---------- */
const CAP = [['Evakuasi warga lansia, Pabean', '15 Apr'], ['Pembagian paket sembako', '14 Apr'], ['Distribusi selimut di GOR', '12 Apr'], ['Pemasangan pompa air', '11 Apr'], ['Logistik tiba di bandara', '10 Apr'], ['Posko pengungsian Panjang', '09 Apr'], ['Heli bantu desa terisolir', '08 Apr'], ['Pantau genangan Kandang Panjang', '07 Apr']];
$('#gallery').innerHTML = D.gallery.map((g, i) => `<figure><div class="im"><img class="gs" src="${img(g)}" alt="${esc(CAP[i][0])}" loading="lazy"></div><figcaption><span style="font-weight:700">${CAP[i][0]}</span><span>${CAP[i][1]}</span></figcaption></figure>`).join('');
$$('#gallery .im').forEach(f => f.onclick = () => { const b = openModal(`<div class="lb-h"><b>Dokumentasi lapangan</b><button class="lp-x" data-c aria-label="Tutup"><i data-lucide="x"></i></button></div><img class="lb-img" src="${$('img', f).src}" alt="">`, {cls: 'lightbox'}); $('[data-c]', b).onclick = () => closeModal(b); icons(); });
const CS = {'112': 'Panggilan darurat nasional', '110': 'Kepolisian', '119': 'Ambulans & gawat darurat', '115': 'Basarnas, pencarian & pertolongan', '123': 'Palang Merah Indonesia', '113': 'Pemadam kebakaran & BPBD'};
$('#contacts').innerHTML = D.contacts.map(c => `<a class="ct" href="tel:${c.num}"><span class="ic"><i data-lucide="${c.ic}"></i></span><span class="t"><b>${esc(c.n)}</b><small>${CS[c.num]}</small></span><span class="n">${c.num}</span></a>`).join('');

icons(); mountReveal();
