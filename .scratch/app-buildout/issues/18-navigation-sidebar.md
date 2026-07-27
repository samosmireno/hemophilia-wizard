# 18 — Navigation sidebar (Prev/Next + jump buttons)

Status: ready-for-human
Phase: 1
Blocked by: 00, 01, 02
Gate: Gate 1 (client wireframe approval)

## Goal

Build the real persistent navigation: a sidebar implementing the linear-walkthrough model
(see `docs/adr/0001-linear-walkthrough-navigation.md`), replacing the temporary placeholder
nav that issue 01 put in `AppShell`.

## Scope

- **Prev / Next** controls that step through the linear section order, driven entirely by
  `src/data/sectionOrder.ts` (`prevOf` / `nextOf`). Prev on the first step and Next on the
  last are disabled/absent — no wraparound.
- **Jump buttons**, always visible regardless of position in the flow: **Home** (`/`),
  **Wizard** (`/wizard`), **Glossary** (`/glossary`), **Acronyms** (`/acronyms`),
  **References** (`/references`). Home and Wizard are also in-flow steps but get one-click
  shortcuts.
- Active-step indication (e.g. `aria-current`), matching the `/education` **prefix** for the
  education chapters (you never sit on bare `/education`).
- Structural + semantic tokens only (issue 02). Gate-2 styling (issue 15) applies polish,
  states, motion, responsive.

## Acceptance

- Prev/Next traverse the nine-step order correctly, including in/out of the four education
  chapters; endpoints disable appropriately.
- All five jump buttons navigate without full reload; active step is marked accessibly.
- No hardcoded order in the component — it reads `sectionOrder.ts`.

## Notes

The layout (sidebar placement, collapse/mobile behavior) follows the Gate-1 wireframe.
Depends on issue 01's `sectionOrder.ts` and the off-line routes (`/glossary`, `/acronyms`,
`/references`) existing.
