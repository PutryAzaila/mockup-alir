const S = Store.get(), D = ALIR_DATA;
let tab = (location.hash || '#ringkasan').slice(1), selId = null, vfilter = 'pending', vmap = null;
const TABS = ['ringkasan', 'verifikasi', 'penugasan', 'logistik', 'donasi', 'dokumentasi', 'komunitas', 'edukasi', 'wa'];
const view = $('#view');
const save = () => Store.save();
const log = t => Store.log(t);
const teamName = id => (S.teams.find(t => t.id === id) || {name: id}).name;
const sevTag = s => `<span class="tag ${s === 3 ? 'red' : s === 2 ? 'amber' : 'teal'}">${SEV[s].n}</span>`;

/* skor kepercayaan: foto 35 + GPS 20 + min(klaster,2)*15 + WA aktif 15 */
function others(r) { return [...S.pending, ...S.reports].filter(o => o.id !== r.id && haversine(r.lat, r.lng, o.lat, o.lng) <= 500); }
function score(r) {
  const c = others(r).length, parts = [['Foto terlampir', r.photo ? 35 : 0, 35], ['Koordinat GPS', r.gps ? 20 : 0, 20], ['Laporan sekitar (500 m)', Math.min(c, 2) * 15, 30], ['WhatsApp aktif', r.waActive ? 15 : 0, 15]];
  const t = parts.reduce((a, p) => a + p[1], 0);
  return {t, parts, c, lv: t >= 70 ? ['Tinggi', 'teal', '#14B8A6'] : t >= 40 ? ['Sedang', 'amber', '#F5A524'] : ['Rendah', 'red', '#E5484D']};
}

function badges() {
  $('#b-ver').textContent = S.pending.filter(r => r.verdict === 'pending').length;
  $('#b-pen').textContent = S.pending.filter(r => r.verdict === 'valid').length;
  $('#b-log').textContent = S.logistics.filter(l => l.status === 'menunggu').length;
  $('#b-doc').textContent = S.docs.filter(d => d.st === 'menunggu').length;
  $('#b-kom').textContent = S.communities.filter(c => c.st === 'menunggu').length;
  ['b-ver', 'b-pen', 'b-log', 'b-doc', 'b-kom'].forEach(id => { const e = $('#' + id), v = e.textContent; e.style.display = v === '0' ? 'none' : ''; if (e.dataset.p !== undefined && e.dataset.p !== v) { e.classList.remove('badge-bounce'); void e.offsetWidth; e.classList.add('badge-bounce'); } e.dataset.p = v; });
  const sum = ids => ids.reduce((a, id) => a + (+$('#' + id).textContent || 0), 0);
  [['g-lap', ['b-ver', 'b-pen']], ['g-ali', ['b-log']], ['g-kon', ['b-doc', 'b-kom']]].forEach(([g, ids]) => { const e = $('#' + g), v = String(sum(ids)); e.textContent = v; e.style.display = v === '0' ? 'none' : ''; });
}
let firstNav = true;
const KICK = {ringkasan: 'UTAMA', verifikasi: 'LAPORAN', penugasan: 'LAPORAN', logistik: 'ALIRAN BANTUAN', donasi: 'ALIRAN BANTUAN', dokumentasi: 'KONTEN & DATA', komunitas: 'KONTEN & DATA', edukasi: 'KONTEN & DATA', wa: 'KONTEN & DATA'};
function nav(t) {
  tab = TABS.includes(t) ? t : 'ringkasan'; location.hash = tab;
  $$('.side [data-tab]').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
  const ga = $('.side [data-tab="' + tab + '"]'), gg = ga && ga.closest('.ng');
  $$('.ng').forEach(x => { x.classList.toggle('has-on', x === gg); if (x === gg) { x.classList.add('open'); $('.ng-h', x).setAttribute('aria-expanded', 'true'); } });
  $('#side').classList.remove('open');
  if (vmap) { vmap.remove(); vmap = null; }
  const draw = () => { badges(); R[tab](); icons(); [...view.children].forEach((c, i) => c.style.setProperty('--i', i)); mountReveal(); scrollTo(0, 0); };
  if (firstNav) { firstNav = false; draw(); } else withProgress(draw, 280);
}
const head = (t, sub, right = '') => `<div class="pg-h"><div><span class="kicker">${KICK[tab] || ''}</span><h2>${t}</h2><p class="muted">${sub}</p></div>${right}</div>`;

const R = {
  /* ---------- RINGKASAN ---------- */
  ringkasan() {
    const pend = S.pending.filter(r => r.verdict === 'pending').length, valid = S.pending.filter(r => r.verdict === 'valid').length;
    const logw = S.logistics.filter(l => l.status === 'menunggu').length, docw = S.docs.filter(d => d.status === 'menunggu' || d.st === 'menunggu').length;
    const fresh = S.donations.slice(0, S.donations.length - D.donations.length).filter(d => d.st === 'settlement');
    const inn = D.funds.in + fresh.reduce((a, d) => a + d.amt, 0), out = D.funds.out;
    view.innerHTML = head('Ringkasan', 'Kondisi terkini Kota Pekalongan') + `
    <div class="kpi-g">
      ${[['siren', 'Laporan menunggu', pend, 'var(--coral-tint)', 'var(--coral-dark)', 'verifikasi'], ['route', 'Siap ditugaskan', valid, 'var(--amber-tint)', 'var(--amber-ink)', 'penugasan'], ['package', 'Logistik menunggu', logw, 'var(--water-tint)', 'var(--water-deep)', 'logistik'], ['images', 'Dokumentasi menunggu', docw, 'var(--teal-tint)', 'var(--teal-ink)', 'dokumentasi'], ['map-pin', 'Titik banjir aktif', S.reports.filter(r => r.status === 'aktif').length, 'var(--red-tint)', 'var(--red-ink)', 'verifikasi'], ['users', 'Komunitas siaga', S.teams.filter(t => !t.busy).length, 'var(--teal-tint)', 'var(--teal-ink)', 'komunitas']].map(c =>
        `<button class="stat hov" style="text-align:left;cursor:pointer" data-go="${c[5]}"><span class="ic" style="background:${c[3]};color:${c[4]}"><i data-lucide="${c[0]}"></i></span><b data-count="${c[2]}">0</b><span>${c[1]}</span></button>`).join('')}
    </div>
    <div class="rs-g">
      <div class="card"><h3>Dana donasi</h3><div class="row between wrapx" style="margin:16px 0 10px"><div><span class="xs muted">Masuk</span><div style="font-size:clamp(20px,6vw,26px);font-weight:800">${rp(inn)}</div></div><div style="text-align:right"><span class="xs muted">Tersalur</span><div style="font-size:clamp(20px,6vw,26px);font-weight:800;color:var(--teal-ink)">${rp(out)}</div></div></div>
        <div class="mini-bar"><i style="width:${out / inn * 100}%;background:var(--teal)"></i><i style="width:${100 - out / inn * 100}%;background:var(--water)"></i></div>
        <div class="row xs muted" style="gap:16px;margin-top:10px"><span><b style="color:var(--teal)">&#9632;</b> Tersalur</span><span><b style="color:var(--water)">&#9632;</b> Saldo ${rp(inn - out)}</span></div></div>
      <div class="card"><h3>Jejak audit</h3><div style="margin-top:8px">${S.audit.slice(0, 7).map(a => `<div class="audit"><time>${a.t}</time><span>${esc(a.txt)}</span></div>`).join('')}</div></div>
    </div>
    <div class="rs-g">
      <div class="card" style="display:flex;flex-direction:column"><div class="row between"><h3>Peta sebaran laporan</h3><span class="tag">${S.reports.length + S.pending.filter(r => r.verdict === 'pending').length} titik</span></div><div id="rmap" class="map" style="flex:1;min-height:340px;margin-top:12px"></div>
        <div class="map-leg"><span><i style="background:#E5484D"></i>Parah</span><span><i style="background:#F5A524"></i>Sedang</span><span><i style="background:#14B8A6"></i>Ringan</span><span><i style="background:transparent;border:2px dashed #FF6A3D"></i>Menunggu verifikasi</span></div></div>
      <div class="card"><div class="row between"><h3>Perlu tindakan</h3><span class="tag coral">${pend + logw + docw}</span></div><div style="margin-top:8px">
        ${S.pending.filter(r => r.verdict === 'pending').slice(0, 3).map(r => `<div class="todo"><span class="ic" style="background:${SEV[r.sev].c}22;color:${SEV[r.sev].c}"><i data-lucide="shield-check"></i></span><span><b>${r.id} · ${esc(r.kel)}</b><small>${r.h} cm · ${r.people} warga · ${esc(r.ts)}</small></span><button class="btn" data-rv="${r.id}">Tinjau</button></div>`).join('')}
        ${S.logistics.filter(l => l.status === 'menunggu').slice(0, 2).map(l => `<div class="todo"><span class="ic" style="background:var(--water-tint);color:var(--water-deep)"><i data-lucide="package"></i></span><span><b>${l.id} · ${esc(l.item)}</b><small>${esc(l.team)} · ${l.req} diminta</small></span><button class="btn" data-go="logistik">Tinjau</button></div>`).join('')}
        ${S.docs.filter(d => d.st === 'menunggu').slice(0, 1).map(d => `<div class="todo"><span class="ic" style="background:var(--teal-tint);color:var(--teal-ink)"><i data-lucide="images"></i></span><span><b>${d.id} · Dokumentasi</b><small>${esc(d.team)}</small></span><button class="btn" data-go="dokumentasi">Tinjau</button></div>`).join('')}
      </div></div>
    </div>`;
    if (window.L) {
      vmap = AlirMap.create('rmap', {zoom: 13});
      S.reports.forEach(r => L.marker([r.lat, r.lng], {icon: AlirMap.sevIcon(r.sev, r.status === 'surut')}).bindPopup(`<b>${esc(r.kel)}</b><br>${r.h} cm · ${r.people} jiwa`).addTo(vmap));
      S.pending.filter(r => r.verdict === 'pending').forEach(r => L.circleMarker([r.lat, r.lng], {radius: 9, color: '#FF6A3D', weight: 2, dashArray: '3 3', fillColor: '#FF6A3D', fillOpacity: .15}).bindPopup(`<b>${r.id}</b> · ${esc(r.kel)}<br>Menunggu verifikasi`).addTo(vmap));
      D.poskos.forEach(p => L.marker([p.lat, p.lng], {icon: AlirMap.poskoIcon()}).bindPopup(esc(p.name)).addTo(vmap));
    }
    $$('[data-rv]').forEach(b => b.onclick = () => { selId = b.dataset.rv; vfilter = 'pending'; nav('verifikasi'); });
    $$('[data-go]').forEach(b => b.onclick = () => nav(b.dataset.go));
    mountReveal(); $$('[data-count]').forEach(countUp);
  },

  /* ---------- VERIFIKASI ---------- */
  verifikasi() {
    const flt = {pending: r => r.verdict === 'pending', valid: r => ['valid', 'ditugaskan'].includes(r.verdict), other: r => ['invalid', 'duplikat'].includes(r.verdict)};
    const list = S.pending.filter(flt[vfilter]);
    if (!selId || !list.find(r => r.id === selId)) selId = list[0] ? list[0].id : null;
    view.innerHTML = head('Verifikasi Laporan', 'Periksa bukti, lihat laporan di sekitar, lalu tentukan keputusan.') + `
    <div class="ver-grid"><div class="col" style="gap:10px">
      <div class="seg" id="vf" style="align-self:flex-start">${[['pending', 'Menunggu'], ['valid', 'Terverifikasi'], ['other', 'Ditolak']].map(f => `<button class="${vfilter === f[0] ? 'on' : ''}" data-f="${f[0]}">${f[1]}</button>`).join('')}</div>
      ${list.length ? list.map(r => `<button class="q-it ${r.id === selId ? 'on' : ''}" data-id="${r.id}"><i class="dot" style="background:${SEV[r.sev].c}"></i><span class="grow"><b>${r.id} &middot; ${esc(r.kel)}</b><br><span class="xs muted">${r.h} cm &middot; ${r.people} warga &middot; ${esc(r.ts)}</span></span>${r.verdict === 'ditugaskan' ? '<span class="tag water">Ditugaskan</span>' : ''}</button>`).join('') : '<div class="card empty">Tidak ada laporan.</div>'}
    </div><div id="vd"></div></div>`;
    $$('#vf button').forEach(b => b.onclick = () => { vfilter = b.dataset.f; selId = null; nav('verifikasi'); });
    $$('.q-it').forEach(b => b.onclick = () => { selId = b.dataset.id; nav('verifikasi'); });
    if (selId) detail(S.pending.find(r => r.id === selId));
    else $('#vd').innerHTML = '<div class="card empty">Pilih laporan di sebelah kiri.</div>';
  },

  /* ---------- PENUGASAN ---------- */
  penugasan() {
    const reps = S.pending.filter(r => ['valid', 'ditugaskan'].includes(r.verdict));
    view.innerHTML = head('Penugasan Relawan', 'Rekomendasi komunitas diurutkan berdasarkan jarak (Haversine). ETA dihitung 15 km/jam.') + `
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,430px),1fr));align-items:start">${reps.length ? reps.map(r => {
      const rank = S.teams.map(t => ({t, d: haversine(r.lat, r.lng, t.lat, t.lng)})).sort((a, b) => a.d - b.d);
      const asg = S.tasks.filter(k => k.rep === r.id);
      return `<div class="card"><div class="row between"><div><h3>${r.id} &middot; ${esc(r.kel)}</h3><p class="xs muted">${r.h} cm &middot; ${r.people} warga ${sevTag(r.sev)}</p></div>${asg.length ? `<span class="tag water">${asg.length} tim</span>` : '<span class="tag amber">Belum ditugaskan</span>'}</div>
        <div style="margin-top:10px">${rank.slice(0, 4).map(x => {
          const full = x.t.cur >= x.t.max, off = x.t.busy || full, has = asg.some(k => k.team === x.t.id);
          return `<div class="rank ${off ? 'off' : ''}"><div><b class="small">${esc(x.t.name)}</b><div class="xs muted">${fmtDist(x.d)} &middot; ETA ${eta(x.d)} mnt &middot; kapasitas ${x.t.cur}/${x.t.max} &middot; ${x.t.boats} perahu</div></div>
            ${off ? `<span class="tag">${x.t.busy ? 'Sibuk' : 'Penuh'}</span>` : '<span></span>'}
            <button class="btn btn-sm ${has ? 'btn-ghost' : 'btn-coral'}" ${off || has ? 'disabled' : ''} data-as="${r.id}|${x.t.id}|${Math.round(x.d)}">${has ? 'Ditugaskan' : 'Tugaskan'}</button></div>`;
        }).join('')}</div></div>`;
    }).join('') : '<div class="card empty" style="grid-column:1/-1">Belum ada laporan terverifikasi yang menunggu penugasan.</div>'}</div>
    <div class="card"><h3>Tugas aktif</h3>${S.tasks.length ? `<div class="tbl-wrap"><table class="tbl" style="margin-top:8px"><thead><tr><th>Tugas</th><th>Lokasi</th><th>Komunitas</th><th>Tahap</th><th></th></tr></thead><tbody>${S.tasks.map(k => `<tr><td><b>${k.id}</b><br><span class="xs muted">${k.rep}</span></td><td>${esc(k.kel)}</td><td>${esc(teamName(k.team))}</td><td>${k.rejected ? '<span class="tag red">Ditolak relawan</span>' : ['Menunggu diterima', 'Menuju lokasi', 'Ditangani', 'Selesai'][k.stage + (k.accepted ? 1 : 0)] ? `<span class="tag ${k.stage === 2 ? 'teal' : 'water'}">${['Menunggu diterima', 'Menuju lokasi', 'Ditangani', 'Selesai'][k.stage + (k.accepted ? 1 : 0)]}</span>` : ''}${k.rejected ? `<div class="xs muted" style="margin-top:4px">${esc(k.rejected)}</div>` : ''}</td>
          <td style="text-align:right;white-space:nowrap">${k.stage < 2 ? `<button class="btn btn-ghost btn-sm" data-re="${k.id}">Ganti</button> <button class="btn btn-ghost btn-sm" data-cx="${k.id}">Batalkan</button>` : ''}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Belum ada tugas.</div>'}</div>`;
    $$('[data-as]').forEach(b => b.onclick = async () => {
      const [rid, tid, d] = b.dataset.as.split('|'), r = S.pending.find(x => x.id === rid), t = S.teams.find(x => x.id === tid);
      if (!await ask({title: 'Tugaskan komunitas?', body: 'Tugas akan muncul di portal relawan.', tone: 'info', rows: [['Laporan', rid + ' ' + r.kel], ['Komunitas', t.name], ['Jarak', fmtDist(+d)], ['ETA', eta(+d) + ' menit']], yes: 'Tugaskan'})) return;
      S.tasks.unshift({id: 'TK-' + (S.tasks.length + 1) + Math.floor(Math.random() * 90 + 10), rep: rid, kel: r.kel, h: r.h, people: r.people, dist: +d, stage: 0, accepted: false, team: tid});
      r.verdict = 'ditugaskan'; save(); log(`Laporan ${rid} ditugaskan ke ${t.name}`); toast('Tugas dikirim ke ' + t.name, 'ok'); nav('penugasan');
    });
    $$('[data-cx]').forEach(b => b.onclick = async () => {
      const k = S.tasks.find(x => x.id === b.dataset.cx);
      if (!await ask({title: 'Batalkan penugasan?', body: 'Tugas akan ditarik dari komunitas.', tone: 'danger', rows: [['Tugas', k.id], ['Komunitas', teamName(k.team)]], yes: 'Batalkan tugas'})) return;
      S.tasks = S.tasks.filter(x => x.id !== k.id); S.tasks.length;
      if (!S.tasks.some(x => x.rep === k.rep)) { const r = S.pending.find(x => x.id === k.rep); if (r) r.verdict = 'valid'; }
      save(); log(`Penugasan ${k.id} dibatalkan`); toast('Penugasan dibatalkan'); nav('penugasan');
    });
    $$('[data-re]').forEach(b => b.onclick = () => {
      const k = S.tasks.find(x => x.id === b.dataset.re);
      const opts = S.teams.filter(t => !t.busy && t.cur < t.max && t.id !== k.team);
      const m = openModal(`<div class="modal-h"><h3>Ganti komunitas</h3></div><p class="muted small">Tugas ${k.id} di ${esc(k.kel)}</p><div class="col" style="margin-top:14px;gap:8px">${opts.map(t => `<button class="chip" data-t="${t.id}" style="height:auto;padding:12px 16px;text-align:left;border-radius:16px">${esc(t.name)}</button>`).join('')}</div><button class="btn btn-ghost" style="margin-top:16px" data-c>Batal</button>`);
      $('[data-c]', m).onclick = () => closeModal(m);
      $$('[data-t]', m).forEach(c => c.onclick = () => { k.team = c.dataset.t; k.accepted = false; k.rejected = null; k.stage = 0; save(); log(`Tugas ${k.id} dialihkan ke ${teamName(k.team)}`); closeModal(m); toast('Tugas dialihkan', 'ok'); nav('penugasan'); });
    });
  },

  /* ---------- LOGISTIK ---------- */
  logistik() {
    view.innerHTML = head('Permintaan Logistik', 'Bandingkan stok gudang dengan permintaan komunitas.') + `<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>ID</th><th>Komunitas</th><th>Barang</th><th>Diminta</th><th>Stok</th><th>Tenggat</th><th>Status</th><th></th></tr></thead><tbody>${S.logistics.map(l => `<tr><td><b>${l.id}</b></td><td>${esc(l.team)}<div class="xs muted">${esc(l.why)}</div></td><td>${esc(l.item)}</td><td><b>${l.approved || l.req}</b></td><td><span class="tag ${l.stock >= l.req ? 'teal' : 'red'}">${l.stock}</span></td><td class="small">${esc(l.deadline)}</td><td><span class="tag ${l.status === 'disetujui' ? 'teal' : l.status === 'ditolak' ? 'red' : 'amber'}">${l.status}</span></td>
      <td style="text-align:right;white-space:nowrap">${l.status === 'menunggu' ? `<button class="btn btn-teal btn-sm" data-lg="full|${l.id}" ${l.stock < l.req ? 'disabled' : ''}>Penuh</button> <button class="btn btn-ghost btn-sm" data-lg="part|${l.id}">Sebagian</button> <button class="btn btn-ghost btn-sm" data-lg="no|${l.id}">Tolak</button>` : ''}</td></tr>`).join('')}</tbody></table></div></div>`;
    $$('[data-lg]').forEach(b => b.onclick = async () => {
      const [k, id] = b.dataset.lg.split('|'), l = S.logistics.find(x => x.id === id);
      let qty = l.req, reason = '';
      if (k === 'part') { qty = Math.max(1, Math.floor(l.stock / 2)); if (!await ask({title: 'Setujui sebagian?', body: `Stok hanya ${l.stock}. Akan disetujui ${qty} dari ${l.req}.`, tone: 'warn', rows: [['Barang', l.item], ['Disetujui', qty + ' dari ' + l.req]], yes: 'Setujui sebagian'})) return; }
      if (k === 'full' && !await ask({title: 'Setujui penuh?', body: 'Stok akan dikirim ke komunitas.', tone: 'ok', rows: [['Barang', l.item], ['Jumlah', l.req], ['Untuk', l.team]], yes: 'Setujui'})) return;
      if (k === 'no') { reason = await ask({title: 'Tolak permintaan?', body: 'Relawan akan melihat alasan penolakan.', tone: 'danger', input: 'Alasan penolakan', yes: 'Tolak'}); if (!reason) return; l.why = reason; }
      l.status = k === 'no' ? 'ditolak' : 'disetujui'; if (k !== 'no') { l.approved = qty; l.stock -= qty; const inv = S.inventory.find(i => i.name.toLowerCase().startsWith(l.item.toLowerCase().split(' ')[0])); if (inv) inv.stock += qty; }
      save(); log(`Logistik ${l.id} ${l.status}`); toast('Permintaan ' + l.status, k === 'no' ? '' : 'ok'); nav('logistik');
    });
  },

  /* ---------- DONASI ---------- */
  donasi() {
    const ok = S.donations.filter(d => d.st === 'settlement'), gen = ok.filter(d => d.dest.startsWith('Umum'));
    view.innerHTML = head('Donasi & Alokasi', 'Status pembayaran dari webhook Midtrans (signature key terverifikasi).') + `
    <div class="grid g3"><div class="stat"><span class="ic" style="background:var(--teal-tint);color:var(--teal-ink)"><i data-lucide="wallet"></i></span><b>${rp(ok.reduce((a, d) => a + d.amt, 0))}</b><span>Donasi berhasil (sesi ini + contoh)</span></div>
      <div class="stat"><span class="ic" style="background:var(--amber-tint);color:var(--amber-ink)"><i data-lucide="hourglass"></i></span><b>${rp(gen.reduce((a, d) => a + d.amt, 0))}</b><span>Donasi umum belum dialokasi</span></div>
      <div class="stat"><span class="ic" style="background:var(--water-tint);color:var(--water-deep)"><i data-lucide="receipt"></i></span><b>${S.donations.length}</b><span>Total transaksi</span></div></div>
    <div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>ID</th><th>Donatur</th><th>Nominal</th><th>Tujuan</th><th>Status</th><th></th></tr></thead><tbody>${S.donations.map(d => `<tr><td><b>${d.id}</b></td><td>${esc(d.donor)}</td><td class="mono">${rp(d.amt)}</td><td>${esc(d.dest)}</td><td><span class="tag ${d.st === 'settlement' ? 'teal' : d.st === 'pending' ? 'amber' : ''}">${d.st}</span></td><td style="text-align:right">${d.st === 'settlement' && d.dest.startsWith('Umum') ? `<button class="btn btn-coral btn-sm" data-al="${d.id}">Alokasikan</button>` : ''}</td></tr>`).join('')}</tbody></table></div></div>`;
    $$('[data-al]').forEach(b => b.onclick = () => {
      const d = S.donations.find(x => x.id === b.dataset.al);
      const m = openModal(`<div class="modal-h"><h3>Alokasikan ${rp(d.amt)}</h3></div><p class="muted small">Pilih item wishlist yang akan dibelikan.</p><div class="col" style="margin-top:14px;gap:8px">${S.wishlist.filter(w => w.got < w.target).map(w => `<button class="pm-i chip" data-w="${w.id}" style="height:auto;padding:12px 16px;text-align:left;border-radius:16px"><b>${esc(w.name)}</b> <span class="xs muted">${w.urg} &middot; ${rp(w.price)}/${w.unit}</span></button>`).join('')}</div><button class="btn btn-ghost" style="margin-top:16px" data-c>Batal</button>`);
      $('[data-c]', m).onclick = () => closeModal(m);
      $$('[data-w]', m).forEach(c => c.onclick = () => { const w = S.wishlist.find(x => x.id === c.dataset.w); closeModal(m);
        ask({title: 'Konfirmasi alokasi', body: 'Dana akan dicatat untuk item ini.', tone: 'ok', rows: [['Donasi', d.id + ' ' + rp(d.amt)], ['Item', w.name]], yes: 'Alokasikan'}).then(y => { if (!y) return; d.dest = w.name; w.got = Math.min(w.target, w.got + Math.max(1, Math.floor(d.amt / w.price))); save(); log(`Donasi ${d.id} dialokasikan ke ${w.name}`); toast('Dana dialokasikan', 'ok'); nav('donasi'); }); });
    });
  },

  /* ---------- DOKUMENTASI ---------- */
  dokumentasi() {
    view.innerHTML = head('Moderasi Dokumentasi', 'Foto dari relawan tampil di situs publik setelah disetujui.') + `<div class="dgrid">${S.docs.map(d => `<div class="dcard"><img src="${img(d.img)}" alt=""><div class="bd"><div class="row between"><b class="small">${esc(d.team)}</b><span class="tag ${d.st === 'disetujui' ? 'teal' : d.st === 'ditolak' ? 'red' : 'amber'}">${d.st}</span></div><p class="small muted">${esc(d.cap)}</p>${d.st === 'menunggu' ? `<div class="row"><button class="btn btn-teal btn-sm grow" data-dc="ok|${d.id}">Setujui</button><button class="btn btn-ghost btn-sm grow" data-dc="no|${d.id}">Tolak</button></div>` : ''}</div></div>`).join('')}</div>`;
    $$('[data-dc]').forEach(b => b.onclick = async () => { const [k, id] = b.dataset.dc.split('|'), d = S.docs.find(x => x.id === id);
      if (!await ask({title: k === 'ok' ? 'Setujui dokumentasi?' : 'Tolak dokumentasi?', body: d.cap, tone: k === 'ok' ? 'ok' : 'danger', yes: k === 'ok' ? 'Setujui' : 'Tolak'})) return;
      d.st = k === 'ok' ? 'disetujui' : 'ditolak'; save(); log(`Dokumentasi ${d.id} ${d.st}`); toast('Dokumentasi ' + d.st, 'ok'); nav('dokumentasi'); });
  },

  /* ---------- KOMUNITAS ---------- */
  komunitas() {
    const pend = S.communities.filter(c => c.st === 'menunggu');
    view.innerHTML = head('Komunitas & Wilayah', 'Kelola komunitas relawan dan posko layanan.') + `
    ${pend.length ? `<div class="card"><h3>Pendaftaran baru</h3><div class="col" style="margin-top:12px;gap:10px">${pend.map(c => `<div class="row between wrapx" style="padding:14px;border-radius:18px;background:var(--amber-tint)"><div><b>${esc(c.name)}</b><div class="xs" style="color:var(--amber-ink)">PIC ${esc(c.pic)} &middot; ${c.members} anggota &middot; ${esc(c.area)}</div></div><div class="row"><button class="btn btn-teal btn-sm" data-cm="ok|${c.id}">Setujui</button><button class="btn btn-ghost btn-sm" data-cm="no|${c.id}">Tolak</button></div></div>`).join('')}</div></div>` : ''}
    <div class="grid g2" style="grid-template-columns:1.2fr 1fr;align-items:start"><div class="card"><h3>Komunitas aktif</h3><div class="tbl-wrap"><table class="tbl" style="margin-top:8px"><thead><tr><th>Nama</th><th>Anggota</th><th>Perahu</th><th>Status</th></tr></thead><tbody>${S.teams.map(t => `<tr><td><b>${esc(t.name)}</b><div class="xs muted">${esc(t.area)}</div></td><td>${t.cur}/${t.max}</td><td>${t.boats}</td><td><span class="tag ${t.busy ? 'amber' : 'teal'}">${t.busy ? 'Bertugas' : 'Siaga'}</span></td></tr>`).join('')}</tbody></table></div></div>
      <div class="card"><h3>Peta wilayah</h3><div id="kmap" class="map" style="height:360px;margin-top:12px"></div></div></div>`;
    if (window.L) { vmap = AlirMap.create('kmap', {zoom: 13});
      D.poskos.forEach(p => { L.circle([p.lat, p.lng], {radius: p.r, color: '#14B8A6', weight: 1.5, dashArray: '6 6', fillOpacity: .1, interactive: false}).addTo(vmap); L.marker([p.lat, p.lng], {icon: AlirMap.poskoIcon()}).bindPopup(esc(p.name)).addTo(vmap); });
      S.teams.forEach(t => L.marker([t.lat, t.lng], {icon: AlirMap.teamIcon(t.busy)}).bindPopup(`<b>${esc(t.name)}</b><br>${t.cur}/${t.max} anggota`).addTo(vmap)); }
    $$('[data-cm]').forEach(b => b.onclick = async () => { const [k, id] = b.dataset.cm.split('|'), c = S.communities.find(x => x.id === id);
      if (!await ask({title: k === 'ok' ? 'Setujui komunitas?' : 'Tolak pendaftaran?', body: c.name, tone: k === 'ok' ? 'ok' : 'danger', yes: k === 'ok' ? 'Setujui' : 'Tolak'})) return;
      c.st = k === 'ok' ? 'aktif' : 'ditolak';
      if (k === 'ok') S.teams.push({id: c.id, name: c.name, lat: -6.8845 + (Math.random() - .5) * .03, lng: 109.67 + (Math.random() - .5) * .04, cur: c.members, max: c.members + 6, boats: 0, busy: false, area: c.area});
      save(); log(`Komunitas ${c.name} ${c.st}`); toast('Komunitas ' + c.st, 'ok'); nav('komunitas'); });
  },

  /* ---------- EDUKASI ---------- */
  edukasi() {
    view.innerHTML = head('Konten Edukasi', 'Tambah, ubah, dan terbitkan artikel edukasi.', '<button class="btn btn-coral" id="addE"><i data-lucide="plus"></i>Artikel baru</button>') + `<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Judul</th><th>Kategori</th><th>Status</th><th>Diubah</th><th></th></tr></thead><tbody>${S.eduCms.map(e => `<tr><td><b>${esc(e.t)}</b></td><td>${esc(e.cat)}</td><td><span class="tag ${e.st === 'terbit' ? 'teal' : 'amber'}">${e.st}</span></td><td class="small muted">${esc(e.ts)}</td><td style="text-align:right;white-space:nowrap"><button class="btn btn-ghost btn-sm" data-ed="${e.id}">Ubah</button> <button class="btn btn-ghost btn-sm" data-del="${e.id}"><i data-lucide="trash-2"></i></button></td></tr>`).join('')}</tbody></table></div></div>`;
    const form = e => {
      const m = openModal(`<div class="modal-h"><h3>${e ? 'Ubah' : 'Tambah'} artikel</h3></div><div class="col" style="gap:14px"><div class="field"><label>Judul</label><input class="input" id="et" value="${esc(e ? e.t : '')}"></div><div class="field"><label>Kategori</label><select class="input" id="ec">${['Persiapan', 'Mitos & Fakta', 'Pengetahuan'].map(c => `<option ${e && e.cat === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div><div class="field"><label>Status</label><select class="input" id="es"><option ${e && e.st === 'draf' ? 'selected' : ''}>draf</option><option ${e && e.st === 'terbit' ? 'selected' : ''}>terbit</option></select></div></div><div class="row" style="justify-content:flex-end;margin-top:20px"><button class="btn btn-ghost" data-c>Batal</button><button class="btn btn-coral" data-s>Simpan</button></div>`);
      $('[data-c]', m).onclick = () => closeModal(m);
      $('[data-s]', m).onclick = () => { const t = $('#et', m).value.trim(); if (!t) return $('#et', m).classList.add('err');
        const v = {t, cat: $('#ec', m).value, st: $('#es', m).value, ts: 'Baru saja'};
        if (e) Object.assign(e, v); else S.eduCms.unshift(Object.assign({id: 'E-' + (S.eduCms.length + 1) + Math.floor(Math.random() * 90 + 10)}, v));
        save(); log('Artikel "' + t + '" disimpan'); closeModal(m); toast('Artikel disimpan', 'ok'); nav('edukasi'); };
    };
    $('#addE').onclick = () => form(null);
    $$('[data-ed]').forEach(b => b.onclick = () => form(S.eduCms.find(x => x.id === b.dataset.ed)));
    $$('[data-del]').forEach(b => b.onclick = async () => { const e = S.eduCms.find(x => x.id === b.dataset.del); if (!await ask({title: 'Hapus artikel?', body: e.t, tone: 'danger', yes: 'Hapus'})) return; S.eduCms = S.eduCms.filter(x => x !== e); save(); toast('Artikel dihapus'); nav('edukasi'); });
  },

  /* ---------- WHATSAPP ---------- */
  wa() {
    view.innerHTML = head('Template WhatsApp', 'Pesan otomatis untuk pelapor. Variabel: {tiket}, {tim}, {eta}.') + `<div class="grid g3">${S.waTemplates.map(t => `<div class="wa-t"><div class="row between"><b>${esc(t.t)}</b><span class="tag">${t.id}</span></div><div class="wa-bubble">${esc(t.body)}</div><button class="btn btn-ghost btn-sm" data-wt="${t.id}" style="align-self:flex-start"><i data-lucide="pencil"></i>Ubah</button></div>`).join('')}</div>`;
    $$('[data-wt]').forEach(b => b.onclick = () => { const t = S.waTemplates.find(x => x.id === b.dataset.wt);
      const m = openModal(`<div class="modal-h"><h3>Ubah template</h3></div><div class="field"><label>${esc(t.t)}</label><textarea class="input" id="wb" rows="5">${esc(t.body)}</textarea></div><div class="row" style="justify-content:flex-end;margin-top:18px"><button class="btn btn-ghost" data-c>Batal</button><button class="btn btn-coral" data-s>Simpan</button></div>`);
      $('[data-c]', m).onclick = () => closeModal(m); $('[data-s]', m).onclick = () => { t.body = $('#wb', m).value; save(); closeModal(m); toast('Template disimpan', 'ok'); nav('wa'); }; });
  },
};

/* ---------- detail verifikasi ---------- */
function detail(r) {
  const sc = score(r), near = others(r), box = $('#vd');
  box.innerHTML = `<div class="card col" style="gap:20px">
    <div class="row between wrapx"><div><span class="kicker">${r.id}</span><h2 style="font-size:26px;margin-top:8px">${esc(r.kel)}</h2><p class="muted small">${esc(r.ts)} &middot; ${esc(r.note || '')}</p></div>${sevTag(r.sev)}</div>
    <div class="grid g2" style="gap:16px"><div>${r.img ? `<img src="${img(r.img)}" alt="Foto laporan" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:20px">` : '<div class="ph-ph">Tidak ada foto</div>'}</div><div id="vmap" class="map" style="min-height:240px"></div></div>
    <div class="grid g2" style="gap:16px">
      <div class="card flat score"><div class="ring" id="ring" style="--c:${sc.lv[2]}"><b>${sc.t}</b></div><div class="grow"><span class="tag ${sc.lv[1]}">Kepercayaan ${sc.lv[0]}</span>${sc.parts.map(p => `<div class="sc-row"><span class="muted">${p[0]}</span><b>${p[1]}/${p[2]}</b></div>`).join('')}</div></div>
      <div class="card flat"><dl class="kv" style="margin:0"><dt>Tinggi air</dt><dd>${r.h} cm</dd><dt>Warga terdampak</dt><dd>${r.people}</dd><dt>Laporan 500 m</dt><dd>${sc.c}</dd><dt>WhatsApp</dt><dd>${esc(r.wa)}</dd><dt>Koordinat</dt><dd>${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}</dd></dl>
        <button class="btn btn-ghost btn-sm" id="wab" style="margin-top:10px;width:100%"><i data-lucide="message-circle"></i>Kirim kabar via WhatsApp</button></div></div>
    ${r.verdict === 'pending' ? `<div class="row wrapx"><button class="btn btn-teal" data-v="valid"><i data-lucide="check"></i>Valid</button><button class="btn btn-ghost" data-v="invalid"><i data-lucide="x"></i>Tidak valid</button><button class="btn btn-ghost" data-v="duplikat" ${near.length ? '' : 'disabled'}><i data-lucide="copy"></i>Duplikat</button></div>` : `<div class="row"><span class="tag ${r.verdict === 'invalid' || r.verdict === 'duplikat' ? 'red' : 'teal'}">Status: ${r.verdict}</span>${r.reason ? `<span class="small muted">${esc(r.reason)}</span>` : ''}${r.parent ? `<span class="small muted">induk ${r.parent}</span>` : ''}</div>`}
  </div>`;
  icons(); setTimeout(() => $('#ring').style.setProperty('--p', sc.t), 50);
  if (window.L) {
    vmap = AlirMap.create('vmap', {center: [r.lat, r.lng], zoom: 16});
    L.circle([r.lat, r.lng], {radius: 500, color: '#FF6A3D', weight: 2, dashArray: '8 6', fillColor: '#FF6A3D', fillOpacity: .08}).addTo(vmap);
    L.marker([r.lat, r.lng], {icon: AlirMap.sevIcon(r.sev)}).addTo(vmap);
    near.forEach(o => L.marker([o.lat, o.lng], {icon: AlirMap.sevIcon(o.sev, true)}).bindPopup(`${o.id} &middot; ${esc(o.kel)}`).addTo(vmap));
  }
  $('#wab').onclick = () => { const t = S.waTemplates[0].body.replace('{tiket}', r.id); window.open('https://wa.me/62' + r.wa.replace(/\D/g, '').replace(/^0/, '') + '?text=' + encodeURIComponent(t), '_blank', 'noopener'); };
  $$('[data-v]').forEach(b => b.onclick = async () => {
    const v = b.dataset.v, base = [['Laporan', r.id + ' ' + r.kel], ['Skor kepercayaan', sc.t + ' (' + sc.lv[0] + ')']];
    if (v === 'valid') {
      if (!await ask({title: 'Tandai valid?', body: 'Laporan akan tampil di peta publik dan siap ditugaskan.', tone: 'ok', rows: base, yes: 'Tandai valid'})) return;
      r.verdict = 'valid'; if (!S.reports.find(x => x.id === r.id)) S.reports.unshift({id: r.id, kel: r.kel, lat: r.lat, lng: r.lng, sev: r.sev, h: r.h, people: r.people, status: 'aktif', ts: 'baru saja', by: 'Warga'});
    }
    if (v === 'invalid') { const why = await ask({title: 'Tandai tidak valid?', body: 'Pelapor akan diberi tahu alasannya.', tone: 'danger', rows: base, input: 'Alasan', yes: 'Tolak laporan'}); if (!why) return; r.verdict = 'invalid'; r.reason = why; }
    if (v === 'duplikat') { const p = near.sort((a, b) => haversine(r.lat, r.lng, a.lat, a.lng) - haversine(r.lat, r.lng, b.lat, b.lng))[0];
      if (!await ask({title: 'Tandai duplikat?', body: 'Digabung ke laporan terdekat.', tone: 'warn', rows: [...base, ['Laporan induk', p.id + ' ' + p.kel + ' (' + fmtDist(haversine(r.lat, r.lng, p.lat, p.lng)) + ')']], yes: 'Tandai duplikat'})) return; r.verdict = 'duplikat'; r.parent = p.id; }
    save(); log(`Laporan ${r.id} ditandai ${r.verdict}`); toast('Laporan ' + r.verdict, 'ok'); nav('verifikasi');
  });
}

/* ---------- init ---------- */
$$('.side [data-tab]').forEach(a => a.onclick = () => nav(a.dataset.tab));
$$('.ng-h').forEach(h => h.onclick = () => { const g = h.parentElement; g.classList.toggle('open'); h.setAttribute('aria-expanded', g.classList.contains('open')); });
$('#menu').onclick = () => $('#side').classList.toggle('open');
$$('[data-exp]').forEach(b => b.onclick = () => toast('Ekspor ' + b.dataset.exp + ' dibuat (simulasi)', 'ok'));
$('#q').oninput = e => { const q = e.target.value.toLowerCase(); if (q.length < 2) return; const r = S.pending.find(x => (x.id + x.kel).toLowerCase().includes(q)); if (r) { vfilter = r.verdict === 'pending' ? 'pending' : ['valid', 'ditugaskan'].includes(r.verdict) ? 'valid' : 'other'; selId = r.id; nav('verifikasi'); $('#q').focus(); } };
addEventListener('hashchange', () => { const t = location.hash.slice(1); if (TABS.includes(t) && t !== tab) nav(t); });
nav(tab);

