# 11 — Education blocks

Status: done except residues
Phase: 1

## Outcome

All five `/education/:section` chapters ship in `src/routes/education/` —
`DiseaseBackground`, `TreatmentLandscape`, `RebalancingAgents`, `FviiiMimetics`, plus the
net-new `ProphylaxisGuidance`. `SEVERITY_TABLE`, `TREATMENT_OPTIONS_MATRIX` and the
NXT007/Inno8 emerging-agents block all render. Click-through figures open in-chapter `Popup`s
(`ExpandableFigure`, `DisclosureBand`, `PopupFigure`); the clotting-cascade card's notes and
conclusion live as text in `education.ts`. Geometry in `docs/styling.md` §11 and §13.

## Remaining

- **Glossary cross-links are unwired** — blocked on issue 12.
- **`RebalancingAgents.tsx:280-289` — the three figure boxes are empty `div`s**, and the
  caption above them tells the reader to click them. The designer must name what each box
  opens (no assets, and §7.7 names no target). Styling item 16.
- **Figure assets: 11 of ~24** landed; the rest of §7.7 is image-borne and unsupplied.
- Drug-sheet wiring for the chapters' agent names/cards → issue 10 (a design decision).
- Body type sizes disagree between chapters (one transcribes, others snap to the scale) —
  one call applied backwards to all → styling item 9.
- 2026-08-06: `ExpandableFigure`'s touch-only "⊕ Tap to enlarge" badge is net-new visible UI
  no artboard draws — put it to the client at the next visual review, alongside the
  mlg-reskin all-five check.
