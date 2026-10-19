/* Data dummy ALIR. Semua angka hanyalah contoh. */
window.ALIR_DATA = (function(){
  const IMG = n => 'assets/img/' + n;
  const reports = [
    {id:'P-1042',kel:'Pabean',lat:-6.8712,lng:109.6722,sev:3,h:85,people:42,status:'aktif',ts:'14 mnt lalu',by:'Warga'},
    {id:'P-1041',kel:'Panjang Wetan',lat:-6.8668,lng:109.6609,sev:3,h:78,people:57,status:'aktif',ts:'31 mnt lalu',by:'Warga'},
    {id:'P-1039',kel:'Kandang Panjang',lat:-6.8789,lng:109.6838,sev:2,h:46,people:24,status:'aktif',ts:'52 mnt lalu',by:'Komunitas'},
    {id:'P-1036',kel:'Degayu',lat:-6.8844,lng:109.6992,sev:2,h:38,people:18,status:'ditangani',ts:'1 jam lalu',by:'Warga'},
    {id:'P-1033',kel:'Bandengan',lat:-6.8651,lng:109.6478,sev:3,h:92,people:63,status:'aktif',ts:'2 jam lalu',by:'Warga'},
    {id:'P-1030',kel:'Krapyak',lat:-6.8762,lng:109.6551,sev:1,h:21,people:9,status:'aktif',ts:'2 jam lalu',by:'Warga'},
    {id:'P-1027',kel:'Klego',lat:-6.8941,lng:109.6811,sev:1,h:18,people:6,status:'surut',ts:'3 jam lalu',by:'Warga'},
    {id:'P-1024',kel:'Tirto',lat:-6.8847,lng:109.6402,sev:2,h:41,people:29,status:'ditangani',ts:'4 jam lalu',by:'Komunitas'},
    {id:'P-1020',kel:'Medono',lat:-6.9019,lng:109.6677,sev:1,h:15,people:5,status:'surut',ts:'5 jam lalu',by:'Warga'},
    {id:'P-1017',kel:'Noyontaansari',lat:-6.8903,lng:109.6921,sev:2,h:33,people:14,status:'aktif',ts:'6 jam lalu',by:'Warga'},
  ];
  const pending = [
    {id:'P-1044',kel:'Pabean',lat:-6.8719,lng:109.6731,sev:3,h:70,people:30,photo:true,gps:true,wa:'0812-3456-7801',waActive:true,ts:'3 mnt lalu',verdict:'pending',img:'banjir-tangerang.jpg',note:'Air masuk rumah, lansia belum bisa keluar.'},
    {id:'P-1043',kel:'Pabean',lat:-6.8715,lng:109.6727,sev:3,h:80,people:38,photo:true,gps:true,wa:'0857-2210-4432',waActive:true,ts:'9 mnt lalu',verdict:'pending',img:'banjir-lembuswana.jpg',note:'Jalan gang tertutup, butuh perahu.'},
    {id:'P-1040',kel:'Panjang Baru',lat:-6.8702,lng:109.6584,sev:2,h:44,people:21,photo:false,gps:true,wa:'0821-9988-1203',waActive:true,ts:'40 mnt lalu',verdict:'pending',img:null,note:'Air naik sejak subuh.'},
    {id:'P-1038',kel:'Kuripan Kidul',lat:-6.8912,lng:109.6669,sev:1,h:19,people:4,photo:false,gps:false,wa:'0877-1100-5521',waActive:false,ts:'1 jam lalu',verdict:'pending',img:null,note:'Genangan di depan rumah.'},
    {id:'P-1035',kel:'Degayu',lat:-6.8838,lng:109.6987,sev:2,h:40,people:15,photo:true,gps:true,wa:'0813-6677-2290',waActive:true,ts:'2 jam lalu',verdict:'valid',img:'genangan-1.jpg',note:'Sudah dikonfirmasi tetangga.'},
  ];
  const teams = [
    {id:'T-01',name:'Relawan Pekalongan Tanggap',lat:-6.8868,lng:109.6706,cur:12,max:20,boats:3,busy:false,area:'Pekalongan Utara'},
    {id:'T-02',name:'Komunitas Sigap Pantura',lat:-6.8731,lng:109.6694,cur:9,max:15,boats:2,busy:false,area:'Pabean, Panjang'},
    {id:'T-03',name:'Karang Taruna Bandengan',lat:-6.8662,lng:109.6495,cur:14,max:14,boats:1,busy:true,area:'Bandengan, Krapyak'},
    {id:'T-04',name:'PMI Relawan Kota',lat:-6.8955,lng:109.6759,cur:18,max:25,boats:4,busy:false,area:'Pekalongan Selatan'},
    {id:'T-05',name:'Banser Peduli Banjir',lat:-6.8820,lng:109.6890,cur:7,max:12,boats:1,busy:false,area:'Kandang Panjang, Degayu'},
    {id:'T-06',name:'Mapala Bahari',lat:-6.8845,lng:109.6430,cur:6,max:10,boats:2,busy:false,area:'Tirto, Krapyak'},
  ];
  const poskos = [
    {id:'K-1',name:'Posko Balai Kelurahan Pabean',lat:-6.8730,lng:109.6700,r:900},
    {id:'K-2',name:'Posko Masjid Al-Hikmah Panjang',lat:-6.8688,lng:109.6620,r:800},
    {id:'K-3',name:'Posko SDN Degayu 02',lat:-6.8822,lng:109.6968,r:850},
    {id:'K-4',name:'Posko GOR Jati Pekalongan',lat:-6.8923,lng:109.6772,r:1000},
    {id:'K-5',name:'Posko Kantor Kec. Tirto',lat:-6.8838,lng:109.6417,r:900},
  ];
  const wishlist = [
    {id:'W-01',name:'Beras 5 kg',img:'sembako-bnpb.jpg',urg:'Kritis',price:68000,target:400,got:312,unit:'paket',by:'Sigap Pantura',cat:'Pangan'},
    {id:'W-02',name:'Selimut & Matras',img:'relawan-padang-2.jpg',urg:'Mendesak',price:85000,target:250,got:143,unit:'set',by:'PMI Relawan Kota',cat:'Sandang'},
    {id:'W-03',name:'Popok Bayi (isi 30)',img:'evakuasi-pekalongan.jpg',urg:'Mendesak',price:62000,target:180,got:96,unit:'pak',by:'Karang Taruna Bandengan',cat:'Bayi'},
    {id:'W-04',name:'Air Mineral 1 Dus',img:'logistik-pesawat.jpg',urg:'Normal',price:48000,target:500,got:455,unit:'dus',by:'Relawan Pekalongan Tanggap',cat:'Pangan'},
    {id:'W-05',name:'Kotak P3K Lengkap',img:'heli-bantuan.jpg',urg:'Kritis',price:145000,target:60,got:21,unit:'kotak',by:'PMI Relawan Kota',cat:'Kesehatan'},
    {id:'W-06',name:'Pompa Air Diesel',img:'banjir-bintara.jpg',urg:'Mendesak',price:2850000,target:8,got:3,unit:'unit',by:'Banser Peduli Banjir',cat:'Peralatan'},
  ];
  const donors = [
    {n:'Hamba Allah',anon:true,item:'Beras 5 kg',q:10,amt:680000,ts:'2 mnt lalu'},
    {n:'Rina Kusuma',item:'Selimut & Matras',q:2,amt:170000,ts:'11 mnt lalu'},
    {n:'PT Batik Nusantara',item:'Pompa Air Diesel',q:1,amt:2850000,ts:'27 mnt lalu'},
    {n:'Hamba Allah',anon:true,item:'Air Mineral 1 Dus',q:5,amt:240000,ts:'41 mnt lalu'},
    {n:'Dimas Prasetyo',item:'Popok Bayi',q:3,amt:186000,ts:'1 jam lalu'},
    {n:'Komunitas Alumni SMAN 1',item:'Kotak P3K',q:4,amt:580000,ts:'2 jam lalu'},
    {n:'Siti Aminah',item:'Beras 5 kg',q:2,amt:136000,ts:'3 jam lalu'},
  ];
  const batches = [
    {id:'DST-0415',item:'Beras 5 kg x 120',vendor:'UD Sumber Pangan',inv:'INV/0415/PKL',loc:'Posko Pabean',lat:-6.8730,lng:109.6700,doc:'relawan-padang-1.jpg',stage:3,date:'15 Apr'},
    {id:'DST-0412',item:'Selimut x 60',vendor:'Toko Sandang Jaya',inv:'INV/0412/PKL',loc:'GOR Jati',lat:-6.8923,lng:109.6772,doc:'sembako-bnpb.jpg',stage:3,date:'12 Apr'},
    {id:'DST-0409',item:'Popok Bayi x 40',vendor:'Apotek Sehat',inv:'INV/0409/PKL',loc:'SDN Degayu 02',lat:-6.8822,lng:109.6968,doc:'evakuasi-pekalongan.jpg',stage:2,date:'09 Apr'},
    {id:'DST-0405',item:'Pompa Air x 2',vendor:'CV Teknik Mandiri',inv:'INV/0405/PKL',loc:'Kec. Tirto',lat:-6.8838,lng:109.6417,doc:'banjir-bintara.jpg',stage:1,date:'05 Apr'},
  ];
  const inventory = [
    {id:'I-01',name:'Beras 5 kg',stock:34,min:60,unit:'paket'},
    {id:'I-02',name:'Mi instan (dus)',stock:80,min:50,unit:'dus'},
    {id:'I-03',name:'Air mineral (dus)',stock:120,min:100,unit:'dus'},
    {id:'I-04',name:'Selimut',stock:14,min:40,unit:'pcs'},
    {id:'I-05',name:'Popok bayi',stock:28,min:30,unit:'pak'},
    {id:'I-06',name:'Kotak P3K',stock:9,min:12,unit:'kotak'},
    {id:'I-07',name:'Jas hujan',stock:75,min:40,unit:'pcs'},
    {id:'I-08',name:'Perahu karet',stock:3,min:3,unit:'unit'},
  ];
  const contacts = [
    {n:'Darurat Nasional',num:'112',ic:'siren'},
    {n:'Polisi',num:'110',ic:'shield'},
    {n:'Ambulans',num:'119',ic:'ambulance'},
    {n:'Basarnas',num:'115',ic:'life-buoy'},
    {n:'PMI',num:'123',ic:'heart-pulse'},
    {n:'Pemadam / BPBD',num:'113',ic:'flame'},
  ];
  const gallery = ['evakuasi-pekalongan.jpg','relawan-padang-1.jpg','sembako-bnpb.jpg','banjir-bintara.jpg','logistik-pesawat.jpg','relawan-padang-2.jpg','heli-bantuan.jpg','banjir-lembuswana.jpg'];

  /* admin */
  const logistics = [
    {id:'L-221',team:'Karang Taruna Bandengan',item:'Beras 5 kg',req:60,stock:34,deadline:'Hari ini 16.00',status:'menunggu',why:'Pengungsi bertambah, stok posko habis.'},
    {id:'L-220',team:'Komunitas Sigap Pantura',item:'Selimut',req:40,stock:14,deadline:'Besok 09.00',status:'menunggu',why:'Malam hari suhu turun.'},
    {id:'L-218',team:'PMI Relawan Kota',item:'Kotak P3K',req:10,stock:9,deadline:'Hari ini 18.00',status:'disetujui',why:'Ada korban luka ringan.'},
    {id:'L-215',team:'Banser Peduli Banjir',item:'Jas hujan',req:30,stock:75,deadline:'Kemarin',status:'ditolak',why:'Stok relawan mencukupi.'},
  ];
  const donations = [
    {id:'D-8841',donor:'Rina Kusuma',amt:170000,dest:'Selimut & Matras',st:'settlement'},
    {id:'D-8840',donor:'Hamba Allah',amt:680000,dest:'Beras 5 kg',st:'settlement'},
    {id:'D-8839',donor:'PT Batik Nusantara',amt:2850000,dest:'Pompa Air Diesel',st:'settlement'},
    {id:'D-8838',donor:'Dimas Prasetyo',amt:186000,dest:'Umum (belum dialokasi)',st:'settlement'},
    {id:'D-8837',donor:'Fajar Nugroho',amt:100000,dest:'Umum (belum dialokasi)',st:'pending'},
    {id:'D-8836',donor:'Hamba Allah',amt:50000,dest:'Air Mineral',st:'expire'},
  ];
  const docs = [
    {id:'M-31',team:'Relawan Pekalongan Tanggap',cap:'Pembagian paket sembako di Pabean',img:'relawan-padang-1.jpg',st:'menunggu'},
    {id:'M-30',team:'PMI Relawan Kota',cap:'Evakuasi warga lansia Panjang Wetan',img:'evakuasi-pekalongan.jpg',st:'menunggu'},
    {id:'M-29',team:'Banser Peduli Banjir',cap:'Pemasangan pompa air Kandang Panjang',img:'banjir-bintara.jpg',st:'disetujui'},
    {id:'M-28',team:'Mapala Bahari',cap:'Penyaluran logistik via perahu',img:'heli-bantuan.jpg',st:'disetujui'},
  ];
  const communities = [
    {id:'T-07',name:'Remaja Masjid Kraton',pic:'Ahmad Fauzi',members:11,area:'Kraton',st:'menunggu'},
    {id:'T-08',name:'Pramuka Saka Bhakti',pic:'Lilis Suryani',members:16,area:'Medono',st:'menunggu'},
  ];
  const eduCms = [
    {id:'E-01',t:'Cara membuat tas siaga bencana',cat:'Persiapan',st:'terbit',ts:'12 Mar'},
    {id:'E-02',t:'Mitos & fakta air banjir',cat:'Mitos & Fakta',st:'terbit',ts:'02 Apr'},
    {id:'E-03',t:'Memahami rob dan pasang purnama',cat:'Pengetahuan',st:'draf',ts:'14 Apr'},
  ];
  const waTemplates = [
    {id:'WA-1',t:'Laporan diterima',body:'Halo, laporan banjir Anda ({tiket}) sudah kami terima dan sedang diverifikasi oleh BPBD. Tetap waspada dan jauhi arus.'},
    {id:'WA-2',t:'Tim menuju lokasi',body:'Tim {tim} sedang menuju lokasi Anda, perkiraan tiba {eta} menit. Mohon siapkan dokumen penting dan berkumpul di titik aman.'},
    {id:'WA-3',t:'Laporan ditutup',body:'Laporan {tiket} telah selesai ditangani. Terima kasih atas partisipasi Anda. Jika masih membutuhkan bantuan, ajukan laporan baru.'},
  ];
  const tasks = [
    {id:'TK-1',rep:'P-1042',kel:'Pabean',h:85,people:42,dist:620,stage:0,accepted:false,team:'T-02'},
  ];

  /* edukasi */
  const edu = {
    depth:[
      {cm:0,t:'Aman',d:'Air belum masuk permukiman. Tetap pantau informasi BPBD dan siapkan tas siaga.'},
      {cm:20,t:'Waspada',d:'Setinggi mata kaki hingga betis. Hati-hati kabel listrik dan benda tajam di bawah air.'},
      {cm:50,t:'Siaga',d:'Setinggi lutut. Arus mulai menyulitkan berjalan. Matikan listrik, evakuasi anak dan lansia.'},
      {cm:90,t:'Bahaya',d:'Setinggi paha hingga pinggang. Jangan melintas sendiri. Hubungi tim evakuasi.'},
      {cm:130,t:'Sangat berbahaya',d:'Setinggi dada. Berisiko hanyut. Naik ke tempat tinggi dan tunggu perahu penyelamat.'},
    ],
    phases:[
      {t:'Sebelum banjir',ic:'clipboard-check',items:['Kenali jalur evakuasi dan titik kumpul','Simpan dokumen penting dalam wadah kedap air','Siapkan tas siaga untuk tiap anggota keluarga','Simpan nomor darurat dan pantau info cuaca BMKG']},
      {t:'Saat banjir',ic:'waves',items:['Matikan listrik dan gas dari sumbernya','Naik ke tempat lebih tinggi, jangan berjalan di arus deras','Hindari kontak dengan air kotor dan kabel','Hubungi 112 / Basarnas 115 bila terjebak']},
      {t:'Setelah banjir',ic:'sparkles',items:['Kembali hanya bila dinyatakan aman','Bersihkan rumah dengan sarung tangan dan masker','Buang makanan yang terendam air','Laporkan kerusakan dan kebutuhan lewat ALIR']},
    ],
    bag:['Dokumen penting (KTP, KK) dalam plastik','Senter dan baterai cadangan','Obat pribadi dan P3K','Air minum dan makanan siap saji','Pakaian ganti dan selimut','Power bank dan radio kecil','Peluit','Uang tunai secukupnya'],
    myth:[
      {s:'Air banjir yang terlihat jernih pasti aman disentuh.',a:false,e:'Air jernih tetap bisa tercemar bakteri, limbah, atau bahan kimia.'},
      {s:'Matikan listrik sebelum air masuk rumah.',a:true,e:'Benar. Ini mencegah korsleting dan sengatan listrik.'},
      {s:'Aman berjalan di air banjir setinggi lutut yang mengalir.',a:false,e:'Arus setinggi lutut saja bisa membuat orang dewasa terjatuh.'},
      {s:'Banjir rob hanya terjadi saat hujan deras.',a:false,e:'Rob dipicu pasang laut, bisa terjadi saat cuaca cerah.'},
    ],
    facts:[
      {q:'Mengapa Pekalongan rawan rob?',a:'Sebagian wilayah pesisir mengalami penurunan muka tanah sehingga lebih rendah dari pasang laut.'},
      {q:'Apa itu pasang purnama?',a:'Saat bulan purnama dan baru, gaya tarik bulan dan matahari sejajar sehingga pasang laut lebih tinggi.'},
      {q:'Berapa lama air bisa menyebabkan penyakit kulit?',a:'Paparan berulang terhadap air kotor dapat memicu gatal dan infeksi dalam hitungan hari.'},
      {q:'Mengapa sampah memperparah banjir?',a:'Sampah menyumbat saluran sehingga air tidak mengalir ke laut.'},
    ],
    quiz:[
      {q:'Nomor darurat nasional yang bisa dihubungi saat terjebak banjir adalah...',o:['112','911','108','100'],a:0},
      {q:'Hal pertama yang dilakukan sebelum air masuk rumah?',o:['Mencuci mobil','Mematikan listrik','Membuka semua pintu','Menyalakan kipas'],a:1},
      {q:'Rob dipengaruhi terutama oleh...',o:['Pasang air laut','Gempa bumi','Angin gunung','Gunung meletus'],a:0},
      {q:'Isi tas siaga yang paling penting adalah...',o:['Mainan','Dokumen, obat, air minum','Sepatu baru','Buku pelajaran'],a:1},
      {q:'Air banjir yang jernih...',o:['Pasti steril','Tetap bisa tercemar','Boleh diminum','Tidak berbahaya'],a:1},
    ],
  };

  return {IMG,reports,pending,teams,poskos,wishlist,donors,batches,inventory,contacts,gallery,logistics,donations,docs,communities,eduCms,waTemplates,tasks,edu,
    center:[-6.8845,109.6700],
    funds:{in:482500000,out:371200000},
    weather:{temp:27,tide:1.06,cond:'Hujan ringan',hum:88,wind:14,rain:12},
  };
})();
