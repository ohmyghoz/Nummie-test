import type { Tier, Pocket } from '../packages/core/src/types.js';
import type { GiveCause } from '../packages/core/src/give.js';
import type { ChapterKey } from '../packages/core/src/missions.js';
import type { SendSource } from '../packages/core/src/parent.js';
import type { JobKind, RewardKind } from '../packages/core/src/jobs.js';

export type CategoryTerms = Record<Pocket, string>;

/**
 * Bentuk kamus. Kedua bahasa WAJIB memenuhi bentuk yang sama.
 * Konsekuensinya disengaja: begitu D1 jatuh ke Indonesia, yang belum diterjemahkan muncul
 * sebagai galat tipe — bukan sebagai layar berbahasa Inggris yang lolos ke tangan anak.
 */
export interface Dictionary {
  /**
   * `*App` / `*AppShort` dipakai judul halaman DAN manifest PWA (ADR-0019). `short` adalah yang
   * muncul di bawah ikon Home Screen — iOS memotong sekitar 12 karakter, jadi ia sengaja terpisah
   * dan bukan hasil truncate otomatis.
   */
  brand: {
    name: string; tagline: string; positioning: string;
    kidApp: string; kidAppShort: string;
    parentApp: string; parentAppShort: string;
  };

  /**
   * Lookup [tier][category]. D2 sudah dijawab: istilahnya **sama untuk ketiga tier**
   * (ADR-0017), jadi ketiga nilainya identik hari ini.
   *
   * Bentuk Record<Tier, …> tetap dipertahankan dengan sengaja. Risiko yang diambil sadar di
   * ADR-0017 adalah Teen merasa "Save"/"Give" kekanak-kanakan; kalau uji pengguna membuktikannya,
   * bentuk inilah yang membuat jalan keluarnya berupa edit kamus, bukan sisir komponen.
   *
   * JANGAN pernah menulis nama kategori sebagai teks mati di komponen.
   */
  category: Record<Tier, CategoryTerms>;

  common: Record<
    'total' | 'approve' | 'decline' | 'talkAboutIt' | 'markAsDone' | 'needsOk' | 'toDo' | 'done'
    | 'cancel' | 'waitingForGrownUp',
    string
  >;

  nav: Record<'home' | 'wallets' | 'add' | 'missions' | 'me', string>;

  /**
   * Layar masuk anak (ADR-0012 §A1: kode keluarga + PIN, tanpa memilih anak lebih dulu).
   * `failed` sengaja SATU pesan untuk semua sebab — kode salah, PIN salah, atau dua anak
   * ber-PIN sama. Server pun menjawab seragam; kalau layar ini lebih cerewet daripada
   * server, ia membocorkan apa yang server tutup rapat.
   */
  login: Record<
    'title' | 'subtitle' | 'familyCode' | 'familyCodeHint' | 'pin' | 'pinHint'
    | 'submit' | 'failed' | 'lockedOut' | 'askGrownUp',
    string
  >;

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

  /** "Jobs from home" & penukaran hadiah di sisi ANAK (U-13). Builder ortu ada di `jobs`. */
  kidJobs: Record<
    'title' | 'empty' | 'markDone' | 'waiting' | 'paidInGems' | 'paidInMoney'
    | 'prizesTitle' | 'prizesEmpty' | 'redeem' | 'yourGems' | 'tooExpensive'
    | 'bigPrizeLocked' | 'weeklyLocked' | 'failed',
    string
  >;

  /** Judul chapter — kuncinya di core (`CHAPTERS`). */
  chapter: Record<ChapterKey, string>;

  me: Record<
    'title' | 'starsBalance' | 'starsLifetime' | 'gems' | 'badges' | 'theme' | 'avatarShop'
    | 'owned' | 'buy' | 'cantAfford' | 'choresLocked' | 'choresOpen' | 'bigPrizesLocked'
    | 'cosmeticOnly' | 'categoryColoursNeverChange' | 'signOut',
    string
  >;

  avatar: Record<string, string>;

  /**
   * Learning tracker sisi ortu (handoff §82) — status ketiga gerbang ADR-0004 di satu kartu.
   * Sengaja menyebut apa yang harus terjadi berikutnya, bukan cuma terkunci/terbuka: ortu yang
   * cuma melihat 🔒 tidak tahu ia bisa membantu apa.
   */
  tracker: Record<
    'title' | 'chapters' | 'starsLifetime' | 'gems' | 'gateChores' | 'gateBigPrize'
    | 'gateWeekly' | 'open' | 'locked' | 'starsToGo' | 'chaptersToGo' | 'weeklyNoData'
    | 'talkAboutIt',
    string
  >;

  /**
   * Upsell & paywall — **hanya app ortu** (C1). Setiap pesan menyebut apa yang dibuka, bukan apa
   * yang terkunci: §8 menuntut "selalu tunjukkan value, jangan gagal diam-diam".
   */
  upsell: Record<
    'title' | 'price' | 'framing' | 'perMonth' | 'cta' | 'notNow'
    | 'maxChildren' | 'maxActiveJobs' | 'maxPrizes' | 'maxDreams'
    | 'strictFlexibleDial' | 'autoSplitEditor' | 'grow' | 'report',
    string
  >;

  /** Sisi ortu (S3). Bahasa produk = Inggris, sama dengan app anak (ADR-0016). */
  parent: Record<
    'dashboard' | 'inbox' | 'send' | 'take' | 'rules' | 'noPending' | 'pendingCount'
    | 'instant' | 'toDo' | 'promiseDebt' | 'promiseDebtHint'
    | 'markDone' | 'storyRequired' | 'storyPlaceholder' | 'storyMissing'
    | 'sendTitle' | 'sendSource' | 'sendNote' | 'landsInUnsorted' | 'sendSubmit'
    | 'takeTitle' | 'takeReason' | 'takeSubmit' | 'notificationPreview'
    | 'protectedShownNotHidden' | 'rulesTitle' | 'ratioTotal' | 'ratioLeftover'
    | 'modeFlexible' | 'modeFlexibleBody' | 'modeStrict' | 'modeStrictBody' | 'enforcedOnKid'
    | 'amountRequired' | 'sourceRequired' | 'notEnough' | 'reasonRequired' | 'protected'
    | 'decisionFailed',
    string
  >;

  /**
   * Masuk sebagai ortu (Supabase Auth, email + password — ADR-0012).
   * `failed` satu pesan untuk semua sebab: email tak terdaftar dan password salah harus tidak
   * bisa dibedakan, kalau tidak layar ini jadi alat memeriksa siapa yang punya akun.
   */
  /**
   * Auth ortu = OTP email tanpa password (ADR-0022). `password` sengaja tetap ada di bentuk ini
   * walau layarnya tidak memakainya lagi — membuangnya cuma menghemat satu baris sambil membuat
   * jalan kembali lebih mahal.
   */
  parentAuth: Record<
    'title' | 'subtitle' | 'email' | 'password' | 'submit' | 'failed' | 'signOut'
    | 'noPassword' | 'codeSent' | 'code' | 'codeHint' | 'submitCode' | 'resend'
    | 'badCode' | 'tooMany',
    string
  >;

  /** Sebab uang masuk — kuncinya di core (`SEND_SOURCES`). Anak melihat label ini. */
  sendSource: Record<SendSource, string>;

  takeLock: Record<'dreamProtected' | 'giveProtected' | 'growProtected', string>;

  /**
   * Label lima jalur approval inbox + Grow. Dulu ditulis mati sebagai `KIND_LABEL` di
   * `apps/parent/app/requests/page.tsx` — satu-satunya peta label di app ortu yang melewati kamus.
   * Kuncinya sengaja sama persis dengan `MoneyRequest['kind']` di core, jadi jalur baru tidak bisa
   * ditambahkan tanpa memberinya nama di sini.
   */
  /**
   * Ganti PIN anak — jalur pemulihan satu-satunya. Ortu **mengganti**, tidak pernah **melihat**:
   * `pin_hash` di-bcrypt dan sengaja tidak pernah keluar dari database (migrasi 0006).
   */
  resetPin: Record<
    'title' | 'forWhom' | 'newPin' | 'hint' | 'cannotSee' | 'submit' | 'saved' | 'tellThem',
    string
  >;

  requestKind: Record<
    'cash_out' | 'give_away' | 'prize' | 'mission_claim' | 'grow_in' | 'harvest',
    string
  >;

  settings: Record<
    'title' | 'allowance' | 'rates' | 'prices' | 'investments'
    | 'allowanceOn' | 'allowanceOff' | 'amount' | 'frequency' | 'day' | 'nextDates'
    | 'noApprovalNeeded' | 'landsInUnsorted'
    | 'ratesTitle' | 'ratesHint' | 'ratesUpsideDown' | 'oneTapApprove'
    | 'pricesTitle' | 'goldSell' | 'goldBuyback' | 'spread' | 'fx' | 'pricesFrom'
    | 'investmentsTitle' | 'matured' | 'daysLeft' | 'startedOn' | 'placeholderDates'
    | 'amountRequired' | 'dayOutOfRange' | 'ratesNegative' | 'ratesTooHigh'
    | 'save' | 'saved' | 'months',
    string
  >;

  addChild: Record<
    'title' | 'name' | 'birth' | 'month' | 'year' | 'tier' | 'tierSuggested' | 'tierOverride'
    | 'pin' | 'pinHint' | 'privacy' | 'submit' | 'starterWallets' | 'created'
    | 'nameRequired' | 'birthMonthInvalid' | 'birthYearInvalid' | 'pinLength' | 'pinDigitsOnly'
    | 'pinTaken'
    // Cakupan MVP — ADR-0020 (D5). `tierOnly` menggantikan pilihan tier selama hanya satu tersedia;
    // `tierOutsideScope` memberi tahu, TIDAK menghalangi (catatan 2 `onboarding.ts`).
    | 'tierOnly' | 'tierOutsideScope' | 'tierUnavailable',
    string
  >;

  jobs: Record<
    'title' | 'kind' | 'reward' | 'amount' | 'jobTitle' | 'gemsOnly' | 'whyGemsOnly' | 'add'
    | 'prizes' | 'prizeTitle' | 'gemCost' | 'timeToEarn' | 'weeks' | 'never' | 'gemsPerWeek'
    | 'titleRequired' | 'amountRequired' | 'moneyNotAllowed' | 'costRequired'
    | 'archive' | 'archiveHint',
    string
  >;

  jobKind: Record<JobKind, string>;
  rewardKind: Record<RewardKind, string>;
  tierName: Record<'little' | 'middle' | 'teen', string>;

  txn: Record<
    'title' | 'moneyIn' | 'moneyOut' | 'moved' | 'net' | 'count' | 'empty'
    | 'movedHint' | 'range7d' | 'range30d' | 'range90d' | 'rangeAll' | 'fromOutside',
    string
  >;

  frequency: Record<'weekly' | 'biweekly' | 'monthly', string>;
  weekday: Record<'0' | '1' | '2' | '3' | '4' | '5' | '6', string>;

  sort: Record<
    'title' | 'autoSplitHint' | 'lockedTitle' | 'lockedBody' | 'preview' | 'confirm'
    | 'leftInUnsorted' | 'saveFailed',
    string
  >;

  /** Pesan mode Strict menjelaskan KENAPA terkunci, bukan sekadar tombol yang mati. */
  rules: Record<
    'strictLockedTitle' | 'strictLockedBody'
    | 'ratioOver100' | 'ratioStrictMustBeExact' | 'ratioMissingDestination'
    | 'ratioGrowExcluded',
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
    | 'matured' | 'cashOut' | 'rollOver' | 'takeProfit'
    // Setoran ke instrumen (U-14). `needsGrownUp` dan `promisedInterest` sengaja dipisah:
    // yang pertama soal izin, yang kedua soal janji — dan anak harus membaca keduanya.
    | 'addMoney' | 'addMoneyFrom' | 'howMuch' | 'pickInstrument' | 'pickTenor'
    | 'months' | 'promisedInterest' | 'needsGrownUp' | 'submit' | 'depositBusy'
    | 'sourceNotAllowed' | 'notEnough' | 'amountRequired' | 'tenorRequired',
    string
  >;

  /** Peringatan tampil SEBELUM konfirmasi, bukan sesudah (Fase 5). */
  dream: Record<'raidWarning', string>;
}
