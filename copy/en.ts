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

  move: {
    title: 'Move money',
    from: 'Take it from',
    to: 'Move it to',
    howMuch: 'How much?',
    preview: 'After the move',
    confirm: 'Move it',
    after: '{wallet} will have {amount}',
    // Peringatan tampil SEBELUM konfirmasi — bukan hukuman diam-diam.
    starWarning: 'This costs you {stars} stars. Moving it to another dream is free.',
    needsGrownUp: 'A dream can only be undone with a grown-up.',
    nothingMovable: 'Nothing can be moved right now.',
    amountRequired: 'Pick an amount first',
    notEnough: 'There is not that much in there',
    sourceLocked: 'This money cannot move on its own',
    sameWallet: 'Pick two different wallets',
    destinationNotAllowed: 'Money cannot go there this way',
  },

  requests: {
    title: 'Waiting for a grown-up',
    empty: 'Nothing waiting.',
    waiting: 'Needs OK',
    approved: 'Said yes — not done yet',
    storyNeeded: 'Your grown-up still owes you the story',
  },

  missions: {
    title: 'Missions',
    chapterOf: 'Chapter {n} of {total}',
    learn: 'Learn',
    practice: 'Practice',
    practiceLocked: 'Finish the lessons first',
    chapterLocked: 'Finish the chapter before this one',
    current: 'You are here',
    done: 'Done',
    starsEach: '{stars} stars each',
    // Gerbang mingguan ada di PENUKARAN, bukan perolehan (ADR-0004).
    weeklyGate: 'Finish this week to spend your gems',
  },

  chapter: {
    money_is_choice: 'Money is a choice',
    four_jobs: 'Money has four jobs',
    wants_vs_needs: 'Want it or need it?',
    saving_takes_time: 'Saving takes time',
    giving: 'Giving it away',
    growing: 'Making it grow',
  },

  me: {
    title: 'Me',
    starsBalance: 'Stars to spend',
    starsLifetime: 'Stars ever earned',
    gems: 'Gems',
    badges: 'Badges',
    theme: 'Colour',
    avatarShop: 'Avatars',
    owned: 'Yours',
    buy: '{stars} stars',
    cantAfford: 'Not enough stars yet',
    choresLocked: 'Earn {stars} stars ever to unlock jobs from home',
    choresOpen: 'Jobs from home are open',
    bigPrizesLocked: 'Finish Chapter {n} for the big prizes',
    cosmeticOnly: 'Stars only buy looks — never money, never shortcuts.',
    categoryColoursNeverChange: 'Pocket colours never change. They are how you read your money.',
  },

  avatar: {
    fox: 'Fox', deer: 'Deer', cat: 'Cat', owl: 'Owl', dragon: 'Dragon',
  },

  parent: {
    dashboard: 'Dashboard',
    inbox: 'Requests',
    send: 'Send money',
    take: 'Take money',
    rules: 'Money rules',
    noPending: 'Nothing needs you right now.',
    pendingCount: '{count} need you',
    instant: 'Approving finishes this',
    toDo: 'Approving still leaves you something to do',
    promiseDebt: 'You said yes — not done yet',
    promiseDebtHint: 'A promise you have not kept yet. This is the number that matters most.',
    markDone: 'I did it',
    storyRequired: 'Tell them where it went',
    storyPlaceholder: 'We bought rice for the orphanage on Sunday',
    storyMissing: 'Giving cannot be closed without the story',
    sendTitle: 'Send money',
    sendSource: 'Where is it from?',
    sendNote: 'Note (optional)',
    // Selalu Unsorted — anak yang memberi tugasnya, bukan ortu.
    landsInUnsorted: 'It lands in Unsorted. {child} decides what job it gets.',
    sendSubmit: 'Send it',
    takeTitle: 'Take money',
    takeReason: 'Why are you taking it?',
    takeSubmit: 'Take it',
    notificationPreview: '{child} will see:',
    protectedShownNotHidden: 'Locked pockets stay visible on purpose — so you can see the rule, not wonder where they went.',
    rulesTitle: 'Money rules',
    ratioTotal: 'Total {total}%',
    ratioLeftover: '{leftover}% lands in Unsorted',
    modeFlexible: 'Flexible',
    modeFlexibleBody: 'Your child can re-sort Unsorted and Spend on their own.',
    modeStrict: 'Strict',
    modeStrictBody: 'The split is locked. Money cannot leave the job it was given.',
    enforcedOnKid: 'This is enforced in your child’s app, not just here.',
    amountRequired: 'Pick an amount first',
    sourceRequired: 'Tag where it came from',
    notEnough: 'There is not that much in there',
    reasonRequired: 'A reason is required — your child had to give one too',
    protected: 'This pocket is protected',
  },

  sendSource: {
    allowance: 'Allowance',
    thr: 'THR',
    birthday: 'Birthday',
    prize: 'Prize',
    from_family: 'From family',
    other: 'Something else',
  },

  takeLock: {
    dreamProtected: 'A dream cannot be taken back',
    giveProtected: 'Money promised to giving stays promised',
    growProtected: 'Grow only leaves through Harvest',
  },

  settings: {
    title: 'Settings',
    allowance: 'Allowance schedule',
    rates: 'Your bank rates',
    prices: 'Today’s prices',
    investments: 'Manage investments',
    allowanceOn: 'On',
    allowanceOff: 'Off',
    amount: 'How much',
    frequency: 'How often',
    day: 'Which day',
    nextDates: 'Next three',
    // Sudah dijadwalkan ortu sendiri — meminta ortu menyetujui keputusannya sendiri tiap
    // minggu hanya melatih menekan "ya" tanpa membaca.
    noApprovalNeeded: 'Lands automatically. No approval each time.',
    landsInUnsorted: 'It lands in Unsorted, same as money you send by hand.',
    ratesTitle: 'Your bank rates',
    ratesHint: 'You are the bank. These are the rates your child earns on a Time Deposit.',
    ratesUpsideDown: 'Longer tenors pay less here. Real deposits reward waiting — worth a second look.',
    oneTapApprove: 'With rates set, a deposit request is a one-tap approval.',
    pricesTitle: 'Today’s prices',
    goldSell: 'Gold — buy',
    goldBuyback: 'Gold — sell back',
    spread: 'Gap {pct}%',
    fx: 'Currencies',
    pricesFrom: 'From {date}',
    investmentsTitle: 'Manage investments',
    matured: 'Ready to harvest',
    daysLeft: '{days} days to go',
    startedOn: 'Started {date}',
    placeholderDates: 'Seed dates are placeholders — maturity comes from the ledger until real dates land in S1b.',
    amountRequired: 'Set an amount first',
    dayOutOfRange: 'Pick a valid day (monthly is capped at 28)',
    ratesNegative: 'Rates cannot be negative',
    ratesTooHigh: 'That rate looks like a typo',
  },

  addChild: {
    title: 'Add a child',
    name: 'Name',
    birth: 'Born',
    month: 'Month',
    year: 'Year',
    tier: 'Age group',
    tierSuggested: 'Suggested from age',
    // Ditimpa tanpa dihakimi: tidak ada peringatan, tidak ada "yakin?".
    tierOverride: 'Change it if you know better. You do.',
    pin: 'PIN',
    pinHint: '{min}–{max} digits. Your child types this to sign in.',
    privacy: 'Month and year only — we never ask for the exact date.',
    submit: 'Add {name}',
    starterWallets: 'Starts with',
    created: 'Ready. {name} can sign in with the family code and this PIN.',
    nameRequired: 'A name is needed',
    birthMonthInvalid: 'Pick a month between 1 and 12',
    birthYearInvalid: 'That year looks like a typo',
    pinLength: 'PIN must be {min}–{max} digits',
    pinDigitsOnly: 'Digits only',
  },

  jobs: {
    title: 'Jobs from home',
    kind: 'What kind of job?',
    reward: 'Paid in',
    amount: 'How much',
    jobTitle: 'What is the job?',
    gemsOnly: 'Gems only',
    // Alasannya ditulis, bukan disembunyikan — supaya ortu paham, bukan sekadar menurut.
    whyGemsOnly: 'Helping at home is not paid work. Paying for it teaches your child to negotiate a price for being part of the family.',
    add: 'Add it',
    prizes: 'Prizes',
    prizeTitle: 'What is the prize?',
    gemCost: 'Costs',
    timeToEarn: 'Time to earn',
    weeks: 'about {weeks} weeks',
    never: 'Never — no job pays gems yet',
    gemsPerWeek: '{gems} gems a week',
    titleRequired: 'Give it a name',
    amountRequired: 'Set an amount',
    moneyNotAllowed: 'Helping at home is paid in gems',
    costRequired: 'Set a gem cost',
  },

  jobKind: {
    family_contribution: 'Helping at home',
    extra_work: 'Extra work',
    achievement: 'An achievement',
  },
  rewardKind: { gems: 'Gems', money: 'Money' },
  tierName: { little: 'Little', middle: 'Middle', teen: 'Teen' },

  frequency: { weekly: 'Every week', biweekly: 'Every two weeks', monthly: 'Every month' },
  weekday: {
    '0': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday',
    '4': 'Thursday', '5': 'Friday', '6': 'Saturday',
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
