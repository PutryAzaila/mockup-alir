/* Helper Leaflet + tile OpenStreetMap (tanpa API key). */
window.AlirMap = (function(){
  const CENTER = [-6.8845, 109.6700];
  function create(el, o = {}) {
    const node = typeof el === 'string' ? document.getElementById(el) : el;
    const map = L.map(node, {center: o.center || CENTER, zoom: o.zoom || 14, zoomControl: o.zoomControl !== false, scrollWheelZoom: o.wheel !== false, attributionControl: true});
    const fb = document.createElement('div'); fb.className = 'map-fallback'; node.appendChild(fb);
    const tl = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    tl.on('tileload', () => fb.remove());
    setTimeout(() => map.invalidateSize(), 250);
    return map;
  }
  const colors = {1: '#14B8A6', 2: '#F5A524', 3: '#E5484D'};
  function sevIcon(sev, muted) {
    const c = muted ? '#94A3B8' : colors[sev];
    return L.divIcon({className: '', iconSize: [22, 22], html: `<div class="mk sev-${sev}"><b style="background:${c};${muted ? 'animation:none;opacity:0' : ''}"></b><i style="background:${c}"></i></div>`});
  }
  function teamIcon(busy) {
    const c = busy ? '#94A3B8' : '#0B1E33';
    return L.divIcon({className: '', iconSize: [30, 30], html: `<div style="width:30px;height:30px;border-radius:10px;background:${c};border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);display:grid;place-items:center;color:#fff"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18c2 0 2-1.5 5-1.5S9 18 12 18s3-1.5 5-1.5S19 18 22 18"/><path d="M4 14l2-8h12l2 8"/></svg></div>`});
  }
  function poskoIcon() {
    return L.divIcon({className: '', iconSize: [28, 28], html: `<div style="width:28px;height:28px;border-radius:50%;background:#14B8A6;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);display:grid;place-items:center;color:#fff"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V9l9-6 9 6v12"/><path d="M9 21v-6h6v6"/></svg></div>`});
  }
  return {create, sevIcon, teamIcon, poskoIcon, CENTER};
})();
