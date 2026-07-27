# 01 — Router + app shell / navigation

Status: ready-for-agent
Phase: 0
Blocked by: —

## Goal

Replace the placeholder `src/App.tsx` with a routed app shell for the six top-level
sections.

## Scope

- Add `react-router` (see `CONTEXT.md`/CLAUDE.md — `vercel.json` catch-all rewrite is
  already in place for client routes).
- Routes: `/education` (index), `/wizard`, `/explore`, `/drugs/:id`, `/resources`,
  `/survey`. Decide index redirect (`/` → `/education` or a landing).
- Persistent nav shell (header/nav + `<Outlet/>`), semantic landmarks
  (`<header> <nav> <main>`).
- Structure only — semantic tokens, no brand styling.

## Acceptance

- All six routes resolve and render a placeholder section component.
- Nav links navigate without full reload; unknown route → sensible fallback.
- `npm run build` type-checks clean; `npm run lint` clean.

## Notes

Drug sheets render as modals but own a real route (`/drugs/:id`) so they are
deep-linkable — coordinate with issue 10.
