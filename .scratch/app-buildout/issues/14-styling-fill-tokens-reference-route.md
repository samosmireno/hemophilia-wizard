# 14 — Styling: fill tokens + reference route

Status: needs-info
Phase: 3
Blocked by: 02, 08, 09, 10, 11, 12, 13
Gate: Gate 2 (client palette + typography delivered/approved)

## Goal

Kick off the design-inclusive styling pass by filling tokens and fully styling one
reference route.

## Scope

- Fill `tokens.css` `@theme` with the client's approved **palette + typography**
  (issue 02 defined the semantic slots).
- Since there are **no hi-fi comps**, agree a small internal visual language: spacing
  rhythm, color roles, elevation, one styled reference route (recommend `/wizard`).
- Get the reference route approved before propagating (issue 15) — cheaper than styling
  all six then reworking.

## Acceptance

- Palette/type live as token values; reference route fully styled and client-approved.

## Notes

Status `needs-info` until the client delivers palette + typography (Gate 2). Blocked
also on the Phase 1 sections existing to style.

**Gate 2 palette + typography delivered (2026-07-27).** Both halves are now in `tokens.css`:
the raw color palette (`--color-brand-<name>-<step>` — teal/crimson/slate/lagoon/sand ×
0/25/50/75/100) **and** the type system (`--font-sans` = DM Sans, `--font-display` = Barlow
Condensed, self-hosted via `@fontsource`; bundled `--text-*` scale h1–h4/body/small with
weight + line-height). This issue's remaining "fill tokens" work is now purely mapping the
**semantic** slots from issue 02 onto these raw color + type tokens — no new design values
outstanding. Colors are defined but deliberately unwired; DM Sans is the app default font.
