# Mockup ALIR

Mockup UI/UX statis (HTML + CSS + JS biasa, tanpa build) untuk ALIR, platform tanggap banjir,
logistik relawan, dan donasi transparan Kota Pekalongan. Mengacu ke folder `referensi/`.

## Menjalankan
    node serve.js        # lalu buka http://localhost:5173

Atau buka `index.html` langsung. Butuh internet untuk font, ikon Lucide, Leaflet, dan tile OpenStreetMap.

## Halaman
`index.html` (Landing), `cuaca.html`, `donasi.html`, `edukasi.html`, `login.html`, `admin.html`, `relawan.html`.

## Demo alur
1. Landing: klik **Lapor Banjir**, isi 4 langkah, laporan masuk antrean Admin.
2. `login.html`: email berisi "admin" masuk ke Admin, selain itu ke Relawan (sandi bebas).
3. Admin > Verifikasi: tandai valid, lalu Penugasan > tugaskan **Komunitas Sigap Pantura (T-02)**.
4. Relawan (otomatis sebagai T-02) > Penugasan: terima, mulai tangani, selesaikan.
Data dummy ada di `assets/js/data.js`; state bersama disimpan di `localStorage['alir-shared-v1']`
(hapus kunci itu di DevTools untuk mengembalikan data awal).

## Gaya & animasi
- Tampilan dan animasi mengikuti `referensi/`: navbar pill, hero bergradasi, foto abu-abu, footer yang sama di semua halaman.
- Animasi memakai set yang sama dengan referensi: masuk bertahap `alirUp`, reveal scroll 28px 0,9 dtk (threshold .08), air hero naik 2,8 dtk (190/130/150px), radar Landing, hujan di Cuaca, orb melayang dengan parallax mouse di Edukasi, ticker, ping, counter 1,7 dtk. Semua mengikuti `prefers-reduced-motion`.
- **NProgress** menandai pemuatan halaman, klik tautan, pindah tab Admin/Relawan, dan langkah form.
- Popup memakai satu sistem overlay (z-index seperti referensi: modal 2000, gateway 2100, modal panel 2500, konfirmasi 2600), muat di layar pendek, kunci scroll, dan tutup dengan Esc. Toast: kotak kanan bawah di situs publik, pill tengah bawah di Admin/Relawan.

## Catatan
- Semua data dan angka hanya contoh. Tanpa API/backend (peta memakai tile OSM publik tanpa key).
- Foto dari Wikimedia Commons, kredit di `assets/img/CREDITS.md`.
