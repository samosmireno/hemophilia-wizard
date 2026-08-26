# 08 — Wizard section

Status: done (2026-08-04; the reset acceptance item closed 2026-08-25)
Phase: 1

## Outcome

The three-route branching flow ships: `/wizard` (three `OptionGroup` questions + gated Submit),
`/wizard/scenario` (per-scenario classes to consider), `/wizard/therapies` (the leaf — reason
heading, one-open Considerations/Strategies accordion, curated agent list in an `ArchBand`),
all behind `src/routes/wizard/Gate.tsx`. `therapies.test.tsx` sweeps all 16 (scenario, reason)
leaves against `recommend()`; the `+` buttons open `DrugSheetPopup` by component state (ADR
0006). ADRs 0003-0006, `docs/styling.md` §14-16.

## Open residues

- ~~**Reset — designer's call.** `reset()` exists at `WizardAnswersProvider.tsx:45` but is never
  called: no artboard draws a reset control, so there is no affordance to wire it to.~~
  **Closed 2026-08-25** — the client asked for it directly. See Comments.
- ~~**The scenario illustration boxes open nothing**, though the caption says they do. No assets
  exist for the per-scenario panels, and of the five class labels **"Gene therapy" has no
  education chapter, pop-up or authored copy anywhere** — a best-effort wiring leaves one box
  dead. Needs the designer to say what a box opens.~~ **Closed 2026-08-12** — the ruling came:
  each box opens the §5 comparison table cut to its class, with no filter dropdowns
  (`ClassTablePopup` → `classFilterFor` → `TreatmentGrid`). See Comments.
- Bands, arch and the scenario box row draw 1216px against `max-w-content`'s 1168 —
  rail-clearance divergence, wants one ruling covering both (styling item 23).
- The two therapies exports disagree on inter-bullet spacing in the note panels; shipped at 0
  (styling item 22).

## Comments

**2026-08-12 — the boxes are wired.** The user ruled what a box opens: the §5 comparison
table pre-filtered to the box's class, with **no selectable filters** — the box already chose
the class, so the type/inhibitor dropdowns would only let the view contradict its title. The
full filterable table remains `/explore`'s.

Implementation: `TreatmentGrid` extracted from `ExploreTable` (same nine columns, same
geometry); new `ClassTablePopup` (DrugSheetPopup's contract) resolves the clicked label
through `classFilterFor` in `src/data/explore.ts` — both factor-replacement labels
("Recombinant FVIII concentrates", "FIX prophylaxis") share the UHL bucket, both mimetic
wordings share the FVIII bucket, the other two match by name. No fixed `h-[75dvh]` frame:
that frame exists so _filtering_ can't resize the card, and these rows never change.
`content.test.ts` pins the label→bucket join total over `classesFor`; `scenario.test.tsx`
pins each box's dialog, rows, filterlessness and wide width. CONTEXT.md §4's "boxes open
nothing" block rewritten to record the wiring.

---

**2026-08-25 — reset shipped.** Client ask: "on wizard page, add a reset input button too".
`WizardReset` (`src/components/WizardReset.tsx`) sits at the start of the Submit row through a new
leading slot on `WizardSubmit` (stacked over Submit on one shared track below `sm`), wears Submit's
lagoon skin (now one shared string, `src/components/wizardButton.ts`, which `Survey` imports too),
is disabled until anything at all is answered, and calls the provider's `reset()` on click — all
three answers. An "Are you sure?" prompt (`ConfirmDialog` on `ModalLayer`) was built with it and
removed the same day on client direction; it is in the git history, not the tree.
`/wizard/reason` deliberately has no reset. Tests in `wizard.test.tsx`. Docs: styling §29 +
item 57, ADR 0003 amended. Nothing tracks in GA4 — a `wizard_reset` event would need the console
step in `docs/analytics.md`; not asked for.

**2026-08-26 — phone stack flipped.** Below `sm` the row stacked Reset over Submit (its DOM order,
left becoming top), which put the destructive twin first in reading order. `WizardSubmit` now
renders Submit first in the DOM at every width — the stack reads Submit over Reset and the tab after
the last radio lands on Submit — with the slot's `sm:order-first` keeping Reset-left/Submit-right
from `sm`. Re-measured at 375/480/600/640/1440: every §29 number unchanged. Styling §29 + item 57,
ADR 0003 touched.
