# 09 — Explore comparison table

Status: in-progress — the page is built, the table inside it is not
Phase: 1

## Goal

`/explore` is the SDM conclusion node (ADR 0007); the filterable nine-treatment comparison
table is the body of a `Popup` launched from its CTA.

## Done

Page, architecture and `DrugSheetPopup` wiring (`Explore.tsx:314`): §9 bullets, the CTA opening
a `width="wide"` (1360px) `Popup`, and the class-grouped index into the seven §6 drug sheets.

## Remaining — the table itself

- The table is **not built**: placeholder text at `Explore.tsx:337-346`.
- `filterTreatments()` / `evaluateTreatments()` in `src/data/treatments.ts` have **zero
  callers**. Three dropdowns (class, hemophilia type, indicated-with-inhibitors) need
  `FilterSelect` (issue 03); columns Agent, MOA, Age, Route, Schedule, Monitoring; empty state.
- Horizontal scroll region inside the wide `Popup` still due (styling item 27) — precedents are
  `SeverityTable` and Table 1.
- **Open question:** a drug sheet opening over the table card — does the table close first, or
  do the two stack?
