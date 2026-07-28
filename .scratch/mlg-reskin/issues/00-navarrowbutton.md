# 00 — NavArrowButton → brand crimson

Status: done (2026-07-28)
Blocked by: —

## Goal

Re-skin `NavArrowButton` from the package's emerald default onto the brand
crimson scale, from the designer's Figma four-state export.

## Outcome

Landed in `src/styles/tokens.css:87-131` as component-layer overrides only. No
package change was required — `mlg-components` 0.4.0 (bumped from 0.3.0 in
`package.json`) has every token needed.

Final values:

```css
--color-ui-arrow-bg: var(--color-brand-crimson-50);
--color-ui-arrow-bg-hover: color-mix(
  in oklab,
  var(--color-brand-crimson-50) 96%,
  var(--color-brand-crimson-25)
);
--color-ui-arrow-bg-active: var(--color-brand-crimson-75);
--color-ui-arrow-fg: #ffffff;
--color-ui-arrow-fg-hover: var(--color-brand-teal-0); /* #eef8f6 */
--color-ui-arrow-fg-active: #939393;
--color-ui-arrow-ring: #ffffff;

--shadow-ui-arrow: 0 1px 1px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(143, 26, 46, 0.53);
--shadow-ui-arrow-hover:
  0 2px 4px rgba(0, 0, 0, 0.25), inset 0 2px 4px 2px rgba(255, 255, 255, 0.25);
--shadow-ui-arrow-active: 0 1px 2px rgba(0, 0, 0, 0.15), inset 0 1px 2px 1px rgba(57, 27, 32, 1);
--shadow-ui-arrow-focus: 0 1px 2px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(143, 26, 46, 0.53);
```

## Decisions and why

1. **Stock Tailwind reds in the export were placeholders** for the brand crimson
   scale — confirmed with the designer. Evidence: the export also carried a green
   inner glow and a fully-unrecoloured teal glow, the fingerprints of a partial
   recolour of the package default.
2. **Hover is `color-mix(crimson-50 96%, crimson-25)`, not `crimson-25`.** First
   attempt used `crimson-25` and was visibly wrong — see "Correction" below.
3. **Chevron uses `--color-brand-teal-0`** rather than a literal `#eef8f6`. The
   design's near-white is exactly the primary's lightest tint, so the chevron
   picks up the house cool-white; referencing the token keeps it tracking.
4. **`--color-ui-arrow-fg-active: #939393`** is an off-palette literal, taken
   verbatim from the designer. The press state deliberately _dims_ the chevron.
   2.90:1 on the dark press fill — just under 3:1, momentary state, accepted.
5. **Focus ring is white.** Fine on a dark surface, invisible on a light one.
   **Open risk** — if the wizard's prev/next end up on a light background, this
   ring needs a colour. Not yet resolvable; nothing renders them yet.
6. **The dead `hover:border-white/20` stays dead.** See spec constraint 2.
   The equivalent effect, if ever wanted, is a one-line addition to
   `--shadow-ui-arrow-hover` — no package release needed.

## Correction worth remembering

Hover was first mapped to `--color-brand-crimson-25` on the reasoning that it
was the scale's next-lighter step. Wrong:

|               | default → hover             | luminance ratio | chroma          |
| ------------- | --------------------------- | --------------- | --------------- |
| Figma         | `#ef4444` → `#f43f5e`       | **1.03x**       | .208 → .215     |
| First attempt | `crimson-50` → `crimson-25` | **2.64x**       | .192 → **.101** |

The design's hover is a **hue rotation at constant lightness**, not a
lightening. `crimson-25` is a pastel tint. Compounding it: `crimson-50` already
sits at hue 17.0°, essentially where the design's _hover_ hue is (16.4°) — the
brand scale is already rose-hued, so the red→rose rotation is spent before the
mapping starts. Only the magnitude transfers.

Fixing it also retired an accessibility exception that had been accepted: the
hover chevron went from **1.85:1 to 4.10:1**. The contrast failure was never in
the design — it was the mapping.

## Verification

- `npm run build` + `npm run lint` + `npm test` (35 tests) clean.
- All four states confirmed in compiled CSS (`dist/assets/index-*.css`), not
  just source — `@theme` inlines `--shadow-*` at build time.
- Visually confirmed in the browser on light and dark surfaces via a temporary
  block in `src/routes/Landing.tsx`, since removed.

## Comments

Hover `color-mix` compiles to a static `oklab()` fallback plus the live
`color-mix` behind `@supports`; both regenerate on rebuild, so the derived-from-
token behaviour holds in modern browsers and old ones get the baked value.
