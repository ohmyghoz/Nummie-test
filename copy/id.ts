/**
 * Kamus Indonesia — CADANGAN, bukan kamus aktif. Bahasa produk = Inggris (ADR-0016 menutup D1).
 *
 * Sengaja tetap dipelihara, bukan dihapus: `Dictionary` mewajibkan kedua bahasa memenuhi bentuk
 * yang sama, jadi berkas ini dijaga tipe dan tidak membusuk diam-diam. Itu yang membuat ADR-0016
 * tetap murah dibalik kalau D5 memasukkan Little (KG B–Grade 2), yang memang belum bisa membaca
 * Inggris — pemicu peninjauan ulang yang sudah dicatat di ADR-nya.
 *
 * Catatan: teks bebas yang ditulis anak (alasan cash-out, alasan Give) memang berbahasa Indonesia
 * apa adanya dan TIDAK terpengaruh D1. Jangan disimpan di sini.
 */
import type { Dictionary } from './types.js';

const CATEGORY_ID = {
  unsorted: 'Uang Baru',
  spend: 'Pakai',
  save: 'Simpan',
  give: 'Berbagi',
  grow: 'Bertumbuh',
} as const;

export const id: Dictionary = {
  brand: {
    name: 'Nummi',
    tagline: 'Uang kecil, kebiasaan besar.',
    positioning:
      'Nummi adalah aplikasi Parent as Banking untuk anak belajar memakai, menyimpan, berbagi dan mengelola uangnya.',
  },

  category: { little: CATEGORY_ID, middle: CATEGORY_ID, teen: CATEGORY_ID },

  common: {
    total: 'Total',
    approve: 'Setujui',
    decline: 'Tolak',
    talkAboutIt: 'Bicarakan dulu',
    markAsDone: 'Tandai selesai',
    needsOk: 'Menunggu izin',
    toDo: 'Belum dilakukan',
    done: 'Selesai',
    cancel: 'Batal',
    waitingForGrownUp: 'Menunggu orang tua',
  },

  nav: {
    home: 'Beranda',
    wallets: 'Dompet',
    add: 'Tambah',
    missions: 'Misi',
    me: 'Aku',
  },

  home: {
    greeting: 'Hai, {child}',
    totalLabel: 'Semua uangku',
    justArrived: '{amount} baru masuk!',
    sortItNow: 'Beri tugas',
    nothingToSort: 'Semua uangmu sudah punya tugas. Keren.',
    myDreams: 'Impianku',
    requestsWaiting: '{count} menunggu orang tua',
    toGo: 'kurang {amount}',
  },

  wallets: {
    title: 'Dompetku',
    target: 'Target {amount}',
    reached: 'Tercapai!',
    emptyPocket: 'Belum ada isinya',
    lockedByGrow: 'Uang di sini keluar lewat Harvest saja',
  },

  requests: {
    title: 'Menunggu orang tua',
    empty: 'Tidak ada yang menunggu.',
    waiting: 'Menunggu izin',
    approved: 'Sudah diizinkan — belum dilakukan',
    storyNeeded: 'Orang tuamu masih berutang cerita',
  },

  sort: {
    title: 'Beri tugas untuk uangmu',
    autoSplitHint: '{spend}% Pakai / {save}% Simpan / {give}% Berbagi',
    lockedTitle: 'Orang tuamu yang mengatur pembagian ini',
    lockedBody: 'Kamu bisa melihat ke mana setiap rupiah pergi, tapi kali ini belum bisa menggesernya.',
    preview: 'Beginilah hasilnya nanti',
    confirm: 'Sudah pas',
    leftInUnsorted: '{amount} tetap di Uang Baru',
  },

  rules: {
    strictLockedTitle: 'Uang ini sudah punya tugas',
    strictLockedBody: 'Orang tuamu yang menyimpannya di sini. Tanyakan kalau perlu diubah.',
    ratioOver100: 'Rasio melebihi 100%',
    ratioStrictMustBeExact: 'Bagikan sisa {remaining}% terakhir',
    ratioMissingDestination: 'Pilih dulu tujuan bagian ini',
  },

  give: {
    giveItAway: 'Berikan',
    reasonLabel: 'Kenapa yang ini? (boleh dikosongkan)',
    storyPrompt: 'Ceritakan ke {child} ke mana uangnya pergi — justru itu intinya.',
    whereMyGivingWent: 'Ke mana uang berbagiku pergi',
    title: 'Berikan',
    howMuch: 'Berapa?',
    pickCause: 'Untuk siapa?',
    notePlaceholder: 'Tulis sendiri untuk siapa',
    submit: 'Minta izin orang tua',
    sent: 'Terkirim! Orang tuamu akan menyalurkannya, lalu bercerita ke mana perginya.',
    available: '{amount} siap dibagikan',
    noStoriesYet: 'Belum ada cerita. Ceritanya muncul setelah orang tuamu menyalurkannya.',
    stillWaitingStory: 'Sudah disalurkan — menunggu ceritanya',
    amountRequired: 'Pilih jumlahnya dulu',
    notEnough: 'Itu lebih banyak dari yang bisa kamu bagikan',
    ownCauseNeedsNote: 'Tulis dulu untuk siapa',
  },

  giveCause: {
    worship: 'Tempat ibadahku',
    orphanage: 'Anak yang tidak punya orang tua',
    disaster: 'Orang yang terkena bencana',
    friend: 'Teman yang membutuhkan',
    animals: 'Hewan',
    school: 'Kotak amal sekolahku',
    own: 'Orang lain — nanti kutulis',
  },

  grow: {
    title: 'Bertumbuh',
    putIn: 'Kamu memasukkan {amount}',
    worthNow: 'Hari ini bernilai {amount}',
    youOwn: 'Kamu punya {weight}',
    pricesAsOf: 'Harga per {date}',
    whyLess: 'Kenapa jadi lebih sedikit dari yang kumasukkan?',
    whyLessBody:
      'Emas punya dua harga: harga beli, dan harga jual balik yang lebih rendah. Jaraknya sekitar {spread}%. Tidak ada yang diambil darimu — uangmu hanya butuh waktu untuk tumbuh melewati jarak itu.',
    onlyWayOut: 'Uang keluar dari Bertumbuh lewat Harvest saja',
    harvest: 'Harvest',
    harvestTo: 'Kirim ke',
    harvestLockedToSave: 'Harvest selalu mendarat di dompet Simpan.',
    matured: 'Siap dipanen',
    cashOut: 'Ambil semuanya',
    rollOver: 'Mulai lagi dengan semuanya',
    takeProfit: 'Ambil tambahannya, sisanya lanjut bekerja',
  },

  dream: {
    raidWarning: 'Ini memotong {stars} bintangmu. Memindahkannya ke impian lain gratis.',
  },
};
