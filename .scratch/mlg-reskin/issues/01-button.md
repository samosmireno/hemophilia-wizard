# 01 — Button → brand crimson (teal focus)

Status: done (2026-07-28)
Blocked by: —

## Goal

Re-skin the wide text CTA (`Button`) from the package's emerald default onto the
brand palette.

## Outcome

Landed in `src/styles/tokens.css:133-184` as component-layer overrides only. No
package change required — `mlg-components` 0.4.0 has every token needed.

All eight `--color-ui-btn-*` tokens are overridden, so the component no longer
reads the package ramp anywhere. Only two of the three shadows needed restating.

```css
--color-ui-btn-bg: var(--color-brand-crimson-50); /* #d63a52, exact */
--color-ui-btn-bg-hover: #f73150; /* off-scale — see decision 2 */
--color-ui-btn-bg-active: var(--color-brand-crimson-75); /* #8f1a2e, exact */
--color-ui-btn-bg-focus: var(--color-brand-teal-50); /* design #1a847e */
--color-ui-btn-fg: #ffffff;
--color-ui-btn-fg-hover: var(--color-brand-teal-0); /* #eef8f6, exact */
--color-ui-btn-fg-active: #939393;
--color-ui-btn-ring: var(--color-brand-teal-100); /* design #0e4e4c */

--shadow-ui-btn-hover:
  inset 0px 0px 0px 1px rgba(255, 255, 255, 0.2), 0px 2px 4px 0px rgba(0, 0, 0, 0.25),
  inset 0px 2px 4px 2px rgba(255, 255, 255, 0.25);
--shadow-ui-btn-active:
  0px 1px 2px 0px rgba(0, 0, 0, 0.25), 0px 1px 2px 0px rgba(0, 0, 0, 0.15),
  inset 0px 2px 4px 0px rgba(255, 255, 255, 0.25), inset 0px 1px 2px 1px rgba(57, 27, 32, 1);
```

`--shadow-ui-btn` is **not** overridden: the design's resting shadow is identical
to the package default, so there was nothing to restate.

## Method note: the export was measured, not read

Rather than trusting either the stock class names or the hex list, the designer's
PNG was sampled per-pixel (Pillow) to get the true fill and label of each state.
That is what made the mapping unambiguous — three values land _exactly_ on the
brand palette, which is the confirmation that the stock reds were stand-ins:

| state   | stock class    | true fill              | true label                |
| ------- | -------------- | ---------------------- | ------------------------- |
| default | `bg-red-500`   | `#d63a52` = crimson-50 | `#ffffff`                 |
| clicked | `bg-rose-900`  | `#8f1a2e` = crimson-75 | `#939393`                 |
| hover   | `bg-rose-500`  | `#f73150`              | `#eef8f6` = teal-0        |
| focus   | `bg-green-100` | `#1a847e`              | `#ffffff`, ring `#0e4e4c` |

`bg-green-100` for a mid-teal fill is the clearest single demonstration that the
export's palette is not literal truth.

## Decisions and why

1. **The CTA is crimson, not teal.** Default and active land on crimson-50 and
   crimson-75 to the byte. This contradicts spec decision 3's default
   expectation ("primary teal for everything except the arrows") — see
   "Raised" below. Implemented as the design specifies.

2. **`-bg-hover` is a literal `#f73150`, and no derivation exists.** The design's
   hover is _more_ chromatic than crimson-50 (C .229 vs .192), and crimson-50 is
   already the most chromatic step in the scale. `color-mix` toward any other
   step only pulls chroma **down**, so nothing on the palette reaches this
   colour. The scale is missing a "brighter than -50" step and this is it.

   | candidate                        | result    | lum   | C    |
   | -------------------------------- | --------- | ----- | ---- |
   | design                           | `#f73150` | x1.26 | .229 |
   | `mix(c50 96%, c25)` (the arrows) | `#d73f55` | x1.04 | .188 |
   | `mix(c50 80%, c25)`              | `#dd5263` | x1.24 | .174 |

   The 80% mix matches the luminance but not the saturation — it reads dull.
   Literal it is, on the same footing as `#939393`.

3. **Focus fill maps to `teal-50`, not the design's `#1a847e`.** The two are the
   same colour to within dL .018 / dC .000 — `#1a847e` is teal-50 rotated ~11°
   toward cyan, and the export gives no reason for the rotation. Mapping onto
   the scale keeps it tracking. Same reasoning one step darker for the ring.
   The design's three teals (`#1a847e`, `#13615d`, `#0e4e4c`) form a consistent
   mini-ramp at hue ~190° against the brand teal's ~177° — a whole family
   offset, which reads as a swatch set that predates the brand scale.

4. **Focus ring is `teal-100`, not `teal-75`.** A 3px focus indicator owes 3:1
   against its own fill. The design's own pairing was **2.10:1**; teal-75 would
   be 1.92:1; teal-100 is **3.49:1**. Per spec step 4, a contrast failure here is
   a mapping symptom, not a design tradeoff — this keeps the intent (a dark teal
   rim) and clears the threshold.

5. **The hue switch preserves the package's focus/press distinction for free.**
   The package sets `-bg-focus` to `accent-deep` rather than `accent-strong` so a
   focused button never reads as pressed. The design goes further and changes
   hue family entirely (crimson → teal), so the distinction is stronger, not
   weaker. Constraint satisfied.

6. **Hover ring stays inside the box-shadow.** The export drew it as
   `outline outline-1 -outline-offset-1 outline-white/20`; per spec constraint 3
   it is folded into `--shadow-ui-btn-hover` as `inset 0 0 0 1px`. Only the alpha
   changed against the package (.15 → .20), but re-tinting means restating the
   whole three-layer value.

7. **The active state's inner rim was emerald residue.** The package had
   `inset 0 1px 2px 1px rgba(4, 33, 25, 1)` (`#042119`); the design has
   `rgba(57, 27, 32, 1)` (`#391b20`) — the same crimson-dark the arrows' press
   landed on. Exactly the residue pattern spec step 2 predicts.

## Contrast

| state   | pair                    | ratio  |                                |
| ------- | ----------------------- | ------ | ------------------------------ |
| default | white on crimson-50     | 4.58:1 | passes                         |
| hover   | teal-0 on `#f73150`     | 3.52:1 | passes (26px semibold)         |
| clicked | `#939393` on crimson-75 | 2.90:1 | under 3:1 — accepted, below    |
| focus   | white on teal-50        | 4.18:1 | passes                         |
| focus   | ring teal-100 on fill   | 3.49:1 | passes as a non-text indicator |

The 2.90:1 press label is the identical exception accepted on the arrows
(decision 4 of issue 00): the design deliberately dims the label while the
button is held, and the state is momentary.

## Raised — needs an answer before Gate 2

1. **The accent/primary hierarchy no longer separates.** Spec decision 2 puts the
   arrows in crimson because "prev/next are the highest-frequency controls, so
   they carry the accent while everything else sits in the primary." The CTA is
   now also crimson, so the accent no longer marks anything out. The design does
   use teal — but only as the CTA's _focus_ fill, which is the one state a user
   barely sees. Worth putting to the designer, and worth re-checking at the
   all-five review the spec schedules before issue 05.

2. **This export casts doubt on the arrows' hover.** Issue 00 derived the arrows'
   hover from **stock v3 hexes** (`#ef4444` → `#f43f5e`, a 1.03x lift) because
   the designer's true reds were never obtained — only `#EEF8F6`/`#939393` were
   confirmed. This export gives the true pair for the same visual treatment:
   `#d63a52` → `#f73150`, a **1.26x** lift with rising chroma. If the arrows use
   the same hover, `--color-ui-arrow-bg-hover` is currently a quarter of the
   intended lift and should become `#f73150` too. **Not changed here** — issue 00
   is closed and this is a question for the designer, not an inference to act on.

3. **`#13615D` is in the designer's colour list but appears nowhere in the
   export.** It sits between the focus fill and the focus ring on that same
   ~190° ramp. Unused; flagged rather than guessed at.

4. **Minor, no token exists:** the export drops the inset white highlight on the
   focus state (`0 2px 4px rgba(0,0,0,.25)` alone). `Button` has no
   `--shadow-ui-btn-focus` — unlike `NavArrowButton`, `NavBarButton` and
   `PopupButton`, which all have one — so focus keeps `--shadow-ui-btn` with its
   highlight. A package gap; not worth a release on its own, but worth folding
   into the next one.

## Verification

- `npm run build` + `npm run lint` + `npm test` (35 tests) all clean.
- Compiled CSS checked, not source: all 8 colour tokens resolve in `:root` as
  `var()` chains, and both shadows are inlined into their utilities — the hover
  ring as `#fff3` (.20) and the active rim as `#391b20`, with the emerald
  `#042119` gone.
- Coverage check run: `btn` no longer appears. 23 tokens remain, exactly
  navbar (9) + popup (7) + popup-open (6) + sidebar (1) — issues 02-04.
- Rendered all four states on white and on `#111d2e` via a temporary block in
  `src/routes/Landing.tsx` (since removed), screenshotted headless at 2x, and
  sampled the result: every state reproduces the design's fill and label to the
  byte, except the two deliberate mappings (focus fill teal-50, ring teal-100).
