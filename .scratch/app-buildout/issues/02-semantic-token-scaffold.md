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

## Watch for: a dark page surface breaks the sidebar's focus ring

Whatever this issue makes the page background, check the nav rail against it.

`mlg-components`' `NavBarButton` draws its focus outline with **no
`outline-offset`**, so the ring lands on whatever is behind the button. In the
bottom bar (<1024px) that is `--color-ui-sidebar-bg`, which issue 04 handles. In
the **rail** (>=1024px) `SidebarRail` paints no background at all, so the ring
resolves against the _page_ — and it passes today only because the page has none
and defaults to white (teal-100 ring on white = 14.62:1).

Give the page a dark surface and that becomes ~1:1 — an invisible focus
indicator and a WCAG 2.4.11 failure. The fix at that point is the package change
issue 02 of the re-skin set proposed: add `-outline-offset-[3px]` to
`NavBarButton` so its ring draws on its own white fill, the way `Button` already
does. See `.scratch/mlg-reskin/issues/04-sidebar.md`.

## Notes

This is the styling seam. Phase 3 should be "fill token values," not "rewrite markup."

Note issue 18 (navigation sidebar) shipped **without** waiting on this issue — the
sidebar reads only `mlg-components` package tokens, never app semantic ones. The
dependency was dropped deliberately; see that issue.

**Raw palette already landed (2026-07-27).** The client color palette exists in
`tokens.css` `@theme` as raw scales — `--color-brand-<name>-<step>` for five families
(teal/crimson/slate/lagoon/sand, steps 0/25/50/75/100), namespaced `brand-` to avoid
colliding with Tailwind's built-in `teal`/`slate`. The semantic tokens this issue defines
should reference those raw values (e.g. `--color-brand: var(--color-brand-teal-50)`),
not new hex literals. Raw tokens are intentionally **not** wired to any UI yet.

**Typography also landed (2026-07-27).** `tokens.css` now defines the type layer:
`--font-sans` → DM Sans (app default), `--font-display` → Barlow Condensed, and a
bundled `--text-*` scale (`h1`/`h2`/`h3`/`h4`/`body`/`small`, each carrying
`--font-weight` + `--line-height`). Fonts are self-hosted via `@fontsource` (imported
in `src/main.tsx`). Semantic type slots should reference these `text-*` steps.
