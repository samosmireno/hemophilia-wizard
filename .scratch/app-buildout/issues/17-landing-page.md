# 17 — Landing page (`/`)

Status: ready-for-human
Phase: 1
Blocked by: 01, 02, 03
Gate: Gate 1 (client wireframe approval)

## Goal

Build the landing page at `/` — the app's entry screen. **Net-new: this page is not in
the blueprint**, so its content is defined here, not sourced from `CONTEXT.md`.

## Scope

- Only the **title** is defined so far:

  > **HM-85L — The Future Is Now: Personalizing Hemophilia Prophylaxis in an Era of
  > Novel Agents**

  Single-source this string — it also appears as the education framing block
  (`CONTEXT.md` §7.1). Share one constant so the two never drift.

- Entry points into the five sections (Education, Wizard, Explore, Resources, Survey) —
  navigable cards/links into the app via the issue-01 nav shell.
- Everything else (CME framing, learning objectives, accreditation copy, hero/visual) is
  **TBD** — leave structural hooks; do not invent content.
- Structural + semantic tokens only (no brand styling; Gate 2 fills tokens).

## Acceptance

- `/` renders the landing page: the title plus navigable entry points into all five
  sections; nav shell (issue 01) wraps it.
- Title string is imported from a shared constant, not hard-coded twice.
- `npm run build` type-checks clean; `npm run lint` clean.

## Notes

Replaces the placeholder landing component stubbed in issue 01. Content beyond the title
is undefined and will be settled with the client later.
