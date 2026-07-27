# 09 — Explore comparison table

Status: ready-for-human
Phase: 1
Blocked by: 01, 02, 03
Gate: Gate 1 (client wireframe approval)

## Goal

Build the filterable comparison table at `/explore` (the xlsx-origin "filterable table"
feature).

## Scope

- Three dropdown filters: Treatment class, Hemophilia type (A/B/A+B), Indicated with
  inhibitors (Yes/No) — `FilterSelect` primitive (issue 03).
- Result grid driven by `filterTreatments()` / `evaluateTreatments()` in
  `src/data/treatments.ts`; columns: Agent, MOA, Age, Route, Schedule, Monitoring.
- Empty/no-match state; agent names link to drug sheets (issue 10).
- Structural + semantic tokens only.

## Acceptance

- Filter combinations produce correct rows, verified against `treatments.ts`.
- Responsive table (horizontal scroll container on narrow viewports).

## Notes

SECONDARY engine (computed filter), distinct from the wizard's authored lookup.
