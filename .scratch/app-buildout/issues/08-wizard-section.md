# 08 — Wizard section

Status: done (2026-08-04) — except one acceptance item (reset)
Phase: 1

## Outcome

The three-route branching flow ships: `/wizard` (three `OptionGroup` questions + gated Submit),
`/wizard/scenario` (per-scenario classes to consider), `/wizard/therapies` (the leaf — reason
heading, one-open Considerations/Strategies accordion, curated agent list in an `ArchBand`),
all behind `src/routes/wizard/Gate.tsx`. `therapies.test.tsx` sweeps all 16 (scenario, reason)
leaves against `recommend()`; the `+` buttons open `DrugSheetPopup` by component state (ADR
0006). ADRs 0003-0006, `docs/styling.md` §14-16.

## Open residues

- **Reset — designer's call.** `reset()` exists at `WizardAnswersProvider.tsx:45` but is never
  called: no artboard draws a reset control, so there is no affordance to wire it to.
- **The scenario illustration boxes open nothing**, though the caption says they do. No assets
  exist for the per-scenario panels, and of the five class labels **"Gene therapy" has no
  education chapter, pop-up or authored copy anywhere** — a best-effort wiring leaves one box
  dead. Needs the designer to say what a box opens.
- Bands, arch and the scenario box row draw 1216px against `max-w-content`'s 1168 —
  rail-clearance divergence, wants one ruling covering both (styling item 23).
- The two therapies exports disagree on inter-bullet spacing in the note panels; shipped at 0
  (styling item 22).
