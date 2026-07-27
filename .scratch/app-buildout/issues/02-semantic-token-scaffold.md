# 02 — Semantic design-token scaffold in tokens.css

Status: ready-for-agent
Phase: 0
Blocked by: —

## Goal

Define the semantic token layer that lets Phase 1 build unstyled and Phase 3 fill in
the client palette/type with near-zero markup churn.

## Scope

- In `src/styles/tokens.css` `@theme`, define **semantic** tokens (not raw colors):
  surface/background, heading/body/muted text, border, brand/accent, state colors
  (focus, error, success), plus a spacing/typographic scale.
- Placeholder values now (neutral greys + system type); real palette/type arrive at
  Gate 2 (issue 14).
- Document the token vocabulary so all Phase 1 work uses `bg-surface`, `text-heading`,
  etc. — never `bg-white`/`text-slate-900`.

## Acceptance

- Tokens compile to Tailwind utilities and render.
- A short token reference exists (comment block in tokens.css or a note here).

## Notes

This is the styling seam. Phase 3 should be "fill token values," not "rewrite markup."
