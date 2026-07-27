# 10 — Drug info sheets (modal overlay via `?drug=` param)

Status: ready-for-human
Phase: 1
Blocked by: 00, 01, 02, 03
Gate: Gate 1 (client wireframe approval)

## Goal

Per-drug info sheets launched from drug buttons throughout the app.

## Scope

- Render as `Modal` (issue 03) as an overlay on the current route, driven by a
  `?drug=<id>` query param (e.g. `/explore?drug=marstacimab`, `/wizard?drug=concizumab`).
  There is **no** standalone `/drugs/:id` page — the sheet always renders over whatever
  page you're on (see issue 01).
- Content from `src/data/drug-sheets.ts` (issue 00): Class/Target, Indication, Dosage &
  Administration, Monitoring, Clinical Trials (NCT #s).
- Group by class as Tabs where the blueprint shows tabbed sheets.
- Openable from wizard leaves (08), explore table (09), and education class cards (11) —
  each appends `?drug=<id>` to the current location; opening/closing is a history entry.

## Acceptance

- Setting `?drug=<id>` on any route opens the correct sheet as an overlay over that page;
  closing removes the param and returns to the underlying page (back button also closes).
- Refreshing a URL with `?drug=<id>` re-opens the sheet over the current route.
- Every drug id resolves; unknown/absent id → no sheet (graceful, no bare page).

## Notes

Blueprint purple sticky: sheets "can be displayed however you determine is best" — a
query-param modal overlay is our chosen approach. Deliberately not a standalone
`/drugs/:id` route: a drug sheet is contextual, never a destination page.
