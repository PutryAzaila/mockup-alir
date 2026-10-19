/* Efek canvas: hujan (Cuaca/Edukasi) dan radar hero Landing (algoritma sama dengan referensi). */
window.FX = (function(){
  const reduce = false; // seperti referensi, canvas selalu beranimasi
  /* hujan: 160 tetes ternormalisasi seperti rainHero di referensi */
  function rain(c, o = {}) {
    if (!c) return;
    const ctx = c.getContext('2d'), drops = [];
    const n = o.n || 160, col = o.color || '226,232,240';
    let dpr = Math.min(devicePixelRatio || 1, 2);
    const size = () => { const r = c.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2); c.width = Math.max(1, r.width * dpr); c.height = Math.max(1, r.height * dpr); };
    size(); addEventListener('resize', size);
    for (let i = 0; i < n; i++) drops.push({x: Math.random(), y: Math.random(), l: .6 + Math.random() * .9, v: .6 + Math.random() * .8, a: .12 + Math.random() * .32});
    let vis = true; new IntersectionObserver(e => vis = e[0].isIntersecting).observe(c);
    (function tick() {
      requestAnimationFrame(tick);
      if (!vis || reduce || !c.isConnected) return;
      const w = c.width, h = c.height; ctx.clearRect(0, 0, w, h); ctx.lineCap = 'round';
      for (const p of drops) {
        p.y += .009 * p.v; p.x -= .0012 * p.v;
        if (p.y > 1.05) { p.y = -.05; p.x = Math.random() * 1.1; }
        const x = p.x * w, y = p.y * h, len = 18 * p.l * dpr;
        ctx.strokeStyle = 'rgba(' + col + ',' + p.a + ')'; ctx.lineWidth = 1.2 * dpr;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - len * .18, y + len); ctx.stroke();
      }
    })();
  }
  /* radar: 6 cincin tipis, 3 cincin koral mengembang, sapuan koral sempit, ping acak (radarRef di referensi) */
  function radar(c) {
    if (!c) return;
    const ctx = c.getContext('2d'), pings = [], t0 = performance.now();
    const size = () => { const r = c.getBoundingClientRect(), d = devicePixelRatio || 1; c.width = Math.max(1, r.width * d); c.height = Math.max(1, r.height * d); };
    size(); addEventListener('resize', size);
    (function tick(now) {
      requestAnimationFrame(tick);
      if (!c.isConnected) return;
      const w = c.width, h = c.height, d = devicePixelRatio || 1, t = reduce ? 0 : Math.max(0, (now - t0) / 1000);
      ctx.clearRect(0, 0, w, h);
      const cx = w * (w > 900 * d ? .78 : .6), cy = h * .42, maxR = Math.max(w, h) * .55;
      ctx.lineWidth = 1 * d;
      for (let i = 1; i <= 6; i++) { ctx.strokeStyle = 'rgba(86,156,235,' + (.10 - i * .012) + ')'; ctx.beginPath(); ctx.arc(cx, cy, maxR * i / 6, 0, Math.PI * 2); ctx.stroke(); }
      for (let k = 0; k < 3; k++) { const p = ((t * .35 + k / 3) % 1); ctx.strokeStyle = 'rgba(255,106,61,' + (.35 * (1 - p)) + ')'; ctx.lineWidth = 2 * d; ctx.beginPath(); ctx.arc(cx, cy, maxR * p, 0, Math.PI * 2); ctx.stroke(); }
      const a = t * .9, g = ctx.createConicGradient ? ctx.createConicGradient(a, cx, cy) : null;
      if (g) { g.addColorStop(0, 'rgba(255,106,61,.22)'); g.addColorStop(.08, 'rgba(255,106,61,0)'); g.addColorStop(1, 'rgba(255,106,61,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, maxR, 0, Math.PI * 2); ctx.fill(); }
      if (!reduce && Math.random() < .03) pings.push({x: cx + (Math.random() - .5) * maxR * 1.4, y: cy + (Math.random() - .5) * maxR * 1.1, b: t, c: Math.random() < .6 ? '229,72,77' : Math.random() < .5 ? '255,106,61' : '20,184,166'});
      for (let i = pings.length - 1; i >= 0; i--) if (t - pings[i].b >= 3) pings.splice(i, 1);
      for (const p of pings) {
        const age = (t - p.b) / 3;
        ctx.fillStyle = 'rgba(' + p.c + ',' + (1 - age) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, 4 * d, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(' + p.c + ',' + (.6 * (1 - age)) + ')'; ctx.lineWidth = 1.5 * d; ctx.beginPath(); ctx.arc(p.x, p.y, (4 + age * 22) * d, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = '#FF6A3D'; ctx.beginPath(); ctx.arc(cx, cy, 5 * d, 0, Math.PI * 2); ctx.fill();
    })(performance.now());
  }
  return {rain, radar};
})();
