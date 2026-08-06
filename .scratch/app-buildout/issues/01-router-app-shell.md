# 01 — Router + app shell / navigation

Status: done (2026-07-27)
Phase: 0

## Outcome

`react-router` v7 data router in `src/routes/router.tsx`, mounted from `main.tsx`;
`AppShell.tsx` is the layout route. Ten routes plus `/education/:section` resolve, each with
its own stub file under `src/routes/`; bare/unknown `:section` → `disease-background`, unknown
top-level → `/`, no not-found page. `src/data/sectionOrder.ts` holds the canonical linear
order with `prevOf`/`nextOf`. Placeholder `App.tsx`/`App.test.tsx` deleted.
