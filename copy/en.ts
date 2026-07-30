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
    // Padanan Inggris dari "Uang kecil, kebiasaan besar." — bukan terjemahan harfiah, karena yang
    // ditiru adalah bentuknya: dua frasa pendek, kontras kecil↔besar, tanpa kata kerja.
    tagline: 'Small money, big habits.',
    positioning:
      'Nummi is Parent as Banking — where children learn to spend, save, give, and grow their own money.',
    kidApp: 'Nummi',
    kidAppShort: 'Nummi',
    parentApp: 'Nummi — for grown-ups',
    parentAppShort: 'Nummi Parent',
  },

  // Sama untuk ketiga tier — DIPUTUSKAN (ADR-0017), bukan lagi keadaan sementara.
  // Bentuk Record<Tier, …> sengaja dipertahankan walau ketiganya identik: itu yang membuat
  // keputusan ini bisa dibalik dengan mengedit kamus, bukan menyisir komponen.
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

  login: {
    title: 'Hello!',
    subtitle: 'Type your family code and your PIN.',
    familyCode: 'Family code',
    familyCodeHint: 'The one your grown-up gave you.',
    pin: 'Your PIN',
    pinHint: '{length} numbers, only yours.',
    submit: 'Come in',
    // Satu pesan untuk semua sebab — sama seperti jawaban server.
    failed: "That didn't work. Check the code and the PIN, then try again.",
    lockedOut: 'Too many tries. Wait {minutes} minutes and try again.',
    // Dulu berbunyi "...they can see it in their app" — dan itu TIDAK PERNAH benar. `pin_hash`
    // di-bcrypt dan sengaja tidak pernah keluar dari database (migrasi 0006). Ortu tidak bisa
    // melihat PIN anaknya; ia hanya bisa MENGGANTINYA. Kalimat lama menyuruh anak meminta sesuatu
    // yang mustahil, lalu meninggalkannya terkunci dari uangnya sendiri.
    askGrownUp: "Forgot your PIN? Ask your grown-up — they can set you a new one.",
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

  kidJobs: {
    title: 'Jobs from home',
    empty: 'No jobs right now. Ask your grown-up.',
    markDone: 'I did it',
    waiting: 'Waiting for a grown-up',
    paidInGems: '{amount} gems',
    paidInMoney: '{amount} — lands in Unsorted',
    prizesTitle: 'Prizes',
    prizesEmpty: 'No prizes yet. Ask your grown-up to add one.',
    redeem: 'Swap {cost} gems',
    yourGems: 'You have {gems} gems',
    tooExpensive: 'Not enough gems yet',
    bigPrizeLocked: 'Finish Chapter {n} for the big prizes',
    weeklyLocked: 'Finish this week to spend your gems',
    failed: 'That did not work. Nothing changed.',
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
    signOut: 'Not you? Sign out',
  },

  avatar: {
    fox: 'Fox', deer: 'Deer', cat: 'Cat', owl: 'Owl', dragon: 'Dragon',
  },

  tracker: {
    title: 'Learning tracker',
    chapters: 'Chapters done',
    starsLifetime: 'Stars ever earned',
    gems: 'Gems',
    gateChores: 'Jobs from home',
    gateBigPrize: 'Big prizes & achievements',
    gateWeekly: 'Spending gems this week',
    open: 'Open',
    locked: 'Locked',
    starsToGo: '{n} stars to go',
    chaptersToGo: 'Finish Chapter {n}',
    weeklyNoData: 'No weekly material yet',
    talkAboutIt: '{child} is on Chapter {n} — a good thing to ask about at dinner.',
  },

  upsell: {
    title: 'Nummi Pro',
    price: '{amount}',
    framing: 'Pay once. From KG B to Grade 9.',
    perMonth: 'About {amount} a month — less than one snack.',
    cta: 'Unlock Pro',
    notNow: 'Not now',
    maxChildren: 'Free covers one child. Pro covers up to four, at the same price.',
    maxActiveJobs: 'Free keeps {n} jobs running. Pro has no limit.',
    maxPrizes: 'Free keeps {n} prize. Pro has no limit.',
    maxDreams: 'Free keeps one dream at a time. Pro has no limit.',
    strictFlexibleDial: 'Strict mode is part of Pro. The protection rules stay free.',
    autoSplitEditor: 'Changing the split is part of Pro. The default 40/40/20 stays free.',
    grow: 'Time Deposit, Gold and currencies are part of Pro. Interest on savings stays free.',
    report: 'The Financial Literacy report is part of Pro.',
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
    decisionFailed: 'That did not go through. Nothing changed — check the balance and try again.',
  },

  parentAuth: {
    title: 'Nummi for grown-ups',
    subtitle: 'Sign in to see what your child is deciding.',
    email: 'Email',
    // `password` dipertahankan di kamus walau layarnya sudah tidak memakainya (ADR-0022):
    // `Dictionary` mewajibkan kedua bahasa punya bentuk yang sama, dan menghapusnya sekarang
    // hanya menghemat satu baris sambil membuat jalan kembali lebih mahal.
    password: 'Password',
    submit: 'Email me a code',
    noPassword: 'No password needed — we send a code every time.',
    // Panjang kode SENGAJA tidak disebut. Ia setelan dashboard Supabase, bukan konstanta kode —
    // saat diuji 30 Juli 2026 ia keluar 8 digit, sementara kalimat ini semula menjanjikan 6.
    // Copy yang menyebut angka akan berbohong diam-diam begitu setelannya diubah.
    codeSent: 'We sent a code to {email}.',
    code: 'Code',
    codeHint: 'It expires shortly. Check spam if it is not there.',
    submitCode: 'Sign in',
    resend: 'Send another code',
    badCode: 'That code did not work. Try the newest one, or send another.',
    tooMany: 'Too many tries. Wait a few minutes, then ask for a new code.',
    failed: 'That did not work. Check the email, then try again.',
    signOut: 'Sign out',
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

  resetPin: {
    title: 'New PIN',
    forWhom: 'For {name}',
    newPin: 'New PIN',
    hint: '{length} digits. It has to be different from your other children’s.',
    // Dikatakan apa adanya, bukan disembunyikan: ortu yang mengira bisa melihatnya akan mencari,
    // dan tidak menemukan apa pun. Ini juga janji privasi ke anak, bukan keterbatasan teknis.
    cannotSee: 'Nobody can look up the old PIN — not even you. You can only set a new one.',
    submit: 'Set new PIN',
    saved: 'Done. The old PIN stopped working.',
    tellThem: 'Tell {name} the new PIN yourself — Nummi will not show it to them.',
  },

  // Kunci = `MoneyRequest['kind']` di core. Jalur baru tidak bisa lahir tanpa nama di sini.
  requestKind: {
    cash_out: 'Cash out',
    give_away: 'Giving',
    prize: 'Prize',
    mission_claim: 'Mission',
    grow_in: 'Grow',
    harvest: 'Harvest',
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
    save: 'Save',
    saved: 'Saved. Your child sees this now.',
    months: '{n} months',
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
    pinHint: '{length} digits. Your child types this to sign in — no username needed.',
    privacy: 'Month and year only — we never ask for the exact date.',
    submit: 'Add {name}',
    starterWallets: 'Starts with',
    created: 'Ready. {name} can sign in with the family code and this PIN.',
    nameRequired: 'A name is needed',
    birthMonthInvalid: 'Pick a month between 1 and 12',
    birthYearInvalid: 'That year looks like a typo',
    pinLength: 'PIN must be {length} digits',
    pinDigitsOnly: 'Digits only',
    // Tidak menyebut anak yang mana: ortu tahu keluarganya sendiri, dan menyebut nama membuat
    // pesan ini jadi cara memancing siapa saja yang ada di keluarga itu.
    pinTaken: 'Someone in the family already uses this PIN. Pick another.',
    // ADR-0020: selama hanya satu tier tersedia, tidak ada yang perlu dipilih — jadi jangan
    // menampilkan pilihan palsu. Ini pernyataan cakupan, bukan pertanyaan.
    tierOnly: 'This early test runs one age group: {tier}, ages {min}–{max}.',
    // Memberi tahu, bukan menghalangi. Tidak ada "yakin?" — lihat catatan 2 di `onboarding.ts`.
    tierOutsideScope:
      'Heads up: {name} is outside {min}–{max}, the ages this test was built around. You can still continue.',
    tierUnavailable: 'That age group is not open in this test yet.',
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
    archive: 'Remove',
    archiveHint: 'Removing keeps what your child already earned — it only stops new claims.',
  },

  jobKind: {
    family_contribution: 'Helping at home',
    extra_work: 'Extra work',
    achievement: 'An achievement',
  },
  rewardKind: { gems: 'Gems', money: 'Money' },
  tierName: { little: 'Little', middle: 'Middle', teen: 'Teen' },

  txn: {
    title: 'Transactions',
    moneyIn: 'Came in',
    moneyOut: 'Went out',
    moved: 'Moved around',
    net: 'Held now',
    count: '{count} entries',
    empty: 'Nothing in this range.',
    // Perpindahan internal tidak mengubah total — ringkasan tidak boleh menyiratkan sebaliknya.
    movedHint: 'Moving money between pockets does not make your child richer or poorer.',
    range7d: '7 days', range30d: '30 days', range90d: '90 days', rangeAll: 'All',
    fromOutside: 'from outside',
  },

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
    saveFailed: 'That did not save. Nothing was moved — try again.',
  },

  rules: {
    strictLockedTitle: 'This money already has a job',
    strictLockedBody: 'Your grown-up set this aside. Ask them if it needs to change.',
    ratioOver100: 'Ratio is over 100%',
    ratioStrictMustBeExact: 'Assign the last {remaining}%',
    ratioMissingDestination: 'Pick where this part should land',
    ratioGrowExcluded: 'Grow cannot be part of the automatic split — it always needs your OK.',
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
    addMoney: 'Put money in',
    addMoneyFrom: 'Take it from',
    howMuch: 'How much?',
    pickInstrument: 'Where does it go?',
    pickTenor: 'For how long?',
    months: '{n} months',
    promisedInterest: 'Your grown-up pays you {amount} at the end',
    needsGrownUp: 'Your grown-up has to say yes first.',
    submit: 'Ask my grown-up',
    depositBusy: 'This deposit is still running. Wait for it to finish.',
    sourceNotAllowed: 'Money cannot come from there',
    notEnough: 'There is not that much in there',
    amountRequired: 'Pick an amount first',
    tenorRequired: 'Choose how long first',
  },

  dream: {
    raidWarning: 'This costs you {stars} stars. Moving it to another dream is free.',
  },
};
