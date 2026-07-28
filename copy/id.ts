/**
 * Kamus Indonesia. Console sudah 100% Indonesia dan app ortu sudah mencampur — keduanya jadi
 * bahan awal di sini. D1 belum diputuskan; kamus ini siap dipakai kapan pun jawabannya turun.
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

  sort: {
    title: 'Beri tugas untuk uangmu',
    autoSplitHint: '{spend}% Pakai / {save}% Simpan / {give}% Berbagi',
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
  },

  dream: {
    raidWarning: 'Ini memotong {stars} bintangmu. Memindahkannya ke impian lain gratis.',
  },
};
