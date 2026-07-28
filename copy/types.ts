import type { Tier, Pocket } from '../packages/core/src/types.js';

export type CategoryTerms = Record<Pocket, string>;

/**
 * Bentuk kamus. Kedua bahasa WAJIB memenuhi bentuk yang sama.
 * Konsekuensinya disengaja: begitu D1 jatuh ke Indonesia, yang belum diterjemahkan muncul
 * sebagai galat tipe — bukan sebagai layar berbahasa Inggris yang lolos ke tangan anak.
 */
export interface Dictionary {
  brand: { name: string; tagline: string; positioning: string };

  /**
   * Lookup [tier][category]. D2 belum memutuskan apakah istilah berubah menurut tier —
   * bentuk ini membuat kedua jawaban sama murahnya. JANGAN pernah menulis nama kategori
   * sebagai teks mati di komponen.
   */
  category: Record<Tier, CategoryTerms>;

  common: Record<
    'total' | 'approve' | 'decline' | 'talkAboutIt' | 'markAsDone' | 'needsOk' | 'toDo' | 'done'
    | 'cancel' | 'waitingForGrownUp',
    string
  >;

  nav: Record<'home' | 'wallets' | 'add' | 'missions' | 'me', string>;

  home: Record<
    'greeting' | 'totalLabel' | 'justArrived' | 'sortItNow' | 'nothingToSort'
    | 'myDreams' | 'requestsWaiting' | 'toGo',
    string
  >;

  wallets: Record<'title' | 'target' | 'reached' | 'emptyPocket' | 'lockedByGrow', string>;

  requests: Record<'title' | 'empty' | 'waiting' | 'approved' | 'storyNeeded', string>;

  sort: Record<
    'title' | 'autoSplitHint' | 'lockedTitle' | 'lockedBody' | 'preview' | 'confirm'
    | 'leftInUnsorted',
    string
  >;

  /** Pesan mode Strict menjelaskan KENAPA terkunci, bukan sekadar tombol yang mati. */
  rules: Record<
    'strictLockedTitle' | 'strictLockedBody'
    | 'ratioOver100' | 'ratioStrictMustBeExact' | 'ratioMissingDestination',
    string
  >;

  give: Record<'reasonLabel' | 'storyPrompt' | 'whereMyGivingWent' | 'giveItAway', string>;

  /** Peringatan tampil SEBELUM konfirmasi, bukan sesudah (Fase 5). */
  dream: Record<'raidWarning', string>;
}
