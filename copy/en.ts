/**
 * Kamus Inggris — KAMUS AKTIF produk (ADR-0016 menutup D1).
 * Diisi bertahap saat setiap layar dipindahkan dari legacy/ ke apps/.
 *
 * Catatan saat mengisi: ejaan harus konsisten satu varian (backlog X10 — "Practice" vs
 * "Practise" pernah berbeda antar permukaan). Dulu diasumsikan gugur kalau D1 jatuh ke
 * Indonesia; karena D1 jatuh ke Inggris, konsistensi itu sekarang wajib ditegakkan di sini.
 */
import type { Dictionary } from './types.js';

const CATEGORY_EN = {
  unsorted: 'Unsorted',
  spend: 'Spend',
  save: 'Save',
  give: 'Give',
  grow: 'Grow',
} as const;

export const en: Dictionary = {
  brand: {
    name: 'Nummi',
    tagline: 'Uang kecil, kebiasaan besar.',
    positioning:
      'Nummi adalah aplikasi Parent as Banking untuk anak belajar memakai, menyimpan, berbagi dan mengelola uangnya.',
  },

  // Sama untuk ketiga tier sampai D2 memutuskan sebaliknya.
  category: { little: CATEGORY_EN, middle: CATEGORY_EN, teen: CATEGORY_EN },

  common: {
    total: 'Total',
    approve: 'Approve',
    decline: 'Decline',
    talkAboutIt: 'Talk about it',
    markAsDone: 'Mark as done',
    needsOk: 'Needs OK',
    toDo: 'To do',
    done: 'Done',
    cancel: 'Cancel',
    waitingForGrownUp: 'Waiting for a grown-up',
  },

  nav: {
    home: 'Home',
    wallets: 'Wallets',
    add: 'Add',
    missions: 'Missions',
    me: 'Me',
  },

  home: {
    greeting: 'Hi, {child}',
    totalLabel: 'All my money',
    justArrived: '{amount} just arrived!',
    sortItNow: 'Give it a job',
    nothingToSort: 'Everything has a job. Nice.',
    myDreams: 'My dreams',
    requestsWaiting: '{count} waiting for a grown-up',
    toGo: '{amount} to go',
  },

  wallets: {
    title: 'My wallets',
    target: 'Target {amount}',
    reached: 'Reached!',
    emptyPocket: 'Nothing here yet',
    // Grow tidak punya Move — Harvest satu-satunya jalan keluar (ADR-0003).
    lockedByGrow: 'Money here leaves through Harvest only',
  },

  requests: {
    title: 'Waiting for a grown-up',
    empty: 'Nothing waiting.',
    waiting: 'Needs OK',
    approved: 'Said yes — not done yet',
    storyNeeded: 'Your grown-up still owes you the story',
  },

  sort: {
    title: 'Sort your money',
    // Angkanya TIDAK PERNAH ditulis mati — datang dari money_rules milik ortu.
    autoSplitHint: '{spend}% Spend / {save}% Save / {give}% Give',
    // Mode Strict menjelaskan KENAPA terkunci, bukan sekadar tombol yang mati.
    lockedTitle: 'Your grown-up set this split',
    lockedBody: 'You can see where every rupiah goes, but you cannot move it this time.',
    preview: 'Here is where it lands',
    confirm: 'Looks good',
    leftInUnsorted: '{amount} stays unsorted',
  },

  rules: {
    strictLockedTitle: 'This money already has a job',
    strictLockedBody: 'Your grown-up set this aside. Ask them if it needs to change.',
    ratioOver100: 'Ratio is over 100%',
    ratioStrictMustBeExact: 'Assign the last {remaining}%',
    ratioMissingDestination: 'Pick where this part should land',
  },

  give: {
    giveItAway: 'Give it away',
    reasonLabel: 'Why this one? (optional)',
    storyPrompt: 'Tell {child} where it went — that is the whole point.',
    whereMyGivingWent: 'Where my giving went',
    title: 'Give it away',
    howMuch: 'How much?',
    pickCause: 'Who is it for?',
    notePlaceholder: 'Tell us who, in your own words',
    submit: 'Ask a grown-up',
    sent: 'Sent! A grown-up will pass it on, then tell you where it went.',
    available: '{amount} ready to give',
    noStoriesYet: 'No stories yet. They show up once a grown-up passes your giving on.',
    stillWaitingStory: 'Passed on — waiting for the story',
    amountRequired: 'Pick an amount first',
    notEnough: 'That is more than you have to give',
    ownCauseNeedsNote: 'Tell us who it is for',
  },

  giveCause: {
    worship: 'My place of worship',
    orphanage: 'Children without parents',
    disaster: 'People hit by a disaster',
    friend: 'A friend who needs it',
    animals: 'Animals',
    school: 'My school charity box',
    own: 'Someone else — I will say who',
  },

  grow: {
    title: 'Grow',
    putIn: 'You put in {amount}',
    worthNow: 'Worth {amount} today',
    youOwn: 'You own {weight}',
    pricesAsOf: 'Prices from {date}',
    // Kartu penjelas spread — pelajarannya, bukan biaya tersembunyi.
    whyLess: 'Why is it less than I put in?',
    whyLessBody:
      'Gold has two prices: one to buy, a lower one to sell back. The gap is about {spread}%. Nothing was taken from you — it just needs time to grow past the gap.',
    onlyWayOut: 'Money leaves Grow through Harvest only',
    harvest: 'Harvest',
    harvestTo: 'Send it to',
    harvestLockedToSave: 'Harvest always lands in a Save wallet.',
    matured: 'Ready to harvest',
    cashOut: 'Take it all out',
    rollOver: 'Start again with all of it',
    takeProfit: 'Take the extra, keep the rest working',
  },

  dream: {
    raidWarning: 'This costs you {stars} stars. Moving it to another dream is free.',
  },
};
