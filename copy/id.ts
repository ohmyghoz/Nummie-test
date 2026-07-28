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

  move: {
    title: 'Pindahkan uang',
    from: 'Ambil dari',
    to: 'Pindahkan ke',
    howMuch: 'Berapa?',
    preview: 'Setelah dipindahkan',
    confirm: 'Pindahkan',
    after: '{wallet} akan berisi {amount}',
    starWarning: 'Ini memotong {stars} bintangmu. Memindahkannya ke impian lain gratis.',
    needsGrownUp: 'Impian hanya bisa dibatalkan bersama orang tua.',
    nothingMovable: 'Belum ada yang bisa dipindahkan sekarang.',
    amountRequired: 'Pilih jumlahnya dulu',
    notEnough: 'Isinya tidak sebanyak itu',
    sourceLocked: 'Uang ini tidak bisa pindah sendiri',
    sameWallet: 'Pilih dua dompet yang berbeda',
    destinationNotAllowed: 'Uang tidak bisa ke sana lewat cara ini',
  },

  requests: {
    title: 'Menunggu orang tua',
    empty: 'Tidak ada yang menunggu.',
    waiting: 'Menunggu izin',
    approved: 'Sudah diizinkan — belum dilakukan',
    storyNeeded: 'Orang tuamu masih berutang cerita',
  },

  missions: {
    title: 'Misi',
    chapterOf: 'Bab {n} dari {total}',
    learn: 'Belajar',
    practice: 'Latihan',
    practiceLocked: 'Selesaikan pelajarannya dulu',
    chapterLocked: 'Selesaikan bab sebelumnya dulu',
    current: 'Kamu di sini',
    done: 'Selesai',
    starsEach: '{stars} bintang tiap pelajaran',
    weeklyGate: 'Selesaikan minggu ini untuk memakai permatamu',
  },

  chapter: {
    money_is_choice: 'Uang itu pilihan',
    four_jobs: 'Uang punya empat tugas',
    wants_vs_needs: 'Ingin atau butuh?',
    saving_takes_time: 'Menabung butuh waktu',
    giving: 'Berbagi',
    growing: 'Menumbuhkan uang',
  },

  me: {
    title: 'Aku',
    starsBalance: 'Bintang untuk dibelanjakan',
    starsLifetime: 'Bintang yang pernah didapat',
    gems: 'Permata',
    badges: 'Lencana',
    theme: 'Warna',
    avatarShop: 'Avatar',
    owned: 'Punyamu',
    buy: '{stars} bintang',
    cantAfford: 'Bintangmu belum cukup',
    choresLocked: 'Kumpulkan {stars} bintang untuk membuka kerjaan rumah',
    choresOpen: 'Kerjaan rumah sudah terbuka',
    bigPrizesLocked: 'Selesaikan Bab {n} untuk hadiah besar',
    cosmeticOnly: 'Bintang hanya membeli tampilan — bukan uang, bukan jalan pintas.',
    categoryColoursNeverChange: 'Warna kantong tidak pernah berubah. Itu cara kamu membaca uangmu.',
  },

  avatar: {
    fox: 'Rubah', deer: 'Kancil', cat: 'Kucing', owl: 'Burung Hantu', dragon: 'Naga',
  },

  parent: {
    dashboard: 'Beranda',
    inbox: 'Permintaan',
    send: 'Kirim uang',
    take: 'Ambil uang',
    rules: 'Aturan uang',
    noPending: 'Tidak ada yang menunggumu sekarang.',
    pendingCount: '{count} menunggumu',
    instant: 'Menyetujui berarti selesai',
    toDo: 'Menyetujui masih menyisakan tugas untukmu',
    promiseDebt: 'Kamu sudah bilang ya — belum dilakukan',
    promiseDebtHint: 'Janji yang belum kamu tepati. Ini angka yang paling penting.',
    markDone: 'Sudah saya lakukan',
    storyRequired: 'Ceritakan ke mana uangnya pergi',
    storyPlaceholder: 'Hari Minggu kami belikan beras untuk panti',
    storyMissing: 'Berbagi tidak bisa ditutup tanpa ceritanya',
    sendTitle: 'Kirim uang',
    sendSource: 'Uangnya dari mana?',
    sendNote: 'Catatan (boleh dikosongkan)',
    landsInUnsorted: 'Uangnya mendarat di Uang Baru. {child} yang menentukan tugasnya.',
    sendSubmit: 'Kirim',
    takeTitle: 'Ambil uang',
    takeReason: 'Kenapa kamu mengambilnya?',
    takeSubmit: 'Ambil',
    notificationPreview: '{child} akan melihat:',
    protectedShownNotHidden: 'Kantong terkunci sengaja tetap terlihat — supaya kamu melihat aturannya, bukan bingung ke mana perginya.',
    rulesTitle: 'Aturan uang',
    ratioTotal: 'Total {total}%',
    ratioLeftover: '{leftover}% mendarat di Uang Baru',
    modeFlexible: 'Fleksibel',
    modeFlexibleBody: 'Anakmu boleh menyortir ulang Uang Baru dan Pakai sendiri.',
    modeStrict: 'Ketat',
    modeStrictBody: 'Pembagiannya terkunci. Uang tidak bisa keluar dari tugas yang sudah diberikan.',
    enforcedOnKid: 'Ini benar-benar ditegakkan di app anakmu, bukan cuma di sini.',
    amountRequired: 'Pilih jumlahnya dulu',
    sourceRequired: 'Tandai asal uangnya',
    notEnough: 'Isinya tidak sebanyak itu',
    reasonRequired: 'Alasan wajib diisi — anakmu juga harus memberi alasan',
    protected: 'Kantong ini terlindungi',
  },

  sendSource: {
    allowance: 'Uang saku',
    thr: 'THR',
    birthday: 'Ulang tahun',
    prize: 'Hadiah',
    from_family: 'Dari keluarga',
    other: 'Lainnya',
  },

  takeLock: {
    dreamProtected: 'Impian tidak bisa ditarik kembali',
    giveProtected: 'Uang yang dijanjikan untuk berbagi tetap dijanjikan',
    growProtected: 'Bertumbuh hanya keluar lewat Harvest',
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
