# Spec: mlg-components re-skin → brand palette

## Summary

Re-skin the five `mlg-components` (`Button`, `NavBarButton`, `NavArrowButton`, `PopupButton`,
`Sidebar`) off the package's default emerald onto the brand palette, driven by per-state Figma
exports. **All five are done (issues 00-04); the base ramp (05) is moot** — the coverage check
returns empty, so the ramp is unreferenced. The package is ours
(`github.com/samosmireno/mlg-components`); wiring is `src/styles/tokens.css:6-12`. Each
component owns a `--color-ui-<component>-*` set that `var()`s onto a base ramp it never reads
directly, so component-layer overrides always win.

## Hard constraints

1. Shadows override in `@theme`, never `:root` — Tailwind inlines `--shadow-*` at build time.
2. No hardcoded colour may reach a rendered surface; everything painted comes from a
   `--color-ui-*` token, or a consumer cannot re-skin it.
3. Hover edges are `inset 0 0 0 1px` folded into `--shadow-ui-*-hover`, never a `border`.

## Method (for any future export)

Figma dumps stock Tailwind class names at v3 hexes; they are not literal truth. Sample the PNG
per-pixel first, hunt for un-repainted emerald residue, and measure state deltas in OKLCH with
**`color-delta.mjs` in this directory** (L/C/H, relative luminance, contrast ratios). The `-25`
step of every brand scale is a **pastel tint**, not a lighter `-50`, and designers' hovers are
usually hue rotations at constant lightness — mapping one onto `-25` gives a washed-out
nothing. Check contrast at every state; a failure is more often a bad mapping than a real
tradeoff. Verify against compiled CSS, and on both a light and a dark surface.

**Coverage check:** 38 component tokens resolve to the ramp; miss one and it silently falls
back to emerald. Diff the `--color-ui-*` names in `node_modules/mlg-components/dist/tokens.css`
against `src/styles/tokens.css` after every component issue. **38/38, empty (2026-07-28)** — a
non-empty result is the trigger to re-open issue 05.

## Still owed: the all-five visual review — **Not done**

All five are token-complete and every contrast claim was measured, but **nobody has put them on
screen together and looked**. The question is the hierarchy: three families across five
components — **crimson** (arrows + `Button`), **teal** (nav chrome), **lagoon**
(`PopupButton`). The arrows took the accent because prev/next are the highest-frequency
controls; `Button` came back crimson too, so the accent may now mark nothing out. A whole-set
judgement, not a per-component one. Two values to look at specifically, both **inferred rather
than exported**: `--color-ui-sidebar-bg` (issue 04, no rail/bar export ever arrived) and
`NavBarButton`'s tooltip (issue 02, never supplied). `Sidebar` is mounted in `AppShell` so four
of five are on every page — check the rail (>=1024px) and the bar (<1024px) separately; the bar
is the only place `--color-ui-sidebar-bg` shows. `Button` and `PopupButton` need a temporary
render.

## Open

- **Issue 03** — `PopupButton` fails 3:1 in 0 of 7 states; a designer decision, not a mapping bug.
- **Issue 06** — package debts 2 (half-open), 5, 6, 7.
- Issue 04's forward risk: the rail's focus ring passes only because the page has no background
  yet. See `.scratch/app-buildout/issues/02-semantic-token-scaffold.md`.
