# 17 — Landing page (`/`)

Status: done (2026-07-28)
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

## Comments

**2026-07-28 — built to a supplied design; scope changed.** The client supplied a hero
comp (full-bleed backdrop from issue 19, activity code, title, one CTA) with per-line type
specs. Built as specified. Two departures from the scope above, both deliberate:

1. **The five section entry points are NOT there.** The design has a single call to
   action, and `AppSidebar` (issue 18, which did not exist when this was written) already
   jumps to Wizard, Acronyms, References and Glossary. Under ADR 0001 the app is a linear
   walkthrough with `/` as step 0, so a card grid would have been a second, competing
   navigation. **The acceptance line requiring them is superseded** — reopen only if the
   client asks for a directory-style landing page.
2. **Brand styling, not "structural tokens only".** That constraint predates Gate 2, which
   has since been passed; the design is a real comp with colours and type.

The CTA target is `nextOf("/")` from `src/data/sectionOrder.ts`, i.e. the same computation
the sidebar's Next arrow makes here — the two cannot disagree about what follows `/`.

Title single-sourcing done as `src/data/activity.ts`, which `education.ts` imports for its
framing block (`ACTIVITY_TITLE`). The landing hero renders the halves either side of the
colon at different sizes, so the constant is exported split as well as whole.

Typography rationale, the `clamp()` ramp and the `<main>` centring change are documented
in `docs/styling.md` §8. The CTA renders as a `<button>` rather than a link because mlg
`Button` has no `href`/`render` — logged as debt 5 in
`.scratch/mlg-reskin/issues/06-package-debts.md`.

Still TBD from the original scope, and still not invented: CME framing, learning
objectives, accreditation copy.
