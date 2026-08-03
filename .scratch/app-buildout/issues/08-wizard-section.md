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
