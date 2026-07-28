import type { Tier, Pocket } from '../packages/core/src/types.js';

export type CategoryTerms = Record<Pocket, string>;

export interface Dictionary {
  brand: { name: string; tagline: string; positioning: string };
  /** lookup [tier][category] — D2 belum memutuskan apakah istilah berubah menurut tier */
  category: Record<Tier, CategoryTerms>;
  common: Record<
    'total' | 'approve' | 'decline' | 'talkAboutIt' | 'markAsDone' | 'needsOk' | 'toDo' | 'done',
    string
  >;
  rules: Record<'strictLockedTitle' | 'strictLockedBody', string>;
  give: Record<'reasonLabel' | 'storyPrompt' | 'whereMyGivingWent', string>;
}
