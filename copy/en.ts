import type { Dictionary } from './types.js';

/**
 * English — port apa adanya dari mockup, TIDAK diterjemahkan ulang.
 * Ini sengaja: D1 belum diputuskan (lihat ../docs/decisions/OPEN-keputusan-tertunda.md).
 *
 * Catatan: mockup HP memakai "Practice", mockup iPad memakai "Practise" (K12/X10).
 * Di sini dipilih satu — "Practice" — supaya inkonsistensi itu tidak ikut terbawa ke kode.
 */
const categories = {
  spend: 'Spend',
  save: 'Save',
  give: 'Give',
  grow: 'Grow',
  unsorted: 'Unsorted',
};

export const en: Dictionary = {
  brand: {
    name: 'Nummi',
    tagline: 'Small money, big habits.',
    positioning:
      'Nummi is a Parent as Banking app where children learn to spend, save, give, and grow their money.',
  },
  category: { little: categories, middle: categories, teen: categories },
  common: {
    total: 'Total',
    approve: 'Approve',
    decline: 'Decline',
    talkAboutIt: 'Talk about it',
    markAsDone: 'Mark as done',
    needsOk: 'Needs OK',
    toDo: 'To do',
    done: 'Done',
  },
  rules: {
    strictLockedTitle: 'This is locked right now',
    strictLockedBody:
      'Your grown-up set this money to stay on its job. You can talk to them if you want to change it.',
  },
  give: {
    reasonLabel: 'Why are you giving? (optional)',
    storyPrompt: 'Tell them what happened with the money',
    whereMyGivingWent: 'Where my giving went',
  },
};
