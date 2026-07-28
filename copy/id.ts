import type { Dictionary } from './types.js';

/**
 * Bahasa Indonesia.
 *
 * Istilah kategori mengikuti sumber yang sudah sepakat: lembar karakter yang disetujui +
 * brand system §5.2 + kalimat posisi resmi — SPEND/PAKAI · SAVE/SIMPAN · GIVE/BERBAGI · GROW/BERTUMBUH.
 * (Yang menyimpang hanya design system §13.1; lihat D2.)
 *
 * Per-tier saat ini sengaja identik. Kalau D2 memutuskan istilah berubah menurut tier,
 * ubah nilainya di sini — bentuknya sudah menampung.
 */
const categories = {
  spend: 'Pakai',
  save: 'Simpan',
  give: 'Berbagi',
  grow: 'Bertumbuh',
  unsorted: 'Belum disortir',
};

export const id: Dictionary = {
  brand: {
    name: 'Nummi',
    tagline: 'Uang kecil, kebiasaan besar.',
    positioning:
      'Nummi adalah aplikasi Parent as Banking untuk anak belajar memakai, menyimpan, berbagi dan mengelola uangnya.',
  },
  category: { little: categories, middle: categories, teen: categories },
  common: {
    total: 'Total',
    approve: 'Setujui',
    decline: 'Tolak',
    /** jawaban ketiga — supaya menolak tanpa penjelasan bukan satu-satunya jalan (ADR-0002) */
    talkAboutIt: 'Bicarakan dulu',
    markAsDone: 'Tandai selesai',
    needsOk: 'Menunggu izin',
    toDo: 'Belum dikerjakan',
    done: 'Selesai',
  },
  rules: {
    strictLockedTitle: 'Ini sedang dikunci',
    /** Gembok harus menjelaskan KENAPA, bukan sekadar tombol mati (ADR-0005) */
    strictLockedBody:
      'Orang tuamu mengatur uang ini supaya tetap pada tugasnya. Kamu bisa membicarakannya kalau mau mengubah.',
  },
  give: {
    /** alasan Give OPSIONAL — jangan pajaki kemurahan hati (ADR-0006) */
    reasonLabel: 'Kenapa kamu memberi? (boleh dikosongkan)',
    storyPrompt: 'Ceritakan apa yang terjadi dengan uangnya',
    whereMyGivingWent: 'Ke mana uang berbagiku pergi',
  },
};
