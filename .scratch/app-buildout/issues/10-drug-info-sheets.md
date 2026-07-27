# 10 — Drug info sheets (modal-over-route)

Status: ready-for-human
Phase: 1
Blocked by: 00, 01, 02, 03
Gate: Gate 1 (client wireframe approval)

## Goal

Per-drug info sheets launched from drug buttons throughout the app.

## Scope

- Render as `Modal` (issue 03) over a real route `/drugs/:id` so sheets are
  deep-linkable/shareable.
- Content from `src/data/drug-sheets.ts` (issue 00): Class/Target, Indication, Dosage &
  Administration, Monitoring, Clinical Trials (NCT #s).
- Group by class as Tabs where the blueprint shows tabbed sheets.
- Openable from wizard leaves (08) and explore table (09).

## Acceptance

- Visiting `/drugs/:id` directly opens the correct sheet; closing returns to prior route.
- Every drug id resolves; unknown id → graceful fallback.

## Notes

Blueprint purple sticky: sheets "can be displayed however you determine is best" —
modal-over-route is our chosen approach.
