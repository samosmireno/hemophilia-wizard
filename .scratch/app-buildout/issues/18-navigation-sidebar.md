# 18 — Navigation sidebar (Prev/Next + jump buttons)

Status: done (2026-07-28)
Phase: 1
Blocked by: 00, 01
Gate: Gate 1 (client wireframe approval) — **not applicable, see below**

## Goal

Build the real persistent navigation: a sidebar implementing the linear-walkthrough model
(see `docs/adr/0001-linear-walkthrough-navigation.md`), replacing the temporary placeholder
nav that issue 01 put in `AppShell`.

## Dependency and gate, amended

Originally `Blocked by: 00, 01, 02` and gated on Gate 1. Both were dropped when the work
was picked up, deliberately:

- **02 (semantic token scaffold) is not a real dependency.** The sidebar is
  `mlg-components`' `Sidebar`, which paints entirely from `--color-ui-*` package tokens
  already overridden by the re-skin issues. It reads no app semantic token.
- **Gate 1 has nothing to decide here.** `Sidebar` owns its own fixed positioning and
  accepts no `className`: bottom-right rail at >=1024px, full-width bottom bar below,
  items collapsing into a "More" popover under 640px. There is no layout for a wireframe
  to specify.

One forward risk this creates is recorded in issue 02 — if it gives the page a dark
background, the rail's focus ring needs revisiting.

## Scope

- **Prev / Next** controls that step through the linear section order, driven entirely by
  `src/data/sectionOrder.ts` (`prevOf` / `nextOf`). Prev on the first step and Next on the
  last are disabled — no wraparound.
- **Jump buttons**, always visible regardless of position in the flow. Order and icons
  (all icons from `mlg-components`):

  | icon           | label      | route         |
  | -------------- | ---------- | ------------- |
  | `HomeIcon`     | Home       | `/`           |
  | `WizardIcon`   | Wizard     | `/wizard`     |
  | `BookIcon`     | Acronyms   | `/acronyms`   |
  | `DocumentIcon` | References | `/references` |
  | `InfoIcon`     | Glossary   | `/glossary`   |

  Home and Wizard are also in-flow steps but get one-click shortcuts.

- Active-step indication: the current page's own jump button is **disabled and dimmed**,
  and carries `aria-current="page"`.
- Structural + semantic tokens only (issue 02). Gate-2 styling (issue 15) applies polish,
  states, motion, responsive.

## Off-line pages: Prev returns to the flow

`/glossary`, `/acronyms` and `/references` are not on the spine, so `prevOf`/`nextOf`
return `undefined` for them. Rather than dead-ending both arrows:

- **Next** is always disabled there — a reference page has no successor.
- **Prev** returns to the last walkthrough step visited, so looking something up does not
  cost you your place (the ADR's stated intent). It falls back to `/` when there is
  nothing remembered — a cold deep-link, or a reload.

This is a navigation-model decision, so it is recorded in
`docs/adr/0001-linear-walkthrough-navigation.md`, not only here.

State lives in a ref in `AppSidebar`, updated in an effect whenever the path is on the
spine. It survives every client-side navigation (`AppShell` is a layout route and does not
unmount) but not a reload — that is the fallback case. The ref is read only inside the
Prev handler; reading it during render is unsound under concurrent rendering and
`react-hooks/refs` rejects it.

## Acceptance

- [x] Prev/Next traverse the nine-step order correctly, including in/out of the four
      education chapters; endpoints disable appropriately.
- [x] All five jump buttons navigate without full reload; active step is marked accessibly.
- [x] No hardcoded order in the component — it reads `sectionOrder.ts`.

## Delivered

- `src/routes/AppSidebar.tsx` — new.
- `src/routes/AppShell.tsx` — placeholder `<nav>` deleted; `<main>` gains clearance
  padding for the fixed rail/bar (`pb-20 lg:pr-24 lg:pb-4`).
- `src/styles/tokens.css` — `--color-ui-sidebar-bg` plus the breakpoint-aware focus ring
  (that half is `.scratch/mlg-reskin/issues/04-sidebar.md`, closed by the same change).
- `src/test/setup.ts` — `matchMedia` stub. jsdom has none, and `Sidebar` calls it to pick
  its layout, so without this _every_ routed test throws. Defaults to the rail; exports
  `setViewport(false)` for bar-variant tests.
- `src/routes/sidebar.test.tsx` — 32 tests.
- `src/routes/router.test.tsx` — one test retargeted from the deleted placeholder links.

## Known limits

- ~~The jump items are **buttons, not links**.~~ **Resolved 2026-07-28** in
  `mlg-components` v0.5.0, which added `SidebarItem.render`. `AppSidebar` now returns a
  react-router `<Link>` per target, so cmd-click / open-in-new-tab work. The one
  exception is the current page's own item: `disabled` keeps it a `<button>`, which is
  intended. See debt 1 in `.scratch/mlg-reskin/issues/06-package-debts.md`.
- Issue 18's original scope mentioned `aria-current` matching the `/education` **prefix**.
  Moot as built: there is no Education jump button, so no item can be current on an
  education chapter. Revisit if one is added.
- Removing the placeholder nav means `/education/*`, `/explore`, `/resources` and
  `/survey` are reachable only by stepping the spine. That is the ADR's intent, but it
  does make hand-QA of those (still-stubbed) pages slower until they are built.
