# 08 — Wizard section

Status: ready-for-human
Phase: 1
Blocked by: 00, 01, 02, 03
Gate: Gate 1 (client wireframe approval)

## Goal

Build the branching decision-tree section at `/wizard` — the meatiest, highest-value
screen.

## Scope

- Flow: Q1 Hemophilia A or B → Q2 inhibitors (Yes/No) → Q3 reason for switching
  (adherence / treatment burden / bleeding control / monitoring) → leaf recommendation.
- Leaf renders the curated NFT list from `recommend(type, hasInhibitors, reason)` in
  `src/data/wizard.ts` plus the scenario's pop-up note pair.
- V3 requirement: each reason box gets **Considerations / Strategies tabs** (data from
  issue 00, Tabs primitive from issue 03). Note (per 2026-07-27 re-scan, `CONTEXT.md` §4.2):
  the note text is **scenario-specific** — the leaf shows _this scenario's_ Considerations list
  **and** Strategies list, one per tab (32 notes total across the tree), not a single shared
  per-reason note.
- Wizard state machine: forward/back/reset; answers as `RadioCard` (issue 03).
- Structural + semantic tokens only; behavior fully wired.

## Acceptance

- All 4 scenarios (HA/HB × ±inhibitors) reach correct curated leaf, verified against
  `wizard.ts`.
- Back/reset work; drug names in the leaf open the drug-sheet overlay by appending
  `?drug=<id>` to `/wizard` (issue 10) — no navigation away from the wizard.
- Tests cover the branch → recommendation mapping.

## Notes

Structural build starts after Gate 1. Do not block on final styling.

## Comments

**2026-08-03 — the question screen landed; the two pages past it are placeholders.**
Built from the `/wizard` artboard (two exports: nothing chosen, all three answered).

What shipped:

- `/wizard` — the three questions as `OptionGroup`s, with a Submit button that is disabled
  until all three are answered and then navigates to `nextOf("/wizard")`.
- `src/components/OptionGroup.tsx` — **this issue's `RadioCard`, renamed and skinned**
  rather than headless, under the precedent issue 03's own comment set for `Popup`: the
  design arrived before the primitive, and a skin with one consumer does not need a seam.
  Real `<input type="radio">` behind styled labels, so the platform owns arrow keys and the
  one-of-N rule; clicking the chosen option again clears it. Geometry and the four states
  in `docs/styling.md` §14.
- `/wizard/scenario` and `/wizard/therapies` — placeholder pages, added to `SECTION_ORDER`,
  guarded by `WizardGate`. `scenario` is where `CLASSES_TO_CONSIDER` goes; `therapies` is
  the leaf this issue's scope describes (recommendations + the Considerations/Strategies
  tabs). **Neither is built** — the Tabs primitive and those two designs are still to come.
- Session-scoped answers above the shell, and the sidebar's Next arrow gated on `/wizard` to
  agree with Submit. Rationale: `docs/adr/0003-session-scoped-wizard-answers.md`.

Copy note: the artboard renames Q1 and Q3 and sets the four reasons in the imperative, in a
different reading order from the blueprint's. Both forms now live in `wizard.ts`
(`label` / `sourceLabel`); CONTEXT.md §4 records the split.

Against this issue's acceptance criteria:

- _All 4 scenarios reach the correct curated leaf_ — **not yet**: the leaf is a placeholder.
  `recommend()` is unchanged and still covered by `content.test.ts`.
- _Drug names open the `?drug=` overlay_ — **not yet**, same reason (issue 10).
- _Back works_ — yes, via the spine's Prev.
- _Reset works_ — **knowingly unmet.** The artboard draws no reset control; per-group
  deselect clears one answer at a time, and the provider exposes an uncalled `reset()`. Needs
  a designed affordance before it can land.

**2026-08-03 — `/wizard/scenario` built; `/wizard/therapies` is still the placeholder.**
Built from four artboard exports, one per scenario.

What shipped:

- `/wizard/scenario` — the scenario's own title as the `<h1>`, a lead sentence, the class
  bullets, the HB +inhibitors caveat, and the captioned row of illustration boxes. Nothing is
  composed from the answers beyond `scenarioKey()`: the four screens disagree with each other
  in ways a template would have flattened.
- `src/data/wizard.ts` — `ClassesToConsider` gained `title`, `lead` and `caption`, required so
  the compiler makes all four scenarios supply them. Twelve strings transcribed. Two source
  reconciliations, both recorded in CONTEXT.md §4: `A-with`'s second class label goes plural
  ("Hemostatic rebalancing agent**s**") on the artboard-wins rule, and the exports' double
  spaces are treated as justification artifacts rather than copy.
- `src/lib/formatInline.tsx` — `_em_` / `**strong**` inside a transcribed string. The four
  leads italicise the polarity word, which is the one word distinguishing two otherwise
  near-identical sentences, and nothing in the app had ever emphasised a run _inside_ a
  sentence before. `docs/adr/0004-inline-emphasis-in-transcribed-copy.md` records why the
  markup is in the string rather than in the shape of the data.
- `BulletList` gained a `format` seam for it, defaulting to the plain string.

Verified in Chromium at 1440 across all four scenarios, not just jsdom: boxes land at
227 × 185, the caption flips below the boxes on the single-box screen, and no screen
scrolls horizontally.

**Spacing was then normalised onto the Tailwind scale**, which moved four measured values
by a step: the box gap 119 → 120 (`gap-x-30`), the prose-to-block rhythm 164 → 160
(`mt-40`), and on `/wizard` the Submit padding 25 → 24 (`px-6`) and the pill padding
13 → 12 (`py-3`). One moved further: `OptionGroup`'s cap went 870 → 900 (`max-w-225`),
which the two grid columns absorb, so **the answer pills now draw 440 × 56 against the
artboard's 425 × 56** — same two-equal-pills-20px-apart shape, 15px wider each. All five
comments were rewritten to state the values in the file rather than the ones measured off
the export. Worth a look at the styling gate alongside the two divergences below.

Against this issue's acceptance criteria — unchanged from the comment above. This page is
the class-level step, not the leaf; `recommend()` is still not called by any page.

**Knowingly unmet, and blocked on the designer:**

- _The boxes open nothing._ The caption says they do. No asset exists for any of the
  per-scenario illustration panels (CONTEXT.md §7.7 marks all 24 §7 figures image-borne), and
  of the five distinct class labels only two — FVIIIa mimetics and hemostatic rebalancing
  agents — have an education chapter to point at. **"Gene therapy" has no chapter, no pop-up
  and no authored copy anywhere in the project**, so even a best-effort wiring would leave
  one box dead. Needs the designer to say what a box opens; this is the same state
  `education/rebalancing-agents` has been in since it shipped.
- _The box row is centred on the content column_, where the artboards centre it on the full
  1440 canvas — about 24px apart. The drawing does not account for the sidebar rail the way
  `AppShell` does, and honouring its number would mean breaking the block out of the column
  it sits in. Worth confirming at the styling gate.
- _Box geometry is one set of numbers for four screens._ The exports disagree with themselves
  (166/181/185 tall at ~230 wide; gaps of 119 and 186), which reads as hand-placed rectangles
  standing in for artwork rather than as a rule. Settled at the 227 × 185 that
  `rebalancing-agents` already records for its own placeholder boxes.

**Follow-up, not blocked:** `education.ts` ships `F8`/`F9` flat where nomenclature convention
and CONTEXT.md §7.2/§7.3 set them italic. ADR 0004 makes that a data-only fix now, but it was
not taken here — those chapters came from their own artboards and it has not been checked
whether the designer set them italic.

**2026-08-04 — `/wizard/therapies` built. This issue's leaf is done.**
Built from two artboard exports of the same leaf (HB with inhibitors, improving bleeding
control), one per open note block.

What shipped:

- `/wizard/therapies` — the reason's imperative `label` as the `<h1>`, the scenario's
  Considerations/Strategies pair as a **one-open accordion**, and the curated agent list
  in the arch below under the blueprint's own "Novel therapies to consider if [reason] is
  the primary reason for switching therapies:" sentence (built from `sourceLabel`, not
  `label` — the page is the reason both fields exist).
- `src/components/ArchBand.tsx` — the arch, extracted on its second caller the way
  `BrandLoop` was: the `rounded-t-[300px]` box, the `BrandLoop` backdrop, the crimson
  wash and the centred `text-h2`. `DisclosureBand` now builds on it and keeps its 3-tuple
  and its Popup wiring; the therapies band supplies its own 2–5 item row. Dropped a dead
  `-border-offset-4` class in the process (not a Tailwind utility; compiled to nothing).
- `src/data/wizard.ts` — `NoteBlock.points` is `Bullet[]`, and the four `treatment-burden`
  Considerations notes now nest their age restrictions under the colon-terminated lead-in.
  **Recovered from `documents/out.txt`'s column positions** (top level 1755, children
  1763), which is also what keeps HB −inhib's gene-therapy bullet out of the nest.
  CONTEXT.md §4.2 records it; `treatment-wizard-demo.html` was updated to match.
- `docs/adr/0005-one-open-leaf-accordion.md` — why exactly one is open, why the open
  header is `aria-disabled` rather than `disabled`, and why the source's own "2 buttons or
  tabs" wording did **not** become ARIA tabs (the first artboard draws the open panel
  _between_ the two headers, which is not that pattern).
- `docs/styling.md` §15 — the full measurement record, including the least-squares fit
  that put the panel fill on `teal-25/30` rather than the `--color-figure-note` it looks
  like. Three new open items (21–23).

Verified in Chromium at 1440 across four agent counts, not just jsdom: bands 43px at the
sampled palette steps, panels 141/337px against the drawn 152/335, the arch pinned at the
same y in both states as the artboards show, button centres evenly spaced at 2–5 agents,
no horizontal overflow, and `prefers-reduced-motion` dropping both transitions.

Against this issue's acceptance criteria:

- _All 4 scenarios reach the correct curated leaf, verified against `wizard.ts`_ —
  **met.** `therapies.test.tsx` sweeps all sixteen (scenario, reason) leaves against
  `recommend()`, asserting both note titles and every agent caption, and that no
  recommendation is unresolved.
- _Tests cover the branch → recommendation mapping_ — **met**, same sweep.
- _Back/reset work_ — Back yes, via the spine's Prev. Reset **still knowingly unmet**: the
  artboards draw no reset control, and `reset()` stays uncalled. Unchanged from the
  2026-08-03 comment.
- _Drug names open the drug-sheet overlay by appending `?drug=<id>`_ — **knowingly unmet,
  and the last thing this issue is waiting on.** The `+` buttons are drawn and toggle to
  ✕, but open nothing and carry no `aria-haspopup`, which is the state
  `education/fviii-mimetics` records for its own card-less disclosure. `DRUG_SHEETS`
  has all six recommendable agents ready; what is missing is issue 10's routing decision
  about where a sheet lives and what closing one does to history, and pre-empting it here
  would have settled it by accident. `therapies.test.tsx` has a test asserting the absent
  `aria-haspopup` — it is meant to fail when issue 10 lands.

**2026-08-04 — the `+` buttons open their drug sheets. This issue's last criterion is met.**
Built from seven artboard exports, one per §6 sheet.

What shipped:

- `src/components/DrugSheetPopup.tsx` — the §6 card, owning its `Popup` rather than being a
  body a page wraps (which is what the four §7.5 agent cards are). Reasoning in that file
  and in issue 10: a drug sheet is due on three surfaces, and what it is _called_ is a
  property of the drug, not of the page. Handed `agent: string | null`; an unknown name
  opens nothing, the posture `DisclosureBand` takes for a content-less disclosure.
- `/wizard/therapies` — `openAgent` stopped gating only the ✕ glyph and now drives the card;
  every `+` carries `aria-haspopup="dialog"`, unconditionally, because every agent
  `recommend()` can name has a sheet and `content.test.ts` asserts it.
- `src/data/drug-sheets.ts` — three optional fields for the three per-sheet deviations the
  artboards draw, Denecimig's TBD qualifier promoted from bullet to heading, `2 × 10¹³` in
  Unicode, and the trial citation tails cut per client direction (see issue 10).
- `docs/adr/0006-component-state-drug-sheets.md` — why this is component state and not issue
  10's `?drug=` overlay. The short version: `WizardGate` redirects a cold deep link off this
  very page, so the param's own acceptance criteria were unreachable here.
- `docs/styling.md` §16 — the measurement record. Two new open items (24, 25).

Verified in Chromium at 1440 across two leaves, not just jsdom: labels compute to
`rgb(214, 58, 82)` at 20px/700 exactly as measured off the exports, the gaps land at the
intended +8 / +12, and the card's scroll region actually engages on the three tallest sheets
(824 / 792 / 728px of content in 673) — which is the thing jsdom is blind to. `dialog:modal`
with focus inside, no horizontal overflow at 1440 or 390.

Against this issue's acceptance criteria:

- _Drug names in the leaf open the drug-sheet overlay_ — **met**, by component state rather
  than by `?drug=`. `therapies.test.tsx`'s "promises no dialog, because none opens yet" is
  gone, replaced by a sixteen-leaf sweep of `aria-haspopup="dialog"` plus open/close/swap
  tests. That test was written to fail when this landed, and it did.
- _Reset_ — **still knowingly unmet**, unchanged: the artboards draw no reset control and
  `reset()` stays uncalled.

**For the styling gate**, alongside the two divergences the 2026-08-03 comment lists:

- The bands and arch are drawn 1216px wide against `max-w-content`'s 1168 — the same
  rail-clearance divergence as `/wizard/scenario`'s box row, and it wants one ruling
  covering both (styling open item 23).
- The two exports disagree about inter-bullet spacing in the note panels; shipped at 0
  (open item 22).
