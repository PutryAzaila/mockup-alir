/* Utilitas UI bersama */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const rp = n => 'Rp' + Math.round(n).toLocaleString('id-ID');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const img = n => /^(data:|https?:|blob:)/.test(n) ? n : 'assets/img/' + n;
const haversine = (a, b, c, d) => {
  const R = 6371000, t = x => x * Math.PI / 180, dl = t(c - a), dg = t(d - b);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(t(a)) * Math.cos(t(c)) * Math.sin(dg / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const fmtDist = m => m < 1000 ? Math.round(m) + ' m' : (m / 1000).toFixed(1) + ' km';
const eta = m => Math.max(1, Math.round(m / 1000 / 15 * 60));
const icons = () => { try { window.lucide && lucide.createIcons(); } catch (e) {} };
const SEV = {1:{n:'Ringan',c:'#14B8A6'}, 2:{n:'Sedang',c:'#F5A524'}, 3:{n:'Parah',c:'#E5484D'}};
const isPanel = () => document.body.dataset.panel !== undefined;

/* ---------- NProgress ---------- */
const NP = window.NProgress || {start(){}, done(){}, inc(){}, set(){}, configure(){}};
NP.configure({showSpinner: false, minimum: .12, trickleSpeed: 130, speed: 420});
addEventListener('load', () => setTimeout(() => NP.done(), 120));
addEventListener('pageshow', e => { if (e.persisted) NP.done(); });
/* jalankan fn di antara start dan done (pindah tab, langkah form, dsb.) */
function withProgress(fn, ms = 300) {
  NP.start(); requestAnimationFrame(() => { try { fn(); } finally { setTimeout(() => NP.done(), ms); } });
}
/* tautan antarhalaman: bar langsung jalan, navigasi tidak ditunda */
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || a.target === '_blank') return;
  const href = a.getAttribute('href') || '';
  if (!href || href.startsWith('#') || /^(tel:|mailto:|javascript:)/i.test(href)) return;
  let u; try { u = new URL(a.href, location.href); } catch (x) { return; }
  if (u.pathname === location.pathname && u.search === location.search) return;
  try { NP.start(); } catch (x) {}
});

/* ---------- overlay: satu sistem untuk semua popup ---------- */
/* z-index mengikuti referensi: publik 2000, gateway 2100, panel 2500, konfirmasi 2600 */
const OVS = [];
function openModal(html, opts) {
  const o = typeof opts === 'boolean' ? {wide: opts} : (opts || {});
  const b = document.createElement('div');
  b.className = 'ov ' + (o.z || (isPanel() ? 'panel' : ''));
  b.innerHTML = `<div class="modal ${o.wide ? 'wide' : ''} ${o.cls || ''}" role="dialog" aria-modal="true">${html}</div>`;
  b._onClose = o.onClose;
  if (!o.sticky) b.addEventListener('mousedown', e => { if (e.target === b) closeModal(b); });
  document.body.appendChild(b); OVS.push(b);
  document.body.classList.add('modal-open'); icons();
  return b;
}
function closeModal(b) {
  if (!b || !b.isConnected) return;
  const f = b._onClose; b._onClose = null; try { f && f(); } catch (e) {}
  b.remove(); const i = OVS.indexOf(b); if (i > -1) OVS.splice(i, 1);
  if (!OVS.length) document.body.classList.remove('modal-open');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && OVS.length) closeModal(OVS[OVS.length - 1]); });

function ask(o) {
  return new Promise(res => {
    let done = false; const fin = v => { if (!done) { done = true; res(v); } };
    const ic = {ok:'circle-check', danger:'triangle-alert', warn:'circle-alert', info:'info'}[o.tone || 'info'];
    const rows = (o.rows || []).map(r => `<dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd>`).join('');
    const b = openModal(`
      <div class="ask-ico ${o.tone || 'info'}"><i data-lucide="${ic}"></i></div>
      <h3>${esc(o.title)}</h3>
      <p class="muted" style="margin-top:6px">${esc(o.body || '')}</p>
      ${rows ? `<dl class="kv">${rows}</dl>` : ''}
      ${o.input ? `<div class="field" style="margin-top:12px"><label>${esc(o.input)}</label><textarea class="input" id="ask-in" placeholder="Tulis alasan..."></textarea></div>` : ''}
      <div class="row" style="justify-content:flex-end;margin-top:20px">
        <button class="btn btn-ghost" data-n>Batal</button>
        <button class="btn ${o.tone === 'danger' ? 'btn-red' : 'btn-coral'}" data-y>${esc(o.yes || 'Ya, lanjutkan')}</button>
      </div>`, {z: 'confirm', cls: 'ask', onClose: () => fin(false)});
    $('[data-n]', b).onclick = () => closeModal(b);
    $('[data-y]', b).onclick = () => {
      const v = $('#ask-in', b);
      if (v && !v.value.trim()) { v.classList.add('err'); return; }
      fin(v ? v.value.trim() : true); closeModal(b);
    };
  });
}

/* ---------- toast: publik = kotak kanan bawah, panel = pill tengah bawah ---------- */
let toastT;
function toast(msg, type = '') {
  $$('.toast-x').forEach(t => t.remove()); clearTimeout(toastT);
  const col = type === 'err' ? '#E5484D' : type === 'warn' ? '#F5A524' : '#14B8A6';
  const t = document.createElement('div');
  t.className = 'toast-x ' + (isPanel() ? 'toast-panel' : 'toast-pub');
  t.setAttribute('role', 'status');
  t.innerHTML = isPanel()
    ? `<i data-lucide="${type === 'err' ? 'circle-alert' : 'circle-check'}" style="color:${col}"></i>${esc(msg)}`
    : `<span class="ti" style="background:${col}"><i data-lucide="${type === 'err' ? 'circle-alert' : 'circle-check'}"></i></span>${esc(msg)}`;
  document.body.appendChild(t); icons();
  toastT = setTimeout(() => t.remove(), 3400);
}

/* ---------- air ---------- */
function waveSVG(fill) {
  const p = 'M0 60 C 120 20, 240 100, 360 60 S 600 20, 720 60 S 960 100, 1080 60 S 1320 20, 1440 60 V120 H0Z';
  const two = `<path d="${p}" fill="${fill}"/><path transform="translate(1440 0)" d="${p}" fill="${fill}"/>`;
  return ['w3', 'w2', 'w1'].map(c => `<svg class="${c}" viewBox="0 0 2880 120" preserveAspectRatio="none">${two}</svg>`).join('');
}
function mountWaves() {
  $$('[data-waves]').forEach(el => { if (el._w) return; el._w = 1; el.classList.add('waves'); el.innerHTML = waveSVG(el.dataset.waves); });
}
function mountHeroWater() {
  $$('[data-hero-water]').forEach(el => {
    if (el._hw) return; el._hw = 1;
    const mk = (q, fill) => `<svg viewBox="0 0 2880 100" preserveAspectRatio="none"><path d="M0 50 Q 360 ${q} 720 50 T 1440 50 T 2160 50 T 2880 50 V 100 H 0 Z" fill="${fill}"/></svg>`;
    el.classList.add('hw');
    el.innerHTML = `<div class="l l1">${mk(0, 'rgba(86,156,235,.14)')}</div><div class="l l2">${mk(10, 'rgba(86,156,235,.22)')}</div><div class="body"></div><div class="l l3">${mk(5, el.dataset.heroWater)}</div>`;
    setTimeout(() => { el.style.height = el.dataset.h || '190px'; }, 250);
  });
}

/* ---------- konfeti (Edukasi) ---------- */
function burst(x, y, n = 28) {
  const colors = ['#FF6A3D', '#FFB27A', '#14B8A6', '#569CEB', '#F5A524', '#F5F7FA'];
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i'), a = Math.random() * Math.PI * 2, d = 70 + Math.random() * 150;
    p.className = 'pt' + (i % 3 === 0 ? ' dot' : '');
    p.style.cssText = `left:${x}px;top:${y}px;background:${colors[i % colors.length]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 40}px;--du:${1 + Math.random() * .6}s`;
    document.body.appendChild(p); setTimeout(() => p.remove(), 1900);
  }
}
function burstEl(el, n) { const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, n); }

/* ---------- reveal, counter, bar (mengikuti referensi) ---------- */
let IO;
function countUp(el) {
  if (el._done) return; el._done = true;
  const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), pre = el.dataset.pre || '', suf = el.dataset.suf || '';
  const t0 = performance.now(), dur = 1700;
  const f = t => {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.textContent = pre + (to * e).toLocaleString('id-ID', {minimumFractionDigits: dec, maximumFractionDigits: dec}) + suf;
    if (k < 1) requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}
/* lebar bar tumbuh dari 0 dengan transition 1,4 dtk */
function growBars(root = document) {
  $$('.bar>i', root).forEach(i => {
    if (i._g) return; i._g = 1;
    const w = i.style.width; if (!w) return;
    i.style.width = '0%'; i.style.transition = 'width 1.4s cubic-bezier(.2,.8,.2,1)';
    void i.offsetWidth; requestAnimationFrame(() => setTimeout(() => { i.style.width = w; }, 80));
  });
}
function mountReveal(root = document) {
  if (!IO) IO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; el.classList.add('in'); IO.unobserve(el);
    if (el.dataset.count) countUp(el);
  }), {threshold: .08});
  $$('[data-stagger]', root).forEach(p => [...p.children].forEach((c, i) => {
    if (!c.hasAttribute('data-anim') && !c.hasAttribute('data-reveal')) c.setAttribute('data-anim', '');
    c.style.setProperty('--i', i);
  }));
  $$('[data-reveal],.reveal,[data-anim],[data-count]', root).forEach(el => { if (el._o) return; el._o = 1; IO.observe(el); });
  growBars(root);
}
/* parallax mouse (hanya hero Edukasi, seperti referensi) */
function mouseParallax(box) {
  if (!box || matchMedia('(pointer: coarse)').matches) return;
  const kids = $$('[data-depth]', box);
  box.addEventListener('mousemove', e => {
    const r = box.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
    kids.forEach(k => { const d = +k.dataset.depth; k.style.transform = `translate(${(nx * d * 46).toFixed(1)}px,${(ny * d * 46).toFixed(1)}px)`; });
  });
}

/* ---------- navbar & footer (sama di semua halaman) ---------- */
const NAV = [['index.html', 'Beranda'], ['cuaca.html', 'Cuaca'], ['donasi.html', 'Donasi'], ['edukasi.html', 'Edukasi']];
function mountNav(active) {
  const el = $('#nav'); if (!el) return;
  el.outerHTML = `
  <nav class="nav" id="nav">
    <a class="brand" href="index.html"><span class="logo"><i data-lucide="waves"></i></span>ALIR</a>
    <div class="nav-links">${NAV.map(n => `<a href="${n[0]}" class="${n[0] === active ? 'on' : ''}">${n[1]}</a>`).join('')}</div>
    <a class="nav-ghost" href="login.html"><i data-lucide="log-in"></i><span>Masuk</span></a>
    <button class="nav-cta" id="lapor-open"><i data-lucide="siren"></i><span>Lapor Banjir</span></button>
  </nav>`;
  $('#lapor-open').onclick = openLapor;
}
function mountFooter() {
  const el = $('#foot'); if (!el) return;
  el.outerHTML = `
  <footer class="foot" id="foot">
    <div class="foot-wave"><svg viewBox="0 0 1440 60" preserveAspectRatio="none"><path d="M0 60 C 240 0 480 0 720 30 S 1200 60 1440 10 V 60 Z" fill="#0B1E33"/></svg></div>
    <div class="foot-in">
      <div class="foot-top">
        <div class="foot-brand">
          <a class="brand" href="index.html"><span class="logo"><i data-lucide="waves"></i></span>ALIR</a>
          <p>Aplikasi Logistik Informasi dan Relawan Banjir. Laporan warga, relawan, dan donasi transparan untuk Kota Pekalongan.</p>
          <div class="foot-badges">
            <span class="foot-badge" style="background:#3F7E44;color:#fff"><i data-lucide="globe"></i>SDGs 13 &middot; Climate Action</span>
            <a class="foot-badge" style="background:#14B8A6;color:#0B1E33" href="https://wa.me/6281200000000" target="_blank" rel="noopener"><i data-lucide="message-circle"></i>Hotline WhatsApp</a>
          </div>
        </div>
        <div class="foot-cols">
          <div class="foot-col"><span>MENU</span>${NAV.map(n => `<a href="${n[0]}">${n[1]}</a>`).join('')}</div>
          <div class="foot-col"><span>TIM</span><a href="login.html">Portal Relawan</a><a href="login.html">Panel Admin</a></div>
          <div class="foot-col"><span>DARURAT</span><a class="hot" href="tel:112">112 &middot; Panggilan darurat</a><a href="tel:113">113 &middot; Damkar</a><a href="tel:119">119 &middot; Ambulans</a></div>
        </div>
      </div>
      <div class="foot-bot"><span>&copy; 2026 ALIR &middot; Kota Pekalongan</span><span>Data cuaca: BMKG &middot; Pembayaran: Midtrans &middot; Mockup, semua data contoh</span></div>
    </div>
  </footer>`;
}

/* ---------- modal Lapor Banjir (4 langkah, mengikuti referensi) ---------- */
const WA_RE = /^(\+?62|0)8\d{8,11}$/;
const SEVOPT = {1: ['Ringan', '#14B8A6', 'Genangan di jalan atau halaman, aktivitas masih bisa berjalan.'], 2: ['Sedang', '#F5A524', 'Air masuk pekarangan atau rumah, butuh bantuan mengamankan barang.'], 3: ['Parah', '#E5484D', 'Air tinggi, warga terjebak atau rentan dan butuh evakuasi.']};
function openLapor() {
  const st = {step: 1, lat: null, lng: null, sev: 0, h: 30, people: 1, wa: '', photo: null, photoUrl: '', err: ''};
  const LAB = ['Lokasi', 'Kondisi', 'Kontak', 'Kirim'];
  let pmap = null, pmk = null, b;
  const teardown = () => { if (pmap) { pmap.remove(); pmap = null; pmk = null; } };
  const render = () => {
    teardown();
    const s = st.step, m = $('.modal', b);
    let body = '';
    if (s === 1) body = `<div class="lp-in"><div class="row between wrapx" style="align-items:flex-end;margin-bottom:12px;gap:12px"><div><b style="font-size:18px">Tandai lokasi genangan</b><div class="small muted">Ketuk peta untuk memasang pin.</div></div><button class="btn btn-ghost btn-sm" id="gps"><i data-lucide="locate-fixed"></i>Gunakan lokasi saya</button></div>
      <div id="pmap" class="map" style="height:300px;border:1.5px solid var(--s-200);cursor:crosshair;border-radius:16px"></div>
      <div class="pin-info" id="pinf"><i data-lucide="map-pin" style="color:#E5484D"></i><span id="pint"></span></div></div>`;
    if (s === 2) body = `<div class="lp-in col" style="gap:18px"><div><b style="font-size:18px;display:block;margin-bottom:10px">Tingkat keparahan</b><div class="sev-g" id="sev">${[1, 2, 3].map(i => `<button class="sev-o ${st.sev === i ? 'on' : ''}" data-v="${i}" style="${st.sev === i ? `border-color:${SEVOPT[i][1]}` : ''}"><span class="row between"><b>${SEVOPT[i][0]}</b><i style="width:14px;height:14px;background:${SEVOPT[i][1]};border-radius:4px"></i></span><span class="xs muted">${SEVOPT[i][2]}</span></button>`).join('')}</div></div>
      <div class="sev-g" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px"><div><div class="lbl" style="margin-bottom:6px">Perkiraan ketinggian air</div><div class="row" style="gap:12px"><input type="range" min="5" max="200" step="5" value="${st.h}" id="h" style="accent-color:#E5484D"><b id="hv" style="min-width:60px;font-variant-numeric:tabular-nums">${st.h} cm</b></div></div>
      <div><div class="lbl" style="margin-bottom:6px">Jumlah orang terdampak</div><div class="stp" style="width:max-content"><button id="pm" aria-label="Kurangi"><i data-lucide="minus"></i></button><span id="pv">${st.people}</span><button id="pp" aria-label="Tambah"><i data-lucide="plus"></i></button></div></div></div></div>`;
    if (s === 3) body = `<div class="lp-in col" style="gap:18px"><label class="drop" id="drop"><input type="file" accept="image/*" id="ph" hidden>
      ${st.photoUrl ? `<div class="gs" style="width:100%;height:220px;background:url(${st.photoUrl}) center/cover;border-radius:20px"></div><span class="small row" style="gap:6px;font-weight:700;color:var(--teal-ink)"><i data-lucide="circle-check" style="width:14px"></i>Foto terlampir &middot; ketuk untuk mengganti</span>` :
      `<span class="row" style="gap:12px"><span class="di"><i data-lucide="camera"></i></span><span><b style="display:block;font-size:15px">Unggah foto genangan <span style="color:var(--coral-dark)">*</span></b><span class="small muted">Wajib sebagai bukti validasi &middot; seret &amp; lepas atau ketuk untuk memilih</span></span></span>`}</label>
      <div><div class="lbl" style="margin-bottom:6px">Nomor WhatsApp <span style="color:var(--coral-dark)">*</span></div><div class="nm" style="border:2px solid var(--s-200)" id="wab"><span><i data-lucide="message-circle" style="width:15px;color:var(--teal)"></i> WA</span><input id="wa" value="${esc(st.wa)}" placeholder="0812 3456 7890" inputmode="tel" style="font-size:15px;font-weight:500"></div><div class="xs" id="wah" style="margin-top:6px;color:var(--s-500)">Format: 08xx atau +62 8xx. Kami kabari status lewat WhatsApp.</div></div></div>`;
    if (s === 4) body = `<div class="lp-in"><b style="font-size:18px;display:block;margin-bottom:12px">Periksa laporan Anda</b><div class="rv-g">${[['Lokasi', st.lat.toFixed(4) + ', ' + st.lng.toFixed(4)], ['Keparahan', SEVOPT[st.sev][0]], ['Tinggi air', st.h + ' cm'], ['Warga terdampak', st.people + ' orang'], ['WhatsApp', st.wa], ['Foto', st.photo ? 'Terlampir' : 'Tidak ada']].map(v => `<div><div class="k">${v[0]}</div><b>${esc(v[1])}</b></div>`).join('')}</div>
      <div class="row small muted" style="gap:8px;margin-top:12px;align-items:flex-start"><i data-lucide="info" style="width:15px;flex:none;margin-top:2px"></i>Admin memverifikasi laporan dalam &plusmn;10 menit. Status dikirim via WhatsApp.</div></div>`;
    m.innerHTML = `<div class="lp-h"><div class="row" style="gap:10px;font-weight:800;font-size:19px"><i data-lucide="siren"></i>Lapor Banjir</div><button class="lp-x" data-x aria-label="Tutup"><i data-lucide="x"></i></button></div>
      <div class="lp-steps">${LAB.map((l, i) => `<div class="${i + 1 === s ? 'on' : i + 1 < s ? 'done' : ''}"><small>0${i + 1}</small><b>${l}</b></div>`).join('')}</div>
      <div class="lp-body">${body}${st.err ? `<div class="lp-err"><i data-lucide="triangle-alert"></i>${esc(st.err)}</div>` : ''}</div>
      <div class="lp-f"><button class="btn btn-ghost" data-b ${s === 1 ? 'disabled' : ''}>Kembali</button><button class="lp-next" data-n>${s === 4 ? 'Kirim laporan' : 'Lanjut'}<i data-lucide="arrow-right"></i></button></div>`;
    icons();
    $('[data-x]', m).onclick = () => closeModal(b);
    $('[data-b]', m).onclick = () => { st.err = ''; st.step--; render(); };
    $('[data-n]', m).onclick = next;
    if (s === 1) initMap(m);
    if (s === 2) {
      $$('#sev .sev-o', m).forEach(c => c.onclick = () => { st.sev = +c.dataset.v; st.err = ''; render(); });
      $('#h', m).oninput = e => { st.h = +e.target.value; $('#hv', m).textContent = st.h + ' cm'; };
      $('#pm', m).onclick = () => { st.people = Math.max(1, st.people - 1); $('#pv', m).textContent = st.people; };
      $('#pp', m).onclick = () => { st.people++; $('#pv', m).textContent = st.people; };
    }
    if (s === 3) {
      const file = f => {
        if (!f) return;
        if (!/^image\//.test(f.type)) { st.err = 'File harus berupa gambar (JPG atau PNG).'; render(); return; }
        const r = new FileReader();
        r.onload = () => {
          const im = new Image();
          im.onload = () => {
            const k = Math.min(1, 800 / Math.max(im.width, im.height)), c = document.createElement('canvas');
            c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
            c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
            st.photo = f.name; st.photoUrl = c.toDataURL('image/jpeg', .72); st.err = ''; render();
          };
          im.onerror = () => { st.err = 'Gambar tidak dapat dibaca. Coba foto lain.'; render(); };
          im.src = r.result;
        };
        r.readAsDataURL(f);
      };
      $('#ph', m).onchange = e => file(e.target.files[0]);
      const d = $('#drop', m); d.ondragover = e => e.preventDefault(); d.ondrop = e => { e.preventDefault(); file(e.dataTransfer.files[0]); };
      $('#wa', m).oninput = e => { st.wa = e.target.value; const ok = WA_RE.test(st.wa.replace(/[\s-]/g, '')); $('#wab', m).style.borderColor = !st.wa ? '' : ok ? 'var(--teal)' : 'var(--red)'; const h = $('#wah', m); h.style.color = !st.wa ? '' : ok ? 'var(--teal-ink)' : 'var(--red-ink)'; h.textContent = !st.wa ? 'Format: 08xx atau +62 8xx. Kami kabari status lewat WhatsApp.' : ok ? 'Nomor valid.' : 'Nomor tidak valid. Contoh: 081234567890'; };
    }
  };
  const initMap = m => {
    const put = (la, lo, fly) => {
      st.lat = la; st.lng = lo; st.err = '';
      if (pmk) pmk.setLatLng([la, lo]); else pmk = L.marker([la, lo]).addTo(pmap);
      if (fly) pmap.flyTo([la, lo], 16);
      $('#pint', m).textContent = `Pin dipasang di ${la.toFixed(4)}, ${lo.toFixed(4)}`;
    };
    $('#pint', m).textContent = 'Belum ada pin. Ketuk peta untuk memilih lokasi.';
    if (!window.L) { $('#pmap', m).innerHTML = '<div class="empty">Peta membutuhkan koneksi internet.</div>'; return; }
    pmap = AlirMap.create('pmap', {zoom: 14});
    if (st.lat != null) put(st.lat, st.lng);
    pmap.on('click', e => put(e.latlng.lat, e.latlng.lng));
    $('#gps', m).onclick = () => { put(-6.8702, 109.6911, true); toast('Lokasi perangkat ditemukan (simulasi)'); };
    setTimeout(() => pmap && pmap.invalidateSize(), 420);
  };
  const next = () => {
    const s = st.step, m = $('.modal', b), fail = t => { st.err = t; render(); return false; };
    if (s === 1 && st.lat == null) return fail('Tentukan pin lokasi dulu.');
    if (s === 2) {
      if (!st.sev) return fail('Pilih tingkat keparahan.');
      if (!(st.h >= 5 && st.h <= 200)) return fail('Tinggi air harus 5 sampai 200 cm.');
    }
    if (s === 3) {
      st.wa = $('#wa', m).value.trim().replace(/[\s-]/g, '');
      if (!st.photoUrl) return fail('Unggah foto genangan sebagai bukti validasi.');
      if (!WA_RE.test(st.wa)) return fail('Nomor WhatsApp tidak valid. Contoh: 081234567890');
    }
    if (s === 4) {
      const kel = nearestKel(st.lat, st.lng);
      const id = window.Store ? Store.addReport({kel, lat: st.lat, lng: st.lng, sev: st.sev, h: st.h, people: st.people, photo: true, gps: true, wa: st.wa, note: '', img: st.photoUrl}) : 'P-' + Math.floor(1000 + Math.random() * 9000);
      teardown();
      m.innerHTML = `<div class="lp-done"><span class="ok"><i data-lucide="check"></i></span><div style="font-size:26px;font-weight:800;letter-spacing:-.02em">Laporan diterima.</div>
        <div style="font-size:15px;color:#2A4560;max-width:520px">Nomor tiket <b>${id}</b>. Kami akan mengirim status verifikasi dan tim relawan yang ditugaskan ke WhatsApp <b>${esc(st.wa)}</b>.</div>
        <div class="row wrapx" style="gap:10px;margin-top:8px"><button class="btn btn-ghost" data-ok>Tutup</button><a class="lp-next" href="admin.html#verifikasi" style="gap:20px">Lihat di Panel Admin<i data-lucide="arrow-up-right"></i></a></div></div>`;
      icons(); $('[data-ok]', m).onclick = () => closeModal(b); return;
    }
    st.err = ''; st.step++; render();
  };
  b = openModal('', {cls: 'lapor', onClose: teardown});
  render();
}
function nearestKel(la, lo) {
  const all = (window.ALIR_DATA ? ALIR_DATA.reports : []).slice().sort((a, b) => haversine(la, lo, a.lat, a.lng) - haversine(la, lo, b.lat, b.lng));
  return all[0] ? all[0].kel : 'Pekalongan';
}

/* ---------- init halaman publik ---------- */
function initPage(opts = {}) {
  mountNav(opts.active);
  mountFooter();
  mountWaves(); mountHeroWater();
  icons();
  mountReveal();
}
