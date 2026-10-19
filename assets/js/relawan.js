const S = Store.get(), D = ALIR_DATA, ME = 'T-02';
const me = () => S.teams.find(t => t.id === ME);
let tab = (location.hash || '#beranda').slice(1), pmap = null;
const TABS = ['beranda', 'tugas', 'inventaris', 'logistik', 'wishlist', 'dok', 'profil'];
const view = $('#view'), save = () => Store.save();
const myTasks = () => S.tasks.filter(k => k.team === ME);
const invSt = i => i.stock <= i.min * .5 ? ['Kritis', 'red'] : i.stock < i.min ? ['Menipis', 'amber'] : ['Aman', 'teal'];
const myLog = () => S.logistics.filter(l => l.team === me().name);
const head = (t, sub, right = '') => `<div class="pg-h"><div><span class="kicker">PORTAL RELAWAN</span><h2>${t}</h2><p class="muted">${sub}</p></div>${right}</div>`;
const STG = ['Menuju lokasi', 'Ditangani', 'Selesai'];

function badges() {
  const n = myTasks().filter(k => !k.accepted && !k.rejected).length, i = S.inventory.filter(x => invSt(x)[0] !== 'Aman').length, l = myLog().filter(x => x.status === 'disetujui').length;
  [['b-tugas', n], ['b-inv', i], ['b-log', l]].forEach(([id, v]) => { const e = $('#' + id), pv = e.dataset.p; e.textContent = v; e.style.display = v ? '' : 'none'; if (pv !== undefined && pv !== String(v)) { e.classList.remove('badge-bounce'); void e.offsetWidth; e.classList.add('badge-bounce'); } e.dataset.p = v; });
  $('#tname').textContent = me().name; $('#onduty').textContent = me().cur;
}
let firstNav = true;
function nav(t) {
  tab = TABS.includes(t) ? t : 'beranda'; location.hash = tab;
  $$('.side [data-tab]').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
  $('#side').classList.remove('open'); if (pmap) { pmap.remove(); pmap = null; }
  const draw = () => { badges(); R[tab](); icons(); [...view.children].forEach((c, i) => c.style.setProperty('--i', i)); mountReveal(); scrollTo(0, 0); };
  if (firstNav) { firstNav = false; draw(); } else withProgress(draw, 280);
}

/* peta mini: posko, radius layanan, dan lokasi tugas */
function miniMap(id, tasks) {
  if (!window.L || !$('#' + id)) return;
  const t = me(); pmap = AlirMap.create(id, {center: [t.lat, t.lng], zoom: 14});
  L.circle([t.lat, t.lng], {radius: S.radius || 900, color: '#14B8A6', weight: 2, dashArray: '6 6', fillOpacity: .12}).addTo(pmap);
  L.marker([t.lat, t.lng], {icon: AlirMap.teamIcon(false)}).bindPopup('<b>' + esc(t.name) + '</b><br>Posko Anda').addTo(pmap);
  const pts = [[t.lat, t.lng]];
  tasks.forEach(k => { const r = S.pending.find(x => x.id === k.rep) || S.reports.find(x => x.id === k.rep); if (r) { L.marker([r.lat, r.lng], {icon: AlirMap.sevIcon(r.sev)}).bindPopup('<b>' + esc(k.kel) + '</b><br>' + k.people + ' warga · ' + k.h + ' cm').addTo(pmap); pts.push([r.lat, r.lng]); } });
  if (pts.length > 1) pmap.fitBounds(pts, {padding: [40, 40], maxZoom: 15});
}

const R = {
  beranda() {
    const tk = myTasks().filter(k => k.stage < 2 && !k.rejected), low = S.inventory.filter(i => invSt(i)[0] !== 'Aman');
    view.innerHTML = head('Selamat bertugas', 'Ringkasan hari ini untuk ' + me().name) + `
    <div class="grid g3">
      <div class="stat"><span class="ic" style="background:var(--coral-tint);color:var(--coral-dark)"><i data-lucide="clipboard-list"></i></span><b data-count="${tk.length}">0</b><span>Tugas aktif</span></div>
      <div class="stat"><span class="ic" style="background:var(--amber-tint);color:var(--amber-ink)"><i data-lucide="triangle-alert"></i></span><b data-count="${low.length}">0</b><span>Stok perlu perhatian</span></div>
      <div class="stat"><span class="ic" style="background:var(--teal-tint);color:var(--teal-ink)"><i data-lucide="users"></i></span><b data-count="${me().cur}">0</b><span>Anggota bertugas</span></div>
    </div>
    <div class="rs-g" style="grid-template-columns:minmax(0,1.1fr) minmax(280px,.9fr)">
      <div class="col" style="gap:16px"><div class="card"><div class="row between"><h3>Tugas hari ini</h3><button class="btn btn-ghost btn-sm" data-go="tugas">Lihat semua</button></div>
        ${tk.length ? tk.map(k => `<div class="rank" style="grid-template-columns:1fr auto"><div><b>${esc(k.kel)}</b><div class="xs muted">${k.people} warga &middot; ${k.h} cm &middot; ${fmtDist(k.dist)}</div></div><span class="tag ${k.accepted ? 'water' : 'coral'}">${k.accepted ? STG[k.stage] : 'Baru'}</span></div>`).join('') : '<div class="empty">Belum ada tugas. Tunggu penugasan dari admin.</div>'}</div>
      <div class="card" style="flex:1;display:flex;flex-direction:column"><div class="row between"><h3>Area layanan</h3><span class="tag teal">radius ${S.radius || 900} m</span></div><div id="bmap" class="map" style="flex:1;min-height:240px;margin-top:12px"></div></div></div>
      <div class="card"><h3>Peringatan stok</h3>${low.length ? low.map(i => `<div class="rank" style="grid-template-columns:1fr auto"><div><b>${esc(i.name)}</b><div class="xs muted">${i.stock} / min ${i.min} ${i.unit}</div></div><span class="tag ${invSt(i)[1]}">${invSt(i)[0]}</span></div>`).join('') : '<div class="empty">Semua stok aman.</div>'}
        <button class="btn btn-coral btn-sm" style="margin-top:14px" data-go="logistik">Ajukan logistik</button></div>
    </div>`;
    miniMap('bmap', tk);
    $$('[data-go]').forEach(b => b.onclick = () => nav(b.dataset.go)); $$('[data-count]').forEach(countUp);
  },

  tugas() {
    const ts = myTasks();
    view.innerHTML = head('Penugasan', 'Terima atau tolak tugas, lalu perbarui tahapnya hingga selesai.') + (ts.length ? `<div class="rs-g" style="grid-template-columns:minmax(0,1.15fr) minmax(300px,.85fr);align-items:start"><div class="col" style="gap:16px">${ts.map(k => {
      const pos = k.accepted ? k.stage : -1;
      return `<div class="card" style="${k.rejected ? 'opacity:.6' : ''}"><div class="row between"><div><span class="kicker">${k.rep}</span><h3 style="margin-top:6px">${esc(k.kel)}</h3></div>${k.rejected ? '<span class="tag red">Ditolak</span>' : !k.accepted ? '<span class="tag coral">Tugas baru</span>' : k.stage === 2 ? '<span class="tag teal">Selesai</span>' : '<span class="tag water">Berjalan</span>'}</div>
        <div class="grid g3" style="gap:10px;margin:14px 0"><div class="stk"><span class="xs muted">Warga</span><b>${k.people}</b></div><div class="stk"><span class="xs muted">Tinggi air</span><b>${k.h} cm</b></div><div class="stk"><span class="xs muted">Jarak</span><b>${fmtDist(k.dist)}</b></div></div>
        ${k.rejected ? `<p class="small muted">Alasan: ${esc(k.rejected)}</p>` : !k.accepted ? `<div class="row"><button class="btn btn-teal grow" data-ac="${k.id}">Terima</button><button class="btn btn-ghost grow" data-rj="${k.id}">Tolak</button></div>` :
        `<div class="stepper">${STG.map((s, i) => `<div class="st ${i < pos || (k.stage === 2 && i === 2) ? 'done' : i === pos ? 'on' : ''}"><i>${i < pos || (k.stage === 2 && i === 2) ? '&#10003;' : i + 1}</i>${s}</div>`).join('')}</div>
         ${k.stage < 2 ? `<button class="btn btn-coral" style="width:100%" data-adv="${k.id}">${k.stage === 0 ? 'Mulai tangani' : 'Selesaikan &amp; konfirmasi lapangan'}</button>` : '<p class="small" style="color:var(--teal-ink)"><b>Konfirmasi lapangan tercatat.</b></p>'}`}</div>`;
    }).join('')}<div class="card"><h3>Ringkasan penugasan</h3><div class="grid" style="grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0 18px">${[['Baru', ts.filter(k => !k.accepted && !k.rejected).length, 'coral'], ['Berjalan', ts.filter(k => k.accepted && k.stage < 2).length, 'water'], ['Selesai', ts.filter(k => k.stage === 2).length, 'teal']].map(([l, n, c]) => `<div class="stk" style="padding:12px;border-radius:16px;background:var(--${c}-tint);gap:2px"><b style="font-size:26px;line-height:1">${n}</b><span class="xs" style="font-weight:700">${l}</span></div>`).join('')}</div><div class="col" style="gap:12px">${[['users', 'Utamakan lansia, anak-anak, dan ibu hamil.'], ['camera', 'Ambil foto bukti sebelum dan sesudah penanganan.'], ['refresh-cw', 'Perbarui tahap tugas agar admin dan pelapor ikut terkabari.']].map(t => `<div class="row" style="gap:12px;align-items:flex-start"><span style="width:34px;height:34px;border-radius:12px;background:var(--s-100);display:grid;place-items:center;flex:none"><i data-lucide="${t[0]}"></i></span><span class="small" style="padding-top:6px">${t[1]}</span></div>`).join('')}</div></div></div><div class="card" style="position:sticky;top:90px"><div class="row between"><h3>Peta tugas</h3><span class="tag water">${ts.length} lokasi</span></div><div id="tmap" class="map" style="height:380px;margin-top:12px"></div><div class="map-leg"><span><i style="background:#0B1E33"></i>Posko Anda</span><span><i style="background:#E5484D"></i>Lokasi tugas</span></div></div></div>` : '<div class="card empty">Belum ada tugas untuk komunitas Anda.<br><span class="small">Coba buat laporan di Landing, verifikasi dan tugaskan di Admin (pilih Komunitas Sigap Pantura / T-02).</span></div>');
    miniMap('tmap', ts);
    $$('[data-ac]').forEach(b => b.onclick = async () => { const k = S.tasks.find(x => x.id === b.dataset.ac);
      if (!await ask({title: 'Terima tugas?', body: 'Tim Anda berangkat ke lokasi.', tone: 'ok', rows: [['Lokasi', k.kel], ['Warga', k.people], ['Jarak', fmtDist(k.dist)], ['ETA', eta(k.dist) + ' menit']], yes: 'Terima tugas'})) return;
      k.accepted = true; k.stage = 0; save(); Store.log(`${me().name} menerima ${k.id}`); toast('Tugas diterima', 'ok'); nav('tugas'); });
    $$('[data-rj]').forEach(b => b.onclick = async () => { const k = S.tasks.find(x => x.id === b.dataset.rj);
      const why = await ask({title: 'Tolak tugas?', body: 'Admin akan menugaskan ulang ke komunitas lain.', tone: 'danger', input: 'Alasan penolakan', yes: 'Tolak tugas'}); if (!why) return;
      k.rejected = why; save(); Store.log(`${me().name} menolak ${k.id}`); toast('Tugas ditolak'); nav('tugas'); });
    $$('[data-adv]').forEach(b => b.onclick = async () => { const k = S.tasks.find(x => x.id === b.dataset.adv);
      if (k.stage === 0) { k.stage = 1; save(); toast('Status: Ditangani', 'ok'); return nav('tugas'); }
      if (!await ask({title: 'Konfirmasi lapangan', body: 'Pastikan warga sudah ditangani sebelum menyelesaikan tugas.', tone: 'ok', rows: [['Lokasi', k.kel], ['Warga ditangani', k.people]], yes: 'Ya, selesai'})) return;
      k.stage = 2; const r = S.reports.find(x => x.id === k.rep); if (r) r.status = 'ditangani'; save(); Store.log(`Tugas ${k.id} selesai`); toast('Tugas selesai', 'ok'); nav('tugas'); });
  },

  inventaris() {
    S.invHist = S.invHist || [{t: '08.30', txt: 'Keluar 20 Mi instan ke Pabean'}, {t: '07.10', txt: 'Masuk 60 Air mineral dari Admin'}];
    view.innerHTML = head('Inventaris', 'Stok posko dan riwayat mutasi.') + `<div class="rs-g" style="grid-template-columns:minmax(0,1.9fr) minmax(260px,.8fr);align-items:start"><div class="card"><div class="tbl-wrap"><table class="tbl inv-t"><thead><tr><th>Barang</th><th>Stok</th><th>Level</th><th>Status</th><th></th></tr></thead><tbody>${S.inventory.map(i => { const s = invSt(i), p = Math.min(100, i.stock / (i.min * 2) * 100); return `<tr><td><b>${esc(i.name)}</b></td><td class="mono">${i.stock} ${i.unit}<div class="xs muted">min ${i.min}</div></td><td><div class="inv-bar"><i style="width:${p}%;background:${s[1] === 'red' ? 'var(--red)' : s[1] === 'amber' ? 'var(--amber)' : 'var(--teal)'}"></i></div></td><td><span class="tag ${s[1]}">${s[0]}</span></td><td style="text-align:right;white-space:nowrap"><button class="btn btn-ghost btn-sm" data-mv="in|${i.id}">Masuk</button> <button class="btn btn-ghost btn-sm" data-mv="out|${i.id}">Keluar</button></td></tr>`; }).join('')}</tbody></table></div></div>
      <div class="card"><h3>Ringkasan stok</h3><div class="grid" style="grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0 22px">${[['Aman', 'teal'], ['Menipis', 'amber'], ['Kritis', 'red']].map(([k, c]) => `<div class="stk" style="padding:12px;border-radius:16px;background:var(--${c}-tint);gap:2px"><b style="font-size:26px;line-height:1">${S.inventory.filter(x => invSt(x)[0] === k).length}</b><span class="xs" style="font-weight:700">${k}</span></div>`).join('')}</div><h3>Riwayat mutasi</h3><div style="margin-top:8px">${S.invHist.slice(0, 10).map(a => `<div class="audit"><time>${a.t}</time><span>${esc(a.txt)}</span></div>`).join('')}</div></div></div>`;
    $$('[data-mv]').forEach(b => b.onclick = () => { const [k, id] = b.dataset.mv.split('|'), i = S.inventory.find(x => x.id === id);
      const m = openModal(`<div class="modal-h"><h3>${k === 'in' ? 'Barang masuk' : 'Barang keluar'}: ${esc(i.name)}</h3></div><div class="field"><label>Jumlah (${i.unit})</label><input class="input" id="mq" type="number" min="1" value="10"></div><div class="err-msg" id="me"></div><div class="row" style="justify-content:flex-end;margin-top:18px"><button class="btn btn-ghost" data-c>Batal</button><button class="btn btn-coral" data-s>Simpan</button></div>`);
      $('[data-c]', m).onclick = () => closeModal(m);
      $('[data-s]', m).onclick = () => { const q = +$('#mq', m).value; if (!(q > 0)) return $('#me', m).textContent = 'Jumlah harus lebih dari 0.'; if (k === 'out' && q > i.stock) return $('#me', m).textContent = 'Melebihi stok tersedia.';
        i.stock += k === 'in' ? q : -q; const d = new Date(); S.invHist.unshift({t: String(d.getHours()).padStart(2, '0') + '.' + String(d.getMinutes()).padStart(2, '0'), txt: `${k === 'in' ? 'Masuk' : 'Keluar'} ${q} ${i.name}`}); save(); closeModal(m); toast('Stok diperbarui', 'ok'); nav('inventaris'); }; });
  },

  logistik() {
    const ls = myLog();
    view.innerHTML = head('Permintaan Logistik', 'Ajukan kebutuhan ke admin dan catat distribusi.', '<button class="btn btn-coral" id="nl"><i data-lucide="plus"></i>Ajukan permintaan</button>') + `<div class="card">${ls.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>ID</th><th>Barang</th><th>Jumlah</th><th>Tenggat</th><th>Status</th><th></th></tr></thead><tbody>${ls.map(l => `<tr><td><b>${l.id}</b></td><td>${esc(l.item)}<div class="xs muted">${esc(l.why)}</div></td><td>${l.approved || l.req}</td><td class="small">${esc(l.deadline)}</td><td><span class="tag ${l.status === 'disetujui' ? 'teal' : l.status === 'ditolak' ? 'red' : 'amber'}">${l.status}</span></td><td style="text-align:right;white-space:nowrap">${l.status === 'menunggu' ? `<button class="btn btn-ghost btn-sm" data-cl="${l.id}">Batalkan</button>` : l.status === 'disetujui' && !l.dist ? `<button class="btn btn-teal btn-sm" data-ds="${l.id}">Catat distribusi</button>` : l.dist ? '<span class="tag">Terdistribusi</span>' : ''}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Belum ada permintaan.</div>'}</div>`;
    $('#nl').onclick = () => { const m = openModal(`<div class="modal-h"><h3>Ajukan permintaan</h3></div><div class="col" style="gap:14px"><div class="field"><label>Barang</label><select class="input" id="li">${S.inventory.map(i => `<option>${esc(i.name)}</option>`).join('')}</select></div><div class="field"><label>Jumlah</label><input class="input" id="lq" type="number" min="1" value="20"></div><div class="field"><label>Alasan</label><textarea class="input" id="lw" placeholder="Kenapa dibutuhkan?"></textarea></div></div><div class="err-msg" id="le"></div><div class="row" style="justify-content:flex-end;margin-top:18px"><button class="btn btn-ghost" data-c>Batal</button><button class="btn btn-coral" data-s>Kirim</button></div>`);
      $('[data-c]', m).onclick = () => closeModal(m);
      $('[data-s]', m).onclick = () => { const q = +$('#lq', m).value, w = $('#lw', m).value.trim(); if (!(q > 0) || !w) return $('#le', m).textContent = 'Lengkapi jumlah dan alasan.';
        S.logistics.unshift({id: 'L-' + (230 + S.logistics.length), team: me().name, item: $('#li', m).value, req: q, stock: 50, deadline: 'Besok 12.00', status: 'menunggu', why: w}); save(); closeModal(m); toast('Permintaan terkirim ke admin', 'ok'); nav('logistik'); }; };
    $$('[data-cl]').forEach(b => b.onclick = async () => { if (!await ask({title: 'Batalkan permintaan?', body: b.dataset.cl, tone: 'danger', yes: 'Batalkan'})) return; S.logistics = S.logistics.filter(l => l.id !== b.dataset.cl); save(); toast('Permintaan dibatalkan'); nav('logistik'); });
    $$('[data-ds]').forEach(b => b.onclick = async () => { const l = S.logistics.find(x => x.id === b.dataset.ds); if (!await ask({title: 'Catat distribusi?', body: 'Barang sudah dibagikan ke warga.', tone: 'ok', rows: [['Barang', l.item], ['Jumlah', l.approved || l.req]], yes: 'Catat'})) return; l.dist = true; save(); toast('Distribusi tercatat', 'ok'); nav('logistik'); });
  },

  wishlist() {
    const mine = S.wishlist.filter(w => w.by === me().name || w.by.includes('Sigap'));
    view.innerHTML = head('Wishlist Donasi', 'Barang yang Anda ajukan agar didonasikan publik.', '<button class="btn btn-coral" id="nw"><i data-lucide="plus"></i>Ajukan barang</button>') + `<div class="grid g3">${mine.map(w => `<div class="card"><div class="row between"><span class="tag ${w.urg === 'Kritis' ? 'red' : w.urg === 'Mendesak' ? 'amber' : 'teal'}">${w.urg}</span><span class="xs muted">${w.id}</span></div><h3 style="margin:10px 0 4px">${esc(w.name)}</h3><p class="xs muted">${rp(w.price)} / ${w.unit}</p><div class="bar" style="margin:14px 0 6px"><i style="width:${w.got / w.target * 100}%"></i></div><div class="xs muted" style="margin-bottom:14px">${w.got} dari ${w.target} ${w.unit}</div><div class="row"><button class="btn btn-teal btn-sm grow" data-bw="${w.id}">Catat pembelian</button><button class="btn btn-ghost btn-sm" data-cw="${w.id}">Tutup</button></div></div>`).join('') || '<div class="card empty" style="grid-column:1/-1">Belum ada wishlist.</div>'}</div>`;
    $('#nw').onclick = () => { const m = openModal(`<div class="modal-h"><h3>Ajukan barang</h3></div><div class="col" style="gap:14px"><div class="field"><label>Nama barang</label><input class="input" id="wn"></div><div class="grid g2" style="gap:12px"><div class="field"><label>Harga satuan (Rp)</label><input class="input" id="wp" type="number" value="50000"></div><div class="field"><label>Target jumlah</label><input class="input" id="wt" type="number" value="50"></div></div><div class="field"><label>Urgensi</label><select class="input" id="wu"><option>Normal</option><option>Mendesak</option><option>Kritis</option></select></div></div><div class="err-msg" id="we"></div><div class="row" style="justify-content:flex-end;margin-top:18px"><button class="btn btn-ghost" data-c>Batal</button><button class="btn btn-coral" data-s>Posting</button></div>`);
      $('[data-c]', m).onclick = () => closeModal(m);
      $('[data-s]', m).onclick = () => { const n = $('#wn', m).value.trim(); if (!n) return $('#we', m).textContent = 'Nama barang wajib diisi.';
        S.wishlist.unshift({id: 'W-' + (10 + S.wishlist.length), name: n, img: 'sembako-bnpb.jpg', urg: $('#wu', m).value, price: +$('#wp', m).value || 1000, target: +$('#wt', m).value || 1, got: 0, unit: 'unit', by: me().name, cat: 'Peralatan'}); save(); closeModal(m); toast('Wishlist diposting ke halaman Donasi', 'ok'); nav('wishlist'); }; };
    $$('[data-bw]').forEach(b => b.onclick = async () => { const w = S.wishlist.find(x => x.id === b.dataset.bw); if (!await ask({title: 'Catat pembelian?', body: 'Tambahkan 1 unit sebagai terealisasi.', tone: 'ok', rows: [['Barang', w.name]], yes: 'Catat'})) return; w.got = Math.min(w.target, w.got + 1); save(); nav('wishlist'); });
    $$('[data-cw]').forEach(b => b.onclick = async () => { const w = S.wishlist.find(x => x.id === b.dataset.cw); if (!await ask({title: 'Tutup wishlist?', body: w.name + ' tidak lagi tampil di halaman donasi.', tone: 'warn', yes: 'Tutup'})) return; S.wishlist = S.wishlist.filter(x => x !== w); save(); toast('Wishlist ditutup'); nav('wishlist'); });
  },

  dok() {
    const mine = S.docs.filter(d => d.team === me().name || d.team.includes('Sigap'));
    view.innerHTML = head('Dokumentasi', 'Unggah foto kegiatan. Admin memoderasi sebelum tampil.') + `<div class="card"><label class="row" style="justify-content:center;border:2px dashed var(--s-300);border-radius:20px;padding:28px;cursor:pointer;gap:12px"><i data-lucide="upload" style="width:26px;height:26px"></i><span id="fn">Pilih foto kegiatan</span><input type="file" id="fi" accept="image/*" hidden></label>
      <div class="field" style="margin-top:14px"><label>Keterangan</label><input class="input" id="fc" placeholder="Contoh: Pembagian sembako di Pabean"></div><div class="err-msg" id="fe" style="margin-top:6px"></div><button class="btn btn-coral" id="fs" style="margin-top:12px">Kirim ke moderasi</button></div>
      <div class="dgrid">${mine.map(d => `<div class="dcard"><img src="${img(d.img)}" alt=""><div class="bd"><span class="tag ${d.st === 'disetujui' ? 'teal' : d.st === 'ditolak' ? 'red' : 'amber'}" style="align-self:flex-start">${d.st}</span><p class="small muted">${esc(d.cap)}</p></div></div>`).join('')}</div>`;
    $('#fi').onchange = e => $('#fn').textContent = e.target.files[0] ? e.target.files[0].name : 'Pilih foto kegiatan';
    $('#fs').onclick = () => { const c = $('#fc').value.trim(); if (!$('#fi').files[0] || !c) return $('#fe').textContent = 'Pilih foto dan isi keterangan.';
      S.docs.unshift({id: 'M-' + (40 + S.docs.length), team: me().name, cap: c, img: D.gallery[Math.floor(Math.random() * D.gallery.length)], st: 'menunggu'}); save(); toast('Terkirim ke moderasi admin (gambar contoh dipakai di mockup)', 'ok'); nav('dok'); };
  },

  profil() {
    const t = me(); const rad = S.radius || 900;
    view.innerHTML = head('Profil & Posko', 'Atur kapasitas dan radius layanan yang tampil di peta publik.') + `<div class="grid g2" style="align-items:start"><div class="card col" style="gap:16px"><div class="field"><label>Nama komunitas</label><input class="input" value="${esc(t.name)}" disabled></div><div class="grid g2" style="gap:12px"><div class="field"><label>Kapasitas tim</label><input class="input" id="pc" type="number" value="${t.max}"></div><div class="field"><label>Kontak</label><input class="input" id="pk" value="0812-3300-4411"></div></div>
      <div class="field"><label>Radius layanan: <b id="rv">${rad} m</b></label><input type="range" id="rs" min="300" max="2000" step="50" value="${rad}"></div>
      <div class="field"><label>Keahlian</label><div class="chips" id="sk">${['Evakuasi perahu', 'Dapur umum', 'P3K', 'Logistik', 'Pompa air'].map((s, i) => `<button class="chip ${i < 3 ? 'on' : ''}">${s}</button>`).join('')}</div></div><button class="btn btn-coral" id="ps">Simpan profil</button></div>
      <div class="card"><h3>Pratinjau area layanan</h3><div id="pm" class="map" style="height:380px;margin-top:12px"></div></div></div>`;
    $$('#sk .chip').forEach(c => c.onclick = () => c.classList.toggle('on'));
    let circ;
    if (window.L) { pmap = AlirMap.create('pm', {center: [t.lat, t.lng], zoom: 14}); L.marker([t.lat, t.lng], {icon: AlirMap.teamIcon(false)}).addTo(pmap); circ = L.circle([t.lat, t.lng], {radius: rad, color: '#14B8A6', weight: 2, dashArray: '6 6', fillOpacity: .12}).addTo(pmap); }
    $('#rs').oninput = e => { $('#rv').textContent = e.target.value + ' m'; circ && circ.setRadius(+e.target.value); };
    $('#ps').onclick = () => { S.radius = +$('#rs').value; t.max = +$('#pc').value || t.max; save(); toast('Profil disimpan', 'ok'); };
  },
};

const _wish = R.wishlist;
R.wishlist = function () {
  _wish();
  const g = view.querySelector('.grid.g3'); if (!g) return;
  const mine = S.wishlist.filter(w => w.by === me().name || w.by.includes('Sigap'));
  const got = mine.reduce((a, w) => a + w.got * w.price, 0), tgt = mine.reduce((a, w) => a + w.target * w.price, 0);
  const wrap = document.createElement('div'); wrap.className = 'rs-g'; wrap.style.gridTemplateColumns = 'minmax(0,1.4fr) minmax(280px,.8fr)'; wrap.style.alignItems = 'start';
  g.replaceWith(wrap); g.style.gridTemplateColumns = 'repeat(auto-fit,minmax(280px,1fr))';
  const side = document.createElement('div'); side.className = 'col'; side.style.gap = '16px';
  side.innerHTML = '<div class="card"><span class="xs muted" style="font-weight:700">TERKUMPUL DARI TARGET</span><div style="font-size:30px;font-weight:800;letter-spacing:-.03em;margin:6px 0 10px">' + rp(got) + '</div><div class="bar"><i style="width:' + (tgt ? Math.min(100, got / tgt * 100) : 0) + '%"></i></div><div class="row between xs muted" style="margin-top:8px"><span>' + mine.length + ' barang diajukan</span><span>target ' + rp(tgt) + '</span></div></div>' +
    '<div class="card"><h3>Cara kerja wishlist</h3><div class="col" style="gap:14px;margin-top:14px">' + [['clipboard-pen', 'Ajukan barang', 'Isi nama, harga satuan, target, dan tingkat urgensi.'], ['heart-handshake', 'Publik berdonasi', 'Barang tampil di halaman Donasi dan terisi saat ada donatur.'], ['shopping-bag', 'Catat pembelian', 'Setelah dibelikan, catat realisasi agar transparan.']].map(s => '<div class="row" style="gap:12px;align-items:flex-start"><span style="width:38px;height:38px;border-radius:12px;background:var(--coral-tint);color:var(--coral-dark);display:grid;place-items:center;flex:none"><i data-lucide="' + s[0] + '"></i></span><span><b style="display:block;font-size:14px">' + s[1] + '</b><span class="small muted">' + s[2] + '</span></span></div>').join('') + '</div></div>';
  wrap.append(g, side); icons();
};

$$('.side [data-tab]').forEach(a => a.onclick = () => nav(a.dataset.tab));
$('#menu').onclick = () => $('#side').classList.toggle('open');
addEventListener('hashchange', () => { const t = location.hash.slice(1); if (TABS.includes(t) && t !== tab) nav(t); });
nav(tab);

