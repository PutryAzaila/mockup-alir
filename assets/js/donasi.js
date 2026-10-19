initPage({active: 'donasi.html'});
const S = Store.get();
const urgCls = {Kritis: 'red', Mendesak: 'amber', Normal: 'teal'};
const CIC = {Pangan: 'wheat', Sandang: 'shirt', Bayi: 'baby', Kesehatan: 'heart-pulse', Peralatan: 'wrench'};
const st = {cat: 'Semua', urg: 'all', item: null, mode: 'qty', qty: 1, nom: 100000, anon: false, name: '', order: '', method: null, timer: null};

/* ---------- langkah di header ---------- */
function flow(n) {
  $('#flow').innerHTML = [['Pilih barang', 'Katalog kebutuhan posko'], ['Isi donasi', 'Jumlah & tampilan nama'], ['Bayar', 'QRIS · Virtual Account · Gerai']].map((f, i) =>
    `<div class="fs ${i + 1 <= n ? 'on' : ''}" style="opacity:${i + 1 <= n ? 1 : .55}"><div class="b"><i></i></div><div class="n"><span>0${i + 1}</span><b>${f[0]}</b></div><small>${f[1]}</small></div>`).join('');
}
flow(1);

/* ---------- katalog ---------- */
const cats = ['Semua', ...new Set(S.wishlist.map(w => w.cat))];
$('#cats').innerHTML = cats.map(c => `<button class="chip ${c === 'Semua' ? 'on' : ''}" data-c="${c}">${c}</button>`).join('');
$$('#cats .chip').forEach(b => b.onclick = () => { st.cat = b.dataset.c; $$('#cats .chip').forEach(x => x.classList.toggle('on', x === b)); drawCat(); });
$$('#urg button').forEach(b => b.onclick = () => { st.urg = b.dataset.u; $$('#urg button').forEach(x => x.classList.toggle('on', x === b)); drawCat(); });
function drawCat() {
  const l = S.wishlist.filter(w => (st.cat === 'Semua' || w.cat === st.cat) && (st.urg === 'all' || w.urg === st.urg));
  $('#cat').innerHTML = l.length ? l.map((w, i) => {
    const p = Math.round(w.got / w.target * 100), full = w.got >= w.target;
    const col = full ? 'var(--teal-ink)' : p >= 75 ? 'var(--teal-ink)' : w.urg === 'Kritis' ? 'var(--red-ink)' : 'var(--coral-dark)';
    return `<article class="dc" id="c-${w.id}" style="animation-delay:${i * .07}s"><div class="ph"><img class="gs" src="${img(w.img)}" alt="${esc(w.name)}" loading="lazy"><span class="tag ${urgCls[w.urg]}">${w.urg}</span></div>
      <div class="bd"><div class="row between" style="align-items:flex-start"><h3>${esc(w.name)}</h3><i data-lucide="${CIC[w.cat] || 'package'}" style="color:var(--s-600)"></i></div>
        <span class="small muted">${esc(w.by)}</span><b class="small">${rp(w.price)} / ${w.unit}</b>
        <div class="row between" style="align-items:flex-end;margin-top:14px"><span class="pct" style="color:${col}">${p}%</span><span class="xs muted money" style="text-align:right">${rp(w.price * w.got)}<br>dari ${rp(w.price * w.target)}</span></div>
        <div class="bar ${w.urg === 'Kritis' ? 'coral' : ''}" style="margin-top:8px"><i style="width:${p}%"></i></div>
        <div class="row between xs muted" style="margin:8px 0 16px"><span class="cnt">${w.got} / ${w.target} ${w.unit}</span><span class="dnr">${Math.max(1, Math.round(w.got / 3))} donatur</span></div></div>
      <button class="btn-d" data-pick="${w.id}" ${full ? 'disabled' : ''}>${full ? 'Kebutuhan terpenuhi' : 'Donasi barang ini'}<i data-lucide="arrow-right" class="arr"></i></button></article>`;
  }).join('') : '<div class="empty" style="grid-column:1/-1">Tidak ada barang untuk filter ini.</div>';
  $$('[data-pick]').forEach(b => b.onclick = () => openForm(b.dataset.pick));
  icons(); mountReveal();
}
const AVC = [['#DBEAFE', '#1D4ED8'], ['#FFEDE6', '#9A2E10'], ['#CCF3EE', '#0E6B62'], ['#FFF3D6', '#8A5A00'], ['#F1F5F9', '#475569']];
function drawDonors(fresh) {
  $('#donors').innerHTML = S.donors.slice(0, 7).map((d, i) => {
    const c = d.anon ? AVC[4] : AVC[(d.n.charCodeAt(0) || 0) % 4], ini = d.anon ? '?' : d.n.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
    return `<div class="dr ${fresh && i === 0 ? 'new' : ''}"><span class="av" style="background:${c[0]};color:${c[1]}">${ini}</span><span style="min-width:0"><b>${esc(d.n)}</b><span class="it">${d.q}x ${esc(d.item)}</span></span><span class="am"><b>${rp(d.amt)}</b><small>${esc(d.ts)}</small></span></div>`;
  }).join('');
  if (fresh) setTimeout(() => { const f = $('#donors .dr.new'); if (f) f.classList.remove('new'); }, 80);
}
drawCat(); drawDonors();
/* donatur baru masuk tiap 9 dtk: hanya daftar donatur dan satu kartu yang disegarkan (seperti referensi) */
function updateCard(w) {
  const c = $('#c-' + w.id); if (!c) return;
  const p = Math.round(w.got / w.target * 100);
  $('.pct', c).textContent = p + '%'; $('.money', c).innerHTML = rp(w.price * w.got) + '<br>dari ' + rp(w.price * w.target);
  $('.bar>i', c).style.width = p + '%'; $('.cnt', c).textContent = w.got + ' / ' + w.target + ' ' + w.unit; $('.dnr', c).textContent = Math.max(1, Math.round(w.got / 3)) + ' donatur';
  if (w.got >= w.target) { const b = $('.btn-d', c); b.disabled = true; b.firstChild.textContent = 'Kebutuhan terpenuhi'; }
}
const FAKE = [['Budi Santoso', 'W-01', 2], ['Hamba Allah', 'W-04', 4], ['Yayasan Peduli Pantura', 'W-06', 1], ['Nadia Putri', 'W-03', 3], ['Komunitas Sepeda Kota', 'W-05', 2], ['Hamba Allah', 'W-02', 1]];
let fk = 0;
setInterval(() => {
  const [n, id, q] = FAKE[fk++ % FAKE.length], w = S.wishlist.find(x => x.id === id); if (!w || w.got >= w.target || OVS.length) return;
  Store.donate(id, q, q * w.price, n, n === 'Hamba Allah'); drawDonors(true); updateCard(w);
}, 9000);

/* ---------- modal bantu ---------- */
function dmodal(html, cls = 'dm', onClose) { return openModal(html, {cls, z: cls === 'gw' ? 'pay' : '', onClose}); }
const total = () => st.mode === 'qty' ? st.qty * st.item.price : st.nom;
const eqUnits = () => st.mode === 'qty' ? st.qty : Math.max(0, Math.floor(st.nom / st.item.price));
let fm_ = null;
function openForm(id) {
  st.item = S.wishlist.find(w => w.id === id); st.qty = 1; st.mode = 'qty'; st.nom = Math.max(100000, st.item.price); st.anon = false; st.name = '';
  flow(2);
  const b = fm_ = dmodal(`
    <div class="dm-h"><div><div class="st">LANGKAH 2 DARI 3</div><div class="tt">Isi donasi Anda</div></div><button class="x-b" data-x aria-label="Tutup"><i data-lucide="x"></i></button></div>
    <div class="dm-b">
      <div><div class="lb">Barang yang didonasikan</div><select class="sel" id="fi">${S.wishlist.filter(w => w.got < w.target).map(w => `<option value="${w.id}" ${w.id === id ? 'selected' : ''}>${esc(w.name)}</option>`).join('')}</select><div class="xs muted" style="margin-top:6px" id="fp"></div></div>
      <div><div class="lb">Jumlah donasi</div>
        <div class="mseg" id="fm"><button class="on" data-m="qty">Jumlah barang</button><button data-m="nom">Nominal bebas</button></div>
        <div id="fq" class="row wrapx" style="gap:8px"><div class="stp"><button data-d="-1" aria-label="Kurangi"><i data-lucide="minus"></i></button><span id="fqn">1</span><button data-d="1" aria-label="Tambah"><i data-lucide="plus"></i></button></div><b class="small" id="fu"></b>${[5, 10, 25].map(q => `<button class="qk" data-q="${q}">+${q}</button>`).join('')}</div>
        <div id="fn" class="hide" style="display:grid;gap:10px"><div class="nm"><span>Rp</span><input id="fni" inputmode="numeric" value="${st.nom.toLocaleString('id-ID')}"></div><div class="chips">${[50000, 100000, 250000, 500000, 1000000].map(n => `<button class="chip" data-n="${n}">${n >= 1e6 ? '1 jt' : n / 1000 + ' rb'}</button>`).join('')}</div></div>
        <div class="row small muted" style="gap:6px;margin-top:10px"><i data-lucide="package" style="width:14px"></i><span id="feq"></span></div></div>
      <div><div class="lb">Tampilan nama</div><div class="sa" id="fs">
        <button class="on" data-a="0"><span class="rd"><i></i></span><span><b style="display:block;font-size:14px">Nama saya</b><span class="xs muted">Tampil di daftar donatur</span></span></button>
        <button data-a="1"><span class="rd"><i></i></span><span><b style="display:block;font-size:14px">Anonim</b><span class="xs muted">Tampil sebagai Hamba Allah</span></span></button></div>
        <input class="input" id="fnm" placeholder="Nama Anda" style="margin-top:10px"><div class="xs muted" style="margin-top:8px">Tampil di daftar donatur sebagai <b style="color:var(--navy)" id="fda">...</b></div></div>
    </div>
    <div class="dm-f"><div><div class="xs muted">Total donasi</div><div style="font-size:26px;font-weight:800;letter-spacing:-.02em;font-variant-numeric:tabular-nums" id="ft">Rp0</div><div style="font-size:11px;color:var(--s-500)">Minimal Rp10.000</div></div>
      <button class="pay-btn" id="fgo">Lanjut ke Pembayaran<i data-lucide="lock"></i></button></div>`);
  const sync = () => {
    const t = total(); $('#ft', b).textContent = rp(t); $('#fp', b).textContent = `${rp(st.item.price)} / ${st.item.unit} · sisa kebutuhan ${st.item.target - st.item.got} ${st.item.unit}`;
    $('#fu', b).textContent = st.item.unit; $('#fqn', b).textContent = st.qty;
    $('#feq', b).textContent = st.mode === 'qty' ? `${st.qty} ${st.item.unit} × ${rp(st.item.price)}` : `Setara ± ${eqUnits()} ${st.item.unit} ${st.item.name}`;
    $('#fda', b).textContent = st.anon ? 'Hamba Allah' : (st.name.trim() || 'Nama Anda');
    $('#fgo', b).disabled = t < 10000;
    $$('#fn .chip', b).forEach(c => c.classList.toggle('on', +c.dataset.n === st.nom));
  };
  $('[data-x]', b).onclick = () => closeModal(b);
  $('#fi', b).onchange = e => { st.item = S.wishlist.find(w => w.id === e.target.value); st.qty = 1; sync(); };
  $$('#fm button', b).forEach(x => x.onclick = () => { st.mode = x.dataset.m; $$('#fm button', b).forEach(y => y.classList.toggle('on', y === x)); $('#fq', b).classList.toggle('hide', st.mode !== 'qty'); $('#fn', b).classList.toggle('hide', st.mode !== 'nom'); sync(); });
  $$('.stp button', b).forEach(x => x.onclick = () => { st.qty = Math.max(1, Math.min(st.item.target - st.item.got, st.qty + +x.dataset.d)); sync(); });
  $$('.qk', b).forEach(x => x.onclick = () => { st.qty = Math.min(st.item.target - st.item.got, st.qty + +x.dataset.q); sync(); });
  $('#fni', b).oninput = e => { st.nom = +e.target.value.replace(/\D/g, '') || 0; e.target.value = st.nom ? st.nom.toLocaleString('id-ID') : ''; sync(); };
  $$('#fn .chip', b).forEach(x => x.onclick = () => { st.nom = +x.dataset.n; $('#fni', b).value = st.nom.toLocaleString('id-ID'); sync(); });
  $$('#fs button', b).forEach(x => x.onclick = () => { st.anon = x.dataset.a === '1'; $$('#fs button', b).forEach(y => y.classList.toggle('on', y === x)); $('#fnm', b).style.display = st.anon ? 'none' : ''; sync(); });
  $('#fnm', b).oninput = e => { st.name = e.target.value; sync(); };
  $('#fgo', b).onclick = () => { if (!st.anon && !st.name.trim()) { $('#fnm', b).classList.add('err'); $('#fnm', b).focus(); return; } b._onClose = null; closeModal(b); fm_ = null; withProgress(openPay, 450); };
  sync();
}

/* ---------- gateway pembayaran (simulasi tampilan Midtrans Snap) ---------- */
function qrSVG() {
  let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647, n = 29, c = 6; let o = '';
  const fin = (x, y) => '<rect x="' + x * c + '" y="' + y * c + '" width="' + 7 * c + '" height="' + 7 * c + '" rx="9" fill="#0B1E33"/><rect x="' + (x + 1) * c + '" y="' + (y + 1) * c + '" width="' + 5 * c + '" height="' + 5 * c + '" rx="6" fill="#fff"/><rect x="' + (x + 2) * c + '" y="' + (y + 2) * c + '" width="' + 3 * c + '" height="' + 3 * c + '" rx="3" fill="#0B1E33"/>';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { if ((x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9)) continue; if (r() > .5) o += '<rect x="' + (x * c + .6) + '" y="' + (y * c + .6) + '" width="' + (c - 1.2) + '" height="' + (c - 1.2) + '" rx="2" fill="#0B1E33"/>'; }
  return '<svg viewBox="0 0 ' + n * c + ' ' + n * c + '" width="100%" style="display:block;height:auto">' + o + fin(0, 0) + fin(n - 7, 0) + fin(0, n - 7) + '</svg>';
}
const BANKS = [['BCA', '#0060AF', '#fff'], ['BNI', '#F15A23', '#fff'], ['BRI', '#00529C', '#fff'], ['Permata', '#00A650', '#fff'], ['CIMB Niaga', '#7E1416', '#fff'], ['Danamon', '#F58220', '#fff'], ['BSI', '#00A19C', '#fff'], ['SeaBank', '#FF5A1F', '#fff'], ['Saqu', '#1F4E9E', '#fff'], ['Mandiri', '#FFB700', '#003D79']];
const RETAIL = [['Indomaret', '#0066B3', '#fff'], ['Alfamart', '#E30613', '#fff']];
const EW = [['GoPay', '#00AED6', '#fff'], ['ShopeePay', '#EE4D2D', '#fff'], ['OVO', '#4C3494', '#fff'], ['DANA', '#118EEA', '#fff']];
const OB = [['BCA KlikPay', '#0060AF', '#fff', 'KlikPay'], ['KlikBCA', '#0060AF', '#fff', 'KlikBCA'], ['BRI e-Pay', '#00529C', '#fff', 'e-Pay'], ['CIMB Clicks', '#7E1416', '#fff', 'Clicks'], ['UOB EZ Pay', '#003B71', '#fff', 'EZ Pay']];
const PL = [['Akulaku', '#E5002D', '#fff'], ['Kredivo', '#0A5CFF', '#fff']];
/* Pengaturan metode yang ditampilkan (setara enabled_payments di Midtrans): hapus nama untuk menyembunyikan */
const PAY_ENABLED = {
  qris: true, card: true,
  ew: ['GoPay', 'OVO', 'ShopeePay', 'DANA'],
  ob: ['BCA KlikPay', 'KlikBCA', 'BRI e-Pay', 'CIMB Clicks', 'UOB EZ Pay'],
  va: ['BCA', 'BNI', 'BRI', 'Permata', 'CIMB Niaga', 'Danamon', 'BSI', 'SeaBank', 'Saqu', 'Mandiri'],
  rt: ['Indomaret', 'Alfamart'],
  pl: ['Akulaku', 'Kredivo']
};
const LISTS = {va: BANKS, rt: RETAIL, ew: EW, pl: PL, ob: OB};
const on = (g, n) => PAY_ENABLED[g].includes(n);
const WALLETS = [['GoPay', '#00AED6'], ['OVO', '#4C3494'], ['DANA', '#118EEA'], ['ShopeePay', '#EE4D2D'], ['LinkAja', '#E82529']];
const tile = (txt, bg, fg, bd, cls) => '<span class="bk ' + (cls || '') + (txt.length > 5 ? ' sm' : '') + '" style="background:' + bg + ';color:' + fg + (bd ? ';box-shadow:inset 0 0 0 1.5px ' + bd : '') + '">' + txt + '</span>';
const mTile = (type, name, cls) => type === 'qris' ? tile('QRIS', '#fff', '#E5484D', '#E2E8F0', cls) : type === 'card' ? tile('CARD', '#0B1E33', '#fff', '', cls) : (x => tile(type === 'rt' ? x[0].toLowerCase() : type === 'ob' ? x[3] : x[0], x[1], x[2], '', cls))(LISTS[type].find(x => x[0] === name));
const wallets = () => '<span class="gx-wl">' + WALLETS.map(w => '<i><b style="background:' + w[1] + '"></b>' + w[0] + '</i>').join('') + '</span>';
const mmss = n => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
function openPay() {
  flow(3); st.order = 'ALR-' + Math.random().toString(36).slice(2, 8).toUpperCase(); st.method = null;
  const b = dmodal('', 'gw', () => { clearInterval(st.timer); flow(1); }), box = $('.gw', b);
  const t = total(), TOTAL = 900, RING = 2 * Math.PI * 26, q = Math.max(1, eqUnits()), donor = st.anon ? 'Hamba Allah' : st.name;
  let left = TOTAL, itab = 'm', busy = false, started = false;
  const when = new Date().toLocaleString('id-ID', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'});
  box.innerHTML = '<div class="gx">' +
    '<aside class="gx-l"><div class="gx-wave" data-waves="rgba(86,156,235,.16)"></div>' +
      '<div class="gx-brand"><span class="lg"><i data-lucide="waves"></i></span><span><b>ALIR Donasi Banjir</b><small>Order ' + st.order + '</small></span></div>' +
      '<div class="gx-amt"><small>Total pembayaran</small><b>' + rp(t) + '</b></div>' +
      '<div class="gx-item"><img src="' + img(st.item.img) + '" alt=""><div><b>' + esc(st.item.name) + '</b><small>' + q + ' ' + st.item.unit + ' &middot; ' + esc(donor) + '</small></div></div>' +
      '<div class="gx-det"><div><span>Subtotal</span><b>' + rp(t) + '</b></div><div><span>Biaya layanan</span><b>Rp0</b></div><div class="tot"><span>Total</span><b>' + rp(t) + '</b></div></div>' +
      '<div class="gx-timer idle" id="gxt"><svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" class="tr"/><circle id="gring" cx="30" cy="30" r="26" class="pr" stroke-dasharray="' + RING + '" stroke-dashoffset="0"/></svg><div><small id="gtl">Batas waktu bayar</small><b id="gt">Pilih metode</b></div></div>' +
      '<div class="gx-sec"><i data-lucide="lock"></i><span>Pembayaran aman &middot; didukung <b>Midtrans</b></span></div>' +
    '</aside>' +
    '<section class="gx-r"><header class="gx-top"><ol class="gx-steps" id="gxs"></ol><button class="sn-x" id="gx" aria-label="Tutup"><i data-lucide="x"></i></button></header><div class="gx-body" id="gxb"></div></section></div>';
  mountWaves(); $('#gx', b).onclick = () => closeModal(b);
  const setSteps = n => { $('#gxs', b).innerHTML = [['Metode', 1], ['Bayar', 2], ['Selesai', 3]].map(s => '<li class="' + (s[1] < n ? 'done' : s[1] === n ? 'on' : '') + '"><i>' + (s[1] < n ? '&#10003;' : s[1]) + '</i><span>' + s[0] + '</span></li>').join('<span class="ln"></span>'); };
  const setBody = (html, step) => { const e = $('#gxb', b); e.innerHTML = html; e.scrollTop = 0; setSteps(step); icons(); };

  /* langkah 1: pilih metode */
  const showMethods = () => {
    st.method = null; busy = false;
    const sec = (title, cls, items) => items.length ? '<div class="gx-h">' + title + '</div><div class="gx-grid ' + cls + '">' + items.join('') + '</div>' : '';
    const cell = (key, tl, name, sub) => '<button class="gx-bank" data-k="' + key + '">' + tl + '<b>' + name + '</b><small>' + sub + '</small></button>';
    const list = (g, sub) => LISTS[g].filter(k => on(g, k[0])).map(k => cell(g + '|' + k[0], tile(g === 'rt' ? k[0].toLowerCase() : g === 'ob' ? k[3] : k[0], k[1], k[2], '', 'big'), k[0], sub(k[0])));
    setBody('<div class="gx-in"><h3 class="gx-h3">Pilih metode pembayaran</h3><p class="gx-p">Transaksi Anda dienkripsi dan diproses melalui Midtrans.</p>' +
      (PAY_ENABLED.qris ? '<button class="gx-hero" data-k="qris"><span class="rec">Direkomendasikan</span>' + tile('QRIS', '#fff', '#E5484D', '#E2E8F0', 'big') + '<span class="grow"><b>QRIS</b><small>Scan dengan e-wallet atau m-banking apa pun</small></span><i data-lucide="chevron-right"></i></button>' : '') +
      sec('Dompet digital', '', list('ew', () => 'Bayar lewat aplikasi')) +
      sec('Kartu', 'two', PAY_ENABLED.card ? [cell('card', tile('CARD', '#0B1E33', '#fff', '', 'big'), 'Kartu Kredit / Debit', 'Visa, Mastercard, JCB')] : []) +
      sec('Internet banking', '', list('ob', () => 'Login ke akun bank')) +
      sec('Transfer Virtual Account', '', list('va', n => n === 'Mandiri' ? 'Mandiri Bill' : 'Virtual Account')) +
      sec('Bayar di gerai', 'two', list('rt', () => 'Tunjukkan kode ke kasir')) +
      sec('Bayar nanti (PayLater)', 'two', list('pl', () => 'Cicilan tanpa kartu')) + '</div>', 1);
    $$('[data-k]', b).forEach(x => x.onclick = () => { st.method = x.dataset.k; withProgress(showDetail, 260); });
  };

  /* langkah 2: detail + menunggu pembayaran */
  const showDetail = () => {
    if (!started) { started = true; $('#gxt', b).classList.remove('idle'); $('#gtl', b).textContent = 'Bayar sebelum'; $('#gt', b).textContent = mmss(left); st.timer = setInterval(tick, 1000); }
    const [type, name] = st.method.split('|'), va = '8277 0812 ' + String(Math.floor(1000 + Math.abs(Math.sin(st.order.length + t) * 8999))) + ' 7821', code = 'ALR' + st.order.replace('ALR-', '') + '77', bill = va.replace(/\s/g, '').slice(4, 16);
    let top = '';
    if (type === 'qris' || type === 'ew') top = '<div class="gx-qrrow"><div class="gx-qr"><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i>' + qrSVG() + '<span class="scan"></span></div>' +
      '<div class="gx-qi"><small>Merchant</small><b>ALIR DONASI BANJIR</b><small>NMID</small><b class="mono">ID1026438810027</b><small>Nominal</small><b class="amt">' + rp(t) + '</b><button class="gx-btn" id="saveqr"><i data-lucide="' + (type === 'ew' ? 'external-link' : 'download') + '"></i>' + (type === 'ew' ? 'Buka aplikasi ' + name : 'Simpan kode QR') + '</button></div></div>';
    if (type === 'va' && name === 'Mandiri') top = '<div class="gx-card"><small>Pembayaran Mandiri Bill (e-channel)</small><div class="row between" style="gap:12px"><div><div class="gx-lbl">Kode Perusahaan (Biller Code)</div><span class="no">70012</span></div><button class="cp" data-cp="70012"><i data-lucide="copy"></i>Salin</button></div><div class="row between" style="gap:12px"><div><div class="gx-lbl">Kode Pembayaran (Bill Key)</div><span class="no">' + bill + '</span></div><button class="cp" data-cp="' + bill + '"><i data-lucide="copy"></i>Salin</button></div><div class="gx-kv"><span>Jumlah transfer</span><b>' + rp(t) + '</b></div></div>';
    else if (type === 'va') top = '<div class="gx-card"><small>Nomor Virtual Account ' + name + '</small><div class="row between" style="gap:12px"><span class="no">' + va + '</span><button class="cp" data-cp="' + va.replace(/\s/g, '') + '"><i data-lucide="copy"></i>Salin</button></div><div class="gx-kv"><span>Nama penerima</span><b>ALIR DONASI BANJIR</b></div><div class="gx-kv"><span>Jumlah transfer</span><b>' + rp(t) + '</b></div></div>';
    if (type === 'card') top = '<div class="gx-card"><small>Data kartu</small><label class="gx-f">Nomor kartu<input id="cn" inputmode="numeric" maxlength="19" placeholder="0000 0000 0000 0000" autocomplete="off"></label><label class="gx-f">Nama pada kartu<input id="cm" placeholder="Seperti tertera di kartu" autocomplete="off"></label><div class="gx-2"><label class="gx-f">Berlaku s/d<input id="ce" inputmode="numeric" maxlength="5" placeholder="BB/TT" autocomplete="off"></label><label class="gx-f">CVV<input id="cv" inputmode="numeric" maxlength="3" type="password" placeholder="123" autocomplete="off"></label></div></div>';
    if (type === 'pl' || type === 'ob') top = '<div class="gx-card"><small>' + (type === 'ob' ? 'Pembayaran via ' : 'Cicilan ') + name + '</small><div class="gx-kv" style="border:0;padding:0"><span>Jumlah yang dibayarkan</span><b>' + rp(t) + '</b></div><div class="gx-kv"><span>Penyelesaian</span><b>Di aplikasi ' + name + '</b></div></div>';
    if (type === 'rt') top = '<div class="gx-card center"><small>Kode pembayaran ' + name + '</small><div class="bars">' + Array.from({length: 44}, (_, i) => '<span style="width:' + (1 + (i * 7 % 3)) + 'px;background:' + (i % 2 ? '#fff' : '#0B1E33') + '"></span>').join('') + '</div><div class="no">' + code + '</div><div class="gx-kv" style="text-align:left"><span>Jumlah bayar</span><b>' + rp(t) + '</b></div></div>';
    const ins = type === 'va' ? ({a: ['Masukkan kartu ATM dan PIN ' + name + '.', 'Pilih Transaksi Lainnya, Transfer, lalu ke Virtual Account.', 'Masukkan nomor Virtual Account dan cek nominal.', 'Konfirmasi pembayaran dan simpan struk.'], m: ['Buka aplikasi m-banking ' + name + ' dan login.', 'Pilih Transfer, lalu Virtual Account.', 'Masukkan nomor VA' + (name === 'Mandiri' ? ' (Biller Code dan Bill Key)' : '') + ', pastikan nama ALIR DONASI BANJIR.', 'Masukkan PIN dan selesaikan pembayaran.'], i: ['Login ke internet banking ' + name + '.', 'Pilih menu Pembayaran, lalu Virtual Account.', 'Masukkan nomor VA, periksa nominal dan penerima.', 'Masukkan token atau PIN, lalu konfirmasi.']})[itab] :
      type === 'qris' ? ['Buka aplikasi e-wallet atau m-banking pilihan Anda.', 'Pilih menu Scan atau Bayar, arahkan kamera ke kode QR.', 'Pastikan merchant ALIR DONASI BANJIR dan nominal sesuai.', 'Konfirmasi pembayaran. Status di sini berubah otomatis.'] :
      type === 'ew' ? ['Buka aplikasi ' + name + ' atau scan kode QR di atas.', 'Periksa merchant ALIR DONASI BANJIR dan nominal.', 'Konfirmasi dengan PIN ' + name + '.', 'Status di sini berubah otomatis.'] :
      type === 'card' ? ['Isi nomor kartu, nama, masa berlaku, dan CVV.', 'Selesaikan verifikasi 3D Secure (OTP) dari bank penerbit.', 'Status di sini berubah otomatis setelah disetujui.'] :
      type === 'pl' ? ['Anda diarahkan ke aplikasi ' + name + '.', 'Pilih tenor cicilan dan setujui pengajuan.', 'Status di sini berubah otomatis.'] :
      type === 'ob' ? ['Anda diarahkan ke halaman ' + name + '.', 'Login dan periksa nominal serta merchant.', 'Konfirmasi dengan PIN atau token, status berubah otomatis.'] :
      ['Datang ke kasir ' + name + '.', 'Sebutkan pembayaran ALIR DONASI BANJIR, tunjukkan kode.', 'Bayar tunai sesuai nominal dan simpan struk.', 'Status di sini berubah otomatis setelah dibayar.'];
    setBody('<div class="gx-in"><button class="sn-back" id="back"><i data-lucide="arrow-left"></i>Pilih metode lain</button>' +
      '<div class="gx-hd">' + mTile(type, name, 'big') + '<div><h3 class="gx-h3" style="margin:0">' + (({qris: 'Bayar dengan QRIS', va: name + ' Virtual Account', ew: 'Bayar dengan ' + name, card: 'Kartu Kredit / Debit', pl: 'Bayar dengan ' + name, ob: 'Bayar dengan ' + name})[type] || 'Bayar di ' + name) + '</h3><p class="gx-p" style="margin:2px 0 0">' + (({qris: 'Scan kode di bawah dengan aplikasi yang mendukung QRIS.', va: 'Transfer sesuai nominal ke nomor Virtual Account.', ew: 'Scan kode atau buka aplikasi untuk membayar.', card: 'Pembayaran diproses aman oleh Midtrans.', pl: 'Bayar dengan cicilan tanpa kartu kredit.', ob: 'Anda akan diarahkan ke halaman bank untuk login.'})[type] || 'Tunjukkan kode ke kasir lalu bayar tunai.') + '</p></div></div>' + top +
      '<div class="gx-h">Cara membayar</div>' + (type === 'va' ? '<div class="gx-tabs">' + [['a', 'ATM'], ['m', 'm-Banking'], ['i', 'Internet Banking']].map(x => '<button class="' + (itab === x[0] ? 'on' : '') + '" data-t="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>' : '') +
      '<div class="gx-sg">' + ins.map((s, i) => '<div><i>' + (i + 1) + '</i><span>' + s + '</span></div>').join('') + '</div>' +
      '<div class="gx-bar" id="gbar"><div class="gx-wait"><span class="dot"></span><div><b id="gwt">Menunggu pembayaran</b><small id="gws">Status diperiksa otomatis</small></div></div><button class="gx-sim" id="sim"><i data-lucide="check-circle-2"></i>' + (type === 'card' || type === 'pl' || type === 'ob' ? 'Bayar sekarang' : 'Saya sudah membayar') + '</button></div></div>', 2);
    $('#back', b).onclick = () => showMethods();
    $$('[data-t]', b).forEach(x => x.onclick = () => { itab = x.dataset.t; showDetail(); });
    const cp = $('[data-cp]', b); if (cp) cp.onclick = () => { try { navigator.clipboard.writeText(cp.dataset.cp); } catch (e) {} toast('Nomor disalin', 'ok'); };
    const sv = $('#saveqr', b); if (sv) sv.onclick = () => toast(type === 'ew' ? 'Membuka aplikasi ' + name : 'Kode QR disimpan', 'ok');
    const cn = $('#cn', b); if (cn) cn.oninput = () => { cn.value = cn.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim(); };
    const ce = $('#ce', b); if (ce) ce.oninput = () => { const d = ce.value.replace(/\D/g, '').slice(0, 4); ce.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; };
    if (left <= 0) expire();
    $('#sim', b).onclick = () => {
      if (busy || left <= 0) return;
      if (type === 'card' && $('#cn', b).value.replace(/\D/g, '').length < 13) { toast('Lengkapi nomor kartu', 'err'); return; }
      busy = true; const bar = $('#gbar', b);
      bar.classList.add('chk'); $('#gwt', b).textContent = 'Memverifikasi pembayaran...'; $('#gws', b).textContent = 'Menunggu konfirmasi dari ' + (type === 'qris' ? 'penyedia QRIS' : type === 'va' ? 'bank ' + name : name); $('#sim', b).disabled = true; NP.start();
      setTimeout(() => { NP.done(); success(type, name); }, 2000);
    };
  };
  const expire = () => { const s = $('#sim', b); if (s) { s.disabled = true; s.innerHTML = 'Waktu pembayaran habis'; } const w = $('#gwt', b); if (w) { w.textContent = 'Waktu pembayaran habis'; $('#gws', b).textContent = 'Silakan ulangi donasi'; $('.dot', b).classList.add('off'); } };

  /* langkah 3: berhasil */
  const success = (type, name) => {
    clearInterval(st.timer);
    const via = type === 'qris' ? 'QRIS' : type === 'va' ? name + ' Virtual Account' : type === 'card' ? 'Kartu kredit/debit' : name;
    Store.donate(st.item.id, q, t, st.name.trim(), st.anon); drawCat(); drawDonors(true);
    $('#gxt', b).innerHTML = '<span class="paid"><i data-lucide="badge-check"></i>Lunas</span>'; $('#gxt', b).classList.add('ok');
    setBody('<div class="gx-ok"><div class="ok-c"><span class="r"></span><span class="c"><i data-lucide="check"></i></span></div><h3>Pembayaran berhasil</h3><p>Terima kasih, donasi Anda sudah tercatat dan akan diteruskan ke posko.</p>' +
      '<div class="sn-rc">' + [['Order ID', st.order], ['Waktu', when + ' WIB'], ['Metode', via], ['Barang', st.item.name + ' (' + q + ' ' + st.item.unit + ')'], ['Donatur', donor], ['Status', 'Settlement']].map(l => '<div class="row between"><span>' + l[0] + '</span><b>' + esc(l[1]) + '</b></div>').join('') + '</div>' +
      '<div class="sn-act"><a class="btn-dark" href="index.html#transparansi">Lacak penyaluran</a><button class="btn btn-ghost" id="dd">Selesai</button></div></div>', 4);
    toast('Pembayaran berhasil', 'ok'); $('#dd', b).onclick = () => closeModal(b);
  };
  const tick = () => {
    left--; const el = $('#gt', b), rg = $('#gring', b); if (!el) return;
    el.textContent = left > 0 ? mmss(left) : 'Habis'; if (rg) rg.style.strokeDashoffset = RING * (1 - Math.max(0, left) / TOTAL);
    if (left <= 0) { clearInterval(st.timer); expire(); }
  };
  showMethods();
}

const pre = new URLSearchParams(location.search).get('item');
if (pre && S.wishlist.find(w => w.id === pre)) setTimeout(() => openForm(pre), 500);
