# 01 — Router + app shell / navigation

Status: done (2026-07-27)
Phase: 0
Blocked by: —

## Goal

Replace the placeholder `src/App.tsx` with a routed app shell: the ten routes of the
linear-walkthrough navigation model (see `docs/adr/0001-linear-walkthrough-navigation.md`),
each rendering a placeholder section stub, plus the canonical section-order data module the
Prev/Next sidebar will consume.

**Not in scope:** the styled sidebar itself (Prev/Next buttons + jump buttons). That is
issue 18, built in Phase 1 against the Gate-1 wireframe. Issue 01 ships only minimal
semantic landmarks so routes are navigable for testing.

## Scope

- Add `react-router` (v7 unified package). Use the **data router**: `createBrowserRouter`
  with a route config, mounted via `<RouterProvider>` in `src/main.tsx` (keep the existing
  optional GA init in `main.tsx`). `vercel.json` catch-all rewrite is already in place.
- **Delete** the placeholder `src/App.tsx` **and** `src/App.test.tsx` (its only assertion is
  the starter heading). The router config replaces `App`.
- **Per-route stub files** under `src/routes/` — one file per route so the seven Phase 1
  content issues each own exactly one file with zero router churn:
  - `AppShell.tsx` — layout route element: `<header><nav>…</nav></header> <main><Outlet/></main>`,
    semantic landmarks only. Minimal placeholder nav links (temporary, replaced by issue 18's
    sidebar). Layout-only utilities — **no color, no brand styling, no dependency on issue 02.**
  - `router.tsx` — `createBrowserRouter` config.
  - Section stubs: `Landing.tsx` (issue 17), `Education.tsx` (issue 11, reads `:section`),
    `Wizard.tsx` (08), `Explore.tsx` (09), `Resources.tsx` (12), `Survey.tsx` (13),
    `Glossary.tsx` (12), `Acronyms.tsx` (12), `References.tsx` (12), `NotFound.tsx`.
- **Routes** (10 + fallback):
  - **In the linear flow:** `/` · `/education/:section` · `/wizard` · `/explore` ·
    `/resources` · `/survey`
  - **Off the line** (own route, own sidebar button, not in Prev/Next):
    `/glossary` · `/acronyms` · `/references`
  - **Fallback:** `*` → `NotFound`
- `/` renders a standalone **landing page** stub (design/build is issue 17) — **not** a
  redirect to `/education`.
- **`/education`** is a multi-chapter module with subroutes `/education/:section`, sections
  `disease-background`, `treatment-landscape`, `rebalancing-agents`, `fviiia-mimetics`
  (the last two are wizard cross-link targets, so their URLs must be stable). Bare
  `/education` **redirects to `/education/disease-background`** (no overview page). An
  **unknown `:section`** falls through to the global `NotFound` (one fallback everywhere).
- **`/wizard`** is intentionally a single route — all wizard state (type → inhibitor →
  reason → recommendation) is computed in-page, no per-step subroutes.
- **`src/data/sectionOrder.ts`** — the canonical linear order as an array, plus `prevOf(path)`
  / `nextOf(path)` resolvers. Single source of truth for the walkthrough; issue 18's sidebar
  consumes it. Order:
  `/` → the four `/education/:section` chapters (in the order above) → `/wizard` → `/explore`
  → `/resources` → `/survey`. The three off-line pages are **not** in this array.

## Acceptance

- All 10 routes plus `/education/:section` resolve and render a placeholder stub.
- Bare `/education` redirects to `/education/disease-background`; unknown `:section` →
  `NotFound`; unknown top-level route → `NotFound`.
- Placeholder nav links navigate without full reload.
- `sectionOrder.ts` exports the order array + `prevOf`/`nextOf`; covered by a unit test
  (e.g. `nextOf("/wizard") === "/explore"`, `prevOf("/") === undefined`, off-line paths
  are absent).
- `npm run build` type-checks clean; `npm run lint` clean; `npm test` green.

## Notes

Drug sheets are **modal overlays via `?drug=<id>`** on the current route, rendered over
whatever page you're on — there is no standalone `/drugs/:id` page. Issue 01 does **not**
scaffold the overlay; **issue 10** adds the overlay mount point to `AppShell.tsx` and its
content. Keep this in mind when structuring `AppShell` so that later edit is clean.

The persistent nav here is a **temporary** placeholder. The real navigation is a sidebar
with Prev/Next + jump buttons (Home, Wizard, Glossary, Acronyms, References) — see
`docs/adr/0001-linear-walkthrough-navigation.md` and issue 18.
