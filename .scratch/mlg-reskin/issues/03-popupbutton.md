# 03 — PopupButton → brand lagoon

Status: done (2026-07-28) — **RAISED 2 resolved in mlg-components v0.4.1;
RAISED 1 still open, an a11y decision the designer has to make**
Blocked by: —

## Goal

Re-skin the `+` → `×` disclosure trigger.

## Outcome

Landed in `src/styles/tokens.css:276-406` as component-layer overrides only. No
package change was required for the colours; two package behaviours could not be
matched and are raised below.

The designer supplied both state sets, as the needs-info note asked: a four-state
closed export (default / clicked / hover / focus) and a three-state open export
(default / hover / focus).

## The family question is answered: lagoon

The issue asked whether this follows the arrows into crimson or the rest of the
library into teal. The design says **neither**. Every colour in both exports sits
at hue **208–213°**, and the closed ground sampled `#4abfd4` — which is
`--color-brand-lagoon-25` to three decimals in L, C _and_ H:

|                           | L     | C     | H     |
| ------------------------- | ----- | ----- | ----- |
| sampled closed ground     | 0.747 | 0.107 | 211.6 |
| `--color-brand-lagoon-25` | 0.747 | 0.107 | 211.6 |

Same argument as issue 02's teal-100 ring: that exactness is the tell that the
designer reached into the palette deliberately. Unlike issue 02, though, this
export was a **full repaint, not residue** — no emerald survives in any of the
thirteen sampled fills. Only the shadows carried residue (below).

Palette hierarchy now reads: crimson = wizard prev/next, teal = nav chrome,
lagoon = disclosure. That is a third family, which sharpens rather than resolves
the question spec decision 2 raised — see "Feeds back into" below.

## Sampled values, and how each was mapped

Per-pixel from the designer's PNGs (spec method step 1). The two exports agree
with each other and with the designer's hex list to ±1 per channel.

| token                      | sampled    | shipped                          | dE    |
| -------------------------- | ---------- | -------------------------------- | ----- |
| `popup-bg`                 | `#4abfd4`  | `lagoon-25`                      | **0** |
| `popup-bg-hover`           | `#4abfd4`  | `lagoon-25`                      | **0** |
| `popup-bg-active`          | `#67a0aa`  | `mix(lagoon-75 59%, lagoon-0)`   | .011  |
| `popup-fg`                 | `#ffffff`  | `#ffffff`                        | 0     |
| `popup-fg-hover`           | `#bff5ff`  | `#bff5ff` (literal)              | 0     |
| `popup-fg-active`          | `#46595c`  | `mix(lagoon-100 74%, lagoon-0)`  | .013  |
| `popup-ring`               | `#ffffff`  | `#ffffff`                        | 0     |
| `popup-open-bg`            | `#67a0aa`  | = `popup-bg-active`              | .011  |
| `popup-open-bg-hover`      | `#79ccdb`  | `mix(lagoon-25 75%, lagoon-0)`   | .003  |
| `popup-open-fg`            | `#46595c`  | = `popup-fg-active`              | .013  |
| `popup-open-fg-hover`      | `#317b8a`  | `mix(lagoon-25 58%, lagoon-100)` | .004  |
| `popup-open-bg-focus`      | `#67a0aa`  | = `popup-open-bg` (v0.4.1)       | .011  |
| `popup-open-ring`          | `#46595c`  | = `popup-fg-active`              | .013  |
| `popup-open-outline-hover` | — (absent) | `transparent`                    | —     |

Two structural facts fell out of the sampling:

1. **The four off-scale colours are one sub-ramp: lagoon desaturated.** All four
   sit on the lagoon hue at a chroma _below every step the scale has_
   (`#46595c` is lagoon-75's lightness at a third of its chroma). They are
   derived with `color-mix` through the near-white `-0` rather than hardcoded, so
   a lagoon change still moves them. All land under the JND.
2. **The closed press state is a preview of the open skin.** Sampled
   `bg-active` == `open-bg` and `fg-active` == `open-fg`, exactly. That is what
   makes the package's "`-active` covers both skins" constraint harmless here,
   and the tokens reference each other rather than repeating the mix.

`#bff5ff` is the one literal, for the same reason `--color-ui-btn-bg-hover` is
one: it is a _saturated_ ice-blue (L .936, C .056) and the brand's lightest steps
are near-neutral (lagoon-0 is C .018). Mixing toward `-0` loses the chroma,
mixing toward `-25` loses the lightness; closest reachable blend is dE .025 and
visibly flatter. The scale has no saturated near-white.

## RAISED 1 — the design fails 3:1 in every state it specifies

| state          | fg / bg                | ratio      |                               |
| -------------- | ---------------------- | ---------- | ----------------------------- |
| closed default | `#fff` on lagoon-25    | **2.17:1** | ✗                             |
| closed hover   | `#bff5ff` on lagoon-25 | **1.83:1** | ✗                             |
| closed press   | `#46595c` on `#67a0aa` | **2.49:1** | ✗                             |
| closed focus   | `#fff` on lagoon-25    | **2.17:1** | ✗                             |
| open default   | `#46595c` on `#67a0aa` | **2.49:1** | ✗                             |
| open hover     | `#317b8a` on `#79ccdb` | **2.66:1** | ✗                             |
| open focus     | `#46595c` on `#67a0aa` | **2.49:1** | ✗ (was 4.09:1 — see RAISED 2) |

**This one is not a mapping error, and that is what makes it different from
issues 00 and 02.** Both of those had a contrast failure that dissolved once the
mapping was corrected, which is why the spec's method step 4 says to suspect the
mapping first. Here the mapping is provably exact — `#4abfd4` _is_ lagoon-25 —
so there is nothing to correct. The cause is structural:

> lagoon-25 is a **light** step (lum .435) being used as a saturated ground under
> a white glyph. Every other component in the library uses its scale's **-50**
> step for that job — `arrow-bg`, `btn-bg` are crimson-50; `navbar-fg` is
> teal-50. This is the only component painting a `-25` as a fill.

The `+`/`×` is what distinguishes the control's expanded state, so WCAG 1.4.11
applies at 3:1. Shipped faithfully as designed, but this needs a decision:

| fix                                | ratio  | cost                                                                                    |
| ---------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| `--color-ui-popup-bg: lagoon-50`   | 3.58:1 | ground goes from bright cyan to a deeper teal-blue — changes the component's character  |
| keep lagoon-25, glyph → lagoon-75  | 3.20:1 | dark glyph on bright cyan; collides with the open skin, which already owns "dark glyph" |
| keep lagoon-25, glyph → lagoon-100 | 7.01:1 | same collision, stronger                                                                |
| accept as designed                 | —      | 1.4.11 failure across six of seven states                                               |

The first is a one-token change. My read is that it is the only one that does not
break the design's own closed/open tonal logic, but the choice is the designer's,
not ours. **Nothing else in this issue is blocked on it.**

## RAISED 2 — the open focus state cannot be transcribed — **RESOLVED v0.4.1**

The component hardcoded `focus-visible:bg-ui-popup-open-bg-hover`, so the open
skin's focus ground was forced to equal its hover ground. The design wants focus
to keep the _resting_ ground (`#67a0aa`); it got `#79ccdb`. Verified on-screen,
not inferred. No token could fix this — it needed the package to give the open
skin a `-bg-focus` the way `Button` has one.

**Fixed upstream in `mlg-components` v0.4.1** (`bafd6d3`, tag `v0.4.1`):

- `--color-ui-popup-open-bg-focus` added, defaulting to
  `--color-ui-popup-open-bg-hover` so every existing skin renders unchanged.
- `PopupButton` reads that token instead of hardcoding the hover ground.
- Bundled in the same release: both skins now re-assert their glyph colour under
  `focus-visible`. `PopupButton` was the only button in the package that did
  not, so a focused _and_ hovered trigger kept the hover glyph rather than the
  focus one — `Button`, `NavBarButton` and `NavArrowButton` all re-assert.

Consumer side, one line in `src/styles/tokens.css`, and the export is now
transcribed exactly:

```css
--color-ui-popup-open-bg-focus: var(--color-ui-popup-open-bg);
```

**This makes the contrast table above worse, and that is expected.** Open focus
was the single passing row at 4.09:1 — passing only because the package forced
it onto the lighter hover ground, i.e. by accident, as that row already noted.
Faithful to the design it reads 2.49:1 like the rest of the open skin, so the
component is now **0 of 7** on 1.4.11 rather than 1 of 7. Nothing to fix here;
it is RAISED 1 that decides it, and RAISED 1's one-token fix moves all seven.

## Focus rings are ground-dependent in _both_ skins, in opposite directions

Confirmed by rendering on white and on teal-100:

| ring                                   | on white               | on teal-100        |
| -------------------------------------- | ---------------------- | ------------------ |
| closed (`#ffffff`, `outline-offset-2`) | **1.00:1** — invisible | 14.62:1            |
| open (`#46595c`, no offset)            | 7.41:1                 | **1.97:1** — sinks |

The closed one is the same open risk issue 00 logged for `--color-ui-arrow-ring`;
the open one is the same WCAG 2.4.11 exposure issue 02 logged for
`--color-ui-navbar-ring`, now with a second component behind it. **Issue 04's
`--color-ui-sidebar-bg` cannot satisfy both** if this component sits in the rail
— a light rail kills the closed ring, a dark rail kills the open one.

The open skin has a ground-independent escape the others do not: the package's
`--shadow-ui-popup-open-focus` carries an `inset 0 0 0 4px` ring drawn against
the button's own fill (4.09:1, ground-agnostic). The design drops it, so this
implementation drops it — but reinstating that one shadow layer is the fix if
issue 04 lands on a dark surface.

## Notes on the shadows

- `--shadow-ui-popup` — the inner glow was `rgba(26,132,126,.50)`, the stray
  `#1a847e` teal for the **fourth** time in this package (arrows, `Button`,
  `NavBarButton`). Restated on lagoon-50. The design gives three slightly
  different resting geometries across the states and the package has one token;
  shipped the closed default's (`inset 0 -1px 2.6px 1px`), which is both the
  resting appearance the token names and the only one the designer actually
  repainted — the other two are the package's `inset 0 1px 1px` untouched.
- `--shadow-ui-popup-open-hover` — package geometry; the opaque rim was
  `rgba(4,33,25,1)`, the same emerald-dark residue `Button`'s press state
  carried. Restated on lagoon-100.
- `--shadow-ui-popup-open-focus` — two layers, not three (see above). The
  remaining glow was `rgba(0,163,220,1)`, the package's own off-family literal,
  mapped onto lagoon-50 as the nearest step in lightness.
- **Omitted deliberately**: `--shadow-ui-popup-hover` and
  `--color-ui-popup-outline-hover`. The design matches the package default
  exactly in both and there is no colour to restate — same call as
  `--shadow-ui-btn` in issue 01.

## The open hover ring is zeroed, not recoloured

The package draws a solid 4px `outline-offset-[-2px]` ring on open hover. The
design has none — confirmed twice: absent from the export, and the designer's PNG
shows a ~3px _gradient_ rim (the shadow's dark inner glow) where a solid ring
would be four flat pixels. `--color-ui-popup-open-outline-hover: transparent`.
This is the first token in the package set to a non-colour; it still satisfies
the coverage check and spec constraint 2 (nothing hardcoded reaches a surface).

## Verification

- `npm run build` + `npm run lint` + `npm test` (35 tests) clean.
- Compiled CSS: all 13 colour tokens resolve in `:root` as `var()` chains (the
  three `color-mix`es emit a static `oklab()` fallback plus the live value behind
  `@supports`); all three shadows inlined onto their utility rules carrying
  lagoon (`#0a94ae80`, `#052a32`, `#0a94ae`). No emerald survives.
- All twelve state/ground combinations rendered in a real browser and sampled
  per-pixel; every fill matched its intended value to the derived dE. Preview
  scaffolding removed from `Landing.tsx`.
- **Coverage check: `popup` and `popup-open` fully clear. 1 token remains
  (`--color-ui-sidebar-bg`), down from 14.**

Re-verified after the v0.4.1 bump (2026-07-28): dependency at `^0.4.1`, build +
lint + tests (35) clean, and `--color-ui-popup-open-bg-focus` resolves in the
compiled CSS to the resting ground. 14 colour tokens now, not 13. The open focus
state was **not** re-checked on screen — no browser available in that session;
worth a tab-through, and it is the only state in this issue never seen rendered
in its final form.

## Feeds back into

- **Issue 04** — inherits the ring collision above on top of the one issue 02
  already raised.
- **Issue 05 is now very likely moot.** One token remains and issue 04 sets it,
  which would leave the base ramp entirely unreferenced.
- **Spec decision 2** — the library is now crimson (arrows + `Button`), teal
  (nav chrome) and lagoon (disclosure). Three families across five components is
  worth looking at directly in the all-five review the spec schedules before 05.

## Comments

**2026-07-28 — RAISED 2 closed upstream.** `mlg-components` v0.4.1 adds
`--color-ui-popup-open-bg-focus` and, in the same release, makes both `PopupButton`
skins re-assert their glyph colour under `focus-visible` (it was the only button
in the package that did not, so focus+hover kept the hover glyph). Consumer took
the one-line override; the export is now transcribed with no unmatched states.

Verified deterministically rather than visually: the package's compiled Tailwind
output emits every `focus-visible:*` rule after the `hover:*` ones, which is the
ordering the re-assert depends on. No browser was available, so the rendered
result is unconfirmed.

One artefact worth knowing about, since it looks like a bug and is not: the app's
compiled CSS still carries a dead `.focus-visible\:bg-ui-popup-open-bg-hover`
rule. Tailwind's scanner reads this issue file and lifts the class name out of the
prose above. ~90 bytes, harmless, and not worth mangling the prose to avoid.
