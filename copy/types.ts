import type { Tier, Pocket } from '../packages/core/src/types.js';
import type { GiveCause } from '../packages/core/src/give.js';
import type { ChapterKey } from '../packages/core/src/missions.js';

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

  move: Record<
    'title' | 'from' | 'to' | 'howMuch' | 'preview' | 'confirm' | 'after'
    | 'starWarning' | 'needsGrownUp' | 'nothingMovable'
    | 'amountRequired' | 'notEnough' | 'sourceLocked' | 'sameWallet' | 'destinationNotAllowed',
    string
  >;

  requests: Record<'title' | 'empty' | 'waiting' | 'approved' | 'storyNeeded', string>;

  missions: Record<
    'title' | 'chapterOf' | 'learn' | 'practice' | 'practiceLocked'
    | 'chapterLocked' | 'current' | 'done' | 'starsEach' | 'weeklyGate',
    string
  >;

  /** Judul chapter — kuncinya di core (`CHAPTERS`). */
  chapter: Record<ChapterKey, string>;

  me: Record<
    'title' | 'starsBalance' | 'starsLifetime' | 'gems' | 'badges' | 'theme' | 'avatarShop'
    | 'owned' | 'buy' | 'cantAfford' | 'choresLocked' | 'choresOpen' | 'bigPrizesLocked'
    | 'cosmeticOnly' | 'categoryColoursNeverChange',
    string
  >;

  avatar: Record<string, string>;

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

  give: Record<
    'reasonLabel' | 'storyPrompt' | 'whereMyGivingWent' | 'giveItAway'
    | 'title' | 'howMuch' | 'pickCause' | 'notePlaceholder' | 'submit' | 'sent'
    | 'available' | 'noStoriesYet' | 'stillWaitingStory'
    | 'amountRequired' | 'notEnough' | 'ownCauseNeedsNote',
    string
  >;

  /** Sebab Give — kuncinya di core (`GIVE_CAUSES`), labelnya hanya di sini. */
  giveCause: Record<GiveCause, string>;

  grow: Record<
    'title' | 'putIn' | 'worthNow' | 'youOwn' | 'pricesAsOf'
    | 'whyLess' | 'whyLessBody' | 'onlyWayOut'
    | 'harvest' | 'harvestTo' | 'harvestLockedToSave'
    | 'matured' | 'cashOut' | 'rollOver' | 'takeProfit',
    string
  >;

  /** Peringatan tampil SEBELUM konfirmasi, bukan sesudah (Fase 5). */
  dream: Record<'raidWarning', string>;
}
