# 16 — Hardening: a11y · QA · content proof · deploy

Status: ready-for-human
Phase: 4
Blocked by: 15

## Goal

Final hardening and production deploy.

## Remaining

**None of the five scope bullets is done:**

1. Accessibility audit (keyboard, screen reader, contrast, focus order).
2. Cross-browser + responsive QA.
3. Content proof of every section against `CONTEXT.md`.
4. Swap the real survey target into the adapter (issue 06) — waits on the client's destination.
5. Verify analytics events (issue 07); build and deploy `dist/`, confirming the catch-all rewrite.

Baseline: CI runs format / lint / build / test, and 601 tests pass.
