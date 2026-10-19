initPage({active: 'cuaca.html'});
FX.rain($('#rain'), {n: 140});

/* RNG ber-seed agar data stabil */
const rnd = (() => { let s = 20260; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const CONDS = [['cloud-rain', 'Hujan ringan'], ['cloud-lightning', 'Hujan petir'], ['cloud-sun', 'Berawan'], ['cloud-drizzle', 'Gerimis'], ['sun', 'Cerah']];
const pad = n => String(n).padStart(2, '0');
const fm = v => v.toFixed(2).replace('.', ',');
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/* pasang surut: dua kali pasang per hari, lebih tinggi saat purnama/bulan baru */
const T0 = 12.42;
let off = 0;                       // selisih per lokasi
function tideAt(min, d = 0) {
  const spring = Math.abs(Math.cos(2 * Math.PI * d / 14.77)), amp = .25 + .37 * spring;
  return .72 + off + amp * Math.sin(2 * Math.PI * (min / 60 + d * .83) / T0 - 1.2);
}
const peakOf = d => { let m = 0; for (let i = 0; i < 1440; i += 10) m = Math.max(m, tideAt(i, d)); return m; };
const argPeak = d => { let b = 0, m = 0; for (let i = 0; i < 1440; i += 5) { const v = tideAt(i, d); if (v > m) { m = v; b = i; } } return b; };
const riskOf = v => v >= 1.3 ? 2 : v >= 1.05 ? 1 : 0;
const RN = ['Rendah', 'Sedang', 'Tinggi'];
const RSTY = [['#CCF3EE', '#0E6B62'], ['#FFD3C2', '#9A2E10'], ['#FF6A3D', '#0B1E33']];
const ADV = ['Tidak ada potensi rob signifikan. Tetap pantau cuaca.', 'Genangan lokal mungkin terjadi di wilayah pesisir. Amankan barang di lantai bawah.', 'Siapkan barang di tempat tinggi, matikan listrik bila air naik, dan pantau peta ALIR.'];

/* ---------- lokasi ---------- */
const LOCS = [['Pekalongan Utara', 0, 0], ['Pekalongan Barat', .03, 1], ['Pekalongan Timur', -.04, 0], ['Pekalongan Selatan', .06, -1]];
let loc = 0;
$('#locs').innerHTML = LOCS.map((l, i) => `<button class="loc ${i === 0 ? 'on' : ''}" data-i="${i}"><i data-lucide="map-pin"></i>${l[0]}</button>`).join('');
$$('#locs .loc').forEach(b => b.onclick = () => withProgress(() => {
  loc = +b.dataset.i; off = LOCS[loc][1]; $$('#locs .loc').forEach(x => x.classList.toggle('on', x === b)); hero(); calendar(); tideDraw(); tide($('#tslide').value);
}, 350));

/* ---------- hero ---------- */
function hero() {
  const pk = peakOf(0), rk = riskOf(pk), t = argPeak(0), temp = 27 + LOCS[loc][2];
  $('#temp').textContent = temp + '°';
  $('#hl').textContent = `Tertinggi ${temp + 3}° · Terendah ${temp - 2}° · Terasa ${temp + 4}°`;
  $('#robnow').innerHTML = `<div class="rt"><span>RISIKO ROB HARI INI</span><span class="rk" style="background:${RSTY[rk][0]};color:${RSTY[rk][1]}">${RN[rk]}</span></div>
    <div class="pk"><b>${fm(pk)} m</b><span>pasang tertinggi &middot; ${pad(Math.floor(t / 60))}.${pad(t % 60)} WIB</span></div>
    <div class="adv">${ADV[rk]}</div><a href="#pasang">Lihat grafik pasang surut<i data-lucide="arrow-down"></i></a>`;
  icons();
}
hero();

/* ---------- per jam, 7 hari, tile ---------- */
const nowH = new Date().getHours();
$('#hourly').innerHTML = Array.from({length: 24}, (_, i) => {
  const h = (nowH + i) % 24, c = CONDS[Math.floor(rnd() * 4)], rain = Math.round(rnd() * 90), night = h > 18 || h < 5;
  return `<div class="hr ${i === 0 ? 'now' : ''}" style="--i:${i}"><span>${i === 0 ? 'Kini' : pad(h) + '.00'}</span><i data-lucide="${night && c[0] === 'sun' ? 'moon' : c[0]}" style="color:${i === 0 ? '#FF8A63' : 'var(--water-deep)'}"></i><b>${24 + Math.round(rnd() * 6)}&deg;</b><em style="color:${rain > 60 ? 'var(--red-ink)' : 'var(--water-deep)'}">${rain}%</em></div>`;
}).join('');
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
$('#daily').innerHTML = Array.from({length: 7}, (_, i) => {
  const d = new Date(Date.now() + i * 864e5), lo = 24 + Math.round(rnd() * 2), hi = lo + 3 + Math.round(rnd() * 3), c = CONDS[Math.floor(rnd() * 5)];
  return `<div class="dy" style="--i:${i}"><b>${i === 0 ? 'Hari ini' : DAYS[d.getDay()]}</b><i data-lucide="${c[0]}"></i><span class="r">${Math.round(rnd() * 90)}%</span><span class="lo">${lo}&deg;</span><span class="rg"><i style="--i:${i};left:${(lo - 22) * 10}%;width:${(hi - lo) * 10}%"></i></span><b>${hi}&deg;</b></div>`;
}).join('');
$('#tiles').innerHTML = [['droplets', 'KELEMBAPAN', '88%', 'Sangat lembap, terasa gerah'], ['wind', 'ANGIN', '14 km/j', 'Dari barat laut, sedang'], ['cloud-rain', 'CURAH HUJAN', '12 mm', 'Total 24 jam terakhir'], ['gauge', 'TEKANAN', '1.008 hPa', 'Turun perlahan'], ['sun', 'INDEKS UV', '3', 'Rendah, tertutup awan'], ['eye', 'JARAK PANDANG', '6 km', 'Berkabut tipis']].map(t =>
  `<div class="tile"><span class="l"><i data-lucide="${t[0]}"></i>${t[1]}</span><b>${t[2]}</b><small>${t[3]}</small></div>`).join('');

/* ---------- grafik pasang ---------- */
const X = s => s / 95 * 720, Y = v => 240 - 20 - (v - .1) / 1.6 * 200;
function tideDraw() {
  let d = '';
  for (let s = 0; s <= 95; s++) d += (s ? 'L' : 'M') + X(s).toFixed(1) + ' ' + Y(tideAt(s * 15)).toFixed(1);
  $('#tide').innerHTML = `<defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF6A3D" stop-opacity=".45"/><stop offset="1" stop-color="#FF6A3D" stop-opacity="0"/></linearGradient></defs>
    <line x1="0" x2="720" y1="${Y(1)}" y2="${Y(1)}" stroke="#E5484D" stroke-width="1.5" stroke-dasharray="6 6"/>
    <path class="ar" d="${d}L720 240L0 240Z" fill="url(#tg)"/>
    <path class="ln" d="${d}" fill="none" stroke="#FF6A3D" stroke-width="3" vector-effect="non-scaling-stroke"/>
    <line id="cl" y1="0" y2="240" stroke="rgba(248,250,252,.35)" stroke-width="1.5"/><circle id="cd" r="8" fill="#0B1E33" stroke="#F5F7FA" stroke-width="3"/>`;
}
function tide(slot) {
  slot = +slot; const m = slot * 15, v = tideAt(m);
  $('#cl').setAttribute('x1', X(slot)); $('#cl').setAttribute('x2', X(slot)); $('#cd').setAttribute('cx', X(slot)); $('#cd').setAttribute('cy', Y(v));
  $('#tday').textContent = `Hari ini · pukul ${pad(Math.floor(m / 60))}.${pad(m % 60)}`;
  const tv = $('#tv'); tv.textContent = fm(v) + ' m'; tv.style.color = v >= 1 ? '#FF6A3D' : 'var(--navy)';
}
$('#tslide').oninput = e => tide(e.target.value);
tideDraw(); tide(48);

/* ---------- kalender rob 30 hari ---------- */
let info = [], pickI = 0;
function calendar() {
  const start = new Date(), offs = (start.getDay() + 6) % 7, cells = Array.from({length: offs}, () => '<div class="cd none"></div>');
  info = [];
  for (let i = 0; i < 30; i++) {
    const dt = new Date(Date.now() + i * 864e5), p = peakOf(i) + Math.sin(i * 7.3) * .03, r = riskOf(p), moon = [0, 1, 14, 15, 29].includes(i);
    info.push({dt, p, r, moon});
    cells.push(`<button class="cd r${r} ${i === pickI ? 'sel' : ''}" data-i="${i}" style="--i:${i + offs}"><b>${dt.getDate()}</b>${moon ? '<i data-lucide="moon"></i>' : ''}</button>`);
  }
  $('#cal').innerHTML = cells.join('');
  $$('.cd:not(.none)').forEach(c => c.onclick = () => day(+c.dataset.i));
  day(pickI); icons();
}
function day(i) {
  pickI = i; const x = info[i];
  $$('.cd').forEach(c => c.classList.toggle('sel', c.dataset.i == i));
  const bg = ['#fff', '#FFD3C2', '#FF6A3D'][x.r], t = argPeak(i), el = $('#dday');
  el.style.background = bg; el.style.color = 'var(--navy)'; el.style.boxShadow = x.r === 0 ? '0 1px 2px rgba(11,30,51,.06)' : 'none';
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = 'fadeUp .4s var(--ease) both';
  el.innerHTML = `<div class="d">${x.dt.getDate()} ${MON[x.dt.getMonth()].toUpperCase()}</div><div class="p">${fm(x.p)} m</div><div class="small" style="opacity:.8">prediksi pasang tertinggi &middot; ${pad(Math.floor(t / 60))}.${pad(t % 60)} WIB</div>
    <div class="ch"><span>Risiko</span><span>${RN[x.r]}</span></div><div style="margin-top:16px;line-height:1.55">${ADV[x.r]}</div>
    <div class="row small" style="margin-top:12px;opacity:.75;gap:8px"><i data-lucide="moon" style="width:14px"></i>${x.moon ? 'Purnama / bulan baru, pasang lebih tinggi' : 'Fase bulan biasa'}</div>`;
  icons();
}
calendar();

/* ---------- musim ---------- */
const mo = new Date().getMonth();
$('#season').innerHTML = [['Bulan ini', 360, 'tinggi', 'Puncak musim hujan, waspada rob + hujan.', '#fff', '#FF6A3D'], ['Bulan depan', 290, 'sedang', 'Hujan lebat berselang, genangan lokal.', '#FFD3C2', '#FF6A3D'], ['Dua bulan lagi', 170, 'rendah', 'Mulai berkurang, siapkan perbaikan saluran.', '#0B1E33', '#569CEB']].map((s, i) => {
  const dark = s[4] === '#0B1E33';
  return `<div class="sc" style="background:${s[4]};color:${dark ? '#F5F7FA' : 'var(--navy)'}" data-h="${Math.min(90, s[1] / 4.2)}"><span style="font-size:14px;font-weight:800;opacity:.75">${MON[(mo + i) % 12]} &middot; ${s[0]}</span><span class="mm">${s[1]}<small> mm</small></span><span style="font-weight:700">Curah hujan ${s[2]}</span><span class="bar" style="margin-top:auto;background:rgba(86,156,235,.25)"><i style="width:${s[1] / 4.2}%;background:${s[5]}"></i></span><span class="small" style="opacity:.85">${s[3]}</span></div>`;
}).join('');
icons(); mountReveal();
