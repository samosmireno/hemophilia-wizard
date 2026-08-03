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
227 × 185 with the drawn 119px gaps, the 164px prose-to-block rhythm is exact, the caption
flips below the boxes on the single-box screen, and no screen scrolls horizontally.

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
