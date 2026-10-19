/* State bersama antarhalaman lewat localStorage (pola 'alir-shared-v1'). */
window.Store = (function(){
  const KEY = 'alir-shared-v1';
  const D = window.ALIR_DATA;
  const fresh = () => JSON.parse(JSON.stringify({
    pending: D.pending, reports: D.reports, tasks: D.tasks, teams: D.teams,
    inventory: D.inventory, logistics: D.logistics, wishlist: D.wishlist,
    donors: D.donors, donations: D.donations, docs: D.docs, communities: D.communities,
    eduCms: D.eduCms, waTemplates: D.waTemplates,
    audit: [
      {t:'08.12', txt:'Admin menyetujui permintaan logistik L-218'},
      {t:'07.40', txt:'Laporan P-1035 diverifikasi valid'},
      {t:'07.05', txt:'Donasi D-8839 masuk (Midtrans settlement)'},
    ],
    seq: 1045, user: null,
  }));
  let s;
  try { s = JSON.parse(localStorage.getItem(KEY)); } catch(e) {}
  if (!s || !s.pending || !s.audit) s = fresh();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch(e) {} };
  return {
    get: () => s,
    save,
    reset(){ s = fresh(); save(); },
    log(txt){ const d = new Date(); s.audit.unshift({t: String(d.getHours()).padStart(2,'0') + '.' + String(d.getMinutes()).padStart(2,'0'), txt}); save(); },
    addReport(r){
      const id = 'P-' + (s.seq++);
      s.pending.unshift(Object.assign({id, verdict:'pending', ts:'baru saja', waActive:true}, r));
      save(); return id;
    },
    assign(repId, teamId){
      const r = s.pending.find(x => x.id === repId);
      if (!r) return;
      r.verdict = 'ditugaskan';
      s.tasks.unshift({id:'TK-' + (s.tasks.length + 1), rep:repId, kel:r.kel, h:r.h, people:r.people, dist:r.dist || 600, stage:0, accepted:false, team:teamId});
      save();
    },
    donate(itemId, qty, amt, name, anon){
      const w = s.wishlist.find(x => x.id === itemId);
      if (w) w.got = Math.min(w.target, w.got + qty);
      s.donors.unshift({n:anon ? 'Hamba Allah' : (name || 'Donatur'), anon, item: w ? w.name : 'Donasi umum', q:qty, amt, ts:'baru saja'});
      s.donations.unshift({id:'D-' + (8842 + s.donations.length), donor: anon ? 'Hamba Allah' : (name || 'Donatur'), amt, dest: w ? w.name : 'Umum (belum dialokasi)', st:'settlement'});
      save();
    },
  };
})();
