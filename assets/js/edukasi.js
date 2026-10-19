initPage({active: 'edukasi.html'});
mouseParallax($('.ed-hero'));

/* ---------- hero: orb melayang & tautan lompat ---------- */
const ORBS = [['waves', 'left:57%;top:15%', 84, '#FF6A3D', '#0B1E33', '4.2s', 1.1], ['backpack', 'right:12%;top:14%', 76, '#F5F7FA', '#0B1E33', '5s', .7], ['shield-check', 'right:30%;top:58%', 64, '#14B8A6', '#0B1E33', '3.6s', 1.4], ['droplets', 'left:38%;top:16%', 54, 'rgba(86,156,235,.35)', '#BBD9FA', '4.6s', .5], ['life-buoy', 'right:5%;top:48%', 70, '#12304D', '#FF8A63', '5.4s', .9]];
$('#orbs').innerHTML = ORBS.map(o => `<div class="orb" style="${o[1]}" data-depth="${o[6]}"><span style="width:${o[2]}px;height:${o[2]}px;background:${o[3]};color:${o[4]};--bd:${o[5]}"><i data-lucide="${o[0]}" style="width:${o[2] * .42}px;height:${o[2] * .42}px"></i></span></div>`).join('');
const JUMP = [['#sim', 'ruler', 'Simulator'], ['#fase', 'list-checks', 'Fase'], ['#bag', 'backpack', 'Tas siaga'], ['#mitos', 'scale', 'Mitos'], ['#fakta', 'lightbulb', 'Fun facts'], ['#kuis', 'award', 'Kuis']];
$('#jump').innerHTML = JUMP.map(j => `<a href="${j[0]}"><i data-lucide="${j[1]}"></i>${j[2]}</a>`).join('');

/* ---------- 01 simulator ---------- */
const MARKS = [[20, 'footprints', 'Setinggi mata kaki: licin, hati-hati kabel dan benda tajam.'], [40, 'activity', 'Setinggi lutut: arus mulai menyulitkan berjalan.'], [60, 'zap-off', 'Setinggi paha: matikan listrik, evakuasi anak dan lansia.'], [90, 'triangle-alert', 'Setinggi pinggang: jangan melintas sendiri, hubungi tim.'], [120, 'life-buoy', 'Setinggi dada: berisiko hanyut, naik ke tempat tinggi.'], [150, 'siren', 'Setinggi leher: sangat berbahaya, tunggu perahu penyelamat.']];
const LV = [[0, 'Aman', '#CCF3EE', '#0E6B62', '#14B8A6', 'Air belum masuk permukiman. Tetap pantau informasi BPBD dan siapkan tas siaga.'], [10, 'Waspada', '#FFF3D6', '#8A5A00', '#F5A524', 'Genangan mulai terlihat. Hindari kabel listrik dan benda tajam di bawah air.'], [40, 'Siaga', '#FFD3C2', '#9A2E10', '#FF6A3D', 'Arus mulai menyulitkan. Matikan listrik, evakuasi anak dan lansia lebih dulu.'], [80, 'Bahaya', '#FDECEC', '#B91C1C', '#E5484D', 'Jangan melintas sendiri. Hubungi tim evakuasi lewat 112 atau laporkan lewat ALIR.'], [120, 'Sangat berbahaya', '#E5484D', '#fff', '#fff', 'Berisiko hanyut. Naik ke tempat tinggi dan tunggu perahu penyelamat.']];
$('#ticks').innerHTML = [150, 125, 100, 75, 50, 25, 0].map(t => `<span>${t} cm</span>`).join('');
$('#gmarks').innerHTML = MARKS.map(m => `<div class="gm" style="bottom:${m[0] / 150 * 100}%" data-cm="${m[0]}"><span>${m[0]} cm</span></div>`).join('');
$('#mks').innerHTML = MARKS.map(m => `<div class="mk-r" data-cm="${m[0]}"><span class="ic"><i data-lucide="${m[1]}" style="width:18px;height:18px"></i></span><b>${m[0]} cm</b><span class="t">${m[2]}</span></div>`).join('');
$('#presets').innerHTML = [0, 20, 50, 90, 130, 150].map(p => `<button class="chip" data-p="${p}">${p} cm</button>`).join('');
function setLevel(cm, fromUser) {
  cm = +cm; $('#depth').value = cm;
  const lv = [...LV].reverse().find(l => cm >= l[0]);
  $('#lv').textContent = cm; $('#gw').style.height = (cm / 150 * 100) + '%';
  const b = $('#lvb'); b.style.background = lv[2]; b.style.color = lv[3]; b.innerHTML = `<i style="background:${lv[4]}"></i>${lv[1]}`;
  $('#lvm').textContent = lv[5];
  $$('.gm,.mk-r').forEach(e => e.classList.toggle('hit', cm >= +e.dataset.cm));
  $('#pers').style.filter = cm >= 120 ? 'hue-rotate(-20deg) saturate(1.4)' : '';
  $$('#presets .chip').forEach(c => c.classList.toggle('on', +c.dataset.p === cm));
}
$('#depth').oninput = e => setLevel(e.target.value);
$$('#presets .chip').forEach(c => c.onclick = () => { const to = +c.dataset.p; const from = +$('#depth').value; let k = 0; const step = () => { k += .12; setLevel(Math.round(from + (to - from) * Math.min(1, 1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(step); }; step(); });
setLevel(45);

/* ---------- 02 fase ---------- */
const PH = [
  {num: '01', t: 'Sebelum banjir', d: 'Persiapan sepuluh menit hari ini bisa menyelamatkan nyawa saat air datang.', w: 28, wt: 'Muka air normal, saatnya bersiap', items: [['map', 'Kenali jalur evakuasi', 'Tentukan titik kumpul di tempat tinggi dan dua rute menuju ke sana. Latih seluruh keluarga, termasuk anak dan lansia.'], ['file-lock', 'Amankan dokumen penting', 'Simpan KTP, KK, ijazah, dan sertifikat dalam kantong kedap air atau map plastik, lalu taruh di lantai atas.'], ['backpack', 'Siapkan tas siaga', 'Isi dengan air minum, makanan siap saji, obat, senter, dan power bank. Periksa isinya tiap tiga bulan.'], ['cloud-rain', 'Pantau cuaca dan rob', 'Cek prakiraan BMKG dan kalender rob di ALIR. Waspada terutama saat purnama dan bulan baru.']]},
  {num: '02', t: 'Saat banjir', d: 'Utamakan keselamatan: air bergerak cepat dan bisa mengalirkan listrik.', w: 70, wt: 'Muka air naik, bergerak ke tempat tinggi', items: [['zap-off', 'Matikan listrik dan gas', 'Cabut sumber listrik dari meteran dan tutup gas sebelum air masuk. Jangan menyentuh peralatan listrik dengan tangan basah.'], ['footprints', 'Jangan berjalan di arus deras', 'Arus setinggi lutut saja bisa membuat orang dewasa terjatuh. Gunakan tongkat untuk memeriksa pijakan dan berjalan bersama.'], ['shield-alert', 'Hindari kontak air kotor', 'Air banjir bercampur limbah. Gunakan sepatu boot dan sarung tangan, jangan minum atau memasak dengan air banjir.'], ['phone-call', 'Hubungi bantuan', 'Telepon 112 atau Basarnas 115, atau laporkan titik Anda lewat ALIR agar relawan terdekat bergerak.']]},
  {num: '03', t: 'Setelah banjir', d: 'Pulihkan dengan hati-hati: bahaya belum selesai saat air surut.', w: 45, wt: 'Air surut, mulai pemulihan', items: [['house', 'Kembali bila dinyatakan aman', 'Tunggu pernyataan petugas. Periksa retakan dinding, atap, dan instalasi listrik sebelum masuk rumah.'], ['spray-can', 'Bersihkan dengan perlindungan', 'Pakai masker, sarung tangan, dan sepatu tertutup. Cuci permukaan dengan disinfektan dan jemur perabot.'], ['trash-2', 'Buang makanan terendam', 'Makanan dan minuman yang terkena air banjir tidak aman dikonsumsi, meski terlihat bersih.'], ['clipboard-pen', 'Laporkan kerusakan dan kebutuhan', 'Catat kerusakan dan kebutuhan keluarga, lalu laporkan lewat ALIR agar bantuan tepat sasaran.']]},
];
let pi = 0, pOpen = 0;
$('#ptabs').insertAdjacentHTML('beforeend', PH.map((p, i) => `<button data-i="${i}" class="${i === 0 ? 'on' : ''}">${['Sebelum', 'Saat', 'Setelah'][i]}</button>`).join(''));
function phase() {
  const p = PH[pi]; $('#pind').style.transform = `translateX(${pi * 100}%)`;
  $$('#ptabs button').forEach((b, i) => b.classList.toggle('on', i === pi));
  $('#pbody').style.animation = 'none'; void $('#pbody').offsetWidth; $('#pbody').style.animation = '';
  $('#pbody').innerHTML = `<div class="pcard"><div class="w"><svg viewBox="0 0 2880 100" preserveAspectRatio="none"><path d="M0 50 Q 360 0 720 50 T 1440 50 T 2160 50 T 2880 50 V 100 H 0 Z" fill="rgba(86,156,235,.3)"/></svg></div>
    <span class="pnum">${p.num}</span><h3>${p.t}</h3><p>${p.d}</p><span class="wt"><i data-lucide="waves" style="width:16px"></i>${p.wt}</span></div>
    <div>${p.items.map((a, i) => `<div class="ai ${i === pOpen ? 'open' : ''}" style="--i:${i}"><button data-a="${i}"><span class="ic"><i data-lucide="${a[0]}" style="width:20px;height:20px"></i></span><span class="tt">${a[1]}</span><span class="pl"><i data-lucide="plus" style="width:16px"></i></span></button><div class="bd"><div><p>${a[2]}</p></div></div></div>`).join('')}</div>`;
  icons(); requestAnimationFrame(() => setTimeout(() => { const w = $('.pcard .w'); if (w) w.style.height = p.w + '%'; }, 60));
  $$('.ai>button').forEach(b => b.onclick = () => { const i = +b.dataset.a; pOpen = pOpen === i ? -1 : i; $$('.ai').forEach((x, k) => x.classList.toggle('open', k === pOpen)); });
}
$$('#ptabs button').forEach(b => b.onclick = () => { pi = +b.dataset.i; pOpen = 0; phase(); });
phase();

/* ---------- 03 tas siaga ---------- */
const BAG = [['file-text', 'Dokumen penting'], ['cup-soda', 'Air minum'], ['utensils', 'Makanan siap saji'], ['pill', 'Obat pribadi'], ['heart-pulse', 'Kotak P3K'], ['flashlight', 'Senter'], ['smartphone-charging', 'Power bank'], ['radio', 'Radio kecil'], ['shirt', 'Pakaian ganti'], ['bed', 'Selimut'], ['megaphone', 'Peluit'], ['banknote', 'Uang tunai']];
const bag = new Set();
$('#bchips').innerHTML = BAG.map((b, i) => `<button class="bch" data-i="${i}"><span class="i"><i data-lucide="${b[0]}"></i></span>${b[1]}</button>`).join('');
function drawBag(celebrate) {
  const n = bag.size, p = n / BAG.length, full = n === BAG.length;
  $$('#bchips .bch').forEach(c => c.classList.toggle('on', bag.has(+c.dataset.i)));
  const col = full ? '#14B8A6' : p > .5 ? '#F5A524' : '#FF6A3D';
  $('#bc').style.strokeDashoffset = 326.7 * (1 - p); $('#bc').style.stroke = col; $('#bic').style.color = col;
  $('#bpct').textContent = Math.round(p * 100) + '%'; $('#bdone').textContent = `${n}/${BAG.length} barang siap`;
  const m = $('#bmsg'); m.style.color = col; m.textContent = full ? 'Tasmu lengkap, keluarga siap siaga!' : n === 0 ? 'Mulai dari dokumen dan air minum.' : p > .5 ? 'Sedikit lagi, kamu hampir siap.' : 'Bagus, lanjutkan.';
  if (full && celebrate) burstEl($('.bring'), 44);
}
$$('#bchips .bch').forEach(c => c.onclick = () => { const i = +c.dataset.i; bag.has(i) ? bag.delete(i) : bag.add(i); drawBag(true); });
$('#ball').onclick = () => { BAG.forEach((_, i) => bag.add(i)); drawBag(true); };
$('#breset').onclick = () => { bag.clear(); drawBag(); };
drawBag();

/* ---------- 04 mitos atau fakta ---------- */
const MY = [
  ['Air banjir yang terlihat jernih pasti aman disentuh.', false, 'Air jernih tetap bisa tercemar bakteri, limbah, atau bahan kimia. Anggap semua air banjir kotor.'],
  ['Mematikan listrik sebelum air masuk rumah bisa mencegah sengatan.', true, 'Benar. Memutus listrik dari meteran mencegah korsleting dan sengatan listrik saat air menggenang.'],
  ['Berjalan di air setinggi lutut yang mengalir itu aman.', false, 'Arus setinggi lutut saja bisa membuat orang dewasa terjatuh dan terseret.'],
  ['Banjir rob hanya terjadi saat hujan deras.', false, 'Rob dipicu pasang laut, sehingga bisa terjadi saat cuaca cerah, apalagi di sekitar purnama.'],
  ['Rob cenderung lebih tinggi saat purnama dan bulan baru.', true, 'Benar. Gaya tarik bulan dan matahari yang sejajar membuat pasang laut lebih tinggi.'],
  ['Sampah di saluran air tidak memengaruhi banjir.', false, 'Sampah menyumbat saluran sehingga air tidak mengalir ke laut dan genangan bertahan lebih lama.'],
];
let mi = 0, ms = 0, mAns = null; const mres = [];
function mitos() {
  $('#mscore').textContent = `Skor ${ms}/${MY.length}`;
  $('#mdots').innerHTML = MY.map((_, i) => `<span class="mdot ${i === mi && mi < MY.length ? 'cur' : mres[i] === true ? 'ok' : mres[i] === false ? 'no' : ''}"></span>`).join('');
  const g = $('#mgame');
  if (mi >= MY.length) {
    const t = ms >= 5 ? 'Luar biasa! Kamu paham betul soal banjir.' : ms >= 3 ? 'Cukup baik, masih ada yang bisa dipelajari.' : 'Yuk pelajari lagi bagian fase dan fun facts.';
    g.innerHTML = `<div class="mfin"><span class="s">${ms}/${MY.length}</span><b style="font-size:24px">${t}</b><button class="btn-dark" id="mre" style="align-self:flex-start">Main lagi</button></div>`;
    $('#mre').onclick = () => { mi = 0; ms = 0; mAns = null; mres.length = 0; mitos(); }; return;
  }
  const q = MY[mi], ok = mAns === null ? null : mAns === q[1];
  g.innerHTML = `<div class="deck"><div class="mcard ${ok === null ? '' : ok ? 'ok' : 'no'}" style="${ok === null ? '' : 'animation:none'}"><span class="lab">PERNYATAAN ${mi + 1}</span><span class="q">&ldquo;${q[0]}&rdquo;</span>
    ${ok === null ? `<div class="mbt"><button class="m" data-a="0">Mitos<i data-lucide="x"></i></button><button class="f" data-a="1">Fakta<i data-lucide="check"></i></button></div>` :
    `<div class="mres"><span class="v"><span><i data-lucide="${ok ? 'check' : 'x'}"></i></span>${ok ? 'Benar!' : 'Kurang tepat'} Ini ${q[1] ? 'FAKTA' : 'MITOS'}.</span><span style="font-size:17px;line-height:1.55;max-width:680px">${q[2]}</span><button class="btn-dark" id="mnx" style="align-self:flex-start">${mi === MY.length - 1 ? 'Lihat skor' : 'Berikutnya'}<i data-lucide="arrow-right" class="arr"></i></button></div>`}</div></div>`;
  icons();
  $$('.mbt button').forEach(b => b.onclick = () => { mAns = b.dataset.a === '1'; const r = mAns === q[1]; if (r) ms++; mres[mi] = r; mitos(); });
  const nx = $('#mnx'); if (nx) nx.onclick = () => { mi++; mAns = null; mitos(); };
}
mitos();

/* ---------- 05 fun facts (carousel otomatis) ---------- */
const FF = [
  ['Turun', 'muka tanah di pesisir', 'Mengapa pesisir rawan rob?', 'Sebagian wilayah pesisir mengalami penurunan muka tanah sehingga permukaannya lebih rendah dari pasang laut. Rob jadi lebih sering dan lebih lama.', 'Penyebabnya antara lain pengambilan air tanah berlebihan dan beban bangunan. Cek kajian terbaru BPBD/BMKG.'],
  ['Purnama', 'dan bulan baru', 'Mengapa pasang bisa lebih tinggi?', 'Saat purnama dan bulan baru, gaya tarik bulan dan matahari sejajar sehingga pasang laut mencapai puncaknya.', 'Di ALIR, hari-hari ini ditandai ikon bulan pada kalender risiko rob.'],
  ['Sampah', 'penyumbat saluran', 'Saluran tersumbat, air bertahan', 'Sampah yang menumpuk di selokan dan sungai menghambat air mengalir ke laut sehingga genangan bertahan berhari-hari.', 'Kerja bakti rutin membersihkan saluran adalah mitigasi paling murah.'],
  ['Gatal', 'penyakit kulit pascabanjir', 'Bahaya yang datang sesudahnya', 'Terpapar air kotor berulang dapat memicu gatal-gatal, infeksi kulit, hingga diare. Bersihkan diri setelah kontak dengan air banjir.', 'Gunakan sepatu boot dan sarung tangan saat membersihkan rumah.'],
  ['Cepat', 'arus lebih kuat dari tampak', 'Arus tipis, tenaga besar', 'Air yang tampak tenang bisa menyimpan arus kuat. Kendaraan pun bisa terseret oleh air yang tidak terlalu dalam.', 'Jangan paksakan menerobos genangan, putar balik adalah pilihan aman.'],
  ['Data', 'warga adalah sensor', 'Laporanmu menggerakkan relawan', 'Setiap laporan dengan foto dan lokasi membantu BPBD memetakan titik banjir dan mengarahkan relawan terdekat.', 'Skor kepercayaan laporan naik bila ada foto, GPS, dan laporan di sekitar.'],
];
let fi = 0, fOpen = false;
function facts() {
  $('#fbars').innerHTML = FF.map((_, i) => `<button data-i="${i}" class="${i < fi ? 'done' : i === fi ? 'run' : ''}"><span></span></button>`).join('');
  const f = FF[fi];
  $('#fbody').innerHTML = `<div class="fact"><div><span class="big">${f[0]}</span><span class="u">${f[1]}</span></div><div><h3>${f[2]}</h3><p>${f[3]}</p><button class="rv" id="frv"><i data-lucide="lightbulb" style="width:16px;color:#FF8A63"></i>${fOpen ? 'Sembunyikan' : 'Info tambahan'}</button>${fOpen ? `<span class="ex">${f[4]}</span>` : ''}</div></div>`;
  icons();
  $('#frv').onclick = () => { fOpen = !fOpen; facts(); };
  $$('#fbars button').forEach(b => b.onclick = () => go(+b.dataset.i));
  const run = $('#fbars .run span'); if (run) run.addEventListener('animationend', () => go(fi + 1));
}
function go(i) { fi = (i + FF.length) % FF.length; fOpen = false; facts(); }
$('#fprev').onclick = () => go(fi - 1); $('#fnext').onclick = () => go(fi + 1);
facts();

/* ---------- 06 kuis ---------- */
const QZ = ALIR_DATA.edu.quiz.map(q => Object.assign({}, q, {why: ['Nomor darurat nasional 112 bisa dihubungi dari ponsel mana pun, gratis.', 'Memutus listrik lebih dulu mencegah korsleting dan sengatan.', 'Rob dipicu oleh pasang air laut, bukan hanya hujan.', 'Dokumen, obat, dan air minum adalah kebutuhan paling vital saat evakuasi.', 'Air jernih tetap bisa membawa bakteri dan limbah.'][ALIR_DATA.edu.quiz.indexOf(q)]}));
let qi = 0, qs = 0, qdone = false;
function quiz() {
  const box = $('#qbox'); $('#qbar').style.width = (qi / QZ.length * 100) + '%';
  if (qi >= QZ.length) {
    const t = qs >= 5 ? ['Siaga Banjir Sejati', 'Kamu sudah sangat siap. Bagikan ilmumu ke tetangga.', '#FF6A3D'] : qs >= 3 ? ['Cukup Siaga', 'Dasarnya sudah baik. Ulangi bagian fase dan tas siaga.', '#F5A524'] : ['Terus Belajar', 'Jangan khawatir, mulai dari simulator dan fase banjir.', '#569CEB'];
    $('#qprog').textContent = 'Selesai'; $('#qbar').style.width = '100%';
    box.innerHTML = `<div class="qres"><span class="qbadge" style="background:${t[2]}"><i data-lucide="award"></i><b>${qs}/${QZ.length}</b></span><div style="flex:1 1 300px"><div style="font-size:34px;font-weight:800;letter-spacing:-.03em">${t[0]}</div><div style="color:var(--s-600);margin-top:8px;max-width:440px">${t[1]}</div><div class="row wrapx" style="gap:10px;margin-top:20px"><button class="btn-dark" id="qre">Ulangi kuis</button><a class="pill-btn coral" style="padding:12px 18px;font-size:15px;gap:10px" href="donasi.html">Bantu warga terdampak</a></div></div></div>`;
    icons(); $('#qre').onclick = () => { qi = 0; qs = 0; quiz(); }; return;
  }
  $('#qprog').textContent = `Soal ${qi + 1} dari ${QZ.length}`;
  const q = QZ[qi];
  box.innerHTML = `<div class="qq"><h3>${esc(q.q)}</h3><div class="qopts">${q.o.map((o, i) => `<button class="qo2" data-i="${i}"><span class="k">${'ABCD'[i]}</span>${esc(o)}</button>`).join('')}</div><div id="qfb"></div></div>`;
  $$('.qo2').forEach(b => b.onclick = () => {
    const i = +b.dataset.i, ok = i === q.a; if (ok) qs++;
    $$('.qo2').forEach(x => { x.disabled = true; if (+x.dataset.i === q.a) x.classList.add('right'); });
    if (!ok) b.classList.add('wrong'); 
    $('#qfb').innerHTML = `<div class="qfb" style="background:${ok ? 'var(--teal-tint)' : 'var(--red-tint)'}"><span style="max-width:560px"><b>${ok ? 'Tepat!' : 'Belum tepat.'}</b> ${q.why}</span><button class="btn-dark" id="qnx">${qi === QZ.length - 1 ? 'Lihat hasil' : 'Soal berikutnya'}<i data-lucide="arrow-right" class="arr"></i></button></div>`;
    icons(); $('#qnx').onclick = () => { qi++; quiz(); };
  });
}
quiz();
icons(); mountReveal();
