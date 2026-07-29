# Nummi Product Design System

**Version:** 1.0  
**Status:** Product design source of truth  
**Applies to:** Nummi Little, Nummi Middle, Nummi Teen, Nummi Family, Nummi Learning, Nummi Missions, and Nummi for Schools  
**Primary platforms:** iOS, Android, iPadOS, responsive web prototype  
**Primary language:** Bahasa Indonesia  
**Secondary language:** English  

---

## 1. Purpose

Nummi Product Design System translates the Nummi brand into a consistent, accessible, and scalable product experience for children, parents, and schools.

The system must make financial learning:

- easy to understand;
- safe and transparent;
- visually engaging;
- age-appropriate;
- consistent across devices;
- compatible with one shared financial data model.

Nummi should feel like a **financial-learning companion**, not a miniature adult banking application.

---

## 2. Source of Truth

This document supersedes earlier visual directions that used pig imagery.

### Approved brand assets

- **Primary wordmark:** rounded lowercase `nummi`
- **Formal wordmark:** uppercase `NUMMI`
- **Primary symbol:** smiling **Nummi Coin** with a green sprout
- **Primary mascot:** a cute golden **kancil / baby mouse deer**
- **Mascot accessory:** purple scarf with the Nummi `n`
- **Mascot signature:** small sprout and a subtle coin-slot detail
- **Primary theme:** Berry / Nummi Purple
- **Primary tagline:** `Uang kecil, kebiasaan besar.`

### Prohibited brand imagery

Do not use:

- pig or piggy-bank symbols;
- realistic bank buildings;
- piles of cash as the main success metaphor;
- trading-terminal imagery for children;
- gambling-like visual effects;
- wealth, luxury, or “get rich” imagery.

---

## 3. Product Principles

### 3.1 Every Rupiah Has One Home

The interface must always preserve:

`Unsorted + Spend + Save + Give + Grow = Total`

No screen, animation, or label may imply that money is duplicated when it is moved.

### 3.2 Learning Through Action

Teach concepts through:

- sorting;
- moving;
- planning;
- comparing;
- completing missions;
- discussing decisions with parents.

Avoid using long educational paragraphs when the concept can be demonstrated interactively.

### 3.3 One Screen, One Primary Action

Every major screen should answer:

> “Apa tindakan utama yang perlu dilakukan anak sekarang?”

Secondary actions must be visually quieter.

### 3.4 Same Model, Different Experience

Little, Middle, and Teen use the same ledger and core data.

They differ in:

- language;
- density;
- illustration;
- navigation;
- permissions;
- complexity;
- feedback.

### 3.5 Parent as Partner

The application records commitments between child and parent. It does not hold real money.

The UI must clearly show:

- recorded balance;
- pending parent approval;
- completed by parent;
- simulated or recorded investment;
- real-world action occurs outside the app.

### 3.6 Progress Without Pressure

Celebrate:

- consistency;
- reflection;
- planning;
- completing a learning step;
- discussing a decision;
- reaching a self-defined goal.

Do not reward:

- having the largest balance;
- never spending;
- outperforming other children;
- taking unnecessary investment risk.

---

# 4. Brand Expression in Product

## 4.1 Nummi Mascot

The mascot is a golden kancil-inspired learning companion.

### Visual features

- rounded golden-yellow body;
- cream muzzle and belly;
- large dark expressive eyes;
- rosy cheeks;
- small deer ears;
- soft brown markings;
- small green sprout;
- purple Nummi scarf;
- optional subtle coin-slot detail.

### Mascot role

Use the mascot to:

- welcome;
- explain;
- encourage;
- celebrate;
- show waiting states;
- guide missions;
- bridge child and parent interactions.

### Mascot frequency

| Tier | Frequency |
|---|---|
| Little | High |
| Middle | Medium |
| Teen | Low and contextual |
| Parent | Minimal |
| School | Minimal, used in learning materials |

### Core mascot states

1. Welcome
2. Thinking
3. Explaining
4. Celebrating
5. Waiting for parent
6. Encouraging
7. Proud
8. Goal reached
9. Mission unlocked
10. Money moved
11. Grow explanation
12. Error recovery

### Mascot behavior rules

- Never appear angry because a child spent money.
- Never shame a child for an incomplete mission.
- Never celebrate a large balance merely because it is large.
- Use calm expressions for parent approval and Grow.
- Use full-body poses for Little.
- Use small bust illustrations or badges for Teen.

---

## 4.2 Logo Usage in Product

### Wordmark

Use lowercase `nummi` for:

- splash screen;
- login;
- onboarding;
- child-facing headers;
- app store presentation;
- marketing.

Use uppercase `NUMMI` for:

- legal pages;
- formal school materials;
- partner presentations;
- acronym explanation.

### Nummi Coin symbol

Use as:

- app icon;
- favicon;
- loading indicator;
- achievement badge;
- compact brand signature;
- parent approval stamp.

### App icon

Default production icon:

- Nummi Purple background;
- golden Nummi Coin or kancil mascot face;
- green sprout;
- no text;
- no category colors.

---

# 5. Design Tokens

## 5.1 Color Tokens

### Brand

| Token | Hex | Use |
|---|---|---|
| `brand.purple.700` | `#4A32A8` | Dark active state, strong text |
| `brand.purple.500` | `#6C4CE0` | Primary action and brand |
| `brand.purple.300` | `#9A82F0` | Secondary accent |
| `brand.purple.100` | `#EDE7FC` | Soft selection |
| `brand.purple.050` | `#F7F4FD` | Background surface |

### Sunshine

| Token | Hex | Use |
|---|---|---|
| `sunshine.600` | `#D97904` | Accessible dark highlight |
| `sunshine.500` | `#FFB020` | Reward and achievement |
| `sunshine.300` | `#FFD56A` | Mascot and illustration |
| `sunshine.100` | `#FFF3D7` | Celebration background |

### Financial categories

| Token group | Primary | Tint | Deep |
|---|---|---|---|
| `category.spend` | `#FF7A4D` | `#FFEDE5` | `#C24E24` |
| `category.save` | `#2CA6E0` | `#E2F2FB` | `#1B6E97` |
| `category.give` | `#F056A0` | `#FCE6F1` | `#B62C74` |
| `category.grow` | `#2FC078` | `#E1F6EC` | `#1B7A4B` |
| `category.unsorted` | `#8A7CF0` | `#ECE9FC` | `#5645B8` |

Category colors are semantic and must never change when a user changes theme.

### Neutral

| Token | Hex |
|---|---|
| `neutral.ink.900` | `#2A2342` |
| `neutral.ink.700` | `#4F4865` |
| `neutral.ink.500` | `#736C8C` |
| `neutral.ink.300` | `#AAA3BD` |
| `neutral.line.200` | `#EBE6F5` |
| `neutral.surface.100` | `#F7F4FD` |
| `neutral.surface.000` | `#FFFFFF` |
| `neutral.canvas.100` | `#EEEAF6` |

### Status

| Token | Hex | Meaning |
|---|---|---|
| `status.success` | `#1F9D63` | Completed |
| `status.waiting` | `#B77908` | Waiting for parent |
| `status.approval` | `#5A46C8` | Parent permission |
| `status.warning` | `#B5473C` | Needs attention |
| `status.learning` | `#2266B5` | Educational explanation |
| `status.loss` | `#D64550` | Negative movement, not failure |

### Personal themes

| Theme | Brand | Canvas | Mood |
|---|---|---|---|
| Berry | `#6C4CE0` | `#EEEAF6` | Signature, imaginative |
| Mint | `#21A676` | `#EDF9F5` | Fresh, calm |
| Sky | `#3297E6` | `#EEF6FE` | Clear, optimistic |
| Sunset | `#E2795B` | `#FFF3EF` | Warm, expressive |

Themes may alter:

- primary accent;
- canvas;
- decorative ornaments;
- illustration backgrounds.

Themes may not alter:

- category meaning;
- error meaning;
- parent approval status;
- financial amounts.

---

## 5.2 Typography

### Display

**Fredoka**

Use for:

- hero amounts;
- page titles;
- child-facing card titles;
- celebrations;
- friendly numerical highlights.

### UI

**Plus Jakarta Sans**

Use for:

- body copy;
- navigation;
- forms;
- financial details;
- teen dashboards;
- parent and school interfaces.

### Type scale

| Token | Little | Middle | Teen / Parent |
|---|---:|---:|---:|
| `display.hero` | 48 | 40 | 38 |
| `display.h1` | 30 | 28 | 26 |
| `display.h2` | 24 | 22 | 20 |
| `ui.title` | 20 | 18 | 17 |
| `ui.body` | 18 | 16 | 15 |
| `ui.label` | 15 | 14 | 13 |
| `ui.caption` | 13 | 12 | 12 |
| `ui.button` | 17 | 16 | 15 |

Values are in logical pixels.

### Typography rules

- Use sentence case.
- Keep child-facing sentences short.
- Do not put long text in all caps.
- Use stable-width or tabular figures for amounts.
- Use Indonesian thousands separator: `Rp50.000`.
- Never mix `Rp50.000`, `Rp 50,000`, and `IDR 50K` in one experience.
- Avoid text below 12 px.

---

## 5.3 Spacing

Base unit: **4 px**

| Token | Value |
|---|---:|
| `space.1` | 4 |
| `space.2` | 8 |
| `space.3` | 12 |
| `space.4` | 16 |
| `space.5` | 20 |
| `space.6` | 24 |
| `space.8` | 32 |
| `space.10` | 40 |
| `space.12` | 48 |

### Tier density

- Little: use 20–24 px internal spacing.
- Middle: use 16–20 px.
- Teen: use 12–20 px depending on information density.
- iPad: use 24–32 px column gaps.

---

## 5.4 Radius

| Token | Value | Use |
|---|---:|---|
| `radius.xs` | 10 | Chips |
| `radius.sm` | 14 | Inputs, small buttons |
| `radius.md` | 20 | Cards |
| `radius.lg` | 26 | Hero cards |
| `radius.xl` | 32 | Little illustration panels |
| `radius.full` | 999 | Pills and avatars |

Little may add 4 px to card radii. Teen may subtract 2–4 px.

---

## 5.5 Elevation

| Token | Shadow |
|---|---|
| `elevation.none` | none |
| `elevation.card` | `0 2px 4px rgba(42,35,66,.04), 0 8px 24px rgba(42,35,66,.06)` |
| `elevation.pop` | `0 8px 30px rgba(108,76,224,.24)` |
| `elevation.modal` | `0 20px 60px rgba(42,35,66,.28)` |
| `elevation.focus` | `0 0 0 3px rgba(108,76,224,.35)` |

Do not use deep black drop shadows.

---

## 5.6 Icon Tokens

- Default size: 24 px
- Little action icon: 32–40 px
- Middle action icon: 24–32 px
- Teen action icon: 20–24 px
- Stroke: 2 px
- Style: rounded outline
- Selected state: filled
- Minimum contrast: WCAG AA

Use custom icons for primary navigation. Emoji may only be used as optional pocket personalization or storytelling.

---

## 5.7 Motion Tokens

| Token | Duration |
|---|---:|
| `motion.fast` | 140 ms |
| `motion.standard` | 260 ms |
| `motion.money` | 520 ms |
| `motion.approval` | 420 ms |
| `motion.celebration` | 700 ms |

### Easing

- Standard: `cubic-bezier(.2,.8,.2,1)`
- Enter: `cubic-bezier(.16,1,.3,1)`
- Exit: `cubic-bezier(.4,0,1,1)`

### Motion principles

- Show source and destination when money moves.
- Do not imply that reallocation changes the total.
- Grow and Harvest use slower motion.
- Celebration motion must stop automatically.
- Respect reduced-motion preferences.

---

# 6. Responsive Layout

## 6.1 Breakpoints

| Name | Width |
|---|---:|
| Compact mobile | 320–389 |
| Standard mobile | 390–599 |
| Large mobile / small tablet | 600–767 |
| Tablet portrait | 768–1023 |
| Tablet landscape | 1024–1365 |
| Desktop prototype | 1366+ |

---

## 6.2 Mobile Shell

Use:

- top app bar;
- scrollable content;
- bottom navigation;
- floating Money action;
- bottom sheets for quick flows;
- full-screen push pages for complex flows.

Recommended content width:

- full width minus 16–20 px gutters.

---

## 6.3 iPad Shell

Do not stretch the mobile layout.

Use:

- left navigation rail: 80–96 px;
- optional expanded sidebar: 220–260 px;
- top context bar;
- 2–3 content columns;
- persistent secondary panel when useful;
- modal center sheets for confirmation;
- side sheet for details.

### iPad Home layout

Suggested columns:

1. **Primary column**
   - greeting;
   - next best action;
   - total balance;
   - category summary.

2. **Progress column**
   - dream goal;
   - mission;
   - learning insight.

3. **Family column**
   - parent approval;
   - recent activity;
   - settlement status.

Little iPad may use two columns with larger illustrations. Teen iPad may use three structured columns.

---

## 6.4 Content Grid

### Mobile

- 4-column invisible layout grid
- 16–20 px gutters
- 12–16 px gaps

### Tablet

- 8-column grid
- 24–32 px gutters
- 20–24 px gaps

### Desktop prototype

- 12-column grid
- max content width 1280 px
- 24–32 px gaps

---

# 7. Age-Tier Experience

## 7.1 Nummi Little

**Audience:** Kindergarten–Grade 1

### UI characteristics

- large mascot;
- large numbers;
- all balances visible on Home;
- maximum four primary categories visible;
- explicit labels;
- read-aloud support;
- minimal charts;
- more illustrations and ornaments;
- large touch targets;
- simplified language.

### Home priorities

1. New money or current action
2. All balance summary
3. Pakai / Simpan / Berbagi
4. Main dream
5. One playful story or mission
6. Parent waiting state

### Touch target

Minimum: **54 px**

### Do not use

- accordions;
- dense transaction tables;
- complex graphs;
- unlabeled icons;
- hidden balance by default;
- abstract investment language.

---

## 7.2 Nummi Middle

**Audience:** Grade 2–6

### UI characteristics

- mascot and story illustrations;
- financial category cards;
- visible target progress;
- missions;
- projections;
- simple cause-and-effect explanation;
- Grow introduced with parent context.

### Home priorities

1. Main decision
2. Total and categories
3. Goal progress
4. Mission
5. Parent approval
6. Recent activity

### Touch target

Minimum: **48 px**

---

## 7.3 Nummi Teen

**Audience:** Grade 7–9

### UI characteristics

- calmer visual style;
- less mascot presence;
- denser but structured cards;
- weekly summary;
- budget versus actual;
- planning;
- simulations;
- neutral insights;
- clearer Grow terminology.

### Home priorities

1. Weekly overview
2. Budget status
3. Unallocated money
4. Goal and savings
5. Insight
6. Pending decisions

### Touch target

Minimum: **46 px**

---

# 8. Navigation System

## 8.1 Child Navigation

Primary destinations:

1. Home
2. Money / Wallets
3. Missions
4. Journey / Progress

Central action:

- Add money
- Sort money
- Move money
- Request cash out

### Mobile

Use bottom navigation with four destinations and one central Money action.

### iPad

Use navigation rail with:

- icon;
- label;
- selected indicator;
- optional mascot badge.

---

## 8.2 Parent Navigation

Recommended destinations:

1. Overview
2. Requests
3. Children
4. Rules
5. Activity
6. Learning
7. Settings

Parent interface should be calmer and more utilitarian than the child interface.

---

# 9. Core Components

## 9.1 App Bar

Variants:

- child default;
- child with language and theme;
- parent;
- tablet;
- detail page.

Must support:

- avatar;
- title;
- notification/request indicator;
- language;
- theme;
- back action.

---

## 9.2 Nummi Guide Card

Purpose:

- display next best action;
- explain one concept;
- show parent waiting state;
- show a mission.

Anatomy:

1. mascot or icon;
2. eyebrow;
3. title;
4. one supporting sentence;
5. one primary action;
6. optional read-aloud.

Maximum body length:

- Little: 60 characters
- Middle: 100 characters
- Teen: 140 characters

---

## 9.3 Total Balance Card

Must show:

- recorded total;
- context label;
- category relationship;
- parent-as-bank note when needed.

### Little

Show total plus all category balances directly.

### Middle

May use segmented ring or category chips.

### Teen

May show weekly delta, but distinguish:

- ledger change;
- spending;
- new money;
- investment value movement.

Never label unrealized investment value as guaranteed profit.

---

## 9.4 Category Card

Categories:

- Pakai / Spend
- Simpan / Save
- Berbagi / Give
- Bertumbuh / Grow
- Uang Baru / Unsorted

Anatomy:

- semantic icon;
- category name;
- amount;
- supporting label;
- progress or sub-wallet count;
- optional illustration.

Category cards should always use the fixed category color.

---

## 9.5 Wallet / Pocket Card

Anatomy:

- icon or child-selected image;
- wallet name;
- balance;
- category;
- optional goal progress;
- optional parent status;
- context actions.

States:

- default;
- selected;
- empty;
- goal reached;
- locked;
- waiting for parent;
- archived.

---

## 9.6 Dream Goal Card

Anatomy:

- illustration;
- goal name;
- current amount;
- target amount;
- progress;
- estimated completion;
- one primary action.

Feedback example:

> Tambah Rp10.000. Sepedamu kini 54% tercapai.

Avoid generic messages such as:

> Hebat, kamu kaya!

---

## 9.7 Mission Card

Mission types:

1. Read
2. Reflect
3. Practice
4. Family discussion
5. Daily habit
6. School activity

Anatomy:

- mission type;
- title;
- estimated duration;
- learning objective;
- action;
- non-monetary reward;
- completion state.

Rewards should represent:

- knowledge;
- consistency;
- courage to discuss;
- completing a process.

---

## 9.8 Parent Approval Card

Anatomy:

- requested action;
- child;
- amount;
- source and destination;
- reason;
- timestamp;
- educational context;
- approve;
- discuss;
- decline.

Status labels:

- Menunggu orang tua
- Perlu dibicarakan
- Disetujui
- Sudah diselesaikan
- Tidak disetujui
- Kedaluwarsa

Use warm, non-threatening language.

---

## 9.9 Theme Picker

Themes:

- Berry
- Mint
- Sky
- Sunset

Use:

- color preview;
- theme name;
- selected indicator;
- accessible label.

Do not allow themes to recolor financial categories.

---

## 9.10 Amount Input

Anatomy:

- currency prefix;
- numeric input;
- quick amount chips;
- plus/minus stepper;
- available balance;
- validation;
- destination preview.

### Little

- use visual amount chips;
- large stepper;
- fewer digits at once;
- optional read-aloud.

### Middle and Teen

- free-form input;
- quick presets;
- clear source and destination.

---

## 9.11 Buttons

### Primary

- filled brand color;
- one per screen section;
- minimum AA contrast.

### Secondary

- brand tint;
- brand-deep text.

### Tertiary

- text or icon;
- no elevation.

### Destructive

- warning color;
- require explicit text;
- never use for ordinary spending.

### Button labels

Use verbs:

- Bagi uang
- Tambah
- Pindahkan
- Kirim ke orang tua
- Setujui
- Simpan rencana

Avoid vague labels:

- OK
- Lanjut
- Yes

unless context is unmistakable.

---

## 9.12 Chips and Badges

Types:

- category;
- status;
- mission type;
- theme;
- achievement;
- parent.

Badges should not become the primary source of financial meaning.

---

## 9.13 Sheets and Dialogs

### Bottom sheet

Use for:

- quick action selection;
- amount input;
- source/destination selection;
- confirmation.

### Full-screen flow

Use for:

- goal creation;
- Grow education;
- Harvest;
- complex parent rules;
- mission learning.

### Dialog

Use only for:

- irreversible actions;
- important parent confirmation;
- leaving an incomplete flow.

---

# 10. Financial Interaction Patterns

## 10.1 Add Money

Meaning:

Money is recorded into the child ledger.

Required fields:

- amount;
- source;
- note;
- destination or Unsorted;
- parent recorder.

Feedback:

- show destination;
- update total once;
- show who recorded it.

---

## 10.2 Sort Money

Meaning:

Move from Unsorted to Spend, Save, or Give.

Little:

- choose one large destination or simple split.

Middle:

- split with visible amounts.

Teen:

- split manually or apply a rule.

Invariant:

Total remains unchanged.

---

## 10.3 Move Money

Meaning:

Reallocate between liquid wallets.

Required display:

- source;
- destination;
- amount;
- source balance before;
- source balance after.

Avoid approval unless the family rule explicitly requires it.

---

## 10.4 Cash Out

Meaning:

Request real-world settlement from a parent.

Flow:

1. choose source;
2. choose amount;
3. provide reason;
4. send request;
5. parent approves;
6. parent completes real-world action;
7. ledger is reduced at the correct settlement point.

Do not reduce the ledger before the configured approval or settlement event.

---

## 10.5 Grow Inflow

Meaning:

Record money allocated to a real-world asset managed by a parent.

Must show:

- parent approval;
- asset type;
- amount;
- risk explanation;
- recorded, not held by Nummi.

---

## 10.6 Harvest

Direction:

`Grow → Save`

Must always show:

- parent approval;
- liquidation explanation;
- destination Save wallet;
- expected amount;
- possible difference in real value.

Harvest may not move directly to Spend or Give.

---

# 11. Illustration System

## 11.1 Style

- rounded 2.5D or soft 3D;
- large readable silhouettes;
- controlled detail;
- soft lavender shadows;
- warm highlights;
- paper-cut or soft toy feeling;
- no photorealistic finance imagery.

## 11.2 Decorative vocabulary

Approved ornaments:

- sprouts;
- leaves;
- coins;
- stars;
- soft sparkles;
- clouds;
- hearts;
- paths;
- hills;
- small flags;
- friendly shop and school objects.

## 11.3 Illustration worlds

| Category | World |
|---|---|
| Spend | Everyday Town |
| Save | Dream Island |
| Give | Kindness Garden |
| Grow | Growth Forest |
| Missions | Adventure Trail |
| Parent approval | Family Station |

## 11.4 Density by tier

| Tier | Illustration density |
|---|---|
| Little | High |
| Middle | Medium–high |
| Teen | Low |
| Parent | Very low |

Illustration must support comprehension and cannot cover amounts or actions.

---

# 12. Data Visualization

## 12.1 Little

Allowed:

- progress dots;
- coin rows;
- simple filled containers;
- illustrated progress paths.

Avoid:

- line charts;
- pie charts;
- percentage-heavy displays.

## 12.2 Middle

Allowed:

- progress bars;
- simple segmented ring;
- weekly comparison cards;
- goal timelines.

## 12.3 Teen

Allowed:

- bar chart;
- line chart;
- budget progress;
- category distribution;
- trend cards.

Rules:

- always label axes;
- provide text summary;
- avoid red/green alone;
- never imply prediction certainty;
- show recorded versus simulated data.

---

# 13. Content Design

## 13.1 Category naming — SAMA untuk ketiga tier

> **Diputuskan 29 Juli 2026 ([ADR-0017](decisions/0017-istilah-kategori-sama-lintas-tier.md)),
> menutup D2.** Bagian ini dulu memberi istilah berbeda per tier (Middle: *Belanja/Impian*, Teen:
> *Pengeluaran/Tabungan/Investasi*) dan merupakan **satu-satunya** sumber yang menyimpang dari
> brand §5.2, lembar karakter yang disetujui, dan kalimat posisi resmi. Sekarang mengikuti ketiganya.

| Model | Inggris (string UI, ADR-0016) | Indonesia (pasangan kamus) |
|---|---|---|
| Unsorted | **Unsorted** | Uang Baru |
| Spend | **Spend** | Pakai |
| Save | **Save** | Simpan |
| Give | **Give** | Berbagi |
| Grow | **Grow** | Bertumbuh |

Harvest bukan kategori melainkan tindakan, jadi ia tidak ada di lookup `[tier][kategori]`. Kamus
Indonesia **mempertahankan "Harvest"** sebagai istilah (`copy/id.ts`), dengan "dipanen" sebagai kata
kerjanya — bukan salah terjemah, melainkan supaya namanya sama di mata anak dan ortu.

**Kenapa tidak berubah menurut tier:** warna kategori sudah dikunci sebagai alat belajar yang tak
pernah berubah (§5.2 brand). Kalau warnanya jangkar tapi namanya bergeser tiap naik tier, anak yang
lulus dari Middle ke Teen harus belajar ulang nama benda yang sama — dan justru dialah yang sudah
punya kebiasaan paling melekat pada nama lamanya.

**Yang tetap boleh berbeda menurut tier:** nada kalimat, panjang penjelasan, dan tingkat detail
angka. Yang tidak boleh berbeda: **nama kategorinya**.

⚠️ Istilah ini **tidak pernah ditulis mati di komponen** — selalu lewat lookup `[tier][kategori]`
di `copy/`. Ketiga nilainya identik hari ini; strukturnya yang menjaga keputusan ini tetap murah
dibalik kalau uji pengguna Teen membantahnya.

## 13.2 Sentence rules

- One idea per sentence.
- Use active verbs.
- Explain consequences.
- Avoid guilt.
- Avoid guaranteed-return language.
- Avoid “kamu gagal.”
- Use “belum selesai” or “coba lagi.”

## 13.3 Error messages

Structure:

1. what happened;
2. why;
3. what the child can do.

Example:

> Saldo Pakai belum cukup. Kamu bisa memilih jumlah lebih kecil atau memindahkan uang dari Simpan.

---

# 14. Accessibility

## 14.1 Core requirements

- WCAG 2.2 AA target.
- Minimum contrast 4.5:1 for body text.
- Minimum contrast 3:1 for large text and functional graphics.
- Do not rely on color alone.
- Visible keyboard focus.
- Screen-reader labels.
- Reduced-motion support.
- Read-aloud support for Little.
- Logical focus order.
- Minimum touch targets by tier.

## 14.2 Numbers

- Screen readers should announce `Rp50.000` as “lima puluh ribu rupiah.”
- Do not split the currency prefix from the amount in accessibility labels.
- State whether the amount is recorded, available, pending, or simulated.

## 14.3 Illustration accessibility

Decorative illustrations:

- `aria-hidden=true`.

Meaningful illustrations:

- use concise alternative text.

---

# 15. Component States

Every interactive component should define:

- default;
- hover, for web;
- pressed;
- focused;
- selected;
- disabled;
- loading;
- success;
- waiting;
- error;
- empty.

Do not use opacity below 40% for disabled text that must remain readable.

---

# 16. Empty, Loading, and Error Patterns

## 16.1 Empty

Use mascot or Nummi Coin plus a useful next action.

Example:

> Belum ada impian. Mulai dari sesuatu yang ingin kamu capai.

## 16.2 Loading

Use:

- Nummi Coin rotation;
- sprout growth;
- skeleton cards.

Do not use endless mascot jumping.

## 16.3 Error

Use calm visuals and recovery actions.

Avoid alarming full-red pages for ordinary validation errors.

---

# 17. Design Token Example

## 17.1 TypeScript

```ts
export const colors = {
  brand: {
    purple700: "#4A32A8",
    purple500: "#6C4CE0",
    purple300: "#9A82F0",
    purple100: "#EDE7FC",
    purple050: "#F7F4FD",
  },
  category: {
    spend: { base: "#FF7A4D", tint: "#FFEDE5", deep: "#C24E24" },
    save: { base: "#2CA6E0", tint: "#E2F2FB", deep: "#1B6E97" },
    give: { base: "#F056A0", tint: "#FCE6F1", deep: "#B62C74" },
    grow: { base: "#2FC078", tint: "#E1F6EC", deep: "#1B7A4B" },
    unsorted: { base: "#8A7CF0", tint: "#ECE9FC", deep: "#5645B8" },
  },
} as const;
```

## 17.2 Spacing

```ts
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;
```

## 17.3 Radius

```ts
export const radius = {
  xs: 10,
  sm: 14,
  md: 20,
  lg: 26,
  xl: 32,
  full: 999,
} as const;
```

---

# 18. Recommended React Native Structure

```text
src/
├── design-system/
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── radius.ts
│   │   ├── elevation.ts
│   │   └── motion.ts
│   ├── primitives/
│   │   ├── Box.tsx
│   │   ├── Text.tsx
│   │   ├── Stack.tsx
│   │   ├── Icon.tsx
│   │   └── Pressable.tsx
│   ├── components/
│   │   ├── NummiButton.tsx
│   │   ├── GuideCard.tsx
│   │   ├── BalanceCard.tsx
│   │   ├── CategoryCard.tsx
│   │   ├── WalletCard.tsx
│   │   ├── GoalCard.tsx
│   │   ├── MissionCard.tsx
│   │   ├── ApprovalCard.tsx
│   │   ├── AmountInput.tsx
│   │   ├── StatusBadge.tsx
│   │   └── ThemePicker.tsx
│   ├── illustrations/
│   ├── mascot/
│   └── icons/
├── features/
│   ├── home/
│   ├── wallets/
│   ├── missions/
│   ├── progress/
│   ├── parent/
│   └── learning/
└── app/
```

---

# 19. Naming Conventions

### Components

Use PascalCase:

- `BalanceCard`
- `MissionCard`
- `ParentApprovalCard`

### Variants

Use explicit semantic names:

- `tier="little"`
- `category="save"`
- `status="waiting"`
- `theme="berry"`

Avoid:

- `variant="blue"`
- `type="card2"`
- `style="cute"`

### Assets

```text
mascot-welcome.png
mascot-thinking.png
mascot-waiting-parent.png
symbol-nummi-coin.svg
logo-nummi-horizontal.svg
icon-category-save.svg
illustration-dream-island-bike.png
```

---

# 20. Design Review Checklist

## Brand

- [ ] Uses kancil mascot, not pig imagery.
- [ ] Uses Nummi Coin as the primary symbol.
- [ ] Wordmark proportions are preserved.
- [ ] Category colors retain their meaning.

## Product

- [ ] Total ledger remains consistent.
- [ ] Real money and recorded money are clearly distinguished.
- [ ] Parent approval is visible when required.
- [ ] Grow is described as recorded and parent-managed.
- [ ] Harvest only flows to Save.

## Child experience

- [ ] Main action is clear.
- [ ] Copy matches the age tier.
- [ ] Touch targets meet the tier minimum.
- [ ] The child is not shamed.
- [ ] Learning is shown through action.
- [ ] Illustration supports comprehension.

## Accessibility

- [ ] Text contrast passes.
- [ ] Focus state is visible.
- [ ] Screen-reader labels are present.
- [ ] Motion can be reduced.
- [ ] Color is not the only signal.
- [ ] Amounts have accessible labels.

## Responsive

- [ ] Mobile is not simply scaled on iPad.
- [ ] Tablet uses multiple columns where useful.
- [ ] No text or amount is clipped.
- [ ] Modal and sheet behavior fits the device.
- [ ] Landscape and portrait layouts are reviewed.

---

# 21. Definition of Done

A Nummi screen is complete when:

1. it follows the approved brand system;
2. it uses the correct tier behavior;
3. it preserves the ledger invariant;
4. it clearly distinguishes recorded and real-world money;
5. it has one clear primary action;
6. it includes all component states;
7. it works on mobile and iPad;
8. it meets accessibility requirements;
9. its microcopy has been reviewed;
10. its motion explains rather than distracts;
11. it contains no pig imagery;
12. it passes child, parent, and product review.

---

# 22. Master Principle

> **Nummi tidak mengajarkan anak mengejar uang. Nummi membantu anak memberi makna pada setiap rupiah.**

Product interpretation:

> Every visual, word, and interaction should help a child understand what their money is for, what happens when they make a choice, and when a parent needs to help.
