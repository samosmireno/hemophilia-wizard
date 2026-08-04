# Styling & design tokens

Companion to `src/styles/tokens.css`. That file is the machine-readable token
set; this file is the reasoning behind every value in it — where a colour came
from, why a mapping was chosen over the obvious one, and which decisions are
still open.

**Keep the two in sync.** If you change a token, change the note here. If a token
has no note here, it was a plain transcription and needs none.

Related: `.scratch/mlg-reskin/spec.md` (the re-skin method and per-component
issues), `.scratch/app-buildout/issues/02-semantic-token-scaffold.md` (the
semantic layer that still has to be built on top of the raw palette).

---

## 1. How the token layer works

Tokens are declared as CSS variables in the `@theme` block, and Tailwind v4
generates matching utilities from them — `--color-brand-teal-50` yields
`bg-brand-teal-50`, `text-brand-teal-50`, and so on. There is no
`tailwind.config.*`; the CSS file _is_ the config.

`tokens.css` currently holds the **raw brand palette** plus the
**`mlg-components` component-layer overrides**. The semantic layer
(`bg-surface`, `text-heading`, …) does not exist yet — it is issue 02 of the
app build-out.

### Import order and the `@source` path

```css
@import "tailwindcss";
@import "mlg-components/tokens.css";
@source "../../node_modules/mlg-components/dist";
```

The `@source` path is **relative to `tokens.css`**, not to the project root.
`@mlg-components/dist` does not work: the leading `@` reads as an npm scope, and
the package is unscoped, so Tailwind silently scans nothing and every
`mlg-components` component renders unstyled. There is no error — the failure mode
is a blank-looking UI.

### Shadows must be declared in `@theme`, never `:root`

Tailwind resolves `--shadow-*` at build time and inlines the resulting value, so
a `:root` rule naming a shadow token compiles to nothing at all. Colour tokens
work in either place, because colour utilities compile to a runtime `var()`
reference. This asymmetry is load-bearing — it is what makes the media query in
§5 possible for a ring colour and impossible for a shadow.

### Two token layers in `mlg-components`

The package (owned by us, `github.com/samosmireno/mlg-components`, installed at
v0.4.0) exposes:

- a **base ramp** — `--color-ui-accent*`, `--color-ui-white`, `--color-ui-ink`, …
  — the only place the package writes a literal colour;
- **per-component sets** — `--color-ui-arrow-*`, `--color-ui-btn-*`,
  `--color-ui-navbar-*`, `--color-ui-popup-*`, `--color-ui-popup-open-*`,
  `--color-ui-sidebar-bg` — which are `var()` references onto the ramp.

Components never read the ramp directly. **Component-layer overrides therefore
beat the ramp**, and re-pointing the ramp later does not disturb a component
already overridden. Everything in `tokens.css` is a component-layer override; the
package itself is untouched.

---

## 2. Typography

DM Sans is the app default (body/UI). Barlow Condensed is the display face,
reachable as `font-display`. Both are self-hosted via `@fontsource` and imported
in `src/main.tsx`.

**There is no house type scale.** Sizes are Tailwind's own `--text-*` defaults,
used unmodified — `tokens.css` declares no `--text-*` at all, and reintroducing
one would silently redefine that utility everywhere.

A step therefore sets **size + line-height only**. Weight is stated at the call
site, always: Tailwind's font-size utilities carry no `font-weight`, and
preflight resets `h1`–`h6` to `font-weight: inherit`
(`node_modules/tailwindcss/preflight.css:84`), so a heading with no `font-*`
class renders at 400.

The design's drawn sizes and the utility each one maps to:

| Drawn | Utility     | Renders      | Weight at the call site          | Δ   |
| ----- | ----------- | ------------ | -------------------------------- | --- |
| 52px  | `text-5xl`  | 48px / 1.0   | `font-bold`                      | −4  |
| 42px  | `text-4xl`  | 36px / 1.111 | as drawn                         | −6  |
| 32px  | `text-3xl`  | 30px / 1.2   | `font-bold`                      | −2  |
| 26px  | `text-2xl`  | 24px / 1.333 | `font-semibold`, `font-bold`     | −2  |
| 24px  | `text-2xl`  | 24px / 1.333 | as drawn                         | 0   |
| 22px  | `text-xl`   | 20px / 1.4   | as drawn                         | −2  |
| 20px  | `text-xl`   | 20px / 1.4   | `font-semibold`                  | 0   |
| 16px  | `text-base` | 16px / 1.5   | none — 400 is the default        | 0   |
| 14px  | `text-sm`   | 14px / 1.43  | as drawn                         | 0   |
| 12px  | `text-xs`   | 12px / 1.333 | `font-medium` (no call site yet) | 0   |

**26px maps to `text-2xl` at either weight.** The old scale's `h3` step was 26px
at weight 600, which is why several call sites transcribed a raw `text-[26px]`
instead of taking the step — they wanted 700. That reason is gone now that weight
is always explicit, so all of them are `text-2xl` and differ only in their
`font-*` class.

**Line-heights are Tailwind's, not the design's.** The drawn leading is no longer
transcribed and a step never carries a `/…` modifier. Where a specific line box
is load-bearing the call site states it with an explicit `leading-*` — see
`Explore`'s class label (`leading-5.5`) and `ArchBand`'s title (`leading-none`).
Two consequences worth knowing: body prose tightens from a 25.6px line box to
24px, and the old `small` step's 19.8px — the one line-height taken verbatim from
the source spec — is gone, at no visual cost because nothing used it.

This replaced a house scale (`text-h1`…`text-small`, 52/32/26/20/16/12 with
weights and line-heights bundled) on 2026-08-04. That scale is why so much of the
prose below reasons about whether a value "lands on a step": those passages have
been updated to name the utility that ships, but the arguments they make are
about the old numbers. Where one still cites 52px or 26px as what renders, treat
this table as the authority.

### `h1` steps down one size below `lg`

**Every `<h1>` in the app is `text-3xl font-bold … lg:text-5xl`, not bare
`text-5xl`.** At the canvas width it renders at 48px; below `lg` it drops to
30px.

This started as two chapters' comfort call — `prophylaxis-guidance` and
`fviiia-mimetics` have long sentence headings that took nine and six lines on a
phone — but it is now a correctness rule, because the display size **overflows**,
not merely wraps. Barlow Condensed uppercase with `tracking-wide` sets a single
word wider than the content column, and a word cannot break:

| `<h1>` word                                           | At 48px | 375px column (311px)    | 320px column (256px) |
| ----------------------------------------------------- | ------- | ----------------------- | -------------------- |
| `CHARACTERISTICS` (`/wizard`, both leaves)            | 329.1px | **overflows by 18.1px** | overflows by 73.1px  |
| `REQUIREMENT` (`/wizard/therapies` label)             | 251.1px | fits                    | fits by 4.9px        |
| `REBALANCING` (`rebalancing-agents`)                  | 251.1px | fits                    | fits by 4.9px        |
| `BACKGROUND` (`disease-background`)                   | 238.6px | fits                    | fits by 17.4px       |
| `HEMOPHILIA` (`treatment-landscape`, scenario titles) | 216.0px | fits                    | fits                 |

**These figures are arithmetic, not measurement.** The originals were measured in
Chrome at 375 × 800 and 320 × 800 against the old 52px `h1`; the move to
`text-5xl` scaled every one by 48/52 and this table is that multiplication. The
ranking and the conclusion are unchanged, but the exact pixels have not been
re-verified in a browser — re-measure before relying on a thin margin.

The `/wizard` case was not theoretical at 52px: it pushed `document.scrollWidth`
to 388px against a 375px window, i.e. a horizontal scrollbar on the whole page
with the final `S` clipped at the viewport edge. It still overflows at 48px, by
less. At the stepped-down 30px the worst word measures ~205.7px and clears even
the 320px column with 50px to spare.

Dropping to `text-5xl` made the passing rows more comfortable than they were —
`REQUIREMENT` and `REBALANCING` overflowed a 320px column by 16px at 52px and now
fit, and `BACKGROUND`'s 2.5px overflow became a 17.4px margin. The rule is kept
anyway: the worst word still fails at 375, three of the headings are data-driven,
and a new scenario title or switch reason must not be able to reintroduce this.

**Not `clamp()`**, which §8 uses for the landing hero. That is a different
problem: a hero is one composition whose lines must hold their proportions at
every width, so a breakpoint ramp visibly steps them together. A chapter heading
is a single line failing on a single word. One size step fixes it and costs one
class — where a clamp would add a bespoke `(min, slope, max)` triple per heading.
Below the canvas nobody has drawn a phone, so this is an invented comfort value
stated as a step on Tailwind's scale, the same call `AppShell` makes for the
gutters it cannot honour down there (§11).

---

## 3. Brand palette

Five families, namespaced `--color-brand-<name>-<step>` so they can never collide
with Tailwind's built-in `teal` / `slate` scales. Steps run **0 → 100, lightest →
darkest**, matching the design source.

| Family    | Role         | 0         | 25        | 50        | 75        | 100       |
| --------- | ------------ | --------- | --------- | --------- | --------- | --------- |
| `teal`    | primary      | `#eef8f6` | `#7ec5b6` | `#2d8a78` | `#1a5a4c` | `#0d2e26` |
| `crimson` | accent       | `#fef0f2` | `#f4a0ab` | `#d63a52` | `#8f1a2e` | `#4a0a14` |
| `slate`   | neutral cool | `#f2f5f9` | `#9eadc4` | `#5a6f8a` | `#2e4056` | `#111d2e` |
| `lagoon`  | bright blue  | `#e6f7f9` | `#4abfd4` | `#0a94ae` | `#076278` | `#052a32` |
| `sand`    | warm neutral | `#fdf8f2` | `#e0ccb0` | `#b8956a` | `#7a5c38` | `#3a2810` |

These are raw scales with no semantic aliases. Nothing in the app should reference
them directly once the semantic layer lands.

### The `-25` pastel trap

The `-25` step is a **pastel tint**, not a "slightly lighter -50". It runs at
roughly 2.6× the luminance and half the chroma of `-50`. Reaching for it as a
hover state washes the component out, and it has produced a measurable contrast
failure twice — once on `NavArrowButton`'s hover fill and once on `NavBarButton`'s
hover glyph, both landing near 1.85:1 against their grounds. When a design's hover
looks like "slightly brighter", it is almost always a hue rotation at constant
lightness, not a step change. Derive it with `color-mix` off `-50` instead.

### Two gaps in the scale

Two designer colours are provably unreachable from the palette and are therefore
written as literals:

- **Brighter than `crimson-50`.** `--color-ui-btn-bg-hover: #f73150` is _more_
  chromatic (C .229) than `crimson-50` (C .192), which is the most chromatic step
  the crimson scale has. `color-mix` can only pull chroma down.
- **A saturated near-white.** `--color-ui-popup-fg-hover: #bff5ff` is L .936 at
  C .056; `lagoon-0` is C .018. Mixing toward `-0` loses the chroma, mixing toward
  `-25` loses the lightness. Closest reachable blend is dE .025 and visibly flatter.

Both are raised in their issues (`01-button.md`, `03-popupbutton.md`) as palette
questions rather than papered over.

---

## 4. mlg-components overrides

Everything in this section is a component-layer override on top of package v0.4.0.
Values come from the designer's per-state Figma exports, run through the
translation method in `.scratch/mlg-reskin/spec.md`. Two things recur across every
component and are worth stating once:

**Figma exports lie about the palette.** The "copy as Tailwind" dump emits stock
class names (`red-500`, `rose-900`, `neutral-400`) that are the export generator's
approximations. Sampling the designer's PNG per-pixel gives the true fills — and
repeatedly they land _exactly_ on a brand step. That exactness is the tell that the
stock name was standing in for a brand colour.

**Emerald residue.** The package default ramp is emerald. Where a designer never
repainted something, the export carries the package's own emerald through, and it
must not be transcribed — doing so leaves one component emerald beside its
re-skinned neighbours. One literal in particular, `#1a847e`, appears in four
separate components: it is `teal-50` rotated ~11° toward cyan at identical L and
chroma (dL .018, dC .000), off the house hue for no stated reason, and is mapped
back onto `teal-50` every time.

### 4.1 NavArrowButton — crimson

The wizard's prev/next arrows. These sit on top of the package's accent ramp
rather than replacing it, so re-pointing `--color-ui-accent*` later leaves the
arrows crimson.

Its green/teal inner glows were package residue, restated here in `crimson-75`.

| Token        | Value                                   | Note                  |
| ------------ | --------------------------------------- | --------------------- |
| `-bg`        | `crimson-50`                            |                       |
| `-bg-hover`  | `color-mix(crimson-50 96%, crimson-25)` | see below             |
| `-bg-active` | `crimson-75`                            |                       |
| `-fg`        | `#ffffff`                               |                       |
| `-fg-hover`  | `teal-0`                                | see below             |
| `-fg-active` | `#939393`                               | off-palette, verbatim |
| `-ring`      | `#ffffff`                               |                       |

**`-bg-hover` is not `crimson-25`** — that is the pastel trap (§3). The design's
hover barely changes lightness at all; it rotates hue red → rose at constant L.
`crimson-50` already sits at that rose hue, so only the magnitude transfers: a 4%
lift, luminance ratio 1.04× against the design's 1.03×. Derived from the scale
rather than hardcoded so a crimson change still moves it.

**`-fg-hover` is `teal-0`, not plain white** — the design's `#eef8f6` is exactly
the primary's lightest tint, so the chevron picks up the house cool-white on hover.
4.10:1 against the corrected hover fill, clearing the 3:1 icon threshold. (It read
1.85:1 while the hover was mis-mapped to `crimson-25`; that failure was our
mapping, not the design.)

### 4.2 Button — crimson, teal focus

The wide text CTA. Three sampled fills land exactly on the palette:
default = `crimson-50`, active = `crimson-75`, hover label = `teal-0`.

| Token        | Value        | Note                                               |
| ------------ | ------------ | -------------------------------------------------- |
| `-bg`        | `crimson-50` | `#d63a52`, exact                                   |
| `-bg-hover`  | `#f73150`    | literal — see §3 "gaps in the scale"               |
| `-bg-active` | `crimson-75` | `#8f1a2e`, exact                                   |
| `-bg-focus`  | `teal-50`    | hue-family switch, see below                       |
| `-fg`        | `#ffffff`    | also the focus label — the component re-asserts it |
| `-fg-hover`  | `teal-0`     | `#eef8f6`, exact — 3.52:1 on hover                 |
| `-fg-active` | `#939393`    | off-palette, verbatim; matches the arrows' press   |
| `-ring`      | `teal-100`   | not `teal-75` — see below                          |

**Focus switches hue family entirely**, crimson → teal. That more than preserves
the package's rule that a focused button must never read as a pressed one (there,
`accent-deep` vs `accent-strong`). The design's `#1a847e` is the recurring stray
teal and maps onto `teal-50`.

**`-ring` is `teal-100`, not `teal-75`.** The 3px inset focus ring is a non-text
indicator, so it owes 3:1 against its own fill: `teal-75` gives 1.92:1, `teal-100`
gives 3.49:1. The design's own pairing (`#0e4e4c` on `#1a847e`) was 2.10:1 — this
keeps the intent, a dark teal rim, and clears the threshold.

**`--shadow-ui-btn` is omitted deliberately** — the design's resting shadow is
identical to the package default, so there is nothing to restate.

`--shadow-ui-btn-hover` folds the ring at alpha .20 (per the export's
`outline-white/20`, up from .15) into the box-shadow as an `inset 0 0 0 1px`
rather than making it a real outline. That is the package's canonical mechanism —
no layout box, cannot collide with the focus outline — and re-tinting it means
restating the whole value.

`--shadow-ui-btn-active` keeps the package's four layers; its opaque inner rim was
`rgba(4, 33, 25, 1)`, emerald residue the designer recoloured over, restated in the
crimson-dark the design actually uses (the same value the arrows' press landed on).

### 4.3 NavBarButton — teal, tonally inverted

The round utility button in the nav rail. **Tonally inverted** from the other two:
white surface, coloured _glyph_, so the brand scale lands on `-fg` and the contrast
maths runs against a near-white ground rather than a saturated one. `Sidebar`'s
"More" trigger reads the same tokens — same visual object, same bar — so this block
moves that too.

**This export was almost entirely residue.** Sampling the designer's PNG per-pixel
returned the package's own emerald byte-for-byte in five of seven fills
(`#33a482` = accent-strong, `#43cea4` = accent, `#257b61` = accent-deep,
`#d2d5d4` = mist, `#ffffff`) and in all three shadows. The designer repainted
exactly two things — the hover tint and the focus ring — and the ring landed on
`#0d2e26`, which is `brand-teal-100` exactly. That exactness is the tell: the
intent was teal, the rest simply never got repainted.

**Primary, not the accent.** Crimson is reserved for the wizard's prev/next
(decision 2 in the re-skin spec). A nav rail is chrome.

| Token         | Value                             | Note                                                |
| ------------- | --------------------------------- | --------------------------------------------------- |
| `-bg`         | `--color-ui-white`                | `#ffffff`, exact — restated so the token is owned   |
| `-bg-hover`   | `teal-0`                          | near-exact, see below                               |
| `-bg-active`  | `#d2d5d4`                         | off-palette and literal, see below                  |
| `-fg`         | `teal-50`                         | 4.18:1 on white, up from the design's 3.10:1        |
| `-fg-hover`   | `color-mix(teal-50 90%, teal-25)` | 3.56:1 on `teal-0`, see below                       |
| `-fg-active`  | `teal-75`                         | 5.44:1 on the press grey                            |
| `-ring`       | `teal-100`                        | `#0d2e26`, exact — one of the two repainted colours |
| `-tooltip-bg` | `teal-100`                        | inferred, not exported — see below                  |
| `-tooltip-fg` | `--color-ui-white`                |                                                     |

**`-bg-hover`** — the design's `#dffff6` differs from `teal-0` by dL .004
(luminance ratio 1.02×), a 6° hue rotation and a hair more chroma. No mix off the
scale gets closer; pulling toward `teal-25` darkens, moving away. This is the third
time `#eef8f6` has turned up as a designer's "mint tint" (the arrows' hover fg,
`Button`'s hover label), which is what a house lightest-step looks like when it is
working.

**`-bg-active`** is the one token here indistinguishable from residue — and also
the one where residue and correct answer coincide. A pressed white tile going
neutral grey is palette-agnostic by design, and the brand has no equivalent step:
slate is blue-tinted, and `slate-0` is _lighter_ than the white ground, the wrong
direction for a press. Kept as the package's value.

**`-fg-hover`** — the design lifts the glyph hard on hover (accent-strong →
accent, a 1.66× luminance jump), and that lift is itself package residue rather
than a designer decision. It cannot survive here: the ground lightens on hover
too, so 1.66× lands at 1.86:1 in the design's own export. `teal-25` reproduces the
failure identically (1.84:1) — the pastel trap from the other side. The direction
is kept and the magnitude cut to what the inverted tonality affords: 3.56:1 on
`teal-0`, clear of the 3:1 icon threshold. The hover reads regardless, because the
ground carries it (white → mint).

**Tooltip is inferred, not exported.** No tooltip was ever supplied (issue 02 is
still open on it). `teal-100` is the darkest step and the one colour the designer
explicitly reached for in this component, so the tooltip matches the ring. 14.62:1,
well past the 4.5:1 body-text threshold this is the only element in the package to
owe. Revisit if the export arrives.

**Shadows.** All three are the package default in the export, emerald glows and
all, restated on the teal the fills now use: `rgba(51,164,130)` accent-strong →
`teal-50`, `rgba(37,123,97)` accent-deep → `teal-75`. The focus glow's
`rgba(26,132,126,.53)` is the stray `#1a847e` again, mapped back onto the house
hue for the third time.

There is **no `--shadow-ui-navbar-hover`** — the component paints
`shadow-ui-navbar` through hover, and the export agrees. The
`hover:border-white/20` stays dead per spec constraint 2; here it is invisible by
construction anyway, `white/20` over a mint tint.

**Deliberately unset: `-bg-current` / `-fg-current`.** `mlg-components` v0.5.0
added these so the current page can be marked without being disabled (which would
put that item back in the tab order). Both default to the resting fill in the
package, so leaving them unset keeps the current-page treatment invisible, and
`AppSidebar` keeps dimming the current item via `disabled` instead. That is a
workaround, not the destination — it conflates "you are here" with "unavailable".
Setting them properly needs a Figma answer that does not exist yet, and guessing a
colour here would be inventing design. Tracked as debt 2 in
`.scratch/mlg-reskin/issues/06-package-debts.md`.

### 4.4 PopupButton — lagoon

The `+` → `×` disclosure trigger. **Two independent skins**, closed and open, each
with its own full token set — the open one is a tonal inversion (dark glyph on dark
ground) and does not derive from the closed one.

**This component is lagoon**, neither crimson nor teal. Issue 03 left the family
open — arrows-accent or library-primary — and the design answered with neither:
every colour the designer used sits at hue 208–213°, and the closed ground sampled
`#4abfd4`, which is `--color-brand-lagoon-25` to three decimals in L, C _and_ H.
Same tell as the `NavBarButton` ring landing on `teal-100`: the designer reached
into the palette on purpose. Nothing emerald survived anywhere in the fills, so
unlike §4.3 this export was a full repaint, not residue.

The four off-scale colours are all **lagoon desaturated** — same hue, chroma below
every step the scale has. They are derived with `color-mix` rather than hardcoded
so a lagoon change still moves them; each lands within dE 0.013 OKLab of the
designer's pixel, i.e. under the JND.

#### Closed skin

| Token        | Value                                 | Note                              |
| ------------ | ------------------------------------- | --------------------------------- |
| `-bg`        | `lagoon-25`                           | `#4abfd4`, exact                  |
| `-bg-hover`  | `lagoon-25`                           | unchanged — see below             |
| `-bg-active` | `color-mix(lagoon-75 59%, lagoon-0)`  | `#67a0aa`, dE .011                |
| `-fg`        | `#ffffff`                             |                                   |
| `-fg-hover`  | `#bff5ff`                             | literal — see §3                  |
| `-fg-active` | `color-mix(lagoon-100 74%, lagoon-0)` | `#46595c`, dE .013                |
| `-ring`      | `#ffffff`                             | per the design; offset risk below |

**The ground does not move on hover.** The state is carried by the glyph
(white → `#bff5ff`), the `white/60` outline and the white inner glow. `-bg-hover`
is restated anyway rather than left to fall through to the package's emerald. Note
the design _dims_ the glyph on hover: 2.17:1 → 1.83:1.

**`-bg-active` is the press state for both skins.** `#67a0aa` is lagoon hue at
L .670 but chroma .061 — well under `lagoon-25`'s .107 and `lagoon-50`'s .108, so
no step and no lagoon-to-lagoon blend reaches it, only a blend through the
near-white `-0`. It is also the open skin's resting ground: the design makes the
closed press _preview_ the open look. Consequence: pressing the _open_ `×` changes
nothing but `scale-95`.

**`-ring` is drawn at `outline-offset-2`**, so it lands on the page ground rather
than the button — invisible on a light surface. Same exposure as
`--color-ui-arrow-ring`, and the mirror of the open ring below: 14.62:1 on
`teal-100`, 1.00:1 on white.

**`--shadow-ui-popup`** is painted in every state of both skins. Its inner glow was
`rgba(26,132,126,.50)` — the stray `#1a847e` for the fourth time in this package —
restated on `lagoon-50`. The design gives three slightly different resting
geometries across the states and the package has only one token; this takes the
closed default's (`inset 0 -1px 2.6px 1px`, a glow up off the bottom edge), which
is both the resting appearance the token names and the one the designer actually
repainted — the other two are the package's `inset 0 1px 1px` untouched.

**`--shadow-ui-popup-hover` is omitted deliberately** — the design's hover shadow
is the package default exactly, with no colour to restate. So is
`--color-ui-popup-outline-hover` (`rgba(255,255,255,.6)`). Same call as
`--shadow-ui-btn` in §4.2.

#### Open "×" skin

| Token                 | Value                                  | Note                                                  |
| --------------------- | -------------------------------------- | ----------------------------------------------------- |
| `-open-bg`            | `= -popup-bg-active`                   | the closed skin's press ground, referenced not copied |
| `-open-bg-hover`      | `color-mix(lagoon-25 75%, lagoon-0)`   | `#79ccdb`, dE .003                                    |
| `-open-bg-focus`      | `= -open-bg`                           | see below                                             |
| `-open-fg`            | `= -popup-fg-active`                   |                                                       |
| `-open-fg-hover`      | `color-mix(lagoon-25 58%, lagoon-100)` | `#317b8a`, dE .004                                    |
| `-open-ring`          | `= -popup-fg-active`                   | offset risk below                                     |
| `-open-outline-hover` | `transparent`                          | zeroed, see below                                     |

Resting ground and glyph are the closed skin's press pair — one colour, declared
once and referenced here so the two cannot drift.

**`-open-bg-focus` closes issue 03's RAISED 2.** The component used to paint its
focus-visible ground from the hover token, so the open focus state could not keep
the design's resting ground; `mlg-components` v0.4.1 splits this token out (it
still defaults to the hover ground, hence the explicit override). Faithful to the
export — and it gives up the accidental 4.09:1 the forced hover ground bought, so
this state now reads 2.49:1 like the rest of the skin.

**`-open-ring` is drawn with no `outline-offset`**, so like `NavBarButton` it lands
on the page ground: 7.41:1 on white, but 1.97:1 on `teal-100` — it disappears on a
dark rail. Identical WCAG 2.4.11 exposure to §4.3, and the reason the package's
ground-independent `inset 0 0 0 4px` ring is worth reinstating if this ever lands
on a dark surface.

**`-open-outline-hover` is zeroed, not recoloured.** The package draws a solid 4px
`outline-offset-[-2px]` ring on open hover. The design has no such ring — confirmed
twice: absent from the export, and the designer's PNG shows a soft ~3px gradient
rim (the shadow's dark inner glow) where a solid ring would be four flat pixels.
The shadow's edge does the work.

**`--shadow-ui-popup-open-hover`** keeps the package's geometry; its opaque inner
rim was `rgba(4,33,25,1)`, the same emerald-dark residue `Button`'s press carried,
restated on `lagoon-100`.

**`--shadow-ui-popup-open-focus` is two layers, not three.** The design drops the
package's `inset 0 0 0 4px` graphite ring and indicates focus with the outward ring
instead — measured, not assumed: the focus circle is ~6px wider than the resting
one at 1×, and its fill runs flat from edge to glyph. The remaining glow was
`rgba(0,163,220,1)`, the package's own off-family literal, mapped onto `lagoon-50`
as the nearest step in lightness.

### 4.5 Sidebar — teal-100 chrome

One colour token, and it is painted in exactly one layout. `SidebarRail` (≥1024px)
sets **no background at all** — it is a bare flex column, so up there the buttons
float on the page ground and `--color-ui-sidebar-bg` is unused. Only
`SidebarBottomBar` and its "More" popover paint it. Everything else visible in the
bar belongs to `NavBarButton` (§4.3) and `NavArrowButton` (§4.1).

**No Figma export of the rail or bar ever arrived**, so this is inferred, not
transcribed. `teal-100` is the primary's darkest step and the direction the
re-skin spec already commits the ramp to (decision 4); chrome takes the primary,
not the accent.

It clears every contrast check in the bar — measured, not assumed: white
`NavBarButton` fill 14.62:1, crimson `NavArrowButton` fill 3.19:1, and both focus
rings 14.62:1 given the media query in §5.

**`--spacing-ui-sidebar-gap: 0.5rem`** tightens the rail's vertical rhythm from the
package default 1.25rem (`gap-5`) to `gap-2` — the five jump buttons and the
Back/Front arrow pair both. The rail paints no background, so this spacing is the
only thing grouping the column; at 1.25rem the buttons read as five unrelated dots
rather than one control. Bar layout is unaffected.

---

## 5. Sidebar bottom-bar focus ring (the media query)

`NavBarButton` draws its focus outline with **no `outline-offset`**, so the ring
lands on whatever is _behind_ the button rather than on its own white fill. That
ground differs by layout: the page in the rail, `--color-ui-sidebar-bg` in the bar.
One token cannot serve both — `teal-100` on `teal-100` is 1.00:1, an invisible
focus indicator and a WCAG 2.4.11 failure.

So the ring follows the ground:

- **≥64rem** — stays `teal-100` on the light page (14.62:1).
- **<64rem** — flips to white on the `teal-100` bar (14.62:1), which also matches
  `NavArrowButton`'s white ring, so both controls in the bar indicate focus
  identically. Under 640px the "More" popover paints the same
  `--color-ui-sidebar-bg`, so the white ring stays correct there too.

This works **only** because Tailwind compiles colour utilities to a runtime
`var()` reference (`outline-color: var(--color-ui-navbar-ring)`). A shadow token
could not be overridden this way — `@theme` inlines those (§1). If the override
ever stops applying, verify with the compiled-CSS check in the re-skin spec's
Method section.

`64rem === 1024px === Sidebar`'s `breakpoint` prop default, which is a JS
`matchMedia` the CSS cannot see. `AppSidebar` deliberately leaves that prop unset;
passing a custom value would desync the two silently.

---

## 6. Page backgrounds

Two radial gradients, supplied by the designer. Both are **alpha**, so whatever
colour sits beneath them shows through — they are a layer over the page ground,
not the ground itself.

| Token                             | Route           | Stops                                  |
| --------------------------------- | --------------- | -------------------------------------- |
| `--background-image-page-landing` | `/` only        | `lagoon-25` → `teal-75`, both @ 77%    |
| `--background-image-page`         | everything else | `#ffffff` → off-scale mint, both @ 40% |

These use the `--background-image-*` theme namespace, which yields `bg-page` and
`bg-page-landing`. The arbitrary-value form (`bg-[radial-gradient(…)]`) should not
appear in JSX — the gradient strings are long enough that a second copy will drift
from the first.

### The stops are palette, not literals

Three of the four are exact brand steps: `rgba(74,191,212)` is `lagoon-25`,
`rgba(26,90,76)` is `teal-75`, both byte-for-byte. That is the same tell §4
documents for the component exports — the designer reached into the palette on
purpose — so they are derived with `color-mix(… 77%, transparent)` rather than
transcribed as `rgba()`, and a palette change still moves the background.

**This works only because `--background-image-*` is not `--shadow-*`.** Verified
in the production build: Tailwind emits the gradient twice — once with the hex
inlined, and once with the `var()` references intact inside
`@supports (color: color-mix(in lab, red, red))`. Every browser that can run
`color-mix` takes the second. Contrast that with the shadow tokens in §1, which
are inlined outright with no live reference at all.

`--background-image-page` gets no `@supports` copy, and that is correct rather
than a regression: neither of its stops is a token (one is `#ffffff`, the other
the off-scale literal below), so there is no `var()` to keep live and the whole
value folds to `#fff6 → #73d5c066`. Only the landing gradient tracks the palette.

### The one off-scale stop

The inner gradient's second stop is `rgba(114.61, 213.07, 191.53, 0.40)`.
Fractional channels are the signature of an opacity-flattened Figma layer rather
than a chosen colour. Nearest brand step is `teal-25` at dE .042 — twice as close
as the runner-up (`lagoon-25`, dE .085), but still above JND, and substituting it
shifts the composited result `#c7eee6` → `#cbe8e2`. Kept literal per the §3/§4
rule that off-scale colours are written verbatim and raised rather than rounded
into the palette. **Open question for the designer** (item 7 below): given the
other three stops are exact, this one probably wanted to be `teal-25` too.

### How they are mounted

`AppShell` renders a decorative `fixed inset-0 -z-10` layer as a sibling of
`<main>`, switching class on `pathname === "/"`. Three constraints drove that
shape rather than a class on `<main>` or `<body>`:

- **Geometry.** Both gradients size their ellipse in **percentages of the painted
  box** (`ellipse 58.7% 133.55%`), not the viewport. On `<main>`, a long
  `/education/:section` chapter stretches the ellipse to full document height and
  the second stop lands so far off-screen the page reads as flat white. `fixed
inset-0` pins the geometry to the viewport whatever the content does.
- **Coverage.** The layer sits behind the sidebar too, so the rail — which paints
  no background of its own (§4.5) — floats on the gradient instead of cutting a
  strip out of it.
- **Paint order.** `-z-10` is load-bearing. `fixed` makes the layer a positioned
  element, which would otherwise paint _over_ `<main>`'s in-flow content
  regardless of DOM order.

It carries `aria-hidden` (decorative, no accessible role) and a
`data-page-backdrop` attribute, which is the seam `router.test.tsx` asserts on.

The shell paints `bg-page` **unconditionally** — it holds no route knowledge.
`/` deviates by rendering its own backdrop (§7), a second `fixed inset-0 -z-10`
layer that lands later in DOM order and so paints over the shell's at the same
z-index. Both mount in one React commit, so `bg-page` is never on screen alone.

---

## 7. Landing background video

`/` composites `--background-image-page-landing` over looping footage rather than
over the bare page canvas. `AppShell` knows nothing about this; `Landing` owns
the whole layer (`src/routes/Landing.tsx`).

### The wash is plain source-over

The designer's reference is the footage with the §6 landing gradient over it and
**nothing else** — no `mix-blend-mode`, no filter, no second tint layer. That was
measured, not assumed: sampling the reference against the raw frames,
`0.77 * teal-75 + 0.23 * video` reproduces the bottom-right corner to within
3/255. The raw footage is red and grey; all of the teal comes from the existing
gradient.

Because an element's own background paints _behind_ its children, the gradient
has to be a sibling element stacked over the video, not a class on the wrapper.

The wrapper is grounded `bg-white`. The gradient's stops are 77% alpha and were
authored against the white page canvas, so before the video decodes — and it is
9 MB of source footage reduced to 1.9 MB, not instant — `/` looks exactly as it
did before this feature, rather than flashing a colour the designer never
supplied.

### Assets

| File                 | What                                         | Size    | In git |
| -------------------- | -------------------------------------------- | ------- | ------ |
| `landing-video.mp4`  | source, as delivered — 1080p24, 8 s          | 8.99 MB | no     |
| `landing-loop.mp4`   | ping-pong loop, 720p, 16 s                   | 1.90 MB | yes    |
| `landing-poster.jpg` | frame 0, the `poster` + reduced-motion still | 0.15 MB | yes    |

The source is gitignored: nothing imports it, and 9 MB of binary is in every
clone forever once committed. Keep it wherever the client assets live. The
derived files **cannot be regenerated by any build step** — transcoding at build
time would make `npm run build` depend on an ffmpeg binary that is not in
`package-lock.json`, which the reproducibility rule in `CLAUDE.md` forbids — so
the recipe lives here instead.

```bash
# Ping-pong loop. `reverse` yields frames 191..0; trimming to 1..190 drops the
# frames that would otherwise be duplicated at both joins. 192 + 190 = 382.
ffmpeg -i landing-video.mp4 -filter_complex \
  "[0:v]scale=1280:720,split[a][b];\
   [b]reverse,trim=start_frame=1:end_frame=191,setpts=PTS-STARTPTS[r];\
   [a][r]concat=n=2:v=1[out]" \
  -map "[out]" -an -c:v libx264 -crf 30 -preset slow \
  -pix_fmt yuv420p -movflags +faststart landing-loop.mp4

ffmpeg -i landing-video.mp4 -vf "select=eq(n\,0)" -vframes 1 -q:v 4 landing-poster.jpg
```

720p CRF 30 is not a quality compromise worth agonising over: the result sits
under a 77%-opaque wash, which destroys most of the detail you would be paying
for. A VP9 `.webm` was measured at 1.06 MB against H.264's 0.95 MB for the same
frames — **larger** — so there is no second `<source>` to ship.

### Why the loop is a palindrome

The delivered clip is a continuous dolly-in: frame 0 is a wide shot, frame 191 a
close-up of the same cell. Mean absolute difference between them is **46.5/255**,
so `<video loop>` on the source cuts hard every 8 seconds — and since motion is
the only thing this layer contributes, that cut is the most conspicuous event on
the page. Ping-ponging makes both joins ordinary frame steps: measured 6.57 and
5.43 mean difference against a 4.70 baseline for adjacent frames mid-clip. See
`docs/adr/0002-ping-pong-landing-loop.md`.

### Playback and motion

`autoPlay muted playsInline` is the minimum browsers accept — Chrome blocks
unmuted autoplay, iOS Safari additionally requires `playsinline`. The clip has no
audio track, so `muted` costs nothing.

**iOS Low Power Mode refuses autoplay regardless of attributes.** The poster is
therefore a state a real share of visitors will see, not a loading detail — it is
frame 0, so under the gradient it reads as the intended composite.

Under `prefers-reduced-motion: reduce` the `<video>` is not mounted at all
(rather than mounted and paused), which also skips the 1.9 MB fetch. The still
shown instead is that same poster, so both motionless paths agree. The query is
read once at mount, with no `change` listener.

### 7.1 The second placement — the severity band

The same footage backs the "Hemophilia severity and bleeding patterns" band at
the foot of `/education/disease-background`, cropped into the arch with
`object-cover`. Everything above that is placement-specific — full-bleed geometry
and the teal gradient belong to `Landing` — so only the media itself is shared,
as `src/components/BrandLoop.tsx`: the poster, the autoplay attributes and the
reduced-motion branch documented above, and nothing else.

The wash here is **not** the §7 landing composite. Measured the same way —
sampling the designer's band export against the raw frames — it is

```
0.20 * video + 0.80 * (brand-crimson-50 at 15% over the §6 page gradient)
```

which lands within ~2/255 per channel on both anchors available in the export
(the teal-grey plate between cells, and a cell body). Raw footage teal-grey
`rgb(128 146 137)` composites to `rgb(200 200 197)` against the export's
`rgb(198 201 196)`–`rgb(204 204 201)`.

So the band needs no overlay element and no blend mode, unlike `/`: the div's own
`bg-brand-crimson-50/15` is what the video composites against, and `opacity-20`
on the video is the entire effect. That also makes the pre-decode state correct
by construction rather than by a second layer.

**The two numbers move together.** The 15% tint is what supplies the warm cast
that pulls the raw footage's green plate to neutral; the 20% is what sets how
present the imagery is. Raising the opacity alone re-greens the band. Refit both
against the export rather than nudging one.

---

## 8. Landing hero type

The hero on `/` is the one place in the app whose type sits **outside** the
`text-5xl`…`text-xs` scale of §2. The design specifies 60 / 128 / 36 / 24px,
and §2's mapping tops out at 48px.

Tailwind's own scale does run further — `text-6xl` is 60px and `text-9xl` is
128px, so **all four drawn sizes land on a step exactly** (`text-6xl`,
`text-9xl`, `text-4xl`, `text-2xl`) — which was not true under the old house
scale, and is a strong hint that the designer authored against Tailwind's scale
in the first place. The hero takes those four steps directly; no `@theme` entry
is needed for any of them.

| Line                 | Design      | Shipped    | Was                               |
| -------------------- | ----------- | ---------- | --------------------------------- |
| `HM-85L`             | 60px / 400  | `text-6xl` | `clamp(1.5rem, 4.2vw, 3.75rem)`   |
| `The Future Is Now:` | 128px / 700 | `text-9xl` | `clamp(2.5rem, 9vw, 8rem)`        |
| `Personalizing …`    | 36px / 400  | `text-4xl` | `clamp(1.125rem, 2.5vw, 2.25rem)` |
| `LET’S GET STARTED`  | 24px / 600  | `text-2xl` | `clamp(1rem, 1.7vw, 1.5rem)`      |

### The clamps were removed on 2026-08-04

Every `clamp()` in the app was replaced by its own maximum, so each line renders
the drawn value at every width instead of only at the canvas. **This is a
deliberate regression below `lg`**, and the reasoning it replaced is worth
keeping on the record:

At a fixed 128px, `The Future Is Now:` is ~1000px wide — wider than any phone,
and below 1024px the sidebar is a bottom bar, so mobile is a real case here. Each
`vw` slope was set so the size reached the design's exact value at ~1440px and
stopped; the floors were what the narrowest common viewport (320px, minus the
shell's padding) could hold without wrapping the headline. A hero is a single
composition, so the three lines have to keep their relative sizes at every
width — which is also why a breakpoint ramp was refused: it steps all three at
once and looks broken between stops.

Measured at 375 × 800 after the removal: the headline sets in four lines, the
hero fills the viewport, the CTA lands under the sidebar's bottom bar, and the
page scrolls (853px against 800). Open item 33.

**The headline's leading is still a ratio, not a length** — `leading-[0.75]`
(= 96/128) rather than the drawn 96px. That costs nothing now the size is fixed,
and keeps the two in step if it ever moves again.

### The 400 weight

The eyebrow and subtitle are `font-normal`, and Barlow Condensed was previously
imported at 600/700 only — the two lines would have rendered as a
browser-synthesized regular. `src/main.tsx` now also imports
`@fontsource/barlow-condensed/latin-400.css` (+21 kB woff2).

### The CTA override

mlg `Button` is a single fixed scale by design — `px-16 py-[18px] text-[26px]`,
no breakpoints, matching the other atoms in the package. At the design's 24px
label that is ~370px wide, i.e. wider than a 375px phone once the shell's padding
comes off, and it would sit unchanged under a headline that scales. The override
is the design's own 64px / 18px / 24px:

```
px-16 py-4.5 text-2xl
```

All three land on the spacing and type scales exactly. They were the same
`clamp()` triple as the type above until 2026-08-04 —
`px-[clamp(2rem,4.4vw,4rem)] py-[clamp(0.75rem,1.25vw,1.125rem)] text-[clamp(1rem,1.7vw,1.5rem)]`
— whose floors are what kept the pill inside a 375px phone.
Overriding from the consuming app is the package's own instruction — `cn` is
tailwind-merge, so the later class wins.

**`leading-tight` has to be restated in that same override.** tailwind-merge
treats a font-size utility as resetting line-height, so passing any `text-*`
class silently drops the component's own `leading-tight` and the label inherits
instead. The design's `leading-5` is deliberately not used either way: the
package comments that its looser leading exists so the label does not overlap
itself when it wraps, and a 20px line box under 24px type reintroduces exactly
that.

The CTA is also a destination rendered as a `<button>` — `Button` has no `href`
or `render` escape hatch the way `SidebarItem` does (§4.2, mlg-components 0.5.0).
Accepted deliberately and tracked as debt 5 in
`.scratch/mlg-reskin/issues/06-package-debts.md`.

### Centring

`<main>` is `flex min-h-dvh flex-col` so the hero can claim the leftover height
with `flex-1`. A percentage would not work: `min-height: 100%` against a parent
whose `height` is `auto` resolves to zero, and `min-h-dvh` leaves it `auto`. The
padding is inside that height (border-box), so the hero centres in the area clear
of the bar and the rail rather than behind them — which does mean it sits left of
true viewport centre at ≥1024px, optically clearing the rail. That offset is
~25px since §11 widened the shell's gutters to 112/163 (it was ~48px under the
old `p-4 lg:pr-24`). The hero itself does not move: `max-w-280` is 1120px, still
narrower than the 1165px content column, so it stays centred within it.

---

## 9. Open items

| #   | Item                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Where                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| 1   | `PopupButton` fails the 3:1 non-text threshold in **every** state it specifies (2.17:1 default, 1.83:1 hover, 2.49:1 press/open, 2.66:1 open hover). This is **not** a mapping error — the mapping is exact. `lagoon-25` is a light step (lum .435) being used as a saturated ground under a white glyph; every other component in the library uses its scale's `-50` step for that job. The one-token fix, if the designer wants it, is `--color-ui-popup-bg: var(--color-brand-lagoon-50)` → 3.58:1.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | issue 03, RAISED 1    |
| 2   | Focus rings drawn without `outline-offset` (`NavBarButton`, `PopupButton` open skin) or with a positive offset (`NavArrowButton`, `PopupButton` closed skin) land on the page ground, so their contrast depends on a surface the component does not own. Currently resolved for the bar by §5; any new dark surface reopens it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | issues 00, 02, 03     |
| 3   | The palette has no step brighter than `crimson-50` and no saturated near-white; two literals stand in.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | §3, issue 01          |
| 4   | `--color-ui-navbar-bg-current` / `-fg-current` deliberately unset; current-page state is signalled with `disabled` instead.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | debt 2, issue 06      |
| 5   | `NavBarButton`'s tooltip colours are inferred — no export was ever supplied.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | issue 02              |
| 6   | No semantic layer yet. `bg-surface`, `text-heading`, etc. do not exist; the app reads raw brand steps in the meantime.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | app-buildout issue 02 |
| 7   | The inner gradient's second stop is off-scale (`rgba(114.61, 213.07, 191.53)`, dE .042 from `teal-25`) while the other three stops are exact palette. Probably meant to be `teal-25`; kept literal pending a designer answer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | §6                    |
| 8   | The landing footage does not loop — it is a continuous dolly-in, 46.5/255 apart end to end. Ping-ponging it is a workaround; **ask the designer for an 8–12 s clip that loops cleanly**. That would halve the asset and remove the direction reversal.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | §7, ADR 0002          |
| 9   | The references do not agree with the §2 scale **or with each other**: `disease-background` measures ~32px sub-headings, ~18px body and ~22px captions against the scale's 26/16/20, while `rebalancing-agents` measures ~24px body and ~25px captions. **The three chapters answered it differently until 2026-08-04**, when the §2 migration put all of them on `text-2xl` and removed the divergence — but only by making every reading round to the same step, not by resolving which reading is right. Still needs the designer's sizes.                                                                                                                                                                                                                                                                                                                                                                                                                                                       | §11                   |
| 10  | The chapter is specified to fit one screen and currently does not (818px at 1440×800). Wants one rule across all four chapters rather than per-page constants.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | §11                   |
| 11  | Four of the eight vertical gaps are ink-to-ink measurements off the reference PNG rather than the designer's box gaps, so they render slightly loose.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | §11                   |
| 12  | The pop-up export has **no scrim** — nothing dims the page behind a dialog that traps focus. The shipped `rgb(0 0 0 / .5)` is inferred, like §4.3's tooltip and §4.5's sidebar. The card's own 55%-black shadow was drawn against Figma's dark canvas and does much less work over the light `bg-page`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | §13                   |
| 13  | ~~The pop-up title is 45.47px, off the §2 scale, and ships as a raw value under §8's precedent.~~ **Closed 2026-08-04** — but not the way it was written. 45.47px is the _drawn_ size; what shipped was a clamp capped at 36px, and had been since day one. The code now matches the drawing, so the raw value is genuinely on screen and the question this row asked (is an off-scale title acceptable?) is answered by §8's precedent as it always was. Kept as a row so the numbering below it does not shift.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | §13                   |
| 14  | `--color-agent-mab` (`#003d93`) is a sixth hue: it derives from no brand ramp, and the nearest steps are a different colour rather than a different step. Transcribed verbatim pending a designer answer on whether the agent classes are meant to be brand colours at all. Its pair, `--color-agent-sirna`, is `crimson-50` exactly.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | §11                   |
| 15  | The artboards disagree on the disclosure-caption colour: `#074655` on the first two, `lagoon-75` (`#076278`) on `rebalancing-agents` **and now `fviiia-mimetics`** — so it is 2 v 2 and the tie is no longer breakable by weight of evidence. All four chapters use `--color-popup-caption`, the first value, pending a designer answer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | §11                   |
| 16  | `rebalancing-agents` draws three figure boxes under a caption telling the reader to click them, but §7.7 names no target for any of the three and the export draws "PLACEHOLDER" in all of them. Needs the designer to say what a box opens.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | §11                   |
| 17  | The mechanisms prose card glosses only `AT`, but its own copy introduces `TFPI` and `APC` as well; the figure card behind it glosses only `TFPI`. Shipped with all three on the prose card (§11), which also normalises the export's "AT=" to the "TFPI = " spacing it uses one card later. The alternative reading is that the two cards are meant as one and the gloss is split deliberately — needs the designer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | §11                   |
| 18  | `NavArrowButton` and `Button` are not `forwardRef`, so `ref` does not typecheck on either (`PopupButton` is). That is what blocks focus management when the mechanisms card swaps steps — there is no handle to focus. Package change, tracked in `.scratch/mlg-reskin/`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | §11, mlg-reskin       |
| 19  | `--background-image-emerging-panel`'s mint (`#c6eee5`) is dE .0136 from `color-mix(teal-25 30%, teal-0)` — between the ~.002 every derived token clears and the .042 that made item 7 literal, so the file's own rule does not decide it. Shipped literal; ask the designer whether it is meant to be a teal step.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | §11                   |
| 20  | ~~`fviiia-mimetics` ships four `+` disclosures that open nothing.~~ **Closed.** All four cards (Pop ups 10–13) are built; the diagrams arrived as rasters rather than the SVG exports this item asked for, which is why three of them carry their heading in their own pixels. Kept as a row rather than deleted, so the numbering below it does not shift.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | §11                   |
| 21  | `--color-note-panel-border` (`#747474`) is a neutral grey off every ramp — a hue away rather than a step. Sampled exactly neutral on all three channels, so it is neither an antialiasing artefact nor black at an opacity. Transcribed verbatim pending a designer answer, as item 14 is.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | §15                   |
| 22  | The two `/wizard/therapies` exports disagree about inter-bullet spacing in the note panels — 12px in the Considerations one, 0 in the Strategies one. Shipped at 0 (six observations against one, and the only reading that fits the 8-bullet leaf on one screen), which renders the Considerations panel 141px against the drawn 152.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | §15                   |
| 23  | The `/wizard/therapies` bands and arch are drawn 1216px wide (x 112→1328), 48px wider than `max-w-content`. Same "the artboard forgot the sidebar rail" divergence `/wizard/scenario`'s box row has. Wants **one** designer ruling covering all of them rather than three. The later vector export of the header bands gives `w-[1217px]`, a third independent reading of the same 1216 and the reason this is a rail question rather than a rounding one. **`/explore` now makes it three pages and three answers**: its arch row is drawn on the identical 112→1328 band and ships at exactly that (`lg:-mr-rail`), where `/wizard/therapies` takes `-mr-16` and lands on 1344.                                                                                                                                                                                                                                                                                                                  | §15, §12, §17         |
| 24  | The seven drug-sheet exports agree on every gap except the one **above** a section label: 29–31px over the line on three sheets, 36–44 on three more, and 48 / 56 on Denecimig, which draws what reads as a blank line before two of its labels. Everything else is 26 ± 1 (bullet to bullet) and 33 ± 1 (label to its list) across all thirty-five sections, so this is the only loose value in the card. Shipped uniform at the median (`mt-3`). Same shape as item 22.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | §16                   |
| 25  | The drug-sheet card's horizontal inset is `Popup`'s `px-16` (69px from the card's outer edge). **Two of the seven exports draw exactly that; the other five draw 49.** Not split, because the padding belongs to a card shared with the §7.5 chapters. Wants a designer answer with items 9 and 13 rather than alone.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | §16, §13              |
| 26  | `/explore`'s class labels fit a letter-spacing of **0.036em** across all four strings — between `tracking-wide` (0.025em) and `tracking-wider` (0.05em), and on no step at all. Shipped `tracking-wide`, which renders the longest label 353 → 344px. One tracking rule across every display heading in the app beat an exact bespoke value on a centred label that shifts no layout, but it is the designer's to confirm. Same shape as item 9 — a size/spacing question the file answers off the scale.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | §17                   |
| 27  | ~~`Popup` is too narrow for the §5 comparison table's nine columns.~~ **Half closed.** `Popup` now has a three-step `width` scale and the table's card takes `wide` (1360px), so the columns get ~136px instead of ~113 and the card is no longer the binding constraint. What remains is not a card question: 1360px is not a phone, so the grid still wants a horizontal scroll region inside the card, which is issue 09's own acceptance criterion and is decided against a body that exists. **1360 is a picked number, not a drawn one** — no artboard shows this card, so if the designer draws the table the width is theirs to overrule.                                                                                                                                                                                                                                                                                                                                                  | §13, §17, ADR 0007    |
| 28  | ~~The pop-up title caps at 36px against the drawn 45.47, and the band's padding is `py-5` against the drawn 12.~~ **Closed 2026-08-04, in code.** Both shipped wrong from the component's first commit and neither was visible, because they cancelled: 20 + (2 × 37) + 20 = 114px of band against the drawn 118. Corrected to the drawn values in both cases; three titles gain a line, none reaches three, the two-line band lands at 117, and `PopupFigure`'s `reserve` — documented against a 117px band it was not getting — becomes correct. The band also gained a `min-h-[65px]` floor, which is the ✕'s own height rather than a design value. Verified on twenty cards at 1440 and 390.                                                                                                                                                                                                                                                                                                  | §13                   |
| 29  | **Two of the three `Popup` widths moved on 2026-08-04 and neither new number is drawn**: `narrow` 869 → 860 and `default` 1024 → **1140**. The consequence is the one the default was documented as protecting — `hemostatic_mechanisms_diagram.webp` is stored at 1772px for a drawn 886, which was exactly the old body, and the body is now 1002. The asset did not move with it, so the §7.6 figure is painted ~13% past its stored width. Either re-export it at 2004px or return the default to 1024; the widths are the designer's, and the raster follows them.                                                                                                                                                                                                                                                                                                                                                                                                                            | §13, §7.6             |
| 30  | **The §2 migration of 2026-08-04 is verified at 1440 and 375 only.** A Chromium pass over all ten routes at both widths confirmed: no horizontal overflow anywhere, `<h1>` computing 48px/48/700 at 1440 and 30px/36/700 at 375, and `CHARACTERISTICS` clearing the 375 column. **1024 and 768 were not checked**, and 1024 is where the gutter steps 48 → 112 and the prose column is thinnest (§12) — the width most likely to break and the one still unmeasured. §2's `<h1>` overflow table also remains arithmetic (rescaled ×48/52); the pass proves the conclusion, not the individual pixel figures.                                                                                                                                                                                                                                                                                                                                                                                       | §2, §12               |
| 31  | **`/explore`'s `<h1>` lost 6px to the scale** — drawn 42, fitted by least squares with residuals ≤1.1px, now `text-4xl` at 36. The largest fidelity loss in the migration, and it re-flowed: **the heading now sets in three lines where the artboard draws four.** It reads well and is arguably tighter, but it is no longer the drawn composition. If that matters, restore `text-[42px]` under §8's precedent rather than moving to `text-5xl` — 48 is further from 42 than 36 is.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | §14                   |
| 32  | **Every chapter now fits 1440 × 800 with no scroll**, measured in the item-30 pass — `document.scrollHeight` is exactly 800 on all five. Item 10 recorded `prophylaxis-guidance` at 818px and open; the tighter body leading §2 brought (25.6px line box → 24px) is the likely cause, but the before-state was not measured in the same pass, so this is an observation rather than a closure. Confirm, then close item 10.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | §11                   |
| 33  | **Every `clamp()` in the app was replaced by its own maximum on 2026-08-04, and the last two arbitrary font sizes were rounded onto the scale with it (45.47 → `text-5xl` 48, 26 → `text-2xl` 24) — the app now has no arbitrary font size anywhere, and the small-screen layouts regressed as a result.** Measured at 375 × 800: `/` sets its 128px headline in four lines, fills the viewport, pushes the CTA under the sidebar's bottom bar and scrolls (853px against 800); `/explore` and `/wizard-intro`'s CTAs are both now 24px type in a 20px `leading-5` box, wrapping to four lines with descenders into the caps below — the exact bug the clamps were added to fix, and one that had shipped once before; `Popup`'s band spends 200px of a 345px card on padding. Nothing overflows horizontally and 1440 is untouched, so this is a below-`lg` regression only. The fixes are per-case, not a blanket revert: `leading-tight` on the two CTAs, and a floor of some kind on the hero. | §8, §13, §14          |

---

## 10. Page top rule

Every page except the landing one opens with a full-bleed crimson band, 14px
tall, pinned to the top of the viewport.

The colour is `brand-crimson-50` (`#d63a52`) — sampled from the designer's
reference at `rgb(214, 58, 82)`, i.e. the palette step exactly, no literal
needed. It is the same accent the CTA and the Prev/Next arrows already carry
(§4.1, §4.2), so the band reads as brand chrome rather than a status colour.

The height is `h-rule` (`--spacing-rule`, `0.875rem` = 14px). It was `h-3.5` —
that default step lands on the design value exactly — but the shell has to add
the same 14px to its own top padding to clear the band, and a height and a
padding that must agree should not be two literals maintained apart. §12.

### Where it is mounted

`src/routes/TopRule.tsx`, a **pathless layout route** wrapping every non-index
child in `src/routes/router.tsx`. Not a `pathname === "/"` branch inside
`AppShell`: which pages get the rule is a routing fact, and keeping it in the
route config means the answer is readable from `routes` itself instead of from a
condition that has to be revisited every time a page is added. Same principle as
the landing backdrop in §6 — route-specific chrome does not live in the layout
component.

### Why `fixed`, and why no clearance padding

`<main>` is `min-h-dvh` (§8). An in-flow 14px band stacked above it would make
every page 14px taller than the viewport and give each one a scrollbar with
nothing to scroll, so the rule is `fixed inset-x-0 top-0` and out of flow.

`<main>` opens with the band's own height plus the designer's gap beneath it —
`pt-below-rule`, composed in §12 from the same `--spacing-rule` this element is
drawn with — so at scroll top the band overlaps padding only. Content passing
under it once the page scrolls is the intended behaviour.

`z-30` places it over page content — which is unpositioned, and would otherwise
paint below a `fixed` sibling only by DOM luck — and under the sidebar's own
z-40/z-50 chrome, so the bottom bar's "More" popover is never cut by it.

---

## 11. Education chapters

The first designed content page is `/education/disease-background`
(`src/routes/education/DiseaseBackground.tsx`). Its reference is a **1440 × 800**
artboard — derived, not assumed: the crimson rule measures 18 image px on a
2000px-wide export, and 18 / (2000/1440) = 12.96 ≈ the 14px of §10. Every figure
below is in CSS px at that canvas.

### The app-wide gutter

Content starts **112px** from the left edge and the column ends **160px** from
the right — the same 112 plus 48px of clearance for the rail, putting the
column's right edge at x=1280. Both live on `<main>` in `AppShell` as tokens
(§12), not on the page: the designer specified the left gutter for every page,
so restating it per chapter would be eight chances to disagree. Both are `lg:`
only; 112px of a 375px phone leaves 151px of text.

Page **rhythm** deliberately does not live in the shell — it differs per page, and
the shell holds no route knowledge (§6). The shell's vertical padding is a
different thing: clearance for its own fixed chrome, the rule above and the
sidebar below.

### Off-palette black

Body copy and the two sub-headings sample as pure `#000000`. The palette has no
black and nothing within reach of one: the nearest step is `slate-100` (`#111d2e`)
at dE .232 OKLab, roughly 10× the just-noticeable threshold every other mapping in
this document holds itself to, and it is a blue-black rather than a neutral. So it
ships as `text-black`, verbatim, per the §3/§4 rule that off-scale colours are
written as-is and raised rather than rounded into the palette. Issue 02's semantic
layer is where it becomes `text-base` / `text-heading`.

### `--color-popup-caption`

The caption under each `PopupButton` samples `#074655` — off every lagoon step, but
it is the scale's own midpoint:

```
color-mix(in oklab, lagoon-75 52%, lagoon-100)   →   dE .0006
```

Two orders of magnitude under JND, which is the same tell §4.4 records for the
`PopupButton` fills themselves: the designer was working inside the lagoon family
on purpose. Derived rather than transcribed so a lagoon change still moves it, and
verified in the build — Tailwind keeps the live `color-mix` under
`@supports (color: color-mix(…))` exactly as it does for the gradients in §6.

Named outside both existing namespaces on purpose: `brand-` is the raw scale, and
`ui-` belongs to `mlg-components`.

### Layout

A two-column grid at `lg+` — `1fr` + a fixed **470px** figure with the designer's
**32px** gutter, which lands the prose at 112–775 and the card at 807–1277.

Only the diagnosis **bullet** spans both columns. Its heading sits in the left
column _beside_ the figure, which is where the reference has it: the card runs to
y=392 and the heading's ink to y=403. Getting this wrong (spanning the whole
diagnosis block) opens a 97px hole where the design has 16px.

Below `lg` the grid collapses to one column and DOM order carries the stack:
mechanism → figure → diagnosis → disclosures.

The severity heading and the button row are centred on the **content column**, not
the viewport. The reference centres them on its 1440 artboard, which is ~25px
right of the column centre once the asymmetric rail gutter is taken off; breaking
two elements out of the container to recover 25px is not worth the machinery.

### Vertical spacing

| Gap                            |  px | Source   |
| ------------------------------ | --: | -------- |
| crimson rule → h1              |  32 | designer |
| h1 → "Disease mechanism…"      |  32 | designer |
| sub-heading → its bullets      |  28 | measured |
| mechanism → "Diagnosis:"       |  16 | designer |
| "Diagnosis:" → its bullet      |  22 | measured |
| bullet → severity heading      |  66 | measured |
| severity heading → `+` buttons |  45 | measured |
| `+` button → its caption       |  40 | designer |

"Designer" values are box gaps and are exact. "Measured" values are ink-to-ink off
the reference image, so they render a little looser than intended wherever a line
box carries leading above its glyphs — replace them when the Figma numbers arrive.

The rule-to-h1 gap is the only one of the eight the chapter does not set itself.
The rule is `fixed` and out of flow (§10), so the gap has to be padding on
`<main>`, and it is the same for every chapter — it is `--spacing-below-rule-lg`
in §12, the band's 14px plus this 32, and the h1 carries no top margin at all.

### Open: the chapter is meant to fit one screen

The reference fills its 800px artboard exactly — 59px above the h1, the ink, eight
gaps, 4px of slack — and the chapter is specified to fit one screen rather than
scroll. **This is not implemented.** The page is currently 818px tall at 1440×800
and scrolls.

A first attempt scaled all eight gaps off a single `--v` length clamped against
`100dvh`, so they shrank in proportion as the viewport shortened. It worked, but
the incompressible constant it needs is a per-page magic number — and the one
derived from the artboard was wrong by 104px, because ink measurements do not
include line-box leading. This wants **one rule for every chapter**, written once
the other three exist, not eight numbers per page. Deferred deliberately.

### Open: the type is smaller than the reference

The chapter uses the §2 scale — `text-5xl` for the title, `text-3xl` for the severity
heading, `text-2xl` for the sub-headings, `text-base` for bullets, `text-xl` for
captions. The first two match the reference; **the last three do not.** Cap-height
measurements put the reference at roughly 32px sub-headings, 18px body and 22px
captions, against the scale's 26 / 16 / 20.

The wrap points prove it independently: at an identical 663px column the reference
breaks line 1 after "…disorders, resulting" while the shipped page fits
"…resulting from X–". Awaiting the designer's actual type sizes, and then a call on
whether this chapter transcribes raw values the way the landing hero does (§8) or
snaps to the scale.

### `treatment-landscape`

The second designed chapter (`src/routes/education/TreatmentLandscape.tsx`), from a
**1440 × 800** artboard like the first. It carries the same type as
`disease-background` by instruction — `text-5xl` title, `text-3xl` sub-headings,
`text-base` bullets, `text-2xl` captions, all with the same tracking — so open item 9
above applies to it unchanged and is not re-litigated here.

**Layout.** Three rows of `[prose | figure | disclosure]` in **one grid**, not a
prose column beside an independently-spaced rail. Each block is paired with its own
figure and its own `+`, and the grid is what holds that pairing when a bullet is
added. Measured off the export, rows 2 and 3 have box-top ≈ heading-top within 8px,
which is what says the pairing is real rather than coincidence.

Tracks are stated as the residue of the content column:

```
1168 − 24 − 202 − 24 − 286  =  632px prose
```

which puts the figure box at x=768 (the artboard draws 762) and the caption's right
edge on the content column's own at x=1280 — landing its left edge on 994, which is
where the artboard's caption ink starts. The `+` centres at 1137 against a measured 1135. All `lg:` only; below that the grid collapses and DOM order stacks each row
prose → figure → caption.

The 24px column gap is a tightening of the artboard's 32, applied after the first
pass; the figure box moves 6px right of where the export draws it and everything else
still lands. The caption track is what is load-bearing here, not the prose width —
286px is what puts the column's right edge where the design has it.

`items-center` throughout: whichever of prose / figure / caption is tallest sets the
row, and the other two sit level with its middle. The artboard's own alignment is
inconsistent — it lifts the **first** figure ~30px above its heading (the "figure sets
the top, prose is nudged down" relationship `disease-background` reproduces with
per-column margins) and leaves the other two level with theirs. One rule across three
rows beat reproducing a 30px eyeball as a per-row nudge, and centring reads as
deliberate where a ragged top edge reads as a mistake.

The caption cell is therefore `flex flex-col items-center` and nothing more — under
`items-start` it carried a 166px floor and `justify-center` so the `+` would centre
against the figure beside it, and the row's own centring makes both inert.

**The reserved boxes.** All three §7.7 figures on this chapter are image-borne with
no asset (CONTEXT.md §7.7), so the artboard's "PLACEHOLDER" boxes ship as empty
`202×166` bordered `<div>`s that hold the track open. Not an `<img>`: an empty one
announces itself as broken and takes an `alt` it has nothing to say in. An empty
`<div>` is already invisible to assistive tech, so it needs no `aria-hidden`.

The export draws them **164 / 224 / 166** tall — same width, three heights. Read as
the designer stretching a placeholder to fill its row rather than as spec, and shipped
uniform at the two that agree, so the rail reads as a set and dropping in real assets
does not re-cut the grid.

**Vertical rhythm.** `mt-8` from the h1 (the designer's 32px, same as §11's
`h1 → "Disease mechanism…"`), `gap-y-5` between rows, and `mt-4` from each `+` to its
caption (matching `DisclosureBand`). The row gap measures 25 and 28 ink-to-ink on the
export and ships at 20 — tightened, like the column gap, once the rows were centred
and the ragged edge the looser value was absorbing went away.

**It fits one screen.** 800px exactly at 1440×800, verified in Chromium — so the §11
open item below happens to be satisfied here. That is a property of this chapter's
content, not a rule, and it does not close the item: the rule still wants writing once
all four chapters exist.

**The 1024px cliff bites harder here.** §12's open item leaves `disease-background`
with a 250px prose column at exactly 1024px; this grid's fixed tracks leave **220px**.
Verified, cramped but not broken, and deliberately not fixed separately — the `clamp()`
that section proposes is one change that fixes both.

**Copy that diverges from the source.** The three sub-headings are literals, not
`topic.title`: two carry a colon the source titles do not, and the middle is
"Non-factor therapies:" over a topic named "Non-factor Replacement Therapies". The
first caption reads "clotting **replacement** therapies" where CONTEXT.md §7.4/§7.7
both say "clotting-**factor** replacement therapies" — shipped as drawn, because the
artboard is the authority for on-screen copy, and raised for the designer rather than
silently corrected (contrast the export's "FACOTOR", which is an unambiguous typo and
is not reproduced).

**The "Table 1" card.** The third `+` opens CONTEXT.md §7.3's class matrix, and the
same rule settles four more items on it.

The band reads **"TABLE 1"** — the only card whose title names a figure number rather
than its own subject, and therefore the only dialog whose accessible name says nothing
about what is in it. Shipped as drawn: the trigger's caption ("Novel therapy classes
for HA/HB") is what a reader followed to get there, so the context exists a beat
earlier in the reading order. Worth a designer's second look all the same.

`TREATMENT_OPTIONS_MATRIX` is **reconciled with the artboard, not with §7.3**. It began
as a transcription of PPTX slide 7 and compressed it into table shorthand — `↑ FVIII by
2 IU/dL per IU/kg`, `HA/HB`, `→` — which was right for a record of the source and wrong
the moment the strings became on-screen copy. The export spells all of it out, so the
data module now does too, and §7.3 keeps the source's own wording. (Same call the §7.6
`severe --> mild` edit made, in the same direction.)

Three drawn strings are **not** reproduced, on the "FACOTOR" precedent: "anti–THPI"
(the same row's MOA cell says TFPI), a second "IU/dl" in a cell that writes "IU/dL"
either side of it, and "inter-individiual".

One divergence is deliberate and **open**: the export gives AAV gene therapy the
population "Hemophilia A/B without inhibitors", which contradicts both §7.3 and the MOA
cell beside it — an _F9_ transgene is hemophilia B. Not a typo, so not silently fixed
either; held at B, because a table that tells a clinician the class is indicated for HA
is a worse error to ship than a stale cell, and raised for the designer.

**Its type is measured, not assumed.** Three sizes off the export, none of which lands
on a scale step at the weight drawn: 20px column headings, 16px in the three middle
columns, 24px in the two outer ones — the drawing genuinely sets the option name and
the route larger than the prose between them. Footnotes are 14px/300 set solid
(`leading-none`), which is the designer's own inspector value. All five were raw
under §8's precedent because the old `h3`/`h4` steps bundled weight 600. With
weight now stated at the call site that reason is gone, and — unusually for this
app — **all four sizes land on a Tailwind step exactly**: 24 → `text-2xl`,
20 → `text-xl`, 16 → `text-base`, 14 → `text-sm`, no rounding in any of them.
Only the leading is still transcribed.

The hairline between cells is **inferred**, as `SeverityTable`'s is: the export draws a
flat `#A0A0A0` the palette has no token for, and `black/30` over the body gradient
resolves within a point of it — close enough that matching the grey exactly would only
buy a raw hex in a file that has none.

### `rebalancing-agents`

The third designed chapter (`src/routes/education/RebalancingAgents.tsx`), from a
**1440 × 800** artboard like the other two — derived the same way, the crimson rule
measuring 13.7 on the 2000px export against §10's 14.

Its shape is unlike either predecessor: no grid. Prose, then a centred row of three
reserved figure boxes under a caption, then one "Click here:" `+` — and that last row
puts the caption to the **left** of the button, where `DisclosureBand` and
`treatment-landscape` both stack it underneath.

**Geometry**, all measured off the export and stated in canvas px:

| Thing                | Value     | Drawn     | Note                                    |
| -------------------- | --------- | --------- | --------------------------------------- |
| box                  | 224 × 192 | 227 × 185 | `border-4`; the export's stroke is 3.6  |
| gap between boxes    | 141       | 141       | the group is **963** wide               |
| group centre         | x = 720   | x = 720   | the canvas centre, not the column's 696 |
| boxes → caption      | 16        | 16        |                                         |
| caption → bottom row | 80        | 80        |                                         |
| caption → `+`        | 24        | 38        | the `+` is `size-16.25`, drawn 62       |

Two of those are shipped off the drawn value on purpose, and both follow from the type
below being transcribed rather than snapped: the boxes are squared up to whole scale
steps (`h-48`/`max-w-56`) and the bottom row's gap is tightened to `gap-x-6`, which is
what keeps the chapter on one screen once the prose is set at 26px. The group width
stays the drawn 963, so the row and the bottom caption still share their left edge.

The group **centres on the content column**, not on the canvas. The export centres it
at x=720, ~24px right of the column's 696 — the same offset §11 records for
`disease-background`'s severity band, resolved the same way and for the same reason.
The bottom row is aligned to the group's left edge rather than the column's, which is
why the group width is a named constant in the chapter: three things measure against
it and have to agree.

The caption under the boxes is **wider than the boxes** — 1082 of ink against the
group's 963, overhanging both sides — so it is centred on the column at full width
rather than constrained to the group.

**It fits one screen.** 800px exactly at 1440×800, verified in Chromium, so §9 item 10
stays a `disease-background` problem.

**Its body type is transcribed, not snapped — the first chapter to do so.**
Cap-height measurements put this export at ~24px body copy and ~25px captions, where
the `disease-background` reference measured 18 and 22: the same elements, a third
apart between two artboards, which is what makes §9 item 9 a spread rather than a
single offset.

So the bullets ship as `text-2xl` over `BulletList`'s `text-base` base, and the
three agents at `font-semibold` under it. This was a raw `text-[26px]` until
2026-08-04, taken raw because the old `h3` step bundled weight 600 where the
prose is drawn at 400. With weight stated at the call site that reason is gone,
so the step is usable and the measured 26 now renders at 24 (§2). The captions
were already on the step and are unchanged; 26 against the drawn 25 was always
inside the measurement, and 24 is 1px the other side of it.

This is the divergence §9 item 9 has been holding open, decided in one direction for
one chapter. `disease-background` and `treatment-landscape` still render at the scale,
so the item stays open — what it now records is that the three chapters no longer
agree, and that this one is the reference for how a transcription looks when the
designer's numbers do arrive.

**The caption colour also disagrees between artboards.** This one samples `#076278` —
`lagoon-75` exactly — where the earlier ones gave `#074655`, the value
`--color-popup-caption` is derived from. The chapter uses the existing token, so all
three chapters' captions stay one colour, and the difference is a designer question
rather than a second answer in the codebase.

**`--color-agent-mab` / `--color-agent-sirna`.** The artboard colours the three agents
by mechanism class: the two anti-TFPI mABs in `#003d93`, the AT-directed siRNA in
`crimson-50`. The crimson is exact. The blue is the one value in `tokens.css` that is
neither a scale step nor derived from one — the nearest steps, `lagoon-75` (`#076278`)
and `slate-75` (`#2e4056`), are a different hue rather than a different step, so it is
transcribed verbatim under the §3/§4 rule and raised (§9 item 14). The two are named as
a pair because the mapping is one fact, agent class to colour, and half of it stated as
a token with the other half a bare palette reference would read as coincidence.

**What the chapter does not do**, deliberately: the three boxes are empty reserved
boxes (§7.7 marks all 24 figures image-borne, and the export draws its own
"PLACEHOLDER" in them, so the designer has not placed them either). The caption above
the boxes therefore instructs a click that does nothing — it ships as drawn because
that pass was the layout, and what a box opens is a question §7.7 does not answer.
Item 16 stays open. The `+` beside them no longer opens nothing; see below.

#### The mechanisms click-through: two cards, one dialog

Its §7.7 target is the first in this codebase that opens **two** cards in sequence —
the mechanism prose, then the diagram behind its "View mechanism" button, with a
`NavArrowButton` back. Both are one `Popup` whose title and children come from a
`"prose" | "figure"` step, rather than two dialogs handing off: the dialog is never
closed and reopened as the reader steps, so the platform's focus restoration fires
once, on the way out, onto the `+`. ✕, ESC and a backdrop click therefore all mean
_closed_ from either card, and reopening starts at the first — the `+` names the
target as a whole, not whichever card the reader left on.

**Its prose is sectioned, which is what restructured the data.** The export draws the
lead as a paragraph and each mechanism class as a crimson heading over its own
bullets, where `rebalancing-mechanisms` held five flat strings with the two lead-ins
carrying trailing colons. They are `NestedBullet`s now — the shape that module said it
was holding out for until an artboard showed the nesting — so the card dispatches on
the `Bullet` union rather than splitting on punctuation or slicing at an index.

**Its type is measured off the 2000px export and is approximate**, that being a raster
rather than Figma: ~26px for the lead set tight, ~20px for the bullets, 32px bold for
the two headings, 14px/300 solid for the footnote. All four now ship as steps —
the headings at `text-3xl` (30, from a measured 32), the lead and bullets at
`text-2xl` and `text-xl`, the footnote at `text-sm` exactly. The 20px is
`BenefitsChallengesCard`'s own pop-up body value reused rather than re-derived.
None of this is worth much precision either way: the source is a raster and the
sizes are approximate, so a ±2px snap is inside the measurement error.

The CTA is the package `Button` with `py-2` against its own `py-[18px]` — the export
draws ~353×49 where the component computes ~358×68, so the width agrees and the height
does not. The override is the one its doc invites.

**One deliberate, open divergence.** The export glosses only `AT` under the prose card,
but that card's own copy introduces `TFPI` (its first heading is "Anti-TFPI monoclonal
antibodies") and `APC` (its lead names "the APC/protein S system") — so as drawn it
defines one of the three terms it uses. It ships with all three, in
`figures[0]`'s wording and order, which also normalises the export's "AT=" to the
"TFPI = " spacing the very next card uses. Raised for the designer, not silently
settled: the alternative reading is that the two cards are meant to be read as one and
the gloss is split across them on purpose.

**No focus management between the cards**, which is a package limitation rather than a
choice: `NavArrowButton` and `Button` are not `forwardRef`, so `ref` does not typecheck
on either (only `PopupButton` is), and there is no handle to move focus to when the
previous step's control unmounts. The browser's own behaviour ships instead — focus
drops to `<body>` (measured in Chrome, not to the `<dialog>`), and since `showModal()`
has made the rest of the document inert, the next Tab lands on the new card's own
control. Degraded, not trapped. The gap is logged in `.scratch/mlg-reskin/`.

**Verified in Chrome at 1440×800 and 390×780.** The figure lands at exactly 886×430
from a 1772×860 file, and its card does not scroll at 1440 (574px of content in 574px
of body). The prose card does scroll, which it must — it is ~660px of copy.

One thing the suite could not have caught, and the reason the footnote row carries the
three width classes it does: the prose card's gloss is ~530px of ink, so with the CTA
it overruns the 886px body by ~25px and a plain `flex-wrap` broke the line — putting
the button bottom-**left**, where the export draws it bottom-right. Fixed by letting
the footnote wrap its own text instead (`min-w-0 flex-1 basis-80`), with `ms-auto` on
the action for the phone, where the two genuinely cannot share a line. jsdom applies no
Tailwind, so this was invisible to `npm test` in both directions.

**Pre-existing and untouched:** at 390px the card's content column is 220px — `Popup`'s
`px-16` against a `92vw` card — so 26px lead copy sets seven words to the line. Every
card in the app has this; it is a `Popup` question rather than a chapter one.

### `prophylaxis-guidance`

The fourth designed chapter (`src/routes/education/ProphylaxisGuidance.tsx`), from a
**1440 × 800** artboard like the others, and the sparsest one in the app: a heading,
two bullets, and a full-bleed wash behind them. No figures, no `+`, nothing to open.

**It is the first chapter that centres itself vertically.** The drawn block runs from
the heading's cap top to the last bullet's descender with the space above and below
equal to within ~8px, so it ships as `flex flex-1 flex-col justify-center` — which is
what `AppShell`'s `min-h-dvh` column and its `flex flex-1 flex-col` wrapper were
already there to permit (§6; `Landing` is the other caller). It centres inside the
shell's padded box, so the rule's clearance and the bottom bar's are off the top and
bottom before the maths — which is what puts the block a touch under the true centre
line, as drawn. The chapter is 800px tall at 1440×800 and does not scroll, which is
the one-screen goal the open item above records for `disease-background`.

Type, measured off the 2000px export against the 1.389 scale that canvas implies:

| Ink                | Measured           | Ships as                       |
| ------------------ | ------------------ | ------------------------------ |
| heading, 3 lines   | ~49px/58 leading   | `text-5xl` (52/54.6), `lg:` up |
| heading → bullets  | 35px ink-to-ink    | `mt-8` — the designer's 32     |
| bullets, 26px/32.5 | 26px/32.4 measured | `text-2xl leading-tight`       |

The heading is within 6% of `text-5xl` on size and looser on leading (1.18 against
1.05), which is open item 9's discrepancy again rather than a new one — it stays on
the scale. The bullets were raw for the §8 reason the other chapters record —
26px was `text-2xl`'s size at weight 600 where this is 400 — and are now the step
itself, at 24, since weight no longer travels with a size (§2).
`rebalancing-agents` sets its bullets from the same measurement.

**The heading steps down to `text-3xl` below `lg`, which no other chapter does.** This
one is a 17-word sentence where the others are two to six words, so at the old 52px it took
eleven lines on a 390px phone — the whole screen before the first bullet. An invented
comfort value, exactly like the small-screen gutters above: the artboard is 1440 and
nobody has drawn a phone. Stated as a scale step rather than a raw size so the two
sizes read as one scale.

#### The backdrop is the chapter's own, and the 15% lives in CSS

`bg_image.webp` mounts as a second `fixed inset-0 -z-10` layer, later in DOM order
than `AppShell`'s, so it paints over `bg-page` while the mint gradient still shows
through at 15%. That is `Landing`'s arrangement (§6) one chapter deeper, and it is
what the artboard composites: sampling the reference against the asset and the §6
gradient, `0.15 × image over bg-page` reproduces the drawn background to within a few
units of 255 across the canvas — which is also how the 15% was confirmed rather than
assumed.

**The asset arrived with that opacity baked in** — a uniform alpha of 38/255 (14.9%)
over full-strength RGB. It ships flattened to an opaque image with `opacity-15` in
CSS: the design value is then greppable and adjustable instead of hidden in an alpha
channel, and the two composite identically (mean difference 0.21/255 over 20k sampled
pixels; the only pixels that move are ~5.7k scattered fully-transparent ones, which is
encoder noise at shape edges). Doubling the two would have painted the wash at 2.25%.

It is `object-cover` on a square asset, centred — the crop the artboard draws — and
`alt=""`, because it is wallpaper and the two bullets are the content.

**Stored at 1920×1921, from a 5760×5763 delivery.** The 2× rule in §13 is for figures,
where the drawn width is known and the labels have to survive; this is a full-bleed
wash at 15% with no ink in it, so it is sized against decode cost instead: 33MP is
8× the pixels of the biggest figure in the app for a layer nobody reads. 1920 covers
the 1440 canvas at 1.33× and holds up on a retina viewport at this opacity; the file
goes 721K → 116K at `-q 82`.

**Verified in Chrome at 1440×800 and 390×780.** The composite matches the reference to
a mean of 7/255 over sampled background points at 1440 (the residual is a sub-pixel
crop offset in the export, on imagery with high local variance). At 390 the chapter
fits one screen with the stepped-down heading, and the wash stays put while it does —
`fixed`, so it does not stretch with the document the way a `<main>` background would.

### `fviiia-mimetics`

The fifth designed chapter (`src/routes/education/FviiiaMimetics.tsx`), from Figma
artboard `67:803` ("education box 4"), **1440 × 800** like the others. A two-tone
heading, four bullets, and a bottom half split between two disclosures at the left and
a shadowed corner panel at the right carrying two more.

Type, off the artboard:

| Ink                      | Drawn                | Ships as                      |
| ------------------------ | -------------------- | ----------------------------- |
| heading, 2 lines         | 52px/57.2, Barlow Bd | `text-3xl`, `lg:text-5xl`     |
| heading → bullets        | 32px                 | `mt-8` — the designer's value |
| bullets                  | 26px/32, DM Sans 400 | `text-2xl leading-tight`      |
| agent captions           | 26px/30, wt 900/500  | `text-2xl leading-7.5`        |
| panel heading & captions | 26px/26, wt 900      | `text-2xl leading-6.5`        |

The bullets and captions were raw for the §8 reason the other chapters record —
26px at weights 900 and 500, which the old scale's 26px step (weight 600) could
not carry. All three now take `text-2xl` and state their weight beside it, which
is the whole of what changed; the drawn 26 renders at 24. Tracking
is drawn at 0.608px on 26px (0.0234em); `tracking-wide` is 0.025em, within 0.04px, so
it ships on the scale rather than as an arbitrary value.

**The heading steps down to `text-3xl` below `lg`, the second chapter to need it.** Nine
words at the old 52px took six lines and 328px of a 390 × 780 phone — 42% of the screen before
the first bullet, measured in Chrome. Same invented comfort value as
`prophylaxis-guidance`'s, for the same reason and stated the same way.

`leading-7.5` / `leading-6.5` are the spacing scale's canonical forms of 30px and 26px,
not arbitrary values. Do **not** take the linter's suggestion of `leading-below-rule` for
the first: that token is `TopRule`'s band plus the designer's 16px (§12) and equals 30px
by coincidence, so using it would assert a relationship that does not exist.

**The export shows five bullets and the chapter renders four.** Figma broke the fourth
sentence across two `<li>`s at the measure; the topic's `body` is the source and the
chapter test pins the count, so the drawing cannot be transcribed over it.

#### Three two-toned strings

The first chapter to paint one string in two colours, and it does it three times:

| String           | Lead                           | Tail                           |
| ---------------- | ------------------------------ | ------------------------------ |
| `<h1>`           | `crimson-50`, to the colon     | `slate-100`                    |
| Emicizumab label | `slate-100` wt 900, to the `(` | `--color-popup-caption` wt 500 |
| Denecimig label  | `slate-100` wt 900, to the `:` | `--color-popup-caption` wt 500 |

`#d63a52` and `#111d2e` are `crimson-50` and `slate-100` exactly. The boundary is found
by punctuation in the chapter (`splitTitle`) rather than stored beside the copy: the two
halves concatenate back to the source string, so this moves a paint boundary and never
drops content — which is what separates it from the derivation `rebalancing-agents`
argues against. Colon is tried before paren because the Denecimig title contains both
and the paren comes first in the string; the chapter test pins that.

#### The corner panel

`--background-image-emerging-panel` + `--shadow-emerging-panel`, declared as a pair
because they are one drawn object. The shadow is cast **up and left**
(`-20px -1px 47.2px -22px`) — the panel sits in the page's bottom-right corner, so those
are the only two edges facing the page.

**The mint is transcribed, and this is the borderline case §3/§4 leaves open rather than
a clear one.** Sampled `#c6eee5`. Measured in OKLab: `color-mix(teal-25 30%, teal-0)` is
dE **.0136**, and `--color-figure-note` is dE **.0157**. Both are an order of magnitude
above the ~.002 every derived token in `tokens.css` clears, and well under the .042 that
sent §6's gradient stop to a literal — so it ships literal on the stricter reading and is
raised as open item 19. Reusing `--color-figure-note` was the third option and was
rejected for welding a callout fill and a panel gradient to one value.

**Geometry.** 675 × 350 at (653, 450) on the canvas: right edge at 1328 = 1440 − the
112px gutter, so it stays inside the content column and breaks no shell padding, and
bottom edge flush with the canvas. The chapter reaches that bottom edge with `grow`
inside `AppShell`'s `flex flex-1 flex-col` wrapper — which is `lg:pb-0`, so the content
box already ends at the viewport bottom. It **stretches** past the drawn 350px on a
taller viewport rather than detaching from the corner; its content stays vertically
centred, which the artboard's equal 87px above and below already implies.

The radius steps **117px → 60px below `lg`**. 117 is drawn on a 675px panel where it
reads as a corner; on a 320px phone it eats a third of the width. An invented comfort
value like the small-screen gutters and `prophylaxis-guidance`'s stepped heading — the
canvas is 1440 and nobody has drawn a phone.

#### Four disclosures, and the four cards behind them

Not `DisclosureBand`: that is a 3-tuple by type, drawn as an arch over three centred
columns, and this is four in two groups of two with the caption to the **left** of the
button (`rebalancing-agents`' arrangement, not the stacked one). The chapter composes
`PopupButton` directly.

The designer drew a card behind each — Pop ups **10** (Emicizumab), **11** (Denecimig),
**12** (NXT007), **13** (Inno8), each 1152 × 660, prose plus an MOA diagram — and all
four are built. They are **not** the vector exports item 20 asked for: the diagrams
arrived as rasters, and three of the four bake their crimson heading, white surface and
corner radius into the pixels with real alpha. That is why those three take no white
panel in markup and are described through `alt`; only the emicizumab diagram, whose
asset is a bare picture on white, gets a `bg-white rounded-3xl` wrapper.

Three cards split their columns left/right. **Pop up 13 is a single column** — bullets
across the top, panel beneath — because its panel is 2.6:1 where the other three
diagrams run between 1:1 and 1.6:1: given half the card it would be painted 172px tall
and its annotations unreadable. It is therefore the one card with no `lg:` breakpoint,
since it is already stacked at 1440 and narrows by doing the same thing.

The band on that card keeps **`Inno8` cased** while shouting the rest, which is what the
artboard draws — the fifth entry in `preserveCase`'s term list and the only one there for
transcription rather than to save an abbreviation's meaning. The sibling card lands the
other way on the same authority: the designer shouts `MIM8`.

A stray 355 × 19 vector at (997, 214) on the artboard renders as nothing in the export
and overshoots the text block's right edge; treated as leftover and not reproduced.

---

## 12. Layout geometry

`AppShell`'s `<main>` carries the padding every page inherits. It used to be
eight numbers in a class string; it is now four tokens and three composed from
them, because most of those numbers came from **outside** the shell and the
sums hid where the seams were.

| Token                     |   px | Where it comes from                       |
| ------------------------- | ---: | ----------------------------------------- |
| `--spacing-gutter`        |  112 | Designer's content inset, 1440 canvas §11 |
| `--spacing-rule`          |   14 | `TopRule`'s band height §10               |
| `--spacing-rail`          |   48 | Past the sidebar rail, ≥1024px            |
| `--spacing-bar`           |   80 | Past the sidebar bottom bar, <1024px      |
| `--spacing-gutter-rail`   |  160 | `gutter + rail`                           |
| `--spacing-below-rule`    |   30 | `rule + 16` (designer's gap)              |
| `--spacing-below-rule-lg` |   46 | `rule + 32` (designer's gap at `lg`)      |
| `--container-content`     | 1168 | `1440 − gutter − gutter-rail`             |

### What is deliberately _not_ a token

The 32px horizontal gutter below `sm`, the 48px at `sm`, and the 16px bottom
padding at `lg`. No design canvas exists below 1440 — those three were invented
here for comfort, are specified by nobody, and have one consumer each. Naming
them would claim an authority they do not have. This is §3's rule for off-scale
colours pointed at spacing: transcribe what the designer gave you, and leave what
you made up looking like what it is.

### The composed values are `calc`, not arithmetic

`--spacing-gutter-rail` is `calc(var(--spacing-gutter) + var(--spacing-rail))`,
not `10rem`. The addends survive into the built CSS, so re-pointing the gutter
moves the right edge with it. This is not hypothetical tidiness: the shipped
value was `pr-40` while the comment beside it said 163px, because the two had
been summed by hand at different times from different rail widths. Same
motivation as `--color-popup-caption` in §11 — derive it and the source change
propagates.

`--spacing-rule` earns its name the same way. It has two consumers that must
agree: `TopRule` draws the band with `h-rule`, and `<main>` clears it with a top
padding built from the same token. As `h-3.5` plus a hand-summed `pt-12`, that
agreement was a coincidence maintained by whoever noticed.

### Clearance and measure are different boxes

`<main>` holds the padding — it clears the fixed chrome, so it must be the
element the chrome is measured against. `max-w-content` sits on a wrapper inside
it. Fixed gutters give the content column no upper bound, so on a 2560px monitor
a chapter's prose column would be ~1790px wide; the cap is the column's width at
the design canvas, so nothing moves at or below 1440 and the column centres
above it.

The wrapper is `flex w-full flex-1 flex-col`, which is load-bearing: §8's
vertical centring has `Landing` claim leftover height with `flex-1`, and that
only works if every box between it and `min-h-dvh` is a growing flex parent.

### Open: the 1024px cliff

The gutter steps 48 → 112 at `lg`, so crossing that one pixel takes the content
column from 927px to 752px. That is also exactly where §11's chapter grid turns
on its fixed 470px figure, leaving the prose column at 752 − 32 − 470 = **250px**.

A `clamp()` ramping the gutter from 48px at 1024 to 112px at 1440 would fix it
without touching the transcription — 112 is a 1440 number and 1024 is where the
layout can least afford to pay it in full. Not done: the rail clearance is a
genuine discontinuity at `lg` (below it the sidebar is a bottom bar and there is
no rail to clear), so the breakpoint cannot go away entirely, and the fix wants
deciding alongside §11's one-screen rule rather than twice.

`treatment-landscape` has since made this the wider of two cases: its three fixed
tracks leave **220px** of prose at 1024px against that chapter's 250px. One `clamp()`
still fixes both, which is the argument for not patching either page.

---

## 13. Pop-ups

`src/components/Popup.tsx` is the card behind every §7.7 "Click here:"
disclosure — the skeleton issue 03 asks for, with one scroll region the calling
popup fills. Reference is Figma `144:431` ("Pop 8"), **1066 × 645** on the 1440
canvas, i.e. 74% × 81% of it.

### It is a real `<dialog>`, opened with `showModal()`

Three things then come from the platform rather than from code: the focus trap,
focus restoration on close, and the **top layer**. The last is not a nicety —
`DisclosureBand` wraps its content in `isolate` + `overflow-hidden` to clip the
arch (§4.4's callers), so an in-flow panel the size of this card is cut by it.
A modal dialog escapes every ancestor's clipping and stacking context by
definition, which also clears `TopRule`'s `z-30` (§10) and the sidebar's
z-40/z-50 without the popup owning a z-index at all.

The element is a transparent, viewport-filling layer and the card is a child of
it. That is what makes a backdrop click detectable: `::backdrop` is a
pseudo-element and never an event target, so a dialog sized to its own content
has no way to hear one.

**`open` is the single source of truth.** The `cancel` handler preventDefaults,
so the element never closes itself behind React's back — ESC routes through
`onClose` like the ✕ and the backdrop do, and the DOM and the prop cannot
disagree. Scroll lock is the one item on issue 03's list the platform does not
supply; `showModal()` makes the page inert but leaves it scrollable.

### Geometry

Every figure below is from the node's metadata (clean integers), not from the
`get_design_context` code dump, whose values are the same numbers scaled by
1.263 and therefore fractional.

| Part            | Design                                    | Shipped                           |
| --------------- | ----------------------------------------- | --------------------------------- |
| Card            | 1066 × 645                                | the `default` width step; `95dvh` |
| Radius / border | 40.417px / 5.052px `crimson-50`           | verbatim                          |
| Shadow          | `0 22.735px 50.142px 5.052px` black @ 55% | `--shadow-popup`                  |
| Band padding    | 12px top and bottom                       | `py-3`, floored at the ✕'s 65px   |
| ✕ inset         | 22px from the card's right edge, centred  | `right-5.5`, `-translate-y-1/2`   |
| Body gutters    | 64px sides                                | `px-16 py-2`                      |

**Four rows of that table were wrong until 2026-08-04.** Three were corrected by
changing the table — the code they described was right and had simply moved on
without them. The fourth was corrected by changing the code, because there the
table was right and the code had been wrong since the day both were written.
Worth listing, because the shape of each error is the lesson:

- **`1066px`.** Narrowed to 1024 in the §7.3 commit, which recorded it in the
  commit message ("Popup.tsx carries an unrelated in-flight change") and not
  here. A doc updated by the commit that had a reason to is the only kind that
  stays true; an aside in a message is not that.
- **`85dvh`.** Never shipped. The cap has been `95dvh` since the component was
  written, and `PopupFigure` computes its own height budget against 95, so the
  two live records disagreed and the working one was the code. Two comments
  inside `Popup.tsx` carried the same 85 and are corrected with it.
- **`py-8`** on the body, against a `py-2` that has never been anything else.
- **`py-3`** on the band, against a shipped `py-5` — **and this is the one that
  was fixed rather than re-documented.** It was never a transcription error: the
  band's padding shipped 67% larger than drawn and the title inside it 21%
  smaller, and the two cancelled to a band four pixels off the drawing, which is
  how both survived eleven months of artboard comparison. See "The title" below.
  The band is now `py-3` and the title reaches its drawn 45.47px. This closed
  open items 13 and 28.

The first three share a pattern worth naming, because it will recur: the table
recorded what the _design_ says and was written in the same commit as the
component, so a value the implementation had already departed from got
transcribed as though it were the shipped one. A geometry table is only useful
when it is read off the code.

The fourth is the opposite failure and the more interesting one. There the doc
was right, the code was wrong, and the error hid **because a second error
compensated for it** — no single measurement was far enough off to notice, and
the only way to find it was to check two records against each other rather than
either against the screen.

**The band is content-height, not 118px.** The text node measures y=15, h=94
inside a band running y=3–121, so 12 + (2 × 46.73) + 12 = 117.5 ≈ the 118px the
band renders at. Shipping the padding rather than the height is what lets a
title that wraps to three lines on a phone grow the band instead of being
clipped by it.

**The border is a plain CSS border and the band sits inside it.** In Figma the
band overhangs the card and is clipped; here `overflow-hidden` clips it to the
padding box instead. Band and border are the same `crimson-50`, so the top edge
reads as one mass either way.

### The card has three widths, and only one of them is drawn

`Popup` takes `width="narrow" | "default" | "wide"`. A three-step scale rather
than a `className` the caller composes, because the widths are a closed set the
design supports and not a dimension each card invents — a body that fits no step
is a conversation with the designer, not a fourth literal.

| Step      |   px | Body¹ | Source                                 |
| --------- | ---: | ----: | -------------------------------------- |
| `narrow`  |  860 |   722 | 869 off the §6 drug sheets, then − 9   |
| `default` | 1140 |  1002 | everything that has not asked for more |
| `wide`    | 1360 |  1222 | chosen for the §5 table's nine columns |

¹ the step less `border-5` and `px-16`: `w − 10 − 128`.

**Two of the three moved on 2026-08-04**, and what is below is written against
where they landed rather than where they were derived. `narrow` was 869 and
`default` 1024; both were adjusted in a spacing pass over the cards, and neither
860 nor 1140 has an artboard behind it. That is open item 29, and it has one
concrete consequence: `hemostatic_mechanisms_diagram.webp` is stored at 1772px
for a drawn width of 886, which was the old default's body exactly, because that
figure fills its card rather than being drawn to a size of its own (see the asset
table below). At 1140 the body is 1002, so the raster now upscales. The default
never had an artboard either — the drawn card is 1066 — but it did have that
asset, and the asset did not follow it.

**`narrow` started transcribed and `wide` is picked**, and the difference is
worth keeping. §16 records that the seven drug-sheet artboards draw their cards
at 1136, 1064 and **869** — the designer sized each sheet to its own content,
which is the closest thing in the file to a statement that a pop-up may be
narrower than the default, and 869 was that statement's low end. 860 is that
number nudged; the provenance is still the drug sheets. 1360 has no such backing
at all: it is the widest card that still floats over the 1440 canvas rather than
taking it over, at 40px of page either side.

**`wide` is the only step at `96vw`, and that is the number doing the work.** At
`92vw` the viewport term binds first on the design canvas — 1324.8 < 1360 — so
the card would never once reach the width it is named for. The two terms cross at
1416.7px; below that the percentage governs, as it does for the other two steps.

**Three callers are off `default`: two take `wide` and one takes `narrow`.**

`narrow`'s caller is §7.4's non-factor-therapies card on
`/education/treatment-landscape` — the middle of that chapter's three
"Click here:" rows, and the one whose two lists are shortest. Set by client
direction 2026-08-04 rather than off an artboard: no drawing of this card exists
at any width, so it is the same kind of call the drug sheets record, where the
designer sized each card to its own content. It is also what the step was
measured for and had been waiting on — 869 is the low end of that statement, and
this is the first card short enough to want it.

The chapter's three rows share **one** `Popup` (mutual exclusion is a fact about
the group, not about any button), so the width travels on `Row` beside `title`
and `subtitle` rather than being set at the `<Popup>` call. The other two rows
are unaffected and stay at `default`.

The two `wide` callers are the ones the extra 336px was picked for. The first is
`/explore`'s comparison-table card. It is set there ahead of the grid it is for — so the placeholder is
measured in the box the table will actually land in rather than a box it will
have to be re-fitted to. Nine columns get 136px at `wide` against 113 at
`default`. That does not by itself make item 27 go away: 136px is a readable
column and a phone still is not 1360px wide, so the grid will want a horizontal
scroll region inside the card regardless. What `wide` settles is that the card is
not the binding constraint.

The second is §7.5's Denecimig card (Pop up 11), and it is the first use of the
step for a reason other than a table. That card is the densest of the chapter's
four — four bullets with a nested three in the left column, beside a fixed 448px
panel carrying its own two sentences — and at `default` the left column is the
drawn ~424px, where the bullets wrap past the artboard's line count and the card
engages `Popup`'s scroll region on the 1440 canvas itself. Because the panel is
`w-112 shrink-0`, the whole of `wide`'s extra 336px lands in the prose column
(424 → 750), which is the dimension the overflow is in. The panel is unaffected,
so `denecimig.webp` is still painted at the size it was drawn at.

### The title

Drawn 45.469px / 46.732 leading / +1.3136px tracking, Barlow Condensed Bold,
uppercase. Ships as `text-5xl` — 48px, 5.6% over the drawing:

```
text-5xl            /* 48px; drawn 45.47 */
leading-[1.0278]    /* = 46.732 / 45.469 */
tracking-[0.0289em] /* = 1.3136 / 45.469 */
```

**The two-line band survives the rounding, which is the thing that mattered.**
An earlier draft of this section predicted 48px would wrap the title to three
lines inside a band drawn for two. That was inherited from the old 52px `h1`
step and is wrong at 48: measured against the default card's real band width
(1140 − `border-5`×2 − `px-25`×2 = 930px), all four of the longest titles in the
app set in exactly two lines at 48px, the same as at 45.469 —

- `FVIIIa-Mimetic BsAbs: Approved and Emerging Agents for HA Prophylaxis`
- `Considerations for Reducing Treatment Burden and Improving QoL`
- `Mechanism of Action for Denecimig (Mim8): FVIIIa-mimetic BsAb`
- `Hemostatic Rebalancing Agents in Treatment of HA/HB`

The band grows ~5px on a two-line title (98.7px of type against 93.5), which the
content-height padding absorbs.

Leading and tracking stay relative rather than being restated as lengths: they
were written that way when the size was a clamp, it costs nothing now, and it
keeps all three in step if the size moves again. The size was
`clamp(1.375rem,3.157vw,2.842rem)` until 2026-08-04, then `text-[2.842rem]`
briefly, then the step. The clamp's 22px floor is what the band's
`min-h-[65px]` used to bind against on a phone.

#### The cap was 2.25rem for eleven months

The block above is what this section has said since the component was written.
The code said `2.25rem`, so the title topped out at **36px against the drawn
45.47** — 21% smaller, on every card in the app. Only the two relative values
survived; the `3.157vw` middle term is the drawn ratio and reaches 45.47 at 1440
on its own, and the cap was what stopped it.

**It never looked wrong, because a second error cancelled it.** The band shipped
`py-5` where the export measures 12, and 20 + (2 × 37) + 20 = 114px of band
against the drawn 118. Four pixels — built from a title 21% too small and padding
67% too large. Neither would have survived a measurement on its own; together
they produced a band that measured right, so nothing ever prompted one.

Both are corrected as of 2026-08-04, and the correction is the drawn value in
each case rather than a new compromise: `2.842rem` and `py-3`. **This closed open
items 13 and 28.** The lesson is in the geometry table above — the compensating
pair was found by checking two records against each other, not by looking at the
screen, which had looked fine for eleven months and still does.

#### What restoring it actually changed

Measured across all twenty-three strings that reach the band today, then verified
by opening all twenty cards in Chromium at 1440 × 800 and 390 × 844:

- **Three titles gain a line** — the severity table, the bleeding figure and the
  clotting cascade go one line to two. Every one of them wraps to two lines in the
  designer's own 1066px card as well (measured at that card's 856px text box), so
  the wrap is the type size and not our 42px-narrower card. **Nothing reaches
  three lines**, at either viewport.
- **The two-line band lands at 117px** against the drawn 118, on all six titles
  that wrap. The one-line band is 71px, and the drawing has no one-line case.
- **`PopupFigure`'s `reserve` becomes correct rather than merely safe.** Its
  default is 10rem, documented as "a measured 117px of crimson band … plus the
  body region's 16px" — a figure that described the _drawn_ band, not the one
  that shipped. It now describes both. The two figure cards that gain a line
  still fit: 117 + 16 = 133 inside the 160 reserved.
- **Below 1140px nothing changes at all.** That is where `3.157vw` crosses 36px,
  so under it the middle term was already governing and was already the drawn
  ratio. The whole size change is a desktop change.

#### The band has a floor now, and it is the ✕

`min-h-[65px] flex flex-col justify-center` on the header. This is the one part
of the repair that is not a drawn value, and it is not a design number at all:

Cutting the padding to 12px took the one-line band on a phone from 63px to 47px,
and the ✕ centred on it is **65px tall**. A band shorter than its own button
overhangs it at both ends, and the card's `overflow-hidden` clips the top against
the rounded corner — measured at 390px, 4px of the button gone. The bug was
already latent at `py-5` (the button overhung by 1px and cleared the card by
under 4); the correct padding is what made it visible.

So the floor is the height of the thing the band must contain, which is the same
65 `BAND_INSET`'s own floor is built from. The design draws no one-line band and
therefore offers no value to transcribe. Nothing at 1440 reaches the floor — a
one-line band is 71px — and it used to bind only where the title's clamp sat at its 22px floor,
i.e. on a phone. Because the band and the border are the same crimson, a ✕ flush
to the band's edge still has the border's 5px of crimson above it.

`justify-center` is what makes the floor invisible: the ✕ is centred by
`top-1/2`, so without it a band taller than its title would put the two ~9px
apart. Only the header's **direct** children become flex items, so the
`preserveCase` whitespace trap §17 records does not apply here — the `<h2>`'s own
spans and text nodes stay in normal flow, and the browser check confirms the
cased terms keep their spaces.

The horizontal padding was `clamp(5.5rem,7vw,6.25rem)` until 2026-08-04 and is
now `px-25`, i.e. the 100px maximum flat. What follows describes the clamp; the
88px floor it names is gone, so at 375 the band spends 200px of a 345px card on
padding. Open item 33. Originally: 100px at 1440, floored
at 88px, which is the ✕'s own 65px plus its 22px inset. Symmetric, so the title
stays centred on the card rather than in the space left beside the button.

**Deviation, deliberate:** the design's title box is 713.6px wide starting at
x=156, i.e. its centre sits **20.19px left of the card's**. That is a hand-drag,
not a rule — 1.9% of the card width — and replicating an asymmetric nudge would
make it look intentional. Centred instead.

**The band opts four abbreviations out of its own `uppercase`.** `FVIIIa`,
`BsAbs`, `FIXa`, `FXa` — see `src/lib/preserveCase.tsx`. Shouted whole, the
Emicizumab MOA caption reads "INTERACTIONS WITH FIX/FIXA AND FX/FXA" and loses
the only thing distinguishing an activated factor from its zymogen, which is the
one fact that caption exists to state. Same call the `fviiia-mimetics` `<h1>`
already made; the helper is now shared by both.

It changes **painted glyphs only**. The band's `<h2>` and `<p>` carry an
`aria-label` of the raw `title`/`subtitle`, because the accessible-name algorithm
joins each element's contribution with a separating space and would otherwise
announce "FIX/ FIXa ". A title with no cased term renders as one text node and
the label is a no-op, so it is unconditional rather than a special case.

### Two presentations of one modal

The `<dialog>` itself — scrim, ESC, backdrop click, focus trap, scroll lock — is
`ModalLayer`. Two components dress it:

| Component  | Draws                                          | For                                              |
| ---------- | ---------------------------------------------- | ------------------------------------------------ |
| `Popup`    | crimson band, border, ✕, scroll region         | a §7.7 click-through — a destination with a name |
| `Lightbox` | nothing; content on the scrim, ✕ in the corner | an enlargement — the thing you clicked, bigger   |

`ExpandableFigure` picks between them with `variant`. The clotting cascade stays
a card: it rebuilds annotations as markup and the band says which figure you are
looking at. The §7.5 MOA diagram is `variant="bare"` — chrome there announces a
new place for a gesture that went nowhere, and its trigger already lives inside a
card whose band and ✕ would then be stacked under a second pair.

`Lightbox` names its dialog with `aria-label`, since it paints no heading to be
named from. Its content column is `w-fit` so a caption can be centred on the
picture — which means **prose inside it must not widen the column**: a
paragraph's max-content is its longest unbroken line, wider than most figures, so
callers set `w-0 min-w-full` on it.

### A card over a card

`fviiia-mimetics`' Emicizumab pop-up puts an `ExpandableFigure` in its body, so
its MOA diagram opens a **second `<dialog>` nested inside the first** — and
closing that one has to leave the card standing.

Two of the three routes fall out of what was already here. **ESC did not**, and
that is the one worth reading before touching this:

- **ESC needed handling ahead of the platform.** Chrome routes a dialog's Escape
  through a CloseWatcher, and nested dialogs land in a single close-watcher
  _group_ — one Escape closes every dialog in the group. Measured in Chromium:
  one `cancel` fired, on the inner dialog, and both ended up shut. `onCancel`
  cannot fix that, because the outer never gets a `cancel` to preventDefault.

  So `ModalLayer` takes the keydown itself: `preventDefault` (a close request is
  only processed if the keydown was not cancelled, which removes the group from
  the platform's hands) plus `stopPropagation` (so an enclosing layer does not
  see the same keypress bubble past), then `onClose`. Both calls are needed;
  dropping either reinstates the bug in a different way. `onCancel` stays as the
  fallback for browsers with no CloseWatcher, and for jsdom.

- **The inner backdrop is not the outer backdrop.** The inner `<dialog>` is a
  DOM descendant of the outer layer, so its click bubbles there; the outer's
  `event.target === event.currentTarget` guard is what rejects it. That guard was
  written for a text-selection drag (see `Popup`) and this is its second job.
- **Scroll lock nests correctly.** The inner effect captures `overflow: hidden`
  as its "previous" value and restores it on close, leaving the outer's own
  cleanup to restore the real one.

The thumbnail sits on a white panel inside the gradient card because
`emicizumab.webp` carries a white background, which reads as a stray rectangle
anywhere else. The enlargement needs no such panel — on the scrim the asset's
own white _is_ the surface.

**`PopupFigure` gained a `reserve` prop here.** Its height cap is `95dvh` less
the chrome around it, defaulted to 10rem measured off `Popup` — so a caller that
puts anything under the picture gets pushed into a scroll. The MOA sentence went
below the fold entirely at 1440 × 900 before this existed. The bare enlargement
passes `9rem`, which is a different 9-ish from the default: no crimson band to
subtract, but the layer's padding, the caption's gap and two lines of prose. The
three existing callers pass nothing and render identically.

### The body gradient — `--background-image-popup`

Figma draws three stops. The outer two are exact brand steps:

| Stop | Sampled   | Is                     |
| ---- | --------- | ---------------------- |
| 0    | `#fdf8f2` | `brand-sand-0`, exact  |
| 0.5  | `#bedfd4` | see below              |
| 1    | `#7ec5b6` | `brand-teal-25`, exact |

**The middle stop is redundant and is dropped.** `#bedfd4` is the exact sRGB
midpoint of the other two — (253+126)/2 = 190, (248+197)/2 = 223, (242+182)/2 =
212 — and both SVG and CSS gradients interpolate in sRGB by default, so a
two-stop gradient reproduces it. Its exactness is also what confirms the
interpolation space, which is why it is worth recording rather than just
deleting.

Same tell as §4.4 and §6: two exact palette steps mean the designer reached into
the scale on purpose, so both ship as live `var()` references and a palette
change still moves the fill. Verified in the build — unlike the §6 gradients
this one needs no `@supports` fork, because it contains no `color-mix`.

**Deviation, deliberate: the rotation is dropped.** The export is a _rotated_
ellipse — `gradientTransform="matrix(-103.14 23.614 -20.314 -74.493 542.05
341.53)"` at `r=10`, which is radii 1058 × 772 centred at (542, 342), the major
axis 12.9° off horizontal. CSS `radial-gradient` cannot rotate one. The shipped
approximation is the unrotated equivalent:

```css
radial-gradient(
  ellipse 99.26% 119.71% at 50.85% 52.95%,
  var(--color-brand-sand-0) 0%,
  var(--color-brand-teal-25) 100%
)
```

The radii are 99% and 120% of the box, so the outer stop is reached only past
the corners and the visible isolines move by a few px. The alternatives were
Figma's own encoded-SVG data URI — pixel-exact, but with both hexes frozen
inside it, and ruled out by §6's "no gradient strings in JSX" — or a rotated
pseudo-element, which buys 13° for an extra layer inside an already-clipped
rounded card.

### The scrim is inferred

Nothing in the export dims the page. `::backdrop` ships at `rgb(0 0 0 / .5)`
because the card's 55%-black drop shadow was drawn against Figma's dark canvas
and does much less separating over the light `bg-page` — a focus-trapping dialog
that leaves the page fully lit reads as inconsistent. Inferred rather than
transcribed, on the same footing as §4.3's tooltip and §4.5's sidebar, and
logged as open item 12.

### Two buttons are named "Close &lt;label&gt;"

An open disclosure puts the trigger (showing ✕) and the dialog's own ✕ in the
document at once, and `PopupButton` builds both names the same way. **This is
not a real ambiguity** — `showModal()` makes everything outside the dialog inert,
so only one is ever reachable — but jsdom implements no top layer, so the tests
scope their queries to the `<ul>` and to the dialog rather than searching the
document.

### The jsdom shim

jsdom 25 has the `open` attribute but neither `showModal()` nor `close()` (they
landed in jsdom 26), so `src/test/setup.ts` stands them in. `CLAUDE.md`'s
reproducibility rule makes a dependency bump a deliberate act, not a side effect
of a feature.

**The shim is only the state machine.** The three things `showModal()` is chosen
for are not reproduced, because a fake of them would only assert itself — they
are the platform's contract and belong in a browser check. ESC is in the same
category: jsdom fires no `cancel` event, so `Popup.test.tsx` dispatches one
directly and the test name says so.

### Two UA `dialog` rules this has to fight, and did not at first

Both are on the `<dialog>`'s own class list, and dropping either reproduces a
bug this shipped with:

- **`hidden open:grid`, never a bare `grid`.** A closed dialog is hidden by
  `dialog:not([open]) { display: none }` in the UA stylesheet, and **any** author
  `display` beats a UA one regardless of specificity. A bare `display: grid`
  therefore leaves an empty, unclosable card painted over the page from first
  render — the trigger fills in its title but has nothing to close, because the
  element was never `[open]` to begin with.
- **`size-full`.** The UA sizes a dialog `width: fit-content; height:
fit-content`, and `inset-0` cannot defeat that — insets only stretch an element
  whose size is `auto`. Without it the layer shrinks onto the card and pins
  itself to the top-left instead of filling the viewport, so `place-items-center`
  has nothing to centre in.

Neither is reachable from the test suite: jsdom implements no `dialog` UA styles
at all, so `display` and layout are both meaningless there. This is the class of
bug the section below exists for.

### Verified in a browser

Chromium at 1440×800 and 390×780 on `/education/disease-background`: closed →
`display: none` and 0×0; open → the layer fills 1440×800 with the card 1066px
centred at (187, 304); focus lands on the ✕ and is restored to the trigger on
close; ESC and a backdrop click both close; a content-less disclosure opens
nothing; at 390px the card is 359px (= 92vw), centred, with the title wrapped to
three lines and the band grown to fit it.

Also checked in the compiled CSS: `bg-popup` resolves to the live `var()` chain,
and `--shadow-popup` inlines onto its utility as §1 predicts.

That pass predates the width scale and its 1066px card is the pre-§7.3 default;
the scale has its own pass below.

### Verified in a browser — the width scale

Chromium at five widths on `/explore`, measuring the `wide` card (the table),
the `default` card (Emicizumab's sheet, which this work does not touch and which
is therefore the regression half of the check), and the `narrow` rule applied to
a bare element, since no caller renders one:

| viewport | `wide`        | `default` | `narrow` | band | overflow |
| -------: | ------------- | --------- | -------- | ---- | -------: |
|     1440 | **1360** @x40 | **1024**  | **869**  | 71   |        0 |
|     1280 | 1229          | 1024      | 869      | 66   |        0 |
|     1024 | 983           | 942       | 869      | 65   |        0 |
|      768 | 737           | 707       | 707      | 65   |        0 |
|      375 | 360           | 345       | 345      | 69   |        0 |

Everything below 1440 is a percentage, and the table is the proof that the two
percentages are the ones intended: 1229 is 96vw of 1280 and 942 is 92vw of 1024,
so `wide` reaches its named width **only** on the design canvas and governs by
`96vw` everywhere below — which is the whole reason it is not `92vw` like the
other two. The steps also converge from the bottom, exactly as a percentage scale
should: `narrow` and `default` are the same card below 944px, and all three are
within 15px of each other at 375. No horizontal document overflow at any width.

The `wide` card's body measures 1350px, which is 1360 less the border — its own
`px-16` puts content at **1222**, the number the width table above states.

**The band column is what caught open item 28.** On the first run of this table
it read 77 / 77 / 73 / 65 / 85, and 77px at 1440 is one line of a _36px_ title
plus `py-5` twice — not the 71px a 45.47px title in a 12px band gives. Five
widths agreeing with `clamp(1.375rem,3.157vw,2.25rem)` to the pixel is what
turned "the doc says 2.842rem" from a suspected typo into a finding. The column
above is the same measurement after the repair; the two 65s at 1024 and 768 are
the new `min-h-[65px]` floor binding, where the pre-repair run gave 73 and 65 for
different reasons.

### Verified in a browser — the title repair

Every card in the app, opened by clicking its own trigger, at 1440 × 800 and
390 × 844: four §7.7 disclosures, three §7.3–7.4 cards, both `rebalancing-agents`
steps, the four §7.5 agent cards, all seven §6 drug sheets, and the §5 table
card. **Twenty cards, forty openings.**

- Title computes to **45.46px** at 1440 on every one of them, and to the 22px
  clamp floor at 390.
- **No band clips its ✕ and no page overflows horizontally**, at either viewport
  — the check that failed at 390 before the floor went in.
- One-line bands are 71px, two-line 117 (drawn 118), and the one card with a
  subtitle is 146. At 390 the range is 65–239 and every card either fits or
  scrolls its body region rather than growing past `95dvh`.
- `preserveCase` survives the header becoming a flex container: "Inno8: Oral
  FVIIIa Mimetic for HA" renders with both cased terms and both spaces intact,
  and its `textContent` equals the raw title exactly.
- The three cards that gain a line — severity, bleeding, cascade — all still fit
  without scrolling at 1440.

### The height floor

The design draws 645px, and the card's height is otherwise its content's — which
left the one popup with content today (a single bullet) rendering 193px, reading
as a bar rather than the drawn card, with the body gradient showing only its warm
centre. So the card carries a floor as well as the `95dvh` cap:

```
min-h-[min(520px,95dvh)]   max-h-[95dvh]
```

520px is a chosen number, not a transcribed one — it is short of the drawn 645px
deliberately, so a popup whose content genuinely is brief does not open a screen
of empty gradient.

**Both are `95dvh`, not the `85dvh` this section claimed until 2026-08-04.** The
code has never said 85; see the geometry table above.

**The floor is guarded by the cap, and must stay that way.** `min-height` beats
`max-height` in CSS, so a bare `min-h-[520px]` would push the card past `95dvh`
on any viewport shorter than ~547px — a phone in landscape — and overflow it off
screen with no way to scroll back. Written as `min(520px, 95dvh)` the two cannot
disagree.

**The floor is width-independent, and `narrow` is where that shows.** 520 × 869
is a squarer card than the design has ever drawn; a short body in a narrow card
is the combination most likely to look like a floor rather than a card, and the
first caller to hit it should say so rather than assume the number transfers.

### The figure that opens itself — `ExpandableFigure`

Three of the four §7.7 targets on `/education/disease-background` hang off the
`DisclosureBand`. The fourth — the clotting cascade — the design draws in the
chapter body instead, so it is `src/components/ExpandableFigure.tsx`: a
thumbnail that is its own trigger, wrapping the same `Popup`.

It owns its open state, as `DisclosureBand` does and for the same reason. Two of
them on one page cannot both be open, because `showModal()` makes everything
behind the first one inert. Like `Popup`, it knows nothing about what it opens —
`children` is the card's body, which is what lets one component serve both a
single raster (`PopupFigure`) and a composed figure (below).

**The hover hint reuses `Popup`'s scrim, deliberately.** `bg-black/50` here is
the same literal as the card's `backdrop:bg-black/50`, so hovering the thumbnail
previews the wash that is about to cover the page. It fires on `:focus-visible`
as well as `:hover` — a keyboard user never hovers. Touch reaches neither, so on
a phone the figure reads as static; accepted, since a tap costs nothing.

### The cascade is composed, not photographed

The designer's `clotting-cascade-popup.webp` is the pop-up in its _open_ state:
title band, ✕, two annotation notes, the diagram, and a conclusion, all flattened
into one raster. Only the diagram is genuinely a picture. So the file is taken
apart:

| file / element                  | where it comes from                               | what it becomes                                        |
| ------------------------------- | ------------------------------------------------- | ------------------------------------------------------ |
| crimson band + ✕                | —                                                 | dropped; `Popup` draws its own                         |
| `clotting-cascade-thumb.webp`   | fill `(1761,23)–(1846,108)` with `#d63a52`        | the closed state — keeps its band, so it labels itself |
| `clotting_cascade_diagram.webp` | crop to the diagram's ink, `(640,304)–(1855,946)` | the only real picture, 1220×650                        |
| the two notes                   | transcribed                                       | `CLOTTING_CASCADE_NOTES` in `src/data/education.ts`    |
| the conclusion                  | transcribed                                       | `CLOTTING_CASCADE_CONCLUSION`, stored sentence-case    |

`src/routes/education/ClottingCascadeFigure.tsx` reassembles them: notes left,
diagram right (`md:grid-cols-[1fr_2fr]`, matching the export's 1:2.1), conclusion
spanning under both, stacking to one column below `md`.

Why bother, when one flat raster would have rendered identically at 1440: the
notes and the conclusion are sentences. As markup they reflow instead of scaling
with the image, they are selectable and translatable, and — the reason that
actually forced it — they no longer have to be duplicated into the diagram's
`alt`. CONTEXT.md §7.7 marks this whole figure image-borne; this moves two thirds
of it back into the text layer, and the `alt` shrinks to describing the cascade
alone.

**The card is white for this one figure.** `Popup` takes `surface="white"` as an
opt-in, because the diagram is drawn on white and the `--background-image-popup`
gradient would frame it as a rectangle. Not a global change: the severity table
draws its header pills with `bg-white/50`, and the gradient is what makes those
visible.

Measured off the source rather than eyeballed: the band is 133px tall, the ✕ is a
76×76 circle at (1766, 28), and the band is flat crimson on all four sides of it,
so removing the glyph is a rectangle fill and not inpainting. The fill colour is
`--color-brand-crimson-50` (`#d63a52`); the raster samples one lower in blue,
which is webp quantisation, not a second crimson. The title survives the crop
centred — its white pixels span x 316–1577, centre 946.5 against the band's 947 —
so the ✕ was overlaid on it, not displacing it.

The note fill is `--color-figure-note`, sampled `#d0eae6`. It is not a scale step,
but `color-mix(teal-25 27%, teal-0)` lands at dE .0021 OKLab against it — two
orders under JND, where the nearest steps themselves are dE .057 and .152 — so it
is derived, per the §3/§4 rule, and a teal change still moves it.

### `PopupFigure` is sized from the asset, not from a constant

The §7.7 exports are not one size — the diagnostic and bleeding diagrams are
drawn 720 wide. So `PopupFigure` takes `width` and `height` and caps at
`min(<width>px, 100%)` rather than a shared constant: upscaling a raster past its
native width only softens it, and a single cap cannot serve assets of different
sizes.

### Figure assets are stored at 2x their drawn width, and no wider

| asset                                  | drawn at | stored    | why that width                                   |
| -------------------------------------- | -------- | --------- | ------------------------------------------------ |
| `diagnostic_approach_diagram.webp`     | 720      | 1440×1216 | `PopupFigure` caps at `min(720px, 100%)`         |
| `bleeding_manifestations_diagram.webp` | 720      | 1440×1252 | same cap                                         |
| `clotting_cascade_diagram.webp`        | 610      | 1220×650  | card body 938 − `gap-6`, at the grid's 2/3 share |
| `clotting-cascade-thumb.webp`          | 470      | 940×538   | the thumbnail's own `max-w-117.5`                |
| `hemostatic_mechanisms_diagram.webp`   | 886      | 1772×860  | the card body: 1024 − `border-5` − `px-16`       |

2x covers retina and stops there. The three that needed it were shipped at their
designer-export resolution — 2868×2492, 2988×1591, 1894×1084 — which is 4–6x the
drawn size, i.e. 16–36x the pixels to decode for no visible gain. Re-encoded at
q82, which is indistinguishable from the source at display scale on this line art
(checked at 3x zoom on the cascade's smallest labels) and takes the three from
384K to 246K.

The fourth arrived the same way and was re-encoded on the same rule: 3469×1683
(5.8MP) at ~3.9x its drawn width, `cwebp -q 82 -resize 1772 0`, 67K → 40K. Its
drawn width is the only one in the table that is not a designer number — the
diagram fills the card, so it is whatever `Popup`'s body is wide, and that is
derived rather than measured. It is also the only one that carries alpha; the
diagram is line art on transparency, so it sits on the card's gradient the way
the artboard draws it rather than on a white rectangle of its own.

**Decode cost is the reason, not bytes.** A pop-up's picture has to be rastered
in the frame the card opens, and a 7.1MP source is enough work to miss it — the
figure lands a frame or two late. The other half of that fix is making sure the
asset is _fetched_ by then, which is a mounting question rather than a sizing one
and is recorded on `preloadImage`.

Keep the stored size and the `width`/`height` props in step: they are also where
`aspect-ratio` comes from, so a pair that disagrees with the file reserves a box
of the wrong shape and the card resettles when the image arrives.

### Verified in a browser

Chromium at 1440×800 and 390×780 on `/education/disease-background`.

Thumbnail, closed:

- The button, the image and the hint overlay are one box to within 0.5px at both
  viewports — which is why the thumbnail is capped by width alone. A height cap
  would have let the image satisfy it by narrowing, leaving the overlay hanging
  off the side of the picture it is supposed to cover.
- Hint opacity is 0 at rest and 1 on `:hover` _and_ on `:focus-visible`; the ring
  resolves to `rgb(214, 58, 82)`, i.e. `--color-brand-crimson-50`.
- The hint's background and the card's `::backdrop` both compute to
  `oklab(0 0 0 / 0.5)` — the reuse is real, not just the same source string.

Card, open, at 1440:

- Surface is `rgb(255,255,255)` with `background-image: none` — the opt-in works.
- 1066×520 card, 928×406 figure, no scrollbar (433 vs 433).
- Notes 301px wide sit entirely left of the 603px diagram; note fill computes to
  `srgb(0.8147 0.9185 0.8969)` = the sampled `#d0eae6` within one 8-bit step.
- The conclusion renders `rgb(214,58,82)` with `text-transform: uppercase` while
  its DOM text stays "Hemophilia reduces thrombin generation".
- Two dialogs are mounted on this chapter and exactly one is ever open; focus
  moves to the ✕ on open and is restored to the thumbnail on ESC.

At 390 the grid stacks to one column and the card scrolls (668 vs 601), which is
the intended degradation — the notes stay legible at full width rather than being
scaled down with the picture, which is precisely what the flat raster could not do.

---

## 14. Wizard option buttons

`src/components/OptionGroup.tsx` is `/wizard`'s answer control: a legend over a
2-column grid of wide pills, exactly one choosable per group. Reference is the
two `/wizard` artboard exports — one with nothing chosen, one with all three
questions answered — which between them draw every state the design has.

### It is `Button`'s skin, referenced rather than copied

Sampling both exports returns package values exactly, not approximations of them:

| State                                          | Fill                    | Label     |
| ---------------------------------------------- | ----------------------- | --------- |
| Group unanswered                               | `#d63a52` = crimson-50  | white     |
| Chosen                                         | `#1a5a4c` = **teal-75** | white     |
| Passed over (a sibling in the group is chosen) | `#8f1a2d` = crimson-75  | `#939393` |
| Submit                                         | `#0a94ae` = lagoon-50   | white     |

Two of the three are `Button`'s own skin (§4.2): the untouched group is its
resting pair, and — the interesting one — **a passed-over option is its _press_
pair**, `--color-ui-btn-bg-active` over `--color-ui-btn-fg-active`, used as a
resting state. So the component references those tokens rather than restating
the hexes, and a change to the Button skin moves the wizard with it.

Only the chosen fill is new, hence `--color-choice-selected` (an alias of
teal-75, named so the fact has one home) and `--color-choice-selected-hover`.

### Three states are drawn; hover, press, focus and disabled are not

Both artboard frames are at rest, so the interactive states are filled in by
derivation rather than invention, following the model the Button skin (§4.2)
already states: **the ground lifts on hover and pushes one step darker on press.**

| Option           | Resting              | Hover                             | Press                |
| ---------------- | -------------------- | --------------------------------- | -------------------- |
| Group unanswered | crimson-50 / white   | `#f73150` / teal-0 (Button's own) | crimson-75 / #939393 |
| Passed over      | crimson-75 / #939393 | crimson-50 / white (lifts)        | crimson-75 / #939393 |
| Chosen           | teal-75 / white      | `--color-choice-selected-hover`   | teal-100 / white     |

Two of those need a word:

- **Passed over, hovered** lifts to the resting crimson-50 pair — "you can pick
  me". It is the only invented _behaviour_ here, and its press then needs no rule
  of its own: it shares the unanswered pill's `active:` declaration and lands on
  the colour it already rests at, so pressing it simply drops the hover lift.
- **Chosen, pressed** is teal-100, which is the same one-step move down the ramp
  that crimson-50 → crimson-75 is on the Button. Hence
  `--color-choice-selected-active`.

**Focus** is `Button`'s inset 3px `--color-ui-btn-ring`, drawn on the label
because the `<input>` is `sr-only` (a 1px clip) and a ring on it would be
invisible.

> **It must be `has-[:focus-visible]:`, never `peer-focus-visible:`.** Tailwind
> compiles the `peer-*` variants to a **sibling** combinator, and here the input
> is a **child** of the label it styles — so the peer form matches nothing. It
> fails completely silently: the class sits in the markup, `:focus-visible` is on
> the input, and `outline-style` computes to `none`. The wizard shipped that way
> for one round; it was caught by reading `getComputedStyle` in a browser, and
> could not have been caught by a class-name assertion in jsdom.

**Submit, disabled** is the package's `disabled:opacity-ui-disabled`. Note the
artboard draws Submit at full lagoon in _both_ frames, including the one where
nothing is answered, so this state has no reference at all — see §9.

### Geometry, and the two sizes that are not what they look like

On the 1440 canvas: pills **425 × 56**, `rounded-lg` (8px), 20px between columns
and 16px between rows, in an **870px** block; legends `text-3xl` (drawn 32, renders 30) in teal-75,
10px above their pills; groups 24px apart; Submit 223 × 56, right-aligned to the
block, 32px under it.

The block is centred on the content column (x 261–1131 at 1440) where the artboard
draws it 13px right of that (275–1144) — the same tolerance `WizardIntro` records
for centring on the padded box rather than the canvas.

**Label type is 24px, not the `Button`'s 26.** Cap height cannot separate the two
at this size (JPEG antialiasing is ±1px, which is ±1.5px of type), so it was
settled by matching rendered string widths against the export's ink: "Hemophilia
A" is 153px drawn and renders at 153px at 24px (166 at 26px), and the longest
label, "Reduce monitoring requirement", is 365 against 369 (400 at 26px) — i.e. at
26px it no longer fits a 425px pill on one line. **Submit keeps 26px**, which its
own label confirms: 173px drawn, 176px rendered.

**The line box is `leading-tight` (30px), where the design's is 20px.** The
padding absorbs the difference — 30 + 2×13 = 56, the drawn height — so nothing
moves where the design applies. It only shows below `md`, where the grid is one
column and the labels wrap: at 24px in a 20px box, wrapped lines collide, which
is the same trap `Button`'s own comment records about its 26px type.

### Verified in a browser

At 1440 every row lands within 2px of the artboard (pills at y 226/351/511/583
against 227/350/509/581, Submit 671 against 669), all four fills compute to the
sampled values above, every hover and press in the table resolves to the value it
should, the focus ring computes to `solid 3px rgb(13,46,38) @-3px`, and the third
legend breaks where the designer broke it —
which needs `max-w-[700px]` on the legend, the midpoint of the 589–809px window
in which the drawn break survives. At 390 the grid stacks, the document does not
scroll sideways, and wrapped labels stay legible.

---

## 15. Wizard leaf — the Considerations/Strategies accordion

`/wizard/therapies` draws the leaf's note pair as two stacked header bands with
one panel open beneath the header it belongs to. Two artboards were delivered for
the same leaf (HB with inhibitors, improving bleeding control), one per open
block; everything below is measured off them. The behaviour — exactly one open,
always — is `docs/adr/0005-one-open-leaf-accordion.md`.

A **third source** arrived later: a vector (Tailwind) export of the two header
bands alone, from the _adherence_ leaf. It is the authority for the shadows below
and it overrules two raster measurements in the geometry table — both noted where
they occur.

### The state is carried twice: by the ground and by the shadow

Sampled `rgb(214, 58, 82)` on the open header and `rgb(74, 191, 212)` on the
closed one: `crimson-50` and `lagoon-25` exactly, no literal needed. They are
`--color-note-open` / `--color-note-closed` rather than bare palette utilities at
the call site, because "open is crimson, closed is lagoon" is one design fact with
one place to change — the call `--color-choice-selected` makes one section up.

There is no chevron. That is faithful, and it is not a use-of-colour problem:
`aria-expanded` carries the state non-visually, the open panel below the header is
itself a non-colour signal, and the shadow below carries it a third time as
elevation rather than as hue.

### The shadow says the same thing the ground does

The vector export gives both bands one drop shadow and differing insets:

| band            | drop                    | inset                                    |
| --------------- | ----------------------- | ---------------------------------------- |
| open (crimson)  | `0 1px 2px` black @ .25 | `0 1px 4px` **black** @ .36, + a 1px rim |
| closed (lagoon) | `0 1px 2px` black @ .25 | `0 1px 4px` **white** @ .36              |

Open reads pressed in, closed reads lifted. That is the grammar the rest of this
file already speaks: every `--shadow-ui-*-hover` lifts with an
`inset … rgba(255,255,255,.25)` and every press state recesses with a dark one.

**The numbers are rounded, and that is a reading rather than a liberty.** The
export's drop is `0px 1.0641891956329346px 2.128378391265869px` and its inset blur
`4.256756782531738px` — one scale factor on 1, 2 and 4. Three things say so: the
ratio is exact; the inset's y came out an unscaled `1px` beside a scaled blur,
which is only coherent if 1 and 4 are the real numbers; and the same export
carries `outline-offset-[-1.06px]`, which is −1 × the factor and is not a value
anyone draws. The rounded drop layer then lands verbatim on one already inside
`--shadow-ui-btn-active`.

**The rim ships inside the shadow, not as an `outline`.** The export draws
`outline outline-1 outline-offset-[-1.06px]` on the crimson band and drops its
colour. It cannot be an outline here — the header spends its own on the focus ring
and an element has only one — so it rides as `inset 0 0 0 1px`, which is the trade
the package documents for `--shadow-ui-btn-hover`. Its alpha is that token's
`rgba(255,255,255,0.2)`, borrowed rather than invented on the grounds that it is
the designer's own rim value for a **crimson** ground, which is what this band is.

Two caveats on the export, both handled by the fact that the two snippets can be
cross-checked against each other. It emits **two competing `shadow-[…]` classes**,
which both set `box-shadow` — the second wins, and `tailwind-merge` (which `cn()`
runs) would drop the first outright, so the pasted classes render half of
themselves. Tokens sidestep it. And it names **different font families for the
same component** (`DM_Sans`, `Roboto`), which is what marks the typography half of
the export as noise; only the values both snippets agree on are treated as signal.

### Hover and press are borrowed, not derived

Neither is drawn — both artboards are at rest. The usual move here would be §4.2's
model (lift the ground toward the `-25` tint, push one step darker on press), but
that recipe assumes the resting ground is a `-50` step, and this one already **is**
the `-25`.

So they come from `PopupButton` instead, which is the component the designer
already answered this exact question for — a `lagoon-25` ground under white type
(§4.4). Its answer is that on hover **the ground does not move and the label
lifts** (`--color-ui-popup-fg-hover`, `#bff5ff`), and that press goes to
`--color-ui-popup-bg-active` / `-fg-active`. The header references those tokens
directly, the way `OptionGroup` references the `Button`'s press pair.

Only the **closed** header takes them. The open one is `aria-disabled` (ADR 0005),
so a lift under the cursor would advertise an action it does not have — hover
therefore means "this one will open", which is true of the only header that has
it. Focus is the app's inset ring, `outline-[3px] outline-offset-[-3px]` in
`--color-ui-btn-ring`, on both: drawn outside it would vanish against two
saturated grounds, and it keeps the resting shadow.

**The shadows are borrowed on the same footing.** `--shadow-note-closed-hover` is
the lift `--shadow-ui-btn-hover` and `--shadow-ui-arrow-hover` both make — the
drop grows to `0 2px 4px` and the white inset spreads to `0 2px 4px 2px` @ .25.
`--shadow-note-closed-active` takes the **open** band's own recessed inset over
the lighter `.15` drop the `-focus` variants use, so touching a closed header
previews the state it is about to enter. That is not a flourish: it is exactly
what `--color-ui-popup-bg-active` is documented to do for the ground one line
below it, where the closed press ground **is** the open skin's resting ground.

`box-shadow` joins the header's existing 120ms transition list, which is the
package's own `transition-[background-color,box-shadow,color]`.

### The panel fill is translucent, and the number is fitted

`bg-brand-teal-25/30`. The panel is **not** a flat fill — the page's radial
gradient brightens it toward the centre, which is what identifies it as
translucent in the first place: sampling across the drawn panel gives 181 → 208 →
184 in the red channel, tracking `bg-page`'s own centre at x≈698.

Fitted properly rather than eyeballed. Compositing the §6 gradient over white,
calibrating the model against the page background beside the panel, then solving
`panel = α·C + (1−α)·bg` by least squares over ~85 000 panel pixels puts the free
optimum at α = .265 on `(112, 187, 171)`, RMSE 5.79. Constrained to palette steps:

| candidate             | best α | RMSE     |
| --------------------- | ------ | -------- |
| `teal-25`             | .305   | **5.83** |
| `teal-50`             | .160   | 5.95     |
| `teal-75`             | .125   | 7.03     |
| `lagoon-25`           | .225   | 9.58     |
| `--color-figure-note` | 1.00   | 10.66    |

`teal-25` at .305 is within .04 RMSE of the unconstrained best — indistinguishable
— and lands on an exact palette step at an exact opacity step, so it is the
scale's answer rather than a literal. (`--color-figure-note` was the obvious
guess and is wrong: it matches the panel at the page's brightest point only,
because it is opaque.)

### The stroke is the one literal

`--color-note-panel-border: #747474`, sampled `(116, 116, 116)` — exactly neutral
on all three channels, which is what rules out the alternatives: an antialiased
tint would not be neutral, and black at 45% over the panel's own ground computes
to `(116, 143, 137)`, not grey. It is off every ramp in this file by a hue rather
than by a step, so it stays literal under the §3/§4 rule and is **open item 21**
below, alongside `--color-agent-mab`.

**The panel draws an edge only where one is exposed**, which makes the stroke
positional rather than fixed. Its top never is — the panel tucks flush under its
own header band with no gap — so there are no top corners and no top stroke. Its
bottom is exposed only on the **last** block: the Considerations panel opens
_between_ the two headers and runs straight into the Strategies band beneath it,
with no stroke and no radius where they meet. So `rounded-b-xl` and `border-b`
are the `last` prop's, and the first block's side strokes run down to the next
band and stop. 12px inset per side from the band either way.

### Geometry

|                     | drawn                                       | shipped                  |
| ------------------- | ------------------------------------------- | ------------------------ |
| header band         | 44px tall, 8px radius, all four corners     | `min-h-11 rounded-lg`    |
| header type         | 24px, ~24px of ink ascender-to-descender    | `text-2xl font-semibold` |
| band → panel        | flush, 0px                                  | no margin                |
| panel inset         | 12px per side                               | `mx-3`                   |
| bullet pitch        | 28px, ink 19px on a line with both extremes | `text-xl leading-7`      |
| `<h1>` → first band | 12px                                        | `mt-3`                   |

24px and 20px were both off the old scale (its 26px and 20px steps carried weight
600 where the bullets are 400), so both shipped raw under §8's precedent. Both
are now steps that land exactly — 24 is `text-2xl` and 20 is `text-xl` — with the
weight stated beside them (§2).

**Two rows of that table were corrected by the vector export**, which gives
`h-11 rounded-lg … font-semibold` where the raster reading was 43px, a 6px radius
and weight 700. The vector is the better witness on all three and neither raster
reading could have caught its own error: an antialiased 8px corner genuinely
measures as 6 on a flat PNG, and ink height tells you font **size**, not weight.
The corroboration is the height — the export's 44px is what this page already
shipped, a scale step it had been moved onto independently of the 43px prose.
`rounded-lg` also matters to the shadows above, since it is the corner the drop
and the rim both trace.

**`mt-3` after the `<h1>`, where every chapter and `/wizard/scenario` use `mt-8`.**
Measured, not inherited: this screen packs its heading onto the accordion in a way
the prose screens do not, and their shared 32px is a fact about a heading over
prose rather than about headings.

### The two exports disagree about the gap between bullets

The Considerations export puts 12px between its two bullets — a 40px baseline
pitch where every other pair in it is 28. The Strategies export puts **none**: all
six of its inter-bullet gaps are the same 28px as the intra-bullet ones.

Shipped with **no gap**, on the weight of evidence — six observations against one
— and because it is the reading that survives the tallest note: HA without
inhibitors' _Reducing Treatment Burden_ Considerations runs to 8 bullets, and 12px
between each would push the arch off a 800px screen. The cost is that the
Considerations panel renders 141px against the drawn 152. Worth a designer
question at the styling gate.

### The arch is pinned, not flowed

`ArchBand` with `mt-auto grow-0`, where `DisclosureBand` uses the default `grow`.
Both artboards put the arch's top edge at **the same y (553)** with panels of
152px and 335px above it, which is a band anchored to the bottom of the column
rather than one that follows the content down — so the arch does not jump when
the open block changes. When a note is tall enough to overflow the column
(the 8-bullet leaf, 822px at 1440×800), `mt-auto` collapses and the arch follows
the content, which is the right degradation.

Its captions are **`brand-slate-100`**, not `--color-popup-caption`: the drawn
caption's darkest pixel is `(17, 29, 46)`, which is that step exactly, where the
chapters' captions sample `(7, 70, 85)`. The two bands genuinely wear different
caption colours — `fviiia-mimetics` already records `slate-100` arriving "new and
exact" on a fourth artboard — so this is transcribed rather than folded into open
item 15. They are 22px here against the chapters' 26.

The agent row is equal-width items at an equal gap (`w-40`, `gap-x-30`), which is
what makes the **button centres** evenly spaced — the thing the artboard draws.
Its three land at 427 / 720 / 1015 on a band running 112→1328: a pitch of 294 on
1216, or .2415 of the band, which on this page's 1168 column is 282 against the
shipped 280. The equal width is load-bearing: the three captions measure
137 / 143 / 95px, so content-width items would space the buttons 322 and 301
apart.

**Fuller rows close the gap; they do not squeeze the item.** Five agents do not
fit at the drawn pitch (5 × 160 + 4 × 120 = 1280 against a 1232 band) and the
designer drew no such leaf. The first attempt let the _item_ give, and that was
wrong in a way only a browser showed: measured across viewports, five items fell
to 150px at 1440, 118px at 1280 and **67px at 1024** while the gap sat at its
drawn 120 throughout, so the captions overflowed their own boxes by up to 38px a
side and the outermost — "Emicizumab", "Fitusiran" — ran past the arch into its
`overflow-hidden` and were clipped mid-word.

Three changes, none of which touches the case the designer drew:

|                                                       |                                                                                                                                                                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gap-x-20` above three agents, `gap-x-30` at or below | The 120px pitch is measured off a **three**-agent artboard, so it stays exact wherever it was drawn; rows the designer never drew close to 80. 5 × 160 + 4 × 80 = 1120 fits 1232 uncompressed.                |
| **no `min-w-0`**                                      | It licensed shrinking past the content, which is what produced the clipping. Without it an item's automatic minimum size is its min-content — and every caption is one word, so the floor **is** the caption. |
| `xl:` not `lg:` for nowrap                            | Below 1280 even the closed-up row cannot hold five captions on a line, so the wrap takes over. A second row is legible; a clipped word is not.                                                                |

Re-measured after: every one of the sixteen leaves holds its items at the full
160px at 1440 with zero clipping, and the five-agent leaf clears the arch wall by
16–56px at every width from 1280 up, wrapping to two rows below that with no
horizontal scroll and no collision with the panel above. `px-4` keeps the wrapped
row off the wall. It is still `/wizard/scenario`'s `shrink-0` / `shrink` split,
hinged one breakpoint later.

One residual, measured and left: hemophilia B without inhibitors has a 164px
caption in the 160px box, a 2px overflow per side. It is not clipped and has 80px
of gap either side, so it is recorded rather than chased.

### Motion

220ms `ease-out` on `grid-template-rows`, with the panel's contents cross-fading
at 150ms on the same curve so text does not appear mid-wipe; header colours stay
on the app's 120ms. Under `prefers-reduced-motion: reduce` both are dropped
(`motion-reduce:transition-none`) and the swap is instant — verified, and the same
call `BrandLoop` makes for the footage.

`grid-template-rows` rather than `max-height` because there are sixteen leaves and
sixteen panel heights; see ADR 0005. It needs the inner element to be
`overflow-hidden` **and** `min-h-0` — a grid item's automatic minimum size is its
content, which would otherwise pin the row open.

### Verified in a browser

At 1440, against the two exports: header bands 43px at 6px radius computing to
`rgb(214,58,82)` and `rgb(74,191,212)`; panels 141px and 337px against the drawn
152 and 335; the arch pinned at y=542 in **both** states; the `<h2>`'s two lines
at a 32px pitch and 22–23px cap height, matching the export exactly; captions
inking 16px tall at 133/139/92px against the drawn 137/143/95 — inside the ~4px
this font runs narrower than the export, the same discrepancy §14's pill labels
record. All ink sits 5–6px above the drawn y, which is the whole page's
pre-existing offset, not this section's: `AppShell`'s `pt-below-rule-lg` puts the
`<h1>` at 46 against the artboard's ~53.

Checked at 2, 3, 4 and 5 agents: button centres evenly spaced in every case
(pitch 280 at 2–4, 257 at 5), no horizontal document overflow at any count, and
the 4-agent leaf's three-line "Etranacogene dezaparvovec-drlb" caption grows the
arch rather than overflowing it.

**`leading-none` on the arch's title** is a caller override of `text-3xl`'s own 1.2
step: the export sets this heading's two lines at a 32px pitch, measured twice
(cap tops at y=594 and y=626). It only shows up here because `DisclosureBand`'s
titles are phrases that never reach a second line. `max-w-215` beside it is a
line-break cap, not styling — the drawn break falls after "…IS", and the window
that reproduces it is ≥809px (to hold line 1) and under ~895 (before "THE" fits
beside it).

---

## 16. Drug information sheets — the §6 card

`DrugSheetPopup` draws a per-drug sheet inside `Popup`: the crimson band wearing the
drug's name, then five crimson labels each over a disc list. Seven artboards were
delivered, one per sheet, and everything below is measured off all seven together.
The behaviour — component state rather than a `?drug=` route — is
`docs/adr/0006-component-state-drug-sheets.md`.

### The seven exports share one scale, and it is 1:1

Worth stating first, because it is the opposite of what they look like: the cards are
1136, 1064 and 869px wide across the set, which reads as three export scales. It is not.
**The crimson band is 96px in all seven**, the border is the same weight in all seven,
and body ink measures 20–21px tall wherever it carries an ascender and a descender. So
the exports are one scale and the _cards_ are three widths — the designer drew each
sheet to its own content.

That matters because it means nothing here needs normalising before it is read, and it
is why the "airy vs tight" difference between images is content, not type.

### Type, and why it is not measured off these PNGs

|               |                                        |
| ------------- | -------------------------------------- |
| Section label | 20px, weight 700, `crimson-50`         |
| Bullets       | 20px, weight 400, `BulletList`'s black |
| Both          | `leading-[1.6]`                        |

The size is the **established pop-up body value** — the same `text-xl
leading-[1.6]` all four §7.5 agent cards set — reused rather than re-derived, which is
the rule `DenecimigCard` writes down: two cards a reader opens in sequence should be one
size. It holds harder here than it did there, because these open from a wizard leaf and
those open from an education chapter, and nothing stops a learner doing both in a minute.

The exports agree on the size and disagree on the leading: they draw ~20px type at a
**26px** pitch (1.3), against the 1.6 shipped. That 6px is the one deliberate divergence
in this section, and it is inherited from the house value rather than chosen here.

`crimson-50` is **exact, not near**: 26,144 pixels of `rgb(214, 58, 82)` in the labels
across the seven exports, with no other core value present. No literal, no `color-mix`.

### The two gaps are the measured extra over one line

Ink-top to ink-top, the artboards give:

|                          | Drawn                      | Over one 26px line | Shipped     |
| ------------------------ | -------------------------- | ------------------ | ----------- |
| bullet → next bullet     | 25–27 (median 26)          | 0                  | 0           |
| label → its first bullet | **32–34, all 35 sections** | +7                 | `mt-2` (8)  |
| last bullet → next label | 29–56 (median 37)          | +11                | `mt-3` (12) |

The middle row is the striking one: across seven sheets and thirty-five sections the
label-to-list distance is 33px within ±1. It is a rule, and it is shipped as one.

Inter-bullet spacing is **zero**, the same reading §15 takes for the note panels and on
the same evidence — a wrapped continuation line and a new bullet are both 26 apart, so
there is no gap to find.

### Padding, and the one inset that follows `Popup` rather than the drawing

`py-6` (24px) on the body, the value all four §7.5 cards use, on top of `Popup`'s own
`py-2`. The artboards put the first label's ink 28–43px below the band; 32 is inside it.

The horizontal inset is `Popup`'s existing `px-16`, which puts text 69px from the card's
outer edge. **Two of the seven exports are exactly that**; the other five draw 49. Not
changed: the card is shared with the §7.5 chapters, and a 20px inset is not worth
splitting a component over. Recorded rather than chased.

### Verified in a browser

At 1440 × 800, HB without inhibitors / reduced treatment burden and HA without
inhibitors / reduced treatment burden:

- labels compute to `rgb(214, 58, 82)` at 20px/700/32px line-height, bullets to
  `rgb(0, 0, 0)` at 20px/32px — the measured values exactly;
- label→list 40px box-to-box (32px line + the 8px `mt-2`) and list→label 12px, i.e. the
  +8 / +12 intended;
- the card holds `1024 × 760` and **the scroll region engages**: Emicizumab 824px of
  content in 673px, Fitusiran 792, Etranacogene 728, all `overflow-y: auto`. This is the
  thing jsdom cannot see and the reason the pass exists;
- `dialog:modal` is true with focus inside it;
- no horizontal document overflow at 1440 or at 390, where the card settles to 359 × 741.

`2 × 10¹³` renders as the superscript it should be, and no card contains a link.

### Open: the seven exports disagree about the space above a label

Only above. The three rows of the gap table are 26 ± 1 and 33 ± 1 across every sheet,
and then the last-bullet-to-next-label distance runs 29, 30, 31 on three sheets, 36–44 on
three others, and 48 and 56 on Denecimig — where the export opens what looks like a blank
line before Monitoring and before Clinical Trials. Shipped at the median (12px over the
line) uniformly. Open item 24; it is the same shape as item 22 and wants the same kind of
ruling.

---

## 17. `/explore` — the SDM conclusion and the class arches

`Explore` draws CONTEXT.md §9's shared-decision-making node over a row of three arched
segments indexing the §6 drug sheets by therapeutic class. Why this page is the SDM node
rather than the comparison table issue 09 specified is
`docs/adr/0007-explore-is-the-sdm-conclusion.md`.

One artboard, 1440 × 800, and **it is 1:1** — established before anything was read off it,
because a wrong scale factor makes every number below wrong in the same direction and
nothing else would catch it. Rendering DM Sans 700 at 22px gives the five one-line
captions as 131 / 115 / 135 / 143 / 95px against the export's 131 / 115 / 135 / 143 / 94.
Four exact, one off by a pixel. The package `Button`'s own `px-16 py-[18px]` also lands on
the drawn CTA's 67/66 × 17/15 of padding. So the export is unscaled and the measurements
below are pixels, not ratios.

### The band is the gutter on both sides, and this page takes all of it

The three segments tile **x 112 → 1328**: 339 + 524 + 353 = 1216. That is
`--spacing-gutter` (112px) on the left and the same on the right, i.e. the artboard's
content is symmetric about the canvas and takes no account of the sidebar rail — the
divergence open item 23 already records for `/wizard/therapies` and `/wizard/scenario`.

The content column is `--container-content` (1168px) and stops at x=1280 to clear the
rail, so the page breaks out 48px to the right with **`lg:-mr-rail`**, landing the band on
1328 exactly. `/wizard/therapies` breaks out with `-mr-16` (64px) and lands on 1344,
overshooting the same drawn edge by 16. Two pages, two answers, one designer question —
folded into open item 23 rather than raised again.

Everything on the page centres on the band's centre (x≈717 drawn, 720 computed), not the
column's 696.

### The arches: radius verified, not asserted

`rounded-t-[128px]`, and the radius was checked against the drawn curve rather than read
off a corner. The left segment's flat top is y=518; at x=200 its edge should therefore sit
at `518 + 128 − √(128² − 40²)` = **524.4**, and it measures **524**. The opposite corner
predicts 543.8 at x=400 and measures 544. Both corners, one radius.

| segment | x → x      | width | drawn top | ships at |
| ------- | ---------- | ----: | --------: | -------: |
| left    | 112 → 451  |   339 |       518 |      514 |
| middle  | 451 → 975  |   524 |       478 |      478 |
| right   | 975 → 1328 |   353 |       511 |      514 |

**The middle's 40px lift is kept; the flanks' 7px difference is not.** The lift is far too
large to be hand placement and is what makes the three read as a range with a peak. The
7px between two flanking segments drawn as a pair is placement noise, so they take the
mean and share one top. The padding inside each segment absorbs the difference, which is
what keeps all seven buttons on one line (y 566–630) whatever their arches do: 88px from
the row's top edge in the middle, 36 + 52 either side of it.

The segments carry **no `overflow-hidden`**, unlike `ArchBand` — there is no footage to
clip, and the 128px radius clips nothing else.

### The fills: one solved exactly, one substituted deliberately

Solving `inside = (1−α)·bg + α·C` over the flat top of each segment, against the
composited page gradient immediately above it:

- **middle, α=0.60 → C = (254.7, 254.7, 254.7)** over 245 columns. White, to within a
  quantisation step. Ships `bg-white/60`, exact.
- **flanks, α=0.05 → C = (248, 7, 2) and (254, 4, −3)**. A pure red. The solve is noisy —
  at 5% a ±0.5 quantisation error is amplified 20× — but it is decisive about _hue_:
  `brand-crimson-50` is (214, 58, 82), a pink, and would need G≈58 / B≈82 where the solve
  returns G≈5 / B≈0. The export is Tailwind's `red-600`, not a palette step.

**Shipped `bg-brand-crimson-50/5` anyway.** At α=0.05 the composited difference between
the two is **(−0.3, 1.0, 2.2) out of 255** — under one quantisation step on two channels,
and invisible. Following the export would have made this the only native-Tailwind colour
in an app whose every other value is a token, to buy a difference no display can show.
`ArchBand` already washes its arch in the same crimson at `/15`, so the flanks are now the
same colour one alpha step lighter. Recorded rather than silent, because it is the one
place on this page the code deliberately does not match the file.

### Type

| element     | value                                                    | how it was fixed                                                                                                                                                      |
| ----------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<h1>`      | `text-4xl leading-9 tracking-wide`, display, uppercase   | least squares over all four drawn lines returns size 42 at 0.0234em, residuals ≤1.1px on lines up to 1139px; cap height agrees independently (30px ink / 0.70 = 42.9) |
| bullets     | `text-xl leading-8`                                      | rendered widths 655/1110/817/718 vs drawn 651/1106/813/715 — a constant +4, i.e. the indent, not the size                                                             |
| CTA         | `text-2xl leading-5`, **sentence case**                  | ink measures 24px ascender-to-descender; the drawn label is mixed case                                                                                                |
| caption     | `text-xl leading-5 font-bold text-brand-slate-100`       | pixel-exact to `/wizard/therapies`; `leading-5` from the 20px baseline pitch of "Efanesoctocog / alfa"                                                                |
| class label | `text-2xl leading-5.5 tracking-wide`, display, uppercase | 18px cap ink / Barlow Condensed's 0.70 = 25.7 → 26 = `text-2xl`; 22px line pitch off the three-line label                                                             |

**The `<h1>` is drawn at 42px where every other page in the app sets `text-5xl` (drawn 52,
renders 48).** It is a four-line sentence and the designer dropped it.

It shipped raw at `text-[42px]` until 2026-08-04, as §13's 45.5px pop-up title
still does. It now takes `text-4xl` and renders at **36px — a 6px drop, the
largest single change the §2 migration made anywhere in the app.** That is a real
loss of fidelity and it is worth stating plainly: the 42 was not a guess but a
least-squares fit over all four drawn lines with residuals ≤1.1px, independently
corroborated by cap height (30px ink / 0.70 = 42.9). Snapping to 36 discards that
work, and the four-line heading it was fitted against will re-flow. It went on
the scale anyway, on the instruction that no arbitrary font sizes survive; if the
heading reads wrong at 36, the honest fix is `text-[42px]` back under §8's
precedent, not a different step — 48 is further out than 36 is.

**`max-w-content` on the `<h1>` is a line-break cap**, the device `/wizard/therapies`'
`max-w-215` uses. The drawn lines measure 961 / 1019 / 1142 / 362, and the 1216px band is
wide enough to pull "EMPHASIZING" up onto line 1 and set the whole thing in three. The
window that reproduces the drawn break is **[1142, 1178)** — at least line 3's own width,
and less than line 1 plus the next word. 1168 is inside it, and it is the app's own
content measure rather than a number chosen to fit.

**The CTA's clamps were load-bearing, not responsive polish — and they are gone.**
`leading-5` is what makes the package `Button` 56px instead of 68, but 24px type in a
20px line box overlaps itself the moment the label wraps, which is why `Landing` refuses
the trick. The size clamp floored at 1rem, so wherever this label wrapped it was 16px
inside a 20px box; it had shipped broken for one commit before that floor went in, and
was caught at 375px. Removing the clamp on 2026-08-04 reinstates exactly that bug: the
label is now taller than its line box at every width and wraps to four lines at 375.
`leading-tight` is the fix, at the cost of the drawn 56px pill. Open item 33.

### The label row is a fixed height, because the export says so four times

The four class labels carry 1, 1, 3 and 2 lines of text, and their ink spans are 743–760,
743–760, 721–782 and 765–782. Every one of them has its vertical **midpoint at y = 751.5**.
Four for four, to half a pixel — that is a fixed-height row with the label centred in it,
not labels flowing under their captions. Built as one: the captions take a fixed `h-15`
(60px, the three-line height) and the label row `h-20` (80px), which puts the centre at
751 against the drawn 751.5.

Both are `xl:` only. Below that the buttons wrap and the columns stack, so the four labels
genuinely are not in one row and the fixed heights would only be gaps.

### `preserveCase` and the flex-item whitespace trap

"FVIIIa mimetics" needs `preserveCase` — `uppercase` renders it "FVIIIA MIMETICS" and
destroys the letter that says _activated_ factor VIII, which is why the artboard draws
that `a` lower case.

The helper returns a `<span>` beside a bare text node, and **a flex container makes each
of those an anonymous flex item and drops the whitespace between them**, rendering the
label "FVIIIaMIMETICS". The centring therefore lives on a wrapper and the text is not a
flex item. The helper's other two callers are an `<h1>` and a pop-up band, neither of them
a flex container, which is why this is the first place it bites — worth knowing before the
third caller.

No `aria-label` here, unlike those two callers. The helper's contract asks for one because
the accessible-_name_ algorithm joins each element's contribution with a separating space,
but that computation only runs on elements whose name is being computed, and this is a
`<p>` of body text that names nothing. Its concatenated text content still has the space.

### Below `xl`, and the padding that moved

`px-4` on the segment sits on the inner row, not the flex item: with `flex-basis: 0%` and
border-box, padding on the item floors its basis at 32px and the three segments come out
344.2 / 514.6 / 357.1 instead of 339 / 524 / 353. It is also `xl:px-0`, because 32px taken
out of the space the buttons divide moves every button in the middle segment by up to 21px
against the drawing. The drawn case needs no padding: at the buttons' own height the 128px
radius has already opened to within 25px of the segment edge, and the nearest button is 27
clear of that.

A column's agents need their captions' width and no less — three of them come to 373px —
which fits no phone at any division, so below `xl` the items take a 160px basis, refuse to
shrink, and the row wraps; the three segments stack. That is `/wizard/therapies`'
arrangement on the same breakpoint and the same finding: the gap gives before the item,
because the item is what carries the caption.

### Verified in a browser

At 1440 × 800, measured off the render the same way the artboard was measured:

- heading lines ink at **51 / 87 / 123 / 159** — the artboard's four values exactly;
- bullets at 221 / 253 / 285 / 317 / 349 against the drawn 220 / 252 / 284 / 316 / 348;
- CTA 398–453 (drawn 396–451), 56px tall exactly;
- segments at **x 112 / 451 / 975, widths 339 / 524 / 353, tops 478 / 514 / 514** — the
  drawn geometry to the pixel;
- buttons 566–630, matching the drawn row exactly; centres within 8px at every one of the
  seven, and the worst three are the middle segment, whose buttons the export draws 8px
  right of its own centred label;
- captions ink 652–667 (drawn 651–666); the two wrapping captions span 36 and 55px, both
  identical to the export;
- class labels ink 743–760 with the three-line one at 721 / 743 / 765, and **all four
  midpoints at 751.5** — the drawn value;
- "FVIIIa MIMETICS" keeps its space and its lower-case `a`;
- both pop-ups open, and Efanesoctocog alfa's sheet renders with its `Class:` heading —
  the first time that card has been reachable in the app;
- **no horizontal document overflow at 1440, 1280, 1024, 768 or 375**, and no caption
  clipped at any of them.

### Open: two carried forward

The label tracking fits at 0.036em and ships at `tracking-wide` (0.025em) — open item 26.
`Popup` is too narrow for the nine-column table it will hold — open item 27, since **half
closed**: the card now takes `width="wide"` (1360px, ~136px a column) and what is left is
the scroll region the grid needs on a phone, not the card. See §13's width scale.
