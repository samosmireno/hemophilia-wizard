# 14 — Styling: fill tokens + reference route

Status: in-progress
Phase: 3

## Goal

Fill `tokens.css` with the client's palette + typography and get one fully styled reference
route approved before propagating (issue 15).

## Done

Gate 2 passed 2026-07-27 — palette and type both live in `src/styles/tokens.css`: the five
raw `--color-brand-<name>-<step>` scales, `--font-sans` (DM Sans) and `--font-display`
(Barlow Condensed), self-hosted via `@fontsource`. Everything drawn so far is wired through
**component-scoped tokens**, not a semantic layer.

## Remaining

- The **semantic slot layer was never created** — see issue 02, which must first be rewritten
  or closed wontfix.
- **No client-approved reference route on record.** Routes have been styled from artboards,
  but nobody has run the "approve one, then propagate" step this issue exists for.
