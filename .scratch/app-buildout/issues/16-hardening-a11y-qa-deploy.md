# 16 — Hardening: a11y · QA · content proof · deploy

Status: ready-for-human
Phase: 4
Blocked by: 15
Gate: —

## Goal

Final hardening and production deploy.

## Scope

- Accessibility audit (keyboard, screen reader, contrast, focus order) — CME activities
  carry a11y expectations.
- Cross-browser + responsive QA.
- Content proof of every section against CONTEXT.md.
- Swap the real survey target into the adapter (issue 06) once the destination is
  defined.
- Verify analytics events (issue 07); `npm run build` → deploy `dist/` to the static host.

## Acceptance

- a11y audit passes; content matches CONTEXT.md; real survey submissions land;
  production build deployed and routes resolve (catch-all rewrite verified).

## Notes

Survey-target swap here depends on the destination decision being made by this point.
