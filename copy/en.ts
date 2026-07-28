/**
 * Kamus Inggris — port apa adanya dari mockup (keputusan 28 Juli 2026).
 * Ini BUKAN pernyataan bahwa D1 sudah dijawab. Lihat docs/decisions/OPEN-keputusan-tertunda.md.
 * Diisi bertahap saat setiap layar dipindahkan dari legacy/ ke apps/.
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

  sort: {
    title: 'Sort your money',
    // Angkanya TIDAK PERNAH ditulis mati — datang dari money_rules milik ortu.
    autoSplitHint: '{spend}% Spend / {save}% Save / {give}% Give',
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
  },

  dream: {
    raidWarning: 'This costs you {stars} stars. Moving it to another dream is free.',
  },
};
