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

**The one-step-down shape now reaches past `<h1>`.** `disease-background`'s
responsive pass (§11) applies it to sub-headings, band titles and captions —
`text-2xl … lg:text-3xl` and `text-xl … lg:text-2xl`. The _reason_ is weaker
there and the distinction matters: an `<h1>` steps down because it **overflows**,
which is a correctness bug, while a 30px sub-heading only collapses the heading
hierarchy onto the 16px body size, which is comfort. Same rule, same one class,
different grade of argument — do not read the `<h1>` table above as evidence for
the others.

Body copy mostly does not participate. 16px is a legibility floor and open item 9 has
the reference **larger** than what ships, so there is nothing below it to step to.

**Five pages are the exception, and the exception is what the rule was about.**
`rebalancing-agents` and `prophylaxis-guidance` transcribe their body at 26px off their
own exports — they are the two chapters built around a single block of prose — so they
ship at 24 and step to 20 below `lg`, which is a step on the scale rather than a
collapse onto the other two's 16. **`/wizard/scenario` is the third**, off its own
four artboards and for the same reason: lead, class list and caveat are the page.
**`fviiia-mimetics` is the fourth**, and it is the one that makes the rule a rule rather
than a pair of chapters: its bullets, its two agent captions and its panel's heading are
all the same drawn 26px, so the whole page moves on one step. **`/wizard/therapies` is
the fifth, and the first whose step lands ON the floor rather than above it** — its note
panels are drawn at 20, so one step is 16, which is where the other chapters already sit.
That is the case this rule had not yet met: an exception page is one drawn above the
floor, not one drawn two steps above it. The floor is still the floor; those five simply
start above it. **`/explore` is the sixth**, drawn at 22 and shipping at 20, so its one
step is 16 — the same landing as the fifth, and for a reason neither fit nor transcription:
its `<h1>` ramps three steps to 24 on a phone, and 20px bullets under a 24px heading read
at 0.83× where the artboard draws 0.52×. §11 records the three chapter passes, §18 the
classes screen's, §15 the leaf's and §17 `/explore`'s.

**`/explore`'s `<h1>` is also the one place the one-step rule is not enough.** At 190
characters it is the longest heading in the app, and the app-wide 30px renders it in ten
lines and 300px of a 320px viewport — measured, not estimated. It ramps `text-2xl
sm:text-3xl lg:text-4xl`, i.e. §2's step at `sm` and one more below it, which is
`/wizard-intro`'s three-step shape (§8) reached from the other end. The rule stands for
every other heading: this one is ~2.7× the next longest `<h1>` in the app, which is
`fviiia-mimetics`' 69-character chapter title.

That fourth case is also where the **leadings** had to be answered, because it is the
first page in this section whose transcribed leading was absolute. `leading-7.5` and
`leading-6.5` are the drawn 30px and 26px; held against a 20px step they render 1.5 and
1.3, i.e. the step loosens what it was meant to tighten. They ship as the ratios those
values already rendered at `text-2xl` — `leading-tight` (1.25) and `leading-[1.08]` —
so one class covers both steps and the 1440 canvas is unchanged. **A `leading-*` on the
scale does not survive a size ramp; a ratio does.** The drawn pixels are recorded in
§11's type table, which is where that transcription now lives.

**Not `clamp()`.** §8 used one for the landing hero until 2026-08-04 and no
longer does — the app now contains none — but the argument for keeping chapters
off it never depended on that. A hero is one composition whose lines must hold
their proportions at every width; a chapter heading is a single line failing on a
single word. One size step fixes it and costs one class, where a clamp would add a
bespoke `(min, slope, max)` triple per heading. Below the canvas nobody has drawn
a phone, so this is an invented comfort value stated as a step on Tailwind's
scale, the same call `AppShell` makes for the gutters it cannot honour down there
(§11).

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

Those four are the **`xl:` values**. Each line ramps down from there in four
steps, all of them named Tailwind steps — there is no `clamp()` and no arbitrary
font size in the hero:

| Line                 | Design      | base        | `sm:` 640  | `lg:` 1024 | `xl:` 1280 |
| -------------------- | ----------- | ----------- | ---------- | ---------- | ---------- |
| `HM-85L`             | 60px / 400  | `text-2xl`  | `text-4xl` | `text-5xl` | `text-6xl` |
| `The Future Is Now:` | 128px / 700 | `text-5xl`  | `text-7xl` | `text-8xl` | `text-9xl` |
| `Personalizing …`    | 36px / 400  | `text-sm`   | `text-xl`  | `text-3xl` | `text-4xl` |
| `LET’S GET STARTED`  | 24px / 600  | `text-base` | `text-lg`  | `text-xl`  | `text-2xl` |

### Why the top step is `xl:` and not `lg:`

`lg:` is the app's dominant breakpoint (§11, and the sidebar's own switch point),
so it is the obvious place to hang the drawn values. It is the wrong one. The
128px headline is ~1000px wide, and what has to hold it is not the viewport but
the content column `AppShell` gives it:

| Viewport      | Column (`px-gutter` left, `gutter-rail` right) | 128px headline |
| ------------- | ---------------------------------------------- | -------------- |
| 1024 (`lg`)   | 1024 − 112 − 160 = **752px**                   | wraps to 2     |
| 1280 (`xl`)   | 1280 − 272 = **1008px**                        | one line       |
| 1440 (canvas) | 1440 − 272 = **1168px**                        | one line       |

Attaching the top step to `lg` would put the drawn headline in a column 250px too
narrow for it, breaking the composition at exactly the width where the sidebar
changes shape. `xl` is the first step whose column holds it. Since 1280 ≤ 1440,
**the canvas is unaffected** — the hero at 1440 is what it has always been.

### Why the lines hold their ratios

The first three lines keep their drawn proportions at every step — eyebrow ÷
headline stays 0.47–0.50, subtitle ÷ headline 0.28–0.31 — so the hero is one
composition scaled down rather than three lines independently resized.

That is what answers the objection this section used to make against ramps
(below). It is also why the CTA is deliberately excluded from the ratio: at
0.19 × a 48px headline its label would be 9px. It is a control with a legibility
floor, not a fourth line of type, and it ramps on its own (see below).

**Line-height is written as a slash modifier** — `text-5xl/[0.75]`,
`sm:text-7xl/[0.75]`, … — not as a separate `leading-[0.75]` alongside. The
headline's leading is the ratio 0.75 (= 96/128) rather than the drawn 96px, which
is load-bearing now that the size moves at three breakpoints.

### The line-height rule this section got backwards

**This section claimed until 2026-08-04 that a bare `leading-*` would be
overridden by a later responsive `text-*` step. That is false**, and the built
CSS says so plainly:

```
.leading-none        { --tw-leading: 1; line-height: 1 }
.text-3xl            { font-size: var(--text-3xl);
                       line-height: var(--tw-leading, var(--text-3xl--line-height)) }
.lg\:text-5xl\/none  { font-size: var(--text-5xl); line-height: 1 }
```

A Tailwind v4 `leading-*` sets a **custom property**, and every `text-<size>`
resolves its line-height _through_ that property. A custom property set at the
base level is not scoped to the media query a later step arrives in, so one
`leading-*` covers an entire ramp. It is the **slash modifier** that does not
propagate — it emits a bare `line-height` and sets no property, so a ramp written
that way needs it restated at every step.

Two consequences, and the file now follows both:

- Where a ramp already had a separate `leading-*`, it keeps it and the ramp is
  written as plain `text-*` steps — `Popup`'s title, `ArchBand`'s (whose
  `/wizard/therapies` caller passes `leading-none` and keeps it across the step),
  `SeverityTable`'s manifestation bullets.
- The hero here keeps its slash modifiers. They are not required, and saying so
  is the point of this subsection; four sizes reading one property at a distance
  is the thing that breaks silently when someone edits a single line, so the
  redundancy is kept deliberately rather than by mistake.

**There is a separate, real mechanism that this was confused with**, and it is
tailwind-merge rather than CSS: `conflictingClassGroups` lists `leading` under
`font-size`, so passing a `text-*` class **into** a component whose own classes
carry a `leading-*` strips that leading before the browser sees either. That is
why `Landing`'s CTA genuinely does need a modifier per step — it passes `text-*`
into mlg's `Button`, which ships `leading-tight`. Within a single `className` the
sort order `prettier-plugin-tailwindcss` produces puts `leading-*` after
`text-*`, so the same conflict does not fire there.

### History: two superseded positions

This question has had three answers, and the two dead ones are kept because each
is the argument against what replaced it.

**Until 2026-08-04 — `clamp()`.** Each `vw` slope was set so the size reached the
design's exact value at ~1440px and stopped; the floors were what the narrowest
common viewport (320px, minus the shell's padding) could hold. The case against a
breakpoint ramp was made here in these words: _a hero is a single composition, so
the three lines have to keep their relative sizes at every width — a ramp steps
all three at once and looks broken between stops._ That objection is sound, and
the ramp above is built to satisfy it rather than to dismiss it: the ratios are
held at every stop, which is the property the clamps were bought for.

**On 2026-08-04, for the length of one commit — fixed at the maximum.** Every
`clamp()` in the app was replaced by its own upper value, which rendered the drawn
size at every width and regressed the page below `lg`. Measured at 375 × 800: the
headline set in four lines, the hero filled the viewport, the CTA landed under the
sidebar's bottom bar and the page scrolled (853px against 800).

What settled it in favour of the ramp was the column measurement in the table
above — the fact that the drawn headline needs 1000px of _column_, which neither
earlier position had established. Once that is known, the top step has a
determined home and the intermediate steps are the ratios; the ramp stops being a
guess between stops.

### The 400 weight

The eyebrow and subtitle are `font-normal`, and Barlow Condensed was previously
imported at 600/700 only — the two lines would have rendered as a
browser-synthesized regular. `src/main.tsx` now also imports
`@fontsource/barlow-condensed/latin-400.css` (+21 kB woff2).

### The CTA override

mlg `Button` is a single fixed scale by design — `px-16 py-[18px] text-[26px]`,
no breakpoints, matching the other atoms in the package. At the design's 24px
label that is ~370px wide, i.e. wider than a 375px phone once the shell's padding
comes off, and it would sit unchanged under a headline that scales. The `xl:`
override is the design's own 64px / 18px / 24px, and all three land on the
spacing and type scales exactly.

**The padding ramps with the label.** Ramping type alone leaves a 16px label
inside 64px of horizontal padding on a phone — a 268px pill in a 311px column,
almost all of it air — so the package's one fixed scale becomes four:

|         | base        | `sm:` 640      | `lg:` 1024   | `xl:` 1280     |
| ------- | ----------- | -------------- | ------------ | -------------- |
| padding | `px-8 py-3` | `px-12 py-3.5` | `px-14 py-4` | `px-16 py-4.5` |
| label   | `text-base` | `text-lg`      | `text-xl`    | `text-2xl`     |

The label is the one hero line that does **not** hold the composition ratio, for
the reason given above: 16px is a control's floor, and 0.19 × the base headline
would be 9px.

This was the same `clamp()` triple as the type until 2026-08-04 —
`px-[clamp(2rem,4.4vw,4rem)] py-[clamp(0.75rem,1.25vw,1.125rem)] text-[clamp(1rem,1.7vw,1.5rem)]`
— whose floors are what kept the pill inside a 375px phone; the base step above
is those floors rounded onto the scale.
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

### The second hero — `/wizard-intro`, and why its top step is `lg:`

`WizardIntro` is this section's other caller: a title card with one line of display
type and one CTA, centred the same way and over the same footage. Its type is
outside §2's scale for the same reason — 72px, `text-7xl` exactly — and on
2026-08-04 it took the same shape of ramp, three steps rather than four.

| Line                            | Design     | base        | `sm:` 640  | `lg:` 1024 |
| ------------------------------- | ---------- | ----------- | ---------- | ---------- |
| `EXPLORE NOVEL PROPHYLACTIC …`  | 72px / 700 | `text-4xl`  | `text-5xl` | `text-7xl` |
| `INPUT PATIENT CHARACTERISTICS` | 24px / 600 | `text-base` | `text-xl`  | `text-2xl` |

**The drawn size arrives at `lg` here and at `xl` on `/`, and that is a
measurement rather than an inconsistency.** The rule both pages follow is the
same one: the top step goes at the first breakpoint whose **content column** can
hold the drawn composition. `/`'s headline is ~1000px wide against a 752px column
at 1024, so it waits for `xl`. This card's longest drawn line measures 729px, so
it fits 1024's column with 23px in hand and does not have to.

`max-w-3xl` (768px) is what reproduces the drawn line breaks, and it survives the
early step because the column stands in for it: any cap between the 729px last
line and the ~830px "EXPLORE NOVEL PROPHYLACTIC" would break where the designer
did, and 752 is inside that window as well as 768. So the composition at 1024 is
the drawn one, not an approximation of it.

**The base step is set by a word, not by the composition.** Barlow Condensed
uppercase cannot break, so §2's `<h1>` table applies here at double the size:
"PROPHYLACTIC" is ~397px at 72px, ~265px at 48 and ~199px at 36, against a 311px
column at 375 and a 256px one at 320. `text-5xl` clears the phone but not the
320px case, which is what puts the base step one further down at `text-4xl`.

**The CTA closes the last of item 33's clamp-removal regressions.** Its label is 29
characters where `/`'s is 17, so the package's fixed `px-16 text-[26px]` computed a
513px pill inside a 311px column and wrapped 24px type into a 20px `leading-5` box —
overlapping caps, the same trap §14 records on the wizard's option pills. It takes
`Landing`'s inset steps (`px-8` / `px-12` / `px-16`, `py-3` / `py-3.5` / `py-4.5`)
and keeps the design's `leading-5` at `lg` alone, as the `/5` modifier, with `/tight`
under it. That is `Landing`'s own rule stated the other way round: the drawn 20px box
is what makes the pill 56px, and it is safe exactly where the label does not wrap.

Everything above is arithmetic — see open item 41.

---

## 9. Open items

| #   | Item                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Where                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| 1   | `PopupButton` fails the 3:1 non-text threshold in **every** state it specifies (2.17:1 default, 1.83:1 hover, 2.49:1 press/open, 2.66:1 open hover). This is **not** a mapping error — the mapping is exact. `lagoon-25` is a light step (lum .435) being used as a saturated ground under a white glyph; every other component in the library uses its scale's `-50` step for that job. The one-token fix, if the designer wants it, is `--color-ui-popup-bg: var(--color-brand-lagoon-50)` → 3.58:1.                                                                                                                                                                                                                                                                                                                                                                                                          | issue 03, RAISED 1    |
| 2   | Focus rings drawn without `outline-offset` (`NavBarButton`, `PopupButton` open skin) or with a positive offset (`NavArrowButton`, `PopupButton` closed skin) land on the page ground, so their contrast depends on a surface the component does not own. Currently resolved for the bar by §5; any new dark surface reopens it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | issues 00, 02, 03     |
| 3   | The palette has no step brighter than `crimson-50` and no saturated near-white; two literals stand in.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | §3, issue 01          |
| 4   | `--color-ui-navbar-bg-current` / `-fg-current` deliberately unset; current-page state is signalled with `disabled` instead.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | debt 2, issue 06      |
| 5   | `NavBarButton`'s tooltip colours are inferred — no export was ever supplied.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | issue 02              |
| 6   | No semantic layer yet. `bg-surface`, `text-heading`, etc. do not exist; the app reads raw brand steps in the meantime.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | app-buildout issue 02 |
| 7   | The inner gradient's second stop is off-scale (`rgba(114.61, 213.07, 191.53)`, dE .042 from `teal-25`) while the other three stops are exact palette. Probably meant to be `teal-25`; kept literal pending a designer answer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | §6                    |
| 8   | The landing footage does not loop — it is a continuous dolly-in, 46.5/255 apart end to end. Ping-ponging it is a workaround; **ask the designer for an 8–12 s clip that loops cleanly**. That would halve the asset and remove the direction reversal.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | §7, ADR 0002          |
| 9   | The references do not agree with the §2 scale **or with each other**: `disease-background` measures ~32px sub-headings, ~18px body and ~22px captions against the scale's 26/16/20, while `rebalancing-agents` measures ~24px body and ~25px captions. **The three chapters answered it differently until 2026-08-04**, when the §2 migration put all of them on `text-2xl` and removed the divergence — but only by making every reading round to the same step, not by resolving which reading is right. Still needs the designer's sizes.                                                                                                                                                                                                                                                                                                                                                                    | §11                   |
| 10  | The chapter is specified to fit one screen and currently does not (818px at 1440×800). Wants one rule across all four chapters rather than per-page constants. **The 818 is stale: re-measured 788px on 2026-08-05 (§11, §19), so it now fits 1440 × 800 — as item 32 recorded independently. It remains the tallest route, and §19's height gate is derived from it.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | §11                   |
| 11  | Four of the eight vertical gaps are ink-to-ink measurements off the reference PNG rather than the designer's box gaps, so they render slightly loose.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | §11                   |
| 12  | The pop-up export has **no scrim** — nothing dims the page behind a dialog that traps focus. The shipped `rgb(0 0 0 / .5)` is inferred, like §4.3's tooltip and §4.5's sidebar. The card's own 55%-black shadow was drawn against Figma's dark canvas and does much less work over the light `bg-page`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | §13                   |
| 13  | ~~The pop-up title is 45.47px, off the §2 scale, and ships as a raw value under §8's precedent.~~ **Closed 2026-08-04** — but not the way it was written. 45.47px is the _drawn_ size; what shipped was a clamp capped at 36px, and had been since day one. The code now matches the drawing, so the raw value is genuinely on screen and the question this row asked (is an off-scale title acceptable?) is answered by §8's precedent as it always was. Kept as a row so the numbering below it does not shift.                                                                                                                                                                                                                                                                                                                                                                                               | §13                   |
| 14  | `--color-agent-mab` (`#003d93`) is a sixth hue: it derives from no brand ramp, and the nearest steps are a different colour rather than a different step. Transcribed verbatim pending a designer answer on whether the agent classes are meant to be brand colours at all. Its pair, `--color-agent-sirna`, is `crimson-50` exactly.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | §11                   |
| 15  | The artboards disagree on the disclosure-caption colour: `#074655` on the first two, `lagoon-75` (`#076278`) on `rebalancing-agents` **and now `fviiia-mimetics`** — so it is 2 v 2 and the tie is no longer breakable by weight of evidence. All four chapters use `--color-popup-caption`, the first value, pending a designer answer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | §11                   |
| 16  | `rebalancing-agents` draws three figure boxes under a caption telling the reader to click them, but §7.7 names no target for any of the three and the export draws "PLACEHOLDER" in all of them. Needs the designer to say what a box opens.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | §11                   |
| 17  | The mechanisms prose card glosses only `AT`, but its own copy introduces `TFPI` and `APC` as well; the figure card behind it glosses only `TFPI`. Shipped with all three on the prose card (§11), which also normalises the export's "AT=" to the "TFPI = " spacing it uses one card later. The alternative reading is that the two cards are meant as one and the gloss is split deliberately — needs the designer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | §11                   |
| 18  | `NavArrowButton` and `Button` are not `forwardRef`, so `ref` does not typecheck on either (`PopupButton` is). That is what blocks focus management when the mechanisms card swaps steps — there is no handle to focus. Package change, tracked in `.scratch/mlg-reskin/`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | §11, mlg-reskin       |
| 19  | `--background-image-emerging-panel`'s mint (`#c6eee5`) is dE .0136 from `color-mix(teal-25 30%, teal-0)` — between the ~.002 every derived token clears and the .042 that made item 7 literal, so the file's own rule does not decide it. Shipped literal; ask the designer whether it is meant to be a teal step.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | §11                   |
| 20  | ~~`fviiia-mimetics` ships four `+` disclosures that open nothing.~~ **Closed.** All four cards (Pop ups 10–13) are built; the diagrams arrived as rasters rather than the SVG exports this item asked for, which is why three of them carry their heading in their own pixels. Kept as a row rather than deleted, so the numbering below it does not shift.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | §11                   |
| 21  | `--color-note-panel-border` (`#747474`) is a neutral grey off every ramp — a hue away rather than a step. Sampled exactly neutral on all three channels, so it is neither an antialiasing artefact nor black at an opacity. Transcribed verbatim pending a designer answer, as item 14 is.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | §15                   |
| 22  | The two `/wizard/therapies` exports disagree about inter-bullet spacing in the note panels — 12px in the Considerations one, 0 in the Strategies one. Shipped at 0 (six observations against one, and the only reading that fits the 8-bullet leaf on one screen), which renders the Considerations panel 141px against the drawn 152.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | §15                   |
| 23  | The `/wizard/therapies` bands and arch are drawn 1216px wide (x 112→1328), 48px wider than `max-w-content`. Same "the artboard forgot the sidebar rail" divergence `/wizard/scenario`'s box row has. Wants **one** designer ruling covering all of them rather than three. The later vector export of the header bands gives `w-[1217px]`, a third independent reading of the same 1216 and the reason this is a rail question rather than a rounding one. **`/explore` now makes it three pages and three answers**: its arch row is drawn on the identical 112→1328 band and ships at exactly that (`lg:-mr-rail`), where `/wizard/therapies` takes `-mr-16` and lands on 1344.                                                                                                                                                                                                                               | §15, §12, §17         |
| 24  | The seven drug-sheet exports agree on every gap except the one **above** a section label: 29–31px over the line on three sheets, 36–44 on three more, and 48 / 56 on Denecimig, which draws what reads as a blank line before two of its labels. Everything else is 26 ± 1 (bullet to bullet) and 33 ± 1 (label to its list) across all thirty-five sections, so this is the only loose value in the card. Shipped uniform at the median (`mt-3`). Same shape as item 22.                                                                                                                                                                                                                                                                                                                                                                                                                                       | §16                   |
| 25  | ~~The drug-sheet card's horizontal inset is `Popup`'s `px-16` (69px from the card's outer edge).~~ **Not closed, but re-framed 2026-08-04:** the inset is now `px-4 sm:px-8 lg:px-16`, so this question is about the `lg` step only and the phone case that made it urgent is gone. The 64-vs-49 split is still the designer's to settle. **Two of the seven exports draw exactly that; the other five draw 49.** Not split, because the padding belongs to a card shared with the §7.5 chapters. Wants a designer answer with items 9 and 13 rather than alone.                                                                                                                                                                                                                                                                                                                                                | §16, §13              |
| 26  | `/explore`'s class labels fit a letter-spacing of **0.036em** across all four strings — between `tracking-wide` (0.025em) and `tracking-wider` (0.05em), and on no step at all. Shipped `tracking-wide`, which renders the longest label 353 → 344px. One tracking rule across every display heading in the app beat an exact bespoke value on a centred label that shifts no layout, but it is the designer's to confirm. Same shape as item 9 — a size/spacing question the file answers off the scale.                                                                                                                                                                                                                                                                                                                                                                                                       | §17                   |
| 27  | ~~`Popup` is too narrow for the §5 comparison table's nine columns.~~ **Half closed.** `Popup` now has a three-step `width` scale and the table's card takes `wide` (1360px), so the columns get ~136px instead of ~113 and the card is no longer the binding constraint. What remains is not a card question: 1360px is not a phone, so the grid still wants a horizontal scroll region inside the card, which is issue 09's own acceptance criterion and is decided against a body that exists. **1360 is a picked number, not a drawn one** — no artboard shows this card, so if the designer draws the table the width is theirs to overrule. **Its scroll-region half now has a second instance:** `disease-background`'s `SeverityTable` takes the same answer for the same reason (§11), which makes "a table scrolls sideways inside the card rather than reflowing" a precedent rather than a one-off. |

The responsive pass added three more, all in **open item 46**: the middle segment's white
fill now reads as a state rather than a peak once the three are stacked; the class labels
equal the `<h1>` at 320 and 375; and the arc clearance at 320 is down to 9.4px, which is
what a longer class label would spend. It also **closed item 33** — this CTA was the last of
that item's five cases. | §13, §17, ADR 0007 |
| 28 | ~~The pop-up title caps at 36px against the drawn 45.47, and the band's padding is `py-5` against the drawn 12.~~ **Closed 2026-08-04, in code.** Both shipped wrong from the component's first commit and neither was visible, because they cancelled: 20 + (2 × 37) + 20 = 114px of band against the drawn 118. Corrected to the drawn values in both cases; three titles gain a line, none reaches three, the two-line band lands at 117, and `PopupFigure`'s `reserve` — documented against a 117px band it was not getting — becomes correct. The band also gained a `min-h-[65px]` floor, which is the ✕'s own height rather than a design value. Verified on twenty cards at 1440 and 390. | §13 |
| 29 | **Two of the three `Popup` widths moved on 2026-08-04 and neither new number is drawn**: `narrow` 869 → 860 and `default` 1024 → **1140**. The consequence is the one the default was documented as protecting — `hemostatic_mechanisms_diagram.webp` is stored at 1772px for a drawn 886, which was exactly the old body, and the body is now 1002. The asset did not move with it, so the §7.6 figure is painted ~13% past its stored width. Either re-export it at 2004px or return the default to 1024; the widths are the designer's, and the raster follows them. | §13, §7.6 |
| 30 | **The §2 migration of 2026-08-04 is verified at 1440 and 375 only.** A Chromium pass over all ten routes at both widths confirmed: no horizontal overflow anywhere, `<h1>` computing 48px/48/700 at 1440 and 30px/36/700 at 375, and `CHARACTERISTICS` clearing the 375 column. **1024 and 768 were not checked**, and 1024 is where the gutter steps 48 → 112 and the prose column is thinnest (§12) — the width most likely to break and the one still unmeasured. §2's `<h1>` overflow table also remains arithmetic (rescaled ×48/52); the pass proves the conclusion, not the individual pixel figures. **Still true after the 2026-08-04 responsive pass on `disease-background`, which is entirely about those widths** — the `xl` split, the `md` disclosure row and the ~480px table floor are all arithmetic off `AppShell`'s tokens and `Popup`'s width scale, verified only in the built CSS. 1024 and 768 remain the app's two unmeasured widths, and are now the two carrying the most untested reasoning. **Half closed 2026-08-05 on one route.** `/wizard/therapies` responsive pass was measured in Chromium at **320, 375, 640, 768, 1024, 1280 and 1440** — all sixteen leaves in both accordion states, 112 renders — with no horizontal overflow at any of them (§15). That is the first data this app has at 640, 768, 1024 and 1280, and 1024 behaved: the gutter step is visible in the numbers (the section reads 816 there against 1072 at 1280) and nothing broke on it. It is one route out of ten, so the item stays open — but "1024 is the width most likely to break" now has one counter-example rather than none. **Two routes out of ten as of 2026-08-05**: `/explore` was measured at the same seven widths (§17), 1024 behaved there too, and 1280 was confirmed to divide the band in the drawn 339:524:353 ratio exactly. **What the second sweep changes is where this row says to look.** 1024 and 768 have now behaved twice; **320 is where the app's one measured horizontal overflow was actually found**, and only because this sweep included a width the first `/explore` pass had not. Eight routes remain unmeasured and none of them has ever been rendered at 320. | §2, §12, §15 |
| 31 | **`/explore`'s `<h1>` lost 6px to the scale** — drawn 42, fitted by least squares with residuals ≤1.1px, now `text-4xl` at 36. The largest fidelity loss in the migration, and it re-flowed: **the heading now sets in three lines where the artboard draws four.** It reads well and is arguably tighter, but it is no longer the drawn composition. If that matters, restore `text-[42px]` under §8's precedent rather than moving to `text-5xl` — 48 is further from 42 than 36 is. **Unchanged by the responsive pass of 2026-08-05 and confirmed in a browser by it**: the heading measures 36px in three lines at both 1280 and 1440. What the pass added is a ramp _below_ `lg` (24 / 30 / 36, §17), which leaves the drawn width's fidelity question exactly where this row left it. | §14 |
| 32 | **Every chapter now fits 1440 × 800 with no scroll**, measured in the item-30 pass — `document.scrollHeight` is exactly 800 on all five. Item 10 recorded `prophylaxis-guidance` at 818px and open; the tighter body leading §2 brought (25.6px line box → 24px) is the likely cause, but the before-state was not measured in the same pass, so this is an observation rather than a closure. Confirm, then close item 10. | §11 |
| 33 | **Every `clamp()` in the app was replaced by its own maximum on 2026-08-04, and the last two arbitrary font sizes were rounded onto the scale with it (45.47 → `text-5xl` 48, 26 → `text-2xl` 24) — the app now has no arbitrary font size anywhere, and the small-screen layouts regressed as a result.** Measured at 375 × 800: `/` sets its 128px headline in four lines, fills the viewport, pushes the CTA under the sidebar's bottom bar and scrolls (853px against 800); `/explore` and `/wizard-intro`'s CTAs are both now 24px type in a 20px `leading-5` box, wrapping to four lines with descenders into the caps below — the exact bug the clamps were added to fix, and one that had shipped once before; `Popup`'s band spends 200px of a 345px card on padding. Nothing overflows horizontally and 1440 is untouched, so this is a below-`lg` regression only. The fixes are per-case, not a blanket revert: `leading-tight` on the two CTAs, and a floor of some kind on the hero. **Hero closed 2026-08-04** by the four-step ratio-holding ramp in §8 — not a clamp, so the no-arbitrary-size invariant holds. ~~Three cases remain: `/explore`'s CTA, `/wizard-intro`'s CTA, and `Popup`'s band.~~ **`Popup`'s band closed 2026-08-04** — `px-22 lg:px-25` restored the 88px floor as a breakpoint step, and the title ramps `text-2xl sm:text-3xl lg:text-5xl` with it (§13). The inset moved again the same day to `px-16.5 sm:px-19.5 lg:px-25` when the ✕ itself started ramping, which is what the floor is derived from; the band now spends 132px of the 345px card rather than 200. ~~Two remain: `/explore`'s CTA and `/wizard-intro`'s CTA.~~ **`/wizard-intro`'s CTA closed 2026-08-04** — `px-8 sm:px-12 lg:px-16` around `text-base/tight sm:text-xl/tight lg:text-2xl/5`, i.e. the design's 20px line box kept at `lg` alone and `leading-tight` under it, which is the fix this item proposed; its `<h1>` took a three-step ramp in the same pass and the page's `clamp()` history is now fully answered (§8). ~~One remains: `/explore`'s CTA.~~ **Closed 2026-08-05, and this item with it.** `/explore`'s responsive pass took `/wizard-intro`'s fix verbatim — `px-8 py-3 text-base/tight sm:px-12 sm:py-3.5 sm:text-xl/tight lg:px-16 lg:py-4.5 lg:text-2xl/5` — and it is **the first of the five cases to be verified in a browser rather than reasoned about**: measured at seven widths, the label sets one line from 640 up and two at 320/375, and the drawn pill is 525.5 × 56 from `lg` (§17). All five are now answered. Neither the hero's fix nor `/wizard-intro`'s was verified in a browser at the user's instruction, so the ~1000px headline width the `xl:` step rests on is inherited from the pre-2026-08-04 measurement rather than re-measured, and item 41 records the same for `/wizard-intro`. | §8, §13, §14 |
| 34 | **`--spacing-bar` (80px) overshoots the sidebar bottom bar it clears by 15px.** The bar mlg-components renders is `h-12` buttons in `py-2` with a 1px `border-t` = 65px, so every page below `lg` reserves 15px of clearance that nothing occupies — a strip of page gradient between the content and the nav. `ArchBand` patches it locally with `-mb-4` (§11), which is the only place it was visible enough to notice. The token should either be 65 or be derived from the package the way `--spacing-rule` is derived from `TopRule`; 80 is a round number nobody has tied to a measurement. Read off the package's compiled classes, not measured in a browser. | §11, §12 |
| 35 | **The ✕ ramp is arithmetic, not a measurement.** `size-11 sm:size-14 lg:size-16.25` and the band inset and floor derived from it (§13) were checked in the compiled CSS and in `Popup.test.tsx`, and nothing at or above `lg` moved — but no card was opened in a browser below `lg`, so the 44px button, the 66px inset and the ~49px one-line band at 375 are predicted rather than seen. §13's browser table is explicitly stale in its band column below `lg` for the same reason. **The card's height floor was removed the same day** (`min-h-[min(520px,95dvh)]` deleted, §13), which is unverified in a browser at _every_ width, not just below `lg` — and it leaves the body region as `flex-1 min-h-0`, i.e. `flex-basis:0%` with the automatic minimum removed, in a now-auto-height column flex container. That resolves to the content's max-content height by spec and in practice, but it is the exact pair that collapses when a container's height _is_ definite, so one short card is worth opening. Rolls up into item 30, which already names 1024 and 768 as the app's unmeasured widths. | §13 |
| 36 | **`/education/treatment-landscape`'s responsive pass of 2026-08-04 is arithmetic end to end**, at the user's instruction — verified in the compiled CSS (every new utility present, `min-w-165` resolving to 660px) and in Vitest (29 tests, two of them new and pinning the grid's three steps and the table's scroll wrapper), but jsdom computes no layout, so nothing about pixels can fail. **The weakest number is `min-w-165`**: 660 = 5 × 132, where 132 is "Administration" at 16px plus `px-2`, estimated from character counts rather than measured. Too wide and the card scrolls further than it needs to; too narrow and the words still break at 375. The `sm` two-up, the 320px caption cell it rests on and the 752px single column at 1024 are unmeasured for the same reason. Rolls up into item 30 — and this pass makes **1024 the width carrying the most untested reasoning in the app**, since it is where the grid now stops applying. | §11, §12 |
| 37 | **Table 1's footnote list is `leading-none` and already wraps at the drawn width.** Footnote (a) is ~150 characters, roughly 1100px at 14px against a 1002px card body, so it sets two touching lines at 1440 — `leading-none` is only defensible for a line that never wraps. §11 records it as the designer's own inspector value, so it is a transcription question rather than a responsive one and the 2026-08-04 pass deliberately left it alone rather than change the drawn composition at the drawn width. At 375 it is about nine solid lines. Wants the designer's answer with items 9, 13 and 25. | §11 |
| 38 | **A `PopupFigure` is capped at `min(<drawn width>, 100%)`, so every §7 diagram in the app is illegible on a phone.** At 375 the card body is 303px, which paints `rebalancing-agents`' fourteen-label coagulation cascade at 303 × 147 — a third of drawn size — and does the same to `disease-background`'s diagnostic and bleeding diagrams and all four of `fviiia-mimetics`'. The tables answered the same problem with `overflow-x-auto` plus a `min-w-*` floor (items 27, 36), and that answer transfers: it is one change in `PopupFigure` and it would have to be taken for all seven figures at once or not at all. Each figure's `alt` is the route to its content meanwhile, which is why they run as long as they do. Raised rather than taken during the 2026-08-04 chapter passes, which were scoped one chapter at a time. | §11, §13 |
| 39 | **`/education/rebalancing-agents`' responsive pass of 2026-08-04 is arithmetic end to end**, like item 36's — verified in the compiled CSS (every new and changed utility present, `gap-x-10` and `gap-x-35.25` resolving to 40px and 141px) and in Vitest (28 tests, three of them new and pinning the row's gap ramp, the boxes' drawn size, the whole type ramp and the CTA's inset), but jsdom computes no layout so nothing about pixels can fail. **The weakest number is the 752-exact fill at 1024** — 3 × 224 + 2 × 40 leaves the row no slack at all, so anything that moves the gutter, the border width or `--spacing` puts the boxes back into shrinking, silently and by a pixel at a time. It is also the width already carrying the most untested reasoning in the app (items 30, 36), which makes it the one to confirm first. The 640px of stacked placeholder below `lg` is a deliberate cost rather than an unverified number (§11), but how it reads on a phone is a judgement no test makes. **The CTA's ~241px at 375 rests on an estimated ink width** — 230px for "VIEW MECHANISM" at 26px, back-derived from the ~358px the package computes, then scaled linearly to 20px. It has 62px of card body in hand, and the failure mode is a wrapped label rather than an overflow, but it is an estimate. A preview server was started for this pass and the user declined it, so nothing was opened in a browser — the same call as item 36. | §11, §12 |
| 40 | **`docs/styling.md` is inside Tailwind v4's default source scan, so every class name this file writes in prose is compiled into the bundle.** v4 auto-detects sources from the project root and does not exclude Markdown; `src/styles/tokens.css` adds one `@source` for the package's `dist` and overrides nothing. Confirmed by `px-22`, which has zero occurrences under `src/` — it is the superseded value item 33 records — and ships as a real rule. So do the historical `text-[26px]`, `min-w-105` and `rounded-t-[150px]` mentions, and the count grows every time this file explains a class it is retiring. Harmless to correctness and small against a 72kB sheet, but it means the CSS is not a record of what the app uses, which is exactly what the 2026-08-04 passes were reading it as. Fixed by an explicit `@source` narrowing the scan to `src/`, or by `@source not "docs/"`; either is a one-line change, and it wants a rebuild diff rather than a blind edit. | §1, §9 |
| 41 | **`/wizard-intro` and `/education/prophylaxis-guidance`'s responsive passes of 2026-08-04 are arithmetic end to end**, like items 36 and 39 — verified in the compiled CSS (every new utility present, `text-2xl/5` resolving to a 20px line box and the three `/[1.05]` steps to `line-height:1.05`) and in Vitest (16 tests across the two pages, three of them new), but jsdom computes no layout so nothing about pixels can fail. **The weakest numbers are the two ink widths the `/wizard-intro` ramp is derived from.** "PROPHYLACTIC" at ~397px/72px comes from §8's own drawn line measurements (729px and ~830px) divided into letters at ~0.46em, and the CTA label's ~385px at 24px is back-derived from the 545px the package computes at 26 — so the 320px column clearing `text-4xl` by 57px is safe, while the base CTA step landing 321px in a 311px column is inside the error bar in both directions. That one is deliberately built to survive either outcome (`/tight` makes a wrapped label legible), but which outcome ships is unknown. The 1024 case rests on 729 < 752 with 23px of margin, i.e. on a measurement taken off the export rather than a render — and 1024 is already the app's least-tested width (items 30, 36, 39). `prophylaxis-guidance` carries less: one class, no layout change, and its one-screen claim at 375 × 667 (~460px of ink in a 557px box) is the only estimate in it. Nothing was opened in a browser for either page, at the user's standing instruction. | §8, §11 |
| 42 | **`/wizard`'s responsive pass of 2026-08-04 is arithmetic end to end**, like items 36, 39 and 41 — verified in the compiled CSS (every new utility present, `max-w-110` resolving to 440px and `max-lg:text-lg` to a `width < 64rem` rule that wins over the package's `text-[26px]`) and in Vitest (31 tests across the page and its component, five of them new), but jsdom computes no layout. **Every number in the ramp descends from two rendered measurements §14 already carried**: "Reduce monitoring requirement" at 369px and "Hemophilia A" at 153px, both at 24px, which agree on ~0.53em a character. The binding case is `lg` — ~308px of label inside a 318px pill, i.e. **10px of margin**, against the ~4px export/render discrepancy §14 records — so it is the one step that would flip if the font rounded differently than measured, and 1024 is already the app's least-tested width (items 30, 36, 39, 41). The base step has more room (246 in 263 at 375) and 320 is _known_ to wrap and is built for it. The legend windows (368–506px at 20px) are scaled from a **drawn** 589/809 rather than from a render, so "440 reproduces the designer's break below `lg`" is the softest claim here; it costs a line break rather than an overflow if it is wrong. Nothing was opened in a browser, at the user's standing instruction. | §14 |
| 43 | **`/wizard/scenario`'s responsive pass of 2026-08-04 is arithmetic end to end**, like items 36, 39, 41 and 42 — verified in the compiled CSS and in Vitest (33 tests, eight of them new across the four branches), but jsdom computes no layout. **This screen has never been opened in a browser at any width**, which makes it weaker than its four predecessors rather than equal to them: their `lg` reasoning was untested, this page's 1440 case is too. The box row is the firmest thing in it — 227 and 185 are read off the exports, and 3 × 227 + 2 × 32 = 745 in 752 is arithmetic on `AppShell`'s own tokens with 7px of slack against item 39's zero. **The soft claim is the type ramp's premise.** "Nothing overflows at either size" rests on character-count estimates at §14's ~0.53em rather than on a render, and the uppercase bold caption is the one string estimated at a width its font was never measured at (~0.62em); it fails as a wrap rather than as an overflow either way. The 619px stacked block below `lg` is a deliberate cost rather than an unverified number (§18), but how it reads on a phone is a judgement no test makes. Nothing was opened in a browser, at the user's standing instruction. | §18 |
| 44 | **`/education/fviiia-mimetics`'s responsive pass of 2026-08-05 is arithmetic end to end**, like items 36, 39, 41, 42 and 43 — verified in the compiled CSS and in Vitest (51 tests, six of them new), but jsdom computes no layout. **It rests on firmer ground than its five predecessors and reaches a worse conclusion, which is the thing to check first if this chapter is ever opened in a browser.** The row's 1122px is a sum of four transcribed or package-owned numbers — the drawn 78px indent, the drawn 288px caption, `gap-4`, and `PopupButton`'s `size-16.25 shrink-0` read out of the package's `dist` — so it rests on no character-width estimate at all, and the claim that the drawn row never fitted below a 1394px viewport is as strong as anything in this file that was not rendered. What follows from it is not: **that this chapter has been overflowing its content column at every width from 1024 to ~1394 since it shipped**, by ~285px at 1024, and that no test, no review and no screenshot caught it. If a render disagrees, the first two suspects are `PopupButton`'s rendered box (the package sets `size-16.25`, but its ring and shadow are drawn outside it) and whether the caption's own shrink was absorbing the overflow quietly rather than pushing the panel past the column. The card table's 241px is the same kind of number one layer down — `96vw` and a fixed `xl:w-145` against `Popup`'s padding — and it depends on the §13 correction this pass made rather than on anything measured. The two invented values (the pairs centring below `xl`, and the 60px radius holding to 1024 on a now-full-width panel) are judgements no arithmetic settles. Nothing was opened in a browser, at the user's standing instruction. | §11, §13 |
| 45 | **`/wizard/therapies` responsive pass of 2026-08-05 is the first in the series that is NOT arithmetic** — items 36, 39, 41, 42, 43 and 44 all end "jsdom computes no layout", and this one was measured in Chromium across all sixteen leaves, both accordion states and seven widths (112 renders, §15). Nothing in it is predicted. What stays open is what the measurements turned up rather than what they failed to check. **First, 320 remains the worst measure in the app at ~190px** — roughly where 375 sat before the pass, and still ~23 characters a line of clinical prose. The only lever left there is `mx-3` or `BulletList` `pl-6`, both of which this pass argues should not move. **Second, the agent captions render 20px bold against a 16px body at 375**, which is the visible cost of the deliberate non-step and is a designer question rather than a bug: no artboard exists below 1440 to say whether a fixed 160px box should keep its caption size when the prose around it shrinks. **Third, the five-agent row shrinks its items to 144px at 1280** — the only width at which they are not the drawn 160, previously unrecorded — which is `xl:flex-nowrap` meeting 1120px of content in a 1040px band. Nothing clips, because the absence of `min-w-0` floors each item at its own caption, but it is the drawn item giving way at exactly one width and the designer drew no five-agent leaf to check it against. **Fourth, and from the same day: the below-`sm` gutter narrowed 32 -> 24px within hours of this pass**, so §15's 320 and 375 rows are carried forward at +16px rather than re-rendered — the gutter change was checked visually rather than instrumented, at the user's call, and the derived figures wear a tilde there to say so. Everything from 640 up is untouched by it and stays measured. What is genuinely unknown is the header-band height at 320: it was 112px, four lines, with ~32px less to set in, so it very likely reads three now and nothing has confirmed it. | §15, §2, §12 |
| 46 | **`/explore`'s responsive pass of 2026-08-05 is the second measured one** (§17), so what stays open is what the render turned up rather than what it failed to check. **First, the fills now carry a reading nobody drew**: `bg-white/60` on the middle segment against `crimson-50/5` on the flanks makes the row read as a range with a peak side by side, and stacked as three separate cards it reads as one card being _different_ — selected, or current. Both values are drawn and one is solved exactly, so the pass kept them rather than invent a below-`xl` fill, but it is a designer question and it is new. **Second, the class labels equal the `<h1>` at 320 and 375** (both 24px), the deliberate consequence of ramping a heading three steps past a fixed box that does not step — the same shape as item 45's 20px-caption-over-16px-body, and answerable only by a designer who draws a phone. **Third, the arc clearance at 320 is 9.4px** on the middle segment's label: positive, but it is what a longer class label would spend, and `EXPLORE_SEGMENTS` is authored content that could gain one. **Fourth, the `<h1>` renders ten lines at 320 where the arithmetic predicted eight** — narrow-column line-breaking wastes ~20% of the column on short trailing words, which no estimate in this file models. Every other predicted figure in the pass landed, including the CTA wrapping at 375 by 1px. | §17, §2, §9 |
| 47 | **Figure assets are budgeted for 1.00×, and §19 draws some of them at 1.25×.** §13's rule is that a figure is stored at 2× its drawn width _and no wider_, so at the 1.25× step a figure at full drawn width wants 2.5× and the file has 2×. On DPR 1 this is invisible (a 720-drawn figure renders at 900 CSS px against 1440 stored — still 1.6× oversampled); on a DPR-2 panel it is ~0.8× and mildly soft. **This item said the opposite until 2026-08-05.** It described the symptom as softening, when `PopupFigure`'s `px` cap was in fact _preventing_ softening and paying for it in size: measured at 2560 × 1330, `disease-background`'s two figures held 720px inside a 1413px body, 15% and 19% under the drawing's own proportion. The cap is now `rem` (`min(45rem, 100%)`), so size is correct everywhere and the 2× guarantee is given up on retina large screens — size was judged the more visible half, since an undersized figure is wrong on _every_ large screen and a soft one only on retina ones. What remains open is whether to re-export: `clotting-cascade-thumb.webp` is the tightest at exactly 940 for a 470 figure, while `denecimig` (3852), `inno8` (5224) and `hemostatic_mechanisms` (1772) have ample headroom. Re-export the tight ones at 3× if a 5K screen shows it; do not re-export the set. | §13, §19 |
| 48 | **`--shadow-popup` is not scaled, and it is the one shadow big enough for that to read.** Its 50.142px blur stays 50px on a card that is 1.25× larger, i.e. ~20% tight against the drawing. Left alone deliberately (§19): converting it means editing a value §13 documents as straight-from-export, and it is a one-line change if a 2560 render indicts it. Not yet examined at that size. | §13, §19 |
| 49 | ~~**§19 scaled the pop-up's 5px border but not the app's other visible borders.**~~ **Closed 2026-08-05, and the item under-counted itself while it was open** — it named `ArchBand`'s `border-t-4` and `Scenario`'s `border-4`, but `border-4` had **three** source sites, the other two being `rebalancing-agents`' and `treatment-landscape`' artwork placeholder boxes. All four are now `border-[0.25rem]` / `border-t-[0.25rem]`, which is the same 4px at a 16px root and scales above the canvas with the objects they edge. Verified in Chromium: 4px at 1440, 5px at 2560, and the nine canvas screenshots stay byte-identical. The reason they were missed twice is that they are Tailwind scale utilities rather than arbitrary values, so neither grep that built the §19 conversion list could see them. | §19 |

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

A two-column grid at `xl+` — `1fr` + a fixed **470px** figure with the designer's
**32px** gutter, which lands the prose at 112–775 and the card at 807–1277 on the
1440 canvas.

**`xl`, not `lg`, since 2026-08-04.** It was `lg` and that was the cliff §12
records: the gutter steps 48 → 112 at 1024 in the same pixel that turns the fixed
470px track on, so the prose column landed at 752 − 32 − 470 = **250px** and did
not recover until 1280. The split now waits for the column that can hold it.

| Viewport | Content column | Prose column     |
| -------- | -------------: | ---------------- |
| 1024     |            752 | 752 — one column |
| 1280     |           1008 | 506              |
| 1440     |           1168 | 666 (drawn 663)  |

Between 1024 and 1279 the chapter is a single 752px column, which is **wider than
the prose ever got from the two-column layout at that width** — the stack is the
better composition there, not a fallback. This is the same argument §8 makes for
the landing hero arriving at `xl`, and it was settled the same way: by measuring
the column rather than by preferring a breakpoint.

Only the diagnosis **bullet** spans both columns. Its heading sits in the left
column _beside_ the figure, which is where the reference has it: the card runs to
y=392 and the heading's ink to y=403. Getting this wrong (spanning the whole
diagnosis block) opens a 97px hole where the design has 16px.

Below `xl` the grid collapses to one column and DOM order carries the stack:
mechanism → figure → diagnosis → disclosures. The figure takes `mx-auto` there —
its 480px cap is narrower than the stacked column at every width the stack exists
at, so left-flush would hang 272px of dead space beside it at 1024 — and
`xl:mx-0` inside its own track, where the track is the box and centring would
break the drawn 807–1277 alignment.

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

**None of the eight ramp.** They are 1440 values applied at every width, which is
deliberate: open items 10 and 32 want one one-screen rule across all five
chapters, and scaling this page's gaps alone would pre-empt it with per-page
constants — the exact failure the first attempt at that rule already produced.

### The responsive pass of 2026-08-04

Everything else on the chapter got a rule that day. The type steps down one size
below `lg`, which is §2's `<h1>` rule applied one level in: a sub-heading does not
_overflow_ the way a display `<h1>` does, so this is comfort rather than
correctness — at 30px in a 311px phone column the hierarchy collapses onto the
body size, and one step restores it.

| Element                        | <`lg` | `lg`+ |
| ------------------------------ | ----: | ----: |
| `<h1>` (unchanged, §2)         |    30 |    48 |
| `<h2>` sub-headings            |    24 |    30 |
| `ArchBand` title               |    24 |    30 |
| disclosure caption             |    20 |    24 |
| `SeverityTable` cells          |    16 |    24 |
| `SeverityTable` manifestations |    14 |    20 |
| `BulletList` body              |    16 |    16 |

Body copy is the one thing that does not move. 16px is already a legibility
floor, and open item 9 records the reference as **~18px** — larger than shipped,
so there is nowhere down to go.

Two invented values, stated as such per §12's rule about what is deliberately not
a token — no artboard exists below 1440, so neither is transcribed from anything:

- **`DisclosureBand`'s row is three-up from `md`, not `lg`.** The band is the
  tallest thing on the page once it stacks, and `lg` left a 768px tablet showing
  one 272px caption per screenful. At 768 the content column is 768 − 96 = 672,
  i.e. 224px a disclosure, which holds the button and a 20px caption with room
  over. Below `md` it stacks, which is right for a phone.
- **`ArchBand`'s radius halves to 150px below `xl`.** This replaces a browser
  default rather than adding a rule: two 300px corners want 600px of top edge and
  a 375px phone gives the band 311, so CSS's own overlapping-curve reduction was
  already drawing ~155px corners. Nothing clipped — but the shape was an artefact
  of the viewport, changing continuously as the window moved. 150 fits inside
  311px outright, so the arch is one drawing at every width below the breakpoint.

### The arch title is inset to clear its own corners

`overflow-hidden` is what clips the footage to the arch, and it clips the heading
with it. At the title's depth the corner curve has already taken a fixed bite out
of each side, and nothing in the component was stopping a long title running into
it — the `<h2>` is a block filling the band. Inner radius is the class value less
`border-t-4`, and the inset at depth `y` is

```
inset(y) = r − √(r² − (r−y)²)
```

The heading starts at `mt-9`, so `y = 36`:

| Radius                 | inner `r` | inset at y=36 | shipped    |
| ---------------------- | --------: | ------------: | ---------- |
| `rounded-t-[150px]`    |       146 |        50.0px | `px-13`    |
| `xl:rounded-t-[300px]` |       296 |       154.5px | `xl:px-39` |

Both rounded up to the next scale step, and both ramp at the breakpoint the
**radius** ramps at, because they are derived from it — moving one without the
other reopens the clip.

Only the first line is ever at risk: by `y = 68` the inset is 22.6px. So the lower
lines have room to spare and simply centre inside the same measure, which is why
this is a cap and not a wrap rule — once the measure is right the text wraps on
its own.

**It is a wrapper element, not padding on the `<h2>`.** Preflight sets
`box-sizing: border-box`, so on the heading itself the inset would eat a caller's
`max-w-*` — and `/wizard/therapies` passes `max-w-215` precisely to place a drawn
line break. On a wrapper that cap still measures text. It costs that caller 4px
(1168 − 312 = 856 against its 860), which stays inside the ≥809/<895 window §15
records as reproducing the break. `mt-9` keeps its measured position too: the arch
is `overflow-hidden`, which establishes a block formatting context, so the
heading's top margin cannot collapse out through the new div.

This was a live clip, not a hypothetical. At `lg` the band is 752px and the safe
measure 652 — which is exactly where `/wizard/therapies`' title lands once its
860px cap stops binding.

**Unlike everything else in this subsection, it was verified in a browser**
(2026-08-04, by the author of the change rather than by a Playwright pass). The
two inset values are still arithmetic.

### The arch bleeds out of the shell's padding, twice

`ArchBand` also carries `-mx-6 sm:mx-0` and `-mb-4 lg:mb-0`. Both cancel padding
that `AppShell` applies to every page, and they do it for different reasons.

**`-mx-6` is full bleed on a phone, and it is a look.** It cancels `<main>`'s
`px-6` exactly — 24px each side, the invented comfort gutter §12 records as
belonging to nobody — so below `sm` the band runs edge to edge instead of sitting
in a 327px column. It buys the arch room: at 375px the band goes 327 → 375, which
is 48px more for the title and the disclosure captions, and the curve reads as
part of the page rather than as a rounded box floating in it.

**The pair was 32px until 2026-08-05**, and the two numbers must move together —
a bleed that does not cancel the gutter exactly leaves the band either inset or
hanging over the viewport edge. `EmergingPanel`'s `-mr-6` is the third member
(§11's `fviiia-mimetics`), for the same reason on one side only. `sm:mx-0` stops it
there; from 640 up the gutter is wide enough that the inset looks deliberate.

It is an aesthetic call, stated as one. It is also a **coupling**: the −24 is
`px-6` written a second time, so re-pointing the shell's phone gutter silently
leaves a strip of page down each side of the arch. `-mx-6` and `AppShell`'s
`px-6` have to move together — which is exactly what the 2026-08-05 change had
to do, in three files rather than one.

**`-mb-4` closes a real 15px gap, and the gap is a token being wrong.** The shell
reserves `pb-bar` = `--spacing-bar` = **80px** below `lg` to clear the sidebar's
bottom bar. The bar mlg-components actually renders is `h-12` buttons inside
`py-2` with a 1px `border-t`:

```
48 + 8 + 8 + 1 = 65px
```

So the clearance overshoots the thing it clears by **15px**, and the arch — which
`grow`s to the bottom of `<main>`'s content box — stopped 15px short of the nav
with page gradient showing between them. `-mb-4` is 16px: the discrepancy rounded
up to the next scale step, landing the band 1px behind the bar's top edge so no
seam can open. `lg:mb-0` because at `lg` there is no bar and `pb` is already 0.

**`pb-4 lg:pb-0` is the other half of that pair and is not optional.** The
negative margin moves the band's _box_ 16px lower without moving anything inside
it, so the arch's last row — `DisclosureBand`'s three disclosures,
`/wizard/therapies`' agents — gains 16px of travel toward the bar and can end up
under it. The padding gives that clearance back inside the band, where the
gradient still paints. The two values are the same 16 and step at the same `lg`
for the same reason; changing one alone either reopens the seam or puts content
behind the nav.

**The 65px is read off the package's compiled class strings, not measured in a
browser**, and the 15px overshoot is a fact about `--spacing-bar` rather than
about this component — every page below `lg` has the same dead strip, and only
this one patches it. See open item 34.

### `SeverityTable` scrolls rather than reflows

The severity pop-up is the one element on the chapter that cannot simply reflow.
Three `table-fixed` columns divide whatever they are given, and the manifestation
cells carry unbreakable words — `intracranial`, `hemorrhages` — so below a floor
the text breaks mid-word instead of wrapping.

At 375px the card is `min(1140px, 92vw)` = 345px and its body 303px after the
border and the ramped padding (§13), which is 101px a column and ~61px of text
once `px-2` and `pl-6` come off. The type step above drops the floor to ~140px a
column; `min-w-105` (420px) inside an `overflow-x-auto` wrapper holds it when the
card is narrower still. The table fits outright from ~480px up, and below that the
card scrolls sideways rather than shredding the words.

This is the same call open item 27 already took for the §5 comparison table, and
it is what keeps the `<table>` intact. The alternative — restacking into three
blocks on a phone — flattens the column association for assistive tech at exactly
the width where it matters most, which is the thing the element was chosen for.

The wrapper is a plain `div`, because `overflow-x-auto` on a `<table>` does
nothing: a table box is not a scroll container.

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

**The 818px above is stale, and the item is closer to closed than it reads.**
Re-measured in Chromium on 2026-08-05 with `main`'s `min-h-dvh` neutralised, the
page is **788px** — the 2026-08-04 pass that moved its split to `xl` took 30px out
and nobody came back to this paragraph. At 1440 × 800 it fits, which open item 32
already recorded from the other direction. It is still the tallest route in the
app, which is why §19's height gate is derived from it.

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
1168 − 24 − 200 − 24 − 300  =  620px prose
```

which puts the figure box at x=768 (the artboard draws 762) and the caption's right
edge on the content column's own at x=1280 — landing its left edge on 980, close to
where the artboard's caption ink starts. The `+` centres at 1130 against a measured 1135. (This block read `202` and `286` and summed to 632 until 2026-08-04; the shipped
classes have been `200px 300px` since the first pass, so the arithmetic was describing
tracks the file never had. The conclusions are unaffected — the right edge still lands
on 1280, which is the load-bearing one.)

The 24px column gap is a tightening of the artboard's 32, applied after the first
pass; the figure box moves 6px right of where the export draws it and everything else
still lands. The caption track is what is load-bearing here, not the prose width —
300px is what puts the column's right edge where the design has it.

**All three tracks are `xl:` only, not `lg:`, since 2026-08-04** — see the responsive
pass below, which is also where the two-track step between `sm` and `xl` is recorded.

`items-center` from `xl`: whichever of prose / figure / caption is tallest sets the
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
`h1 → "Disease mechanism…"`), `xl:gap-y-5` between rows, and `mt-4` from each `+` to its
caption (matching `DisclosureBand`). The row gap measures 25 and 28 ink-to-ink on the
export and ships at 20 — tightened, like the column gap, once the rows were centred
and the ragged edge the looser value was absorbing went away. Below `xl` it is 40; see
the responsive pass.

**It fits one screen.** 800px exactly at 1440×800, verified in Chromium — so the §11
open item below happens to be satisfied here. That is a property of this chapter's
content, not a rule, and it does not close the item: the rule still wants writing once
all four chapters exist.

**The 1024px cliff bit harder here, and it is fixed.** §12's open item left
`disease-background` with a 250px prose column at exactly 1024px; this grid's fixed
tracks left **204px** — the item records 220, from the 202/286 tracks the paragraph
above corrects. Fixed on 2026-08-04 the same way that chapter was, by moving the split
to `xl` rather than by touching the gutter: see the responsive pass below.

### The responsive pass of 2026-08-04

Everything below `xl` got a rule that day. Four decisions, in dependency order.

**1. The three tracks moved to `xl`.** The gutter steps 48 → 112 at `lg`, so the pixel
that turned the fixed tracks on was the pixel that took 175px of content column away:
752 − 24 − 200 − 24 − 300 = **204px** of prose, not recovering until 1280.

| Viewport | Content column | Prose column     |
| -------- | -------------: | ---------------- |
| 1024     |            752 | 752 — one column |
| 1280     |           1008 | 460              |
| 1440     |           1168 | 620 (drawn)      |

Between 1024 and 1279 the chapter is a single 752px column, **wider than the prose ever
got from the three-track layout at that width** — so the stack is the better
composition there, not a fallback. Identical argument, identical fix and identical day
as `disease-background`'s move to `xl`; the two chapters were the two cases §12's open
item named, and both are now fixed from the layout end rather than from the gutter.

**2. Between `sm` and `xl` the grid keeps two tracks**, which is what stops that stack
running nine blocks deep to 1279: `sm:grid-cols-[200px_1fr]` with the prose taking
`sm:col-span-2 xl:col-span-1`, so the prose spans full width and the figure sits beside
its own `+` underneath. Implicit placement does all of it — a spanning item takes a row
of its own and the next two fill the row below — so it is still **one grid**, and the
pairing the section opens with is as true at 640 as at 1440.

`sm` is invented and stated as such per §12's rule, alongside `DisclosureBand`'s `md`
and `ArchBand`'s 150px radius. It is where the arithmetic clears: 544 − 24 − 200 leaves
the caption cell 320px, which holds a 65px `+` and three lines of `text-xl` with room
over. Below it everything stacks, which is right for a phone.

**3. The type takes `disease-background`'s table unchanged**, so all four chapters
agree and §11's table stays one table rather than a per-chapter list.

| Element                       | <`lg` | `lg`+ |
| ----------------------------- | ----: | ----: |
| `<h1>` (unchanged, §2)        |    30 |    48 |
| `<h2>` sub-headings           |    24 |    30 |
| disclosure caption            |    20 |    24 |
| `BenefitsChallengesCard` `h3` |    24 |    30 |
| its bullets                   |    16 |    20 |
| Table 1 headings, cols 1 & 5  |    16 |    20 |
| Table 1 cols 2–4              |    14 |    16 |
| page bullets (unchanged)      |    16 |    16 |
| Table 1 footnotes (unchanged) |    14 |    14 |

The ramp is at **`lg`** while the layout moves at `xl`. Two different questions: `lg` is
§2's app-wide type step, which `disease-background` also kept at `lg` after its own
split moved to `xl`.

The card bullets' step is **derived, not picked**. `Popup` is `min(1140px, 92vw)` inside
a `border-5` with `px-4 sm:px-8 lg:px-16`, so at 375 the card body is 345 − 10 − 32 =
**303px** — eight pixels _narrower_ than the page's own 311px column, which sets 16px
bullets. A card cannot set larger body type than the page that opened it in a narrower
measure, which lands `text-base` exactly.

**4. Nothing else shrinks.** The reserved box keeps 200 × 166 at every width — it exists
to hold the track open at the drawn size, so a smaller reserved box reserves the wrong
thing — and gains only `mx-auto`, which is inert from `sm` up (its track is exactly
200px) and does its whole job in the phone stack, where `max-w-50` would otherwise leave
111px of dead column beside it. The `+` keeps `PopupButton`'s one fixed 65px scale;
`CLOSE_BUTTON_SIZE` (§13) is the ✕ that _closes_ a modal, whose ramp answered crowding
inside a 345px band, and nothing crowds this one.

The row gap ramps `gap-y-10 xl:gap-y-5`, because the two-up gives it a second job: at
`xl` it separates three rows and nothing else, and below it separates a row's prose from
that row's own figure _as well as_ row from row, so at one value the three blocks stop
reading as three. This is **not** one of §11's eight — those are 1440 gaps deliberately
left unramped pending one one-screen rule, and 40 does not exist at 1440.

### Table 1 scrolls rather than reflowing

`SeverityTable`'s answer applied unchanged, which open item 27 already calls a precedent
rather than a one-off. `table-fixed` divides the card body into five equal columns, so
the widest unbreakable token in _any_ column sets the floor for all five — and here that
token is the column heading **"Administration"**, not anything in the data: `/` and `-`
are UAX-14 break opportunities, so "prophylaxis/treatment" and "Long-term" both split.

At 1440 the body is 1002px = 200px a column and the grid fits outright. At 375 it is
303px = 60px a column. The type step above drops the per-column floor from ~148px to
~132px, and `min-w-165` (660 = 5 × 132) holds it when the card is narrower still.

**The 660 is arithmetic off character counts, not a measurement** — open item 36, and
the weakest number on this chapter. The wrapper is a plain `div`, because `overflow-x-auto`
on a table box does nothing, and it holds the `<table>` alone: the footnote list below
is prose that wraps fine, and dragging it sideways with the grid would be a scroll
region doing a job nobody asked for.

Restacking into five labelled blocks on a phone was the alternative, rejected for the
reason `SeverityTable` rejects it: it flattens the column association at exactly the
width where it matters most, and that association — `scope="row"` letting a screen
reader announce "Rebalancing: siRNA, Route of Administration, SC" — is why the element
is a real `<table>`.

The footnote list is the one thing the pass left broken, deliberately. It is `text-sm
leading-none` — set solid — and footnote (a) is ~150 characters, roughly 1100px at 14px
against a 1002px body, so it **already wraps to two touching lines at 1440**, before any
of this. That makes it a transcription question rather than a responsive one, and fixing
it would change the drawn composition at the drawn width without the designer. Open item
37; at 375 it sets about nine solid lines.

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

**Its type is measured, not assumed** — and this paragraph had the measurements wrong
until 2026-08-04. It read "20px column headings, 16px in the three middle columns, 24px
in the two outer ones", and then that **all four sizes land on a Tailwind step exactly**
(24 → `text-2xl`, 20 → `text-xl`, 16 → `text-base`, 14 → `text-sm`, "no rounding in any
of them"). Git says none of that was ever true of the file.

What `c5e79cc` actually transcribed off the export is **22 / 16 / 22**:

| Cells                            | Drawn | Shipped                    |
| -------------------------------- | ----: | -------------------------- |
| column headings                  |    22 | `text-base lg:text-xl`     |
| column 1 (option) and 5 (route)  |    22 | `text-base lg:text-xl`     |
| columns 2–4 (MOA, population, …) |    16 | `text-sm lg:text-base`     |
| footnotes                        |    14 | `text-sm` (`leading-none`) |

So the export sets **two** sizes here, not three — the headings and the two outer
columns are one value, and the drawing does set the option name and the route larger
than the prose between them. `769a354` then rounded all three 22s onto the scale at
`text-xl`, a 2px round _down_, so "no rounding in any of them" was wrong about three of
the five. `text-2xl` appears nowhere in this component and never did.

Same shape as §13's 291-vs-159 error, and the same lesson: the wrong numbers were the
ones that made the argument tidier — a three-way split reads as more deliberate
transcription than "22, 16, 22, and we rounded". Nothing downstream depended on them.
Only the leading is still transcribed raw.

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
steps (224 × 192 against the drawn 227 × 185) and the bottom row's gap is tightened to
`gap-x-6`, which is what keeps the chapter on one screen once the prose is set at 26px.
The group width stays the drawn 963, so the row and the bottom caption still share their
left edge.

The box ships `h-48`/`max-w-56` and holds that size at **every** width; see the
responsive pass below.

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
does not. The override is the one its doc invites. **It ramps as of 2026-08-04**, and its
height override moved to `py-2.5` with it; see the responsive pass below.

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

### The responsive pass of 2026-08-04

The third chapter to get one, on the same day and to the same shape. Its cliff was the
same pixel as the other two and its symptom was different, because this chapter has no
grid: what turned on at `lg` was the box **row**.

**1. The gap ramps; the boxes never do.** `lg:gap-x-35.25` put the drawn 141px gap into
the column that had just lost 175px to the gutter step (§12), so the pixel that turned the
row on was the pixel that made it too wide: 3 × 224 + 2 × 141 = **954** against a 752px
column. The boxes took the difference and shrank to **157 × 192** — 30% under drawn, and
portrait where the artboard draws landscape. Only the width was ever allowed to give.

The fix is a middle step in the gap alone, `lg:gap-x-10 xl:gap-x-35.25`, and **40 is
derived**: it is the largest gap that lets three drawn-width boxes fill the `lg` column
exactly — 3 × 224 + 2 × 40 = **752**. So the row turns on at precisely the width that
holds it at full size, and the drawn 141 returns at `xl`, where the drawn 962 group does.

| Viewport | Content column | Group | Layout | Gap |               Box |
| -------- | -------------: | ----: | ------ | --: | ----------------: |
| 375      |            311 |   311 | column |  32 |         224 × 192 |
| 768      |            672 |   672 | column |  32 |         224 × 192 |
| 1024     |            752 |   752 | row    |  40 |         224 × 192 |
| 1280     |           1008 |   962 | row    | 141 |         224 × 192 |
| 1440     |           1168 |   962 | row    | 141 | 224 × 192 (drawn) |

**2. Below `lg` it stacks, at the same size.** That is three 192px boxes and two 32px
gaps — **640px of empty bordered rectangle** — between the prose and a caption that says
"click on the boxes", i.e. about a screenful of a 375 × 667 phone. It is the accepted cost
of not reserving the wrong size, which is `treatment-landscape`'s own rule for the same
object: a reserved box exists to hold the drawn size, and a smaller one reserves the wrong
thing. **The alternative was considered and rejected**: holding the drawn 7:6 ratio
against a fluid width (an `aspect-ratio` in place of the fixed height) would keep the row
at every width and cost the phone 80px instead of 640, but it buys that by shipping a 93px
box — which is reserving the wrong size in the other direction, on both axes at once.

The cost is bounded by open item 16 rather than by this pass: these are placeholders for
assets §7.7 has not named, and the answer to what a box opens is the answer to how much
room it deserves on a phone.

**3. The type takes the same one-step ramp as the other three chapters** — but this is
the one chapter where the _body_ copy moves.

| Element                   | <`lg` | `lg`+ |
| ------------------------- | ----: | ----: |
| `<h1>` (unchanged, §2)    |    30 |    48 |
| page bullets              |    20 |    24 |
| boxes caption             |    20 |    24 |
| disclosure caption        |    20 |    24 |
| prose card lead           |    20 |    24 |
| prose card `<h3>`         |    24 |    30 |
| prose card bullets        |    16 |    20 |
| card footnote (unchanged) |    14 |    14 |

§11's table pins the other three chapters' body copy at 16px because that is a legibility
floor with nowhere down to go. This chapter transcribes its body at 24 (open item 9), so
it has exactly one step to give — and 20 is a step, not a collapse onto the other
chapters' value, so the divergence item 9 is holding open is where it was.

The disclosure caption's step lands it on `text-xl lg:text-2xl`, which is what the other
three chapters' captions already take, so all four now agree on caption **size** as well
as on colour (item 15 is unaffected — that is about the value, not the ramp).

The card's two sizes are derived, not picked, by `BenefitsChallengesCard`'s argument
reused on the same card: `Popup` is `min(1140px, 92vw)` inside a `border-5` with
`px-4 sm:px-8 lg:px-16`, so at 375 the body is 345 − 10 − 32 = **303px**, eight pixels
narrower than the page's own 311px column. A card may not set larger body type than the
page that opened it in a narrower measure — which lands the bullets on `text-base` and
the lead on exactly the 20px the page bullets ramp to, neither a step above nor below.

**4. The "View mechanism" CTA ramps, and it is the only thing in any of the three
2026-08-04 chapter passes that moves the canvas.** The package ships `px-16` — 128px of
inset — around `text-[26px]`, computing ~358px wide against a card body of
345 − 10 − 32 = **303px** at 375. It never overflowed, because the component carries
`max-w-full` and `break-words`, so nothing failed and no test could have caught it: the
label simply wrapped into the 175px left over inside a 303px box. A CTA that is 92% inset
is not a CTA.

It takes the ramp `Landing`'s hero CTA already puts on this same component (§8), reusing
its first three inset steps rather than inventing a scale for one button.

| Viewport | Card body | Inset | Type | Button |
| -------- | --------: | ----: | ---: | -----: |
| 375      |       303 |    64 |   20 | ~241px |
| 640      |       515 |    96 |   20 | ~273px |
| 1024     |       804 |   128 |   24 | ~340px |
| 1440     |      1002 |   128 |   24 | ~340px |

`lg:text-2xl` is the canvas move. `text-[26px]` was the last 26 on this chapter — the
prose went 26 → 24 in §2's migration the same day, and this survived only because it is
the package's default rather than a value the file chose. The cost is item 31's shape:
~340px rendered against the drawn 353, where the package's own 358 was within 5. Ramping
the inset alone was the alternative, and it leaves 26px type over 16px bullets on a phone
— the disproportion §2's ramp exists to fix.

`py-2.5` replaces `py-2` and is what holds the drawn height across that type step:
10 + 10 + 24 × 1.25 = **50px** against the export's 49, where `py-2` would have given 46.
Below `lg` the same value gives 45px, which clears the 44px the ✕'s own ramp lands on
(§13).

**5. Nothing else moves.** `mt-14` and `mt-20` are two of §11's eight vertical gaps,
deliberately unramped pending one one-screen rule across all four chapters (item 10)
rather than answered per page. The `+` keeps `PopupButton`'s one fixed 65px scale, for
`treatment-landscape`'s reason: `CLOSE_BUTTON_SIZE` (§13) ramps the ✕ that _closes_ a
modal, and nothing crowds this one. `CardFooter` is untouched — its three width classes
were tuned at 390px when the chapter shipped, and the `flex-wrap` on the bottom row turns
out never to fire: at 375 the caption shrinks to 311 − 24 − 65 = 222px against a 150px
min-content, so the wrap is a guard rather than the shipped behaviour.

**The figure card is left illegible on a phone, deliberately.** `PopupFigure` caps at
`min(886px, 100%)`, so the coagulation-cascade diagram paints at 303 × 147 at 375 — the
densest figure in the app at a third of drawn size. That is a `PopupFigure` question
rather than a chapter one: the same cap governs `disease-background`'s two diagrams and
all four of `fviiia-mimetics`', and the scroll-region answer the tables took would have
to be taken for all seven at once or not at all. Open item 38.

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

#### The responsive pass of 2026-08-04

The fourth chapter to get one, and the shortest: **one class changes.** The bullets
step 24 → 20 below `lg` and nothing else on the page moves.

That is not an oversight. The other three passes were all spent on things this chapter
does not have — `disease-background` and `treatment-landscape` moved grids off the 1024
cliff (§12), `rebalancing-agents` moved a box row and a card's CTA — and what is left
here is a heading, two bullets and a fixed wash. The `<h1>`'s own ramp predates the
pass: this chapter is where §2's one-step-down rule was first argued, and it is already
`text-3xl lg:text-5xl`.

| Element                | <`lg` | `lg`+ |
| ---------------------- | ----: | ----: |
| `<h1>` (unchanged, §2) |    30 |    48 |
| bullets                |    20 |    24 |

**The argument for the bullets is proportion, not fit.** The heading drops 48 → 30
below `lg` while the body stayed at 24, which renders the body at 0.8 × the heading on
a phone where the artboard draws it 0.5 ×. At 20 that ratio is 0.67 and the hierarchy
survives the step. Nothing overflows at either size, and the chapter still fits one
screen at 375 × 667 under both readings — roughly 460px of ink against a 557px box —
so this buys hierarchy rather than room. It is the comfort grade of §2's argument, not
the correctness grade the `<h1>` has.

The step is the same one `rebalancing-agents` takes, from the same measurement (26px
body copy, the two chapters built around one block of prose) and to the same value, so
the two remain in step at both ends. §2's "body copy does not participate" now names
both as its exception.

`leading-tight` is stated once and covers both steps — a v4 `leading-*` sets
`--tw-leading` and each `text-<size>` resolves through it (§8) — giving the drawn 1.25
at 25px and 30px rather than Tailwind's own 1.4 at `text-xl`.

**Nothing else moves, deliberately.** `mt-8` is one of the vertical gaps open item 10
is holding for a single rule across the chapters. The backdrop is `object-cover` on a
square asset, which crops to whatever box it is given, so a portrait phone gets a
tighter centre crop of wallpaper and no decision is needed. And the page has no figure,
table or card, so items 27, 37 and 38 — the scroll-region questions the other chapters
raised — do not reach it.

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

| Ink                      | Drawn                | Ships as                             |
| ------------------------ | -------------------- | ------------------------------------ |
| heading, 2 lines         | 52px/57.2, Barlow Bd | `text-3xl lg:text-5xl`               |
| heading → bullets        | 32px                 | `mt-8` — the designer's value        |
| bullets                  | 26px/32, DM Sans 400 | `text-xl leading-tight lg:text-2xl`  |
| agent captions           | 26px/30, wt 900/500  | `text-xl leading-tight lg:text-2xl`  |
| panel heading & captions | 26px/26, wt 900      | `text-xl leading-[1.08] lg:text-2xl` |

The bullets and captions were raw for the §8 reason the other chapters record —
26px at weights 900 and 500, which the old scale's 26px step (weight 600) could
not carry. All three now take `text-2xl` and state their weight beside it, which
is the whole of what changed; the drawn 26 renders at 24. Tracking
is drawn at 0.608px on 26px (0.0234em); `tracking-wide` is 0.025em, within 0.04px, so
it ships on the scale rather than as an arbitrary value.

**The two leadings are ratios rather than the drawn pixels**, and the drawing is the
table above rather than the class names — see §2. `leading-7.5` and `leading-6.5` were
30px and 26px exactly, which is right at one size and wrong at two: they became 1.5 and
1.3 the moment the type stepped to 20 below `lg`. `leading-tight` is 1.25, which is what
30px already rendered at the shipped `text-2xl`, and `leading-[1.08]` is what 26px did,
so the 1440 canvas is untouched and the phone inherits the same proportion.

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
112px gutter, and bottom edge flush with the canvas. The chapter reaches that bottom
edge with `grow` inside `AppShell`'s `flex flex-1 flex-col` wrapper — which is
`lg:pb-0`, so the content box already ends at the viewport bottom. It **stretches** past
the drawn 350px on a taller viewport rather than detaching from the corner; its content
stays vertically centred, which the artboard's equal 87px above and below already
implies.

**Correction, 2026-08-05: the drawn panel does _not_ stay inside the content column**,
which this paragraph asserted from its right edge landing on the 112px gutter. The
column's right edge is not the gutter — it is `--spacing-gutter-rail`, 160px, because
the rail has to be cleared as well (§12), so the column ends at 1280 and the drawn panel
runs to 1328. The designer drew it 48px into the rail's clearance. What ships is the
panel inside the column, i.e. 48px left of drawn, which is the same call every page
makes about that strip; nothing about the chapter changes, but the reason it is right
is that the shell owns the rail, not that the artboard agreed.

The radius steps **117px → 60px below `lg`**. 117 is drawn on a 675px panel where it
reads as a corner; on a 320px phone it eats a third of the width. An invented comfort
value like the small-screen gutters and `prophylaxis-guidance`'s stepped heading — the
canvas is 1440 and nobody has drawn a phone. **It stays on `lg` while the layout moves
on `xl`** (below): between the two the panel is full-width, 752 to 1008px, so the drawn
corner is being asked to sit on a panel wider than the one it was measured on.

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

#### The responsive pass of 2026-08-05

The fifth chapter to get one, and the first whose **drawn layout did not fit the app at
any width below the design canvas**. The other four passes moved a breakpoint that was
merely early; this one moved a breakpoint that was never right.

**1. The bottom half's row needs a 1394px viewport, and it was turning on at 1024.**

| Piece                       |       px |
| --------------------------- | -------: |
| `ps-19.5`, the drawn indent |       78 |
| `AgentCaption` (`w-72`)     |      288 |
| `gap-4`                     |       16 |
| `PopupButton`               |       65 |
| left group                  |  **447** |
| `EmergingPanel`             |      675 |
| the row                     | **1122** |

The button is 65px and `shrink-0` in the package, so the only compressible thing in that
group is the caption — whose 288px measure is what produces the artboard's line breaks,
"Denecimig (Mim8):" filling one line with its status wrapped to three beneath. Against
content columns of 752 at `lg` and 1008 at `xl` (§12), the row overflowed by ~285px at
1024 and by ~114 at 1280, squeezing the captions on the way. This is
`rebalancing-agents`' box row failing on the same pixel for the third time in the app:
the width that turns a drawn row on is the width that takes 175px of gutter away.

**2. The row moves to `xl`, and the panel is the axis that gives.** The left group is
pinned — `xl:basis-112.5 xl:shrink-0`, where 450 is that 447 rounded up onto the scale's
quarter step — so the deficit lands entirely on the panel, which drops its `shrink-0`
and keeps `xl:w-168.75` as a maximum rather than a fixed width.

| Viewport | Content column | Layout | Left group |             Panel |
| -------- | -------------: | ------ | ---------: | ----------------: |
| 375      |            311 | column |        311 |               311 |
| 768      |            672 | column |        672 |               672 |
| 1024     |            752 | column |        752 |               752 |
| 1280     |           1008 | row    |        450 |               558 |
| 1397     |           1125 | row    |        450 | 675 — drawn width |
| 1440     |           1168 | row    |        493 |      675 as drawn |

The panel is the right thing to shrink because it is a fluid container rather than a
reserved box: it already stretches past its drawn 350px height on a taller viewport, and
its content is centred in it at any size. `rebalancing-agents`' placeholders are the
opposite case — a reserved box exists to hold the drawn size, so that pass shrank the
_gap_ and left the boxes alone. Same question, opposite answer, because the objects
differ.

**3. The panel's radius stays on `lg`, and that split is deliberate.** Between 1024 and
1279 the panel is full-width, 752 to 1008px — wider than the 675 the drawn 117px corner
was measured on — so the drawn corner reads there as drawn or better, and the invented
60px stays for the widths it was invented for. The ramp and the layout are two
questions; `treatment-landscape` states the same separation.

**4. Below `xl` the two left pairs centre, and below `sm` each pair becomes a column.**
The 78px indent is an artboard fact about a half-width column, and once the pairs sit
under full-width prose there is nothing for it to indent from; the block beneath them is
the panel, which centres its own heading and buttons. A 369px group hugging the left of a
752px column reads as an accident. Invented, like the small-screen radius above.

That 369 is also the number that stacks the pair: caption + `gap-4` + button needs it,
and a 375px phone gives the content column **311**, so side by side the caption was being
squeezed to 230 — below the 288px measure that produces the artboard's line breaks, which
is the one thing `w-72` is there for. Stacked, the caption gets the full column at its
drawn width with the `+` centred beneath it. It is one class on `Disclosure`, so all four
move together, and `items-center` covers both layouts: it centres the two boxes in the
column below `sm` and the caption against the button above it.

The panel's own two pairs still sit **side by side** at 375 — as columns, centred, and
they fit (~140px of pair plus the 56px gap inside a 263px panel body), so `flex-wrap`
remains the guard it has always been rather than the shipped behaviour.

**5. The type takes §2's one step, and this chapter is the fourth case of that section's
body-copy exception.**

| Element                        | <`lg` | `lg`+ |
| ------------------------------ | ----: | ----: |
| `<h1>` (unchanged, §2)         |    30 |    48 |
| page bullets                   |    20 |    24 |
| agent captions                 |    20 |    24 |
| panel heading & panel captions |    20 |    24 |
| all four cards' bodies         |    16 |    20 |
| the scrim caption on Pop up 10 |    16 |    20 |

The page's four transcribed strings are all the same drawn 26px, so the whole page moves
on one step. The two absolute leadings became ratios to survive it — see the type table
above and §2, and note that nothing moves at 1440.

The cards' 20 → 16 is `BenefitsChallengesCard`'s rule reused unchanged: `Popup` is
`min(1140px, 92vw)` inside a `border-5` with `px-4 sm:px-8 lg:px-16`, so at 375 a
`default` card's body is 345 − 10 − 32 = **303px** against the page's own 311px column,
and a card may not set larger body type than the page that opened it in a narrower
measure. Denecimig's `wide` card is `96vw`, i.e. 318px there — 15 wider, still narrower
than the page at every width that matters. The Emicizumab enlargement's caption ramps
with the cards rather than with its own 343px scrim measure: it is one gesture from the
bullets it belongs to, and a step between them is the disproportion the ramp exists to
remove.

**6. The three two-column cards stack at `xl` too, and Denecimig is the argument.** Both
card widths are viewport-bound, so at 1024 the split turned on while the card was at its
narrowest:

| Card               | Body @1024 | Figure col | Prose @1024 | Prose @1280 | Prose @1440 |
| ------------------ | ---------: | ---------: | ----------: | ----------: | ----------: |
| Emicizumab         |        804 |        448 |         308 |         506 |         506 |
| Denecimig (`wide`) |        845 |        580 |     **241** |         487 |         618 |
| NXT007             |        804 |        448 |         332 |         530 |         530 |

241px for four bullets with a nested three, on the one card in the chapter that was
widened _because_ its prose column was tight (§13), is the sharpest number this pass
found after the row itself: `96vw` means `wide`'s extra 336px does not exist below
~1417px, while the fixed 580px panel beside it does. Between 1024 and 1279 all three
cards are a single column, prose first, with the figure at its drawn width beneath —
which costs scrolling inside `Popup`'s own scroll region and buys back up to 496px of
measure. Pop up 13 (Inno8) is untouched: it is drawn as a single column at 1440 already,
for the 2.6:1 reason above, so it had nothing at `lg` to move.

**7. Nothing else moves.** The five vertical gaps — `mt-8`, `mt-14` twice, the 80px
between the two left pairs and the 40px from that group to the panel — hold at every
width, deferred to open item 10 with the other chapters' rather than answered here. The
`+` keeps `PopupButton`'s one fixed 65px scale, as on the other four chapters. The four
diagrams stay illegible on a phone, which is open item 38 and a `PopupFigure` question:
the same `min(886px, 100%)` cap governs seven figures across three chapters, and the
scroll-region answer the tables took has to be taken for all of them at once or not at
all.

### Not verified in a browser

Nothing on this chapter has been opened at any width since the §2 migration's 1440/375
sweep of the `<h1>` (open item 30). Every number above is arithmetic on `AppShell`'s
tokens, the package's own class strings and the artboard. Open item 44.

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

The 24px horizontal gutter below `sm`, the 48px at `sm`, and the 16px bottom
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

**Every number in this table is still a 1440 number, but above 1440 they are no
longer the rendered ones.** §19 steps the root font size at 1800 and 2160, and
because all five tokens are rem the whole table scales with it — the gutter runs
112 → 126 → 140 and `--container-content` 1168 → 1314 → 1460. The cap above still
does exactly what this section says it does; it is simply expressed in a rem that
is 18 or 20px rather than 16 up there. The measure in characters does not change,
which is why scaling was chosen over raising the cap.

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

**Half closed on 2026-08-04, and the proposed fix above is now unavailable.**
`ce9e4fb` removed every `clamp()` in the app, so the gutter ramp this item
recommends would have to be re-argued as a breakpoint step rather than applied —
and stepping the gutter moves all ten routes at 1024–1280, none of which the
change was looking at.

`disease-background` was fixed from the other end instead: its two-column split
moved to `xl`, so the fixed 470px track no longer turns on in the pixel where the
gutter takes 175px away, and between 1024 and 1279 that chapter is a single 752px
column (§11).

**`treatment-landscape` took the same fix later the same day**, so both cases this
item names are now closed from the layout end. Its three tracks move to `xl` too, and
between 1024 and 1279 it is a single 752px column with a two-track step under it (§11).
Its figure here was **204px**, not the 220 recorded above — that number came from the
202/286 tracks §11 was documenting rather than the 200/300 the file ships.

**The gutter itself is still untouched**, which is why this row stays open rather than
closing. What is left is the general case: every other route crossing 1024 pays 112px
of gutter out of a 1024px viewport, and nothing measures whether that is right. The
shape of any fix is now a breakpoint step rather than the `clamp()` this item was
written around, and neither chapter is evidence for it any more — both routed around
the gutter instead of paying it.

Neither page's numbers here have been measured in a browser. Open item 30 still
records 1024 as unchecked.

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

| Part            | Design                                    | Shipped                            |
| --------------- | ----------------------------------------- | ---------------------------------- |
| Card            | 1066 × 645                                | the `default` width step; `95dvh`  |
| Radius / border | 40.417px / 5.052px `crimson-50`           | verbatim                           |
| Shadow          | `0 22.735px 50.142px 5.052px` black @ 55% | `--shadow-popup`                   |
| Band padding    | 12px top and bottom                       | `py-3`, floored at the ✕           |
| ✕               | 65px (`PopupButton`'s one fixed scale)    | `size-11 sm:size-14 lg:size-16.25` |
| ✕ inset         | 22px from the card's right edge, centred  | `right-5.5`, `-translate-y-1/2`    |
| Body gutters    | 64px sides                                | `px-4 sm:px-8 lg:px-16`, `py-2`    |

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
four — four bullets with a nested three in the left column, beside a fixed panel
carrying its own two sentences — and at `default` the left column is the
drawn ~424px, where the bullets wrap past the artboard's line count and the card
engages `Popup`'s scroll region on the 1440 canvas itself. Because that panel is
fixed and `shrink-0`, the whole of `wide`'s extra width lands in the prose column,
which is the dimension the overflow is in; the panel is unaffected, so
`denecimig.webp` is still painted at the size it was drawn at.

**The panel is `xl:w-145` (580px), not the 448 this paragraph claimed**, and the
column arithmetic moves with it: 1222 − 24 − 580 = **618px** of prose at the 1440
canvas rather than 750. The 448 was true when the step was chosen and stopped being
true in `04dedae`'s spacing pass, which widened the panel without revisiting the note
here. **The number this correction matters for is 241** — `wide` is `96vw`, so below
~1417px the extra 336px does not exist while the fixed 580 does, and at 1024 the prose
column was 845 − 24 − 580. That is what moved this card's split to `xl` on 2026-08-05;
§11 records the pass.

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
briefly, then the step. The clamp's 22px floor is what the band's then-flat 65px
floor used to bind against on a phone.

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

`min-h-11 sm:min-h-14 lg:min-h-16.25 flex flex-col justify-center` on the header
— a single `min-h-[65px]` until the ✕ itself started ramping (below). This is the
one part of the repair that is not a drawn value, and it is not a design number
at all:

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

The horizontal padding is 100px at `lg`+ and steps down below it — at each step
the ✕'s own width plus its 22px inset, i.e. the narrowest inset at which the
title can never run under the button. Symmetric, so the title stays centred on
the card rather than in the space left beside it.

**It has now been all four things.** `clamp(5.5rem,7vw,6.25rem)` until
2026-08-04; then the 100px maximum flat, which was the regression open item 33
recorded — at 375 the card is 345px, so the band spent 200 of it on padding and
left 145 for a 48px title; then `px-22 lg:px-25`, the same floor and maximum
restated as a breakpoint step; now `px-16.5 sm:px-19.5 lg:px-25`, because the ✕
the floor is derived from ramps too. Every version since the clamp keeps the
app's no-`clamp()`, no-arbitrary-length invariant, and none of the steps is an
invented comfort value the way §11's `md` row and 150px arch are — each is
derived from the button.

The title ramps with it: `text-2xl sm:text-3xl lg:text-5xl`, i.e. **two steps
down against the chapter's one** (§2). The reason is the box rather than the
type. A heading sits in the content column; this sits in whatever the inset
leaves, which on a 375px phone is 203px against the column's 311 — and it is
`uppercase` display type, the widest thing the app sets. 48 → 36 would still take
"Hemophilia Severity Based on Factor VIII/IX Level" to five lines in a band the ✕
has to stay centred on.

(**This paragraph said 291px until 2026-08-04 and the number was wrong.** The
real figure was 159 — 345px card less `border-5` twice less `px-22` twice — and
291 corresponds to no inset the component has ever shipped. It understated the
case rather than overstating it, so the two-step conclusion it was offered in
support of stands; but it is the kind of error that survives precisely because it
points the way the argument already went.)

#### The ✕ ramps, and three numbers ramp with it

`PopupButton` ships one fixed scale — `size-16.25`, 65px, the drawn value — and
its glyph is `size-[58%]`, so the box is the only thing to move. 65 is a desktop
number: on a 375px phone the card is 345px wide, and the button plus its 22px
inset took 88px off **each** side of the band, a quarter of the card spent on the
affordance that dismisses it. So it steps down twice, at the breakpoints the
title and the body gutter already step at:

| Step  | ✕               | Band inset (✕ + 22) | Band floor       |
| ----- | --------------- | ------------------- | ---------------- |
| base  | `size-11` 44    | `px-16.5` 66        | `min-h-11`       |
| `sm:` | `size-14` 56    | `px-19.5` 78        | `sm:min-h-14`    |
| `lg:` | `size-16.25` 65 | `lg:px-25` 100      | `lg:min-h-16.25` |

Four things are worth stating about that table.

- **44px is the touch-target floor, not a look.** The ✕ is the primary dismiss on
  a phone, where the other two routes are a keyboard and a strip of scrim beside
  a card that is `92vw` wide. It is also on Tailwind's scale.
- **The `lg` inset is 100, not the derived 87**, because 100px is drawn. The two
  smaller steps have no drawn value to transcribe, so there the floor is the
  whole rule.
- **`lg:size-16.25` restates the package's own value** rather than letting it
  show through. `PopupButton` merges a caller's `className` last, so a base
  `size-11` strips the default at every width and the drawn size has to be put
  back explicitly. Asserted in `Popup.test.tsx` for that reason — a lost `lg:`
  would ship a 56px button on the 1440 canvas silently.
- **The 22px inset does not ramp.** It is drawn, and holding it fixed is what
  lets the other two columns be "the button at this step, plus 22".

The floor stays inert, which is the point: a one-line band at `text-2xl` is
12 + 24×1.0278 + 12 = 48.7px against a 44px button, so the ✕ never overhangs the
band the way it did before the floor existed. `PopupFigure`'s `reserve` moves in
the safe direction too — a shorter band leaves it more room than the 133px it
budgets for.

The size lives in `src/components/closeButton.ts` as `CLOSE_BUTTON_SIZE`, shared
with `Lightbox`, whose own doc-comment claims the parity out loud ("so closing an
enlargement looks like closing anything else in this app"). Nothing crowds the ✕
there — it hangs over the scrim — but it does overlap the picture on a phone, so
the ramp helps there as well as matching.

The single `leading-[1.0278]` covers all three steps and does not need restating;
see §8's subsection on the line-height rule, which this file had backwards until
the same day.

**The body gutter ramps too — `px-4 sm:px-8 lg:px-16`.** The drawn 64px is 69px
from the card's outer edge, which is open item 25's question, but neither reading
in that item is a phone number: at 375 `px-16` spent 128px of a 345px card and
left the body 207. The ramp gives it 303 / 514 / 1002 at 375 / 640 / 1440, and
§11's severity table is what made that binding. Only the horizontal padding
moves — `py-2` is clearance between the band and the content, the same job at
every width, and `PopupFigure`'s `reserve` is measured off it.

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
the then-flat `min-h-[65px]` floor binding, where the pre-repair run gave 73 and
65 for different reasons.

**The band column is stale below `lg` as of 2026-08-04**, when the title started
ramping and the ✕ with it. 1440 / 1280 / 1024 are unaffected — nothing at or
above `lg` moved. 768 and 375 are not re-measured here: the floor there is now 56
and 44, and the title 30px and 24px, so the arithmetic says ~56 and ~49. **The
card-width columns are untouched by any of it** — those are `min()` expressions
against the viewport and are what this table was run to prove.

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

### The height floor, and its removal

**The card has no height floor as of 2026-08-04. It is its content's height,
capped at `95dvh`** — one class, `max-h-[95dvh]`, where there used to be two.

Nothing else is required to get content height, and in particular no `h-fit`:
`ModalLayer` lays the card out with `place-items-center`, which is
`align-items: center` rather than `stretch`, so the height was already `auto` and
the floor was the only thing overriding it. A card centred in a stretch container
would have needed the opt-out; this one does not.

The floor read:

```
min-h-[min(520px,95dvh)]   max-h-[95dvh]
```

and the rest of this section is why it existed, kept because the reasoning is
what a future floor would have to answer to.

The design draws 645px, and 520 was a chosen number rather than a transcribed
one — short of the drawn height deliberately, so a popup whose content genuinely
is brief did not open a screen of empty gradient. It went in because the one
popup with content at the time (a single bullet) rendered **193px**, reading as a
bar rather than the drawn card, with `bg-popup` showing only its warm centre.

**That 193px bar is exactly what removing it gives back, and the removal is
deliberate.** No caller today is that short, and a floor that makes every brief
card 520px tall was paying for one hypothetical case with a screenful of empty
gradient on every real one — the same trade the ✕ ramp above makes against the
drawn 65px. If a genuinely one-line body appears, this is the section to reopen,
and a `lg:`-only floor is the shape to reach for first: the drawn 645 is a
1440-canvas number with no authority on a phone, and a narrow card does not read
as a bar the way an 869px-wide one does.

**Any future floor must be guarded by the cap.** `min-height` beats `max-height`
in CSS, so a bare `min-h-[520px]` pushes the card past `95dvh` on any viewport
shorter than ~547px — a phone in landscape — and overflows it off screen with no
way to scroll back. `min(520px, 95dvh)` is the form in which the two cannot
disagree.

**A floor is also width-independent, and `narrow` is where that shows.** 520 ×
869 is a squarer card than the design has ever drawn; a short body in a narrow
card is the combination most likely to look like a floor rather than a card.

**Both values were `95dvh`, not the `85dvh` this section claimed until
2026-08-04.** The code has never said 85; see the geometry table above.

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
moves where the design applies. It only shows where a label wraps, which after
the pass below is a 320px phone: at 24px in a 20px box, wrapped lines collide,
which is the same trap `Button`'s own comment records about its 26px type. It is
stated once and covers all three type steps, because a v4 `leading-*` sets
`--tw-leading` and each `text-<size>` reads it back — so the ratio holds at 16,
20 and 24, and `min-h-14` keeps the pill 56px tall at all three.

### The responsive pass of 2026-08-04

Four ramps, one argument: **below `lg` the block is a single column of
drawn-width pills, and at `lg` the artboard's two columns come back.**

| Box              | Base                | `lg`        | `xl`        |
| ---------------- | ------------------- | ----------- | ----------- |
| fieldset cap     | `max-w-110` (440)   | 900         | 900         |
| grid             | one column          | two columns | two columns |
| legend           | `text-xl` (20)      | `text-3xl`  | `text-3xl`  |
| pill label       | `text-base` (16)    | `text-xl`   | `text-2xl`  |
| Submit label     | `max-lg:text-lg`    | 26 (pkg)    | 26 (pkg)    |
| Submit row's cap | 440, matching above | 900         | 900         |

**The 440px cap is the drawn pill, not a new number** — `(900 − 20) / 2` is what
a pill measures at the canvas, so out of the grid the block is one column of
full-size pills rather than a shrunken artboard. Uncapped it would stretch a
153px label across a 752px pill at `lg`. Same move §11's `disease-background`
figure makes when it leaves its grid: keep the drawn width, add `mx-auto`.

**The split moved from `md` to `lg` because `md` cannot hold the label the pill
was sized around.** At 768 the content column is 672, so two pills are 326 wide
and 278 inside their padding against a longest label of 369px — the reason grid
shipped with one pill in two lines and its row 84px tall rather than 56. That is
the one thing on this page that was wrong rather than merely undrawn.

| Viewport | Column | Cols | Pill | Inside | Type | Longest label |
| -------: | -----: | ---: | ---: | -----: | ---: | ------------: |
|      320 |    256 |    1 |  256 |    208 |   16 | 246 → 2 lines |
|      375 |    311 |    1 |  311 |    263 |   16 |           246 |
|      640 |    544 |    1 |  440 |    392 |   16 |           246 |
|     1024 |    752 |    2 |  366 |    318 |   20 |          ~308 |
|     1280 |   1008 |    2 |  440 |    392 |   24 |           369 |
|     1440 |   1168 |    2 |  440 |    392 |   24 |           369 |

**The pills take three steps where everything else on the page takes one**, and
the reason is that they follow their own width rather than the viewport's: 440 →
366 → 440 is not monotonic, because two pills start sharing a 752px column at
`lg` and only get the drawn 440 back when the block reaches its cap at `xl`. The
base step is then set by the phone rather than by the block, exactly as §2's
`<h1>` rule is — 440px would hold the drawn 24px outright, but 375 gives 263px
inside the padding and only 16 keeps "Reduce monitoring requirement" on one line
there. 320 is past every step on the scale (246 against 208) and wraps.

**The legend takes §2's step at `lg` and needs no cap ramp to follow it.** 700px
is inert below the breakpoint — the 440px fieldset clamps it — and the window
that reproduces the drawn line break scales with the type: 589–809px at the drawn
32 becomes 368–506 at 20, whose midpoint is 437. The block's own 440 lands 3px
off the setting that breaks where the designer did, without anything being chosen
for it. Below `sm` the column is narrower than the window (311 at 375) and the
question sets in three lines; nothing overflows at any width, the longest word
being CONSIDERING at ~137px against a 256px column at 320.

**Submit steps with `max-lg:text-lg`, and the variant is the point.** Nothing
about it is fit: the label computes to a 224 × 56 pill at every width, inside
even the 256px column a 320px phone gives, and `leading-5` is safe for as long as
the label does not wrap, which it never does. What ramps is the +2px this section
measured between this button and the pills beside it — 26 against 24 drawn, 18
against 16 once the pills take their base step.

It is the one `max-*` variant in the app, and it is there because **26px is the
one size on this page the app does not own**: `Button` ships `text-[26px]`, which
is on no scale step. An ascending ramp has to restate its own top, so it could
only end in an arbitrary `text-[26px]` — which the app no longer has anywhere
(item 33) — or in `text-2xl`, rounding the drawn 26 to 24 and dropping the very
2px the step exists to preserve. `max-lg:` emits no rule at or above `lg`, so the
package's value stands untouched where the artboard draws it and only the phone
case is stated. The two survive `twMerge` together because a modifier and a bare
size are different groups to it; that is asserted in `wizard.test.tsx` rather
than assumed, since an unprefixed `text-lg` would have evicted the drawn value
silently. The pill height is unaffected at either size: 2 × 18px of padding plus
the 20px `leading-5` box is 56 both times.

Any other consumer of a package-defaulted size wanting a phone step should reach
for the same device rather than restating the package's value.

`mt-20` and `mt-6` are untouched, per open item 10. Stated here rather than
deferred silently, because 80px is the largest gap in the app: this page is a
form of eight pills in three groups and scrolls on a phone whatever happens to
that gap (~1000px of column at 375), so halving it recovers 4% and buys no
screenful — where on `/wizard-intro` the same question was whether a hero fit at
all.

### Verified in a browser

At 1440 every row lands within 2px of the artboard (pills at y 226/351/511/583
against 227/350/509/581, Submit 671 against 669), all four fills compute to the
sampled values above, every hover and press in the table resolves to the value it
should, the focus ring computes to `solid 3px rgb(13,46,38) @-3px`, and the third
legend breaks where the designer broke it —
which needs `max-w-[700px]` on the legend, the midpoint of the 589–809px window
in which the drawn break survives. At 390 the grid stacks, the document does not
scroll sideways, and wrapped labels stay legible.

That pass predates the responsive one above and covers 1440 and 390 only — both
still land where it says (nothing at or above `xl` moved, and 390 stacked before
and stacks now), but the three widths the ramp actually turns on — 640, 1024 and
1280 — have not been opened. Open item 42.

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

|                     | drawn                                       | shipped                      |
| ------------------- | ------------------------------------------- | ---------------------------- |
| header band         | 44px tall, 8px radius, all four corners     | `min-h-11 rounded-lg`        |
| header type         | 24px, ~24px of ink ascender-to-descender    | `text-xl lg:text-2xl` @ 600  |
| band → panel        | flush, 0px                                  | no margin                    |
| panel inset         | 12px per side                               | `mx-3`                       |
| panel padding       | **not recorded on any artboard**            | `px-4 sm:px-6 lg:px-9`       |
| bullet pitch        | 28px, ink 19px on a line with both extremes | `text-base lg:text-xl` @ 1.4 |
| `<h1>` → first band | 12px                                        | `mt-3`                       |

The **panel padding** row is new, and it is here to say that it is not a
transcription. 36px is what shipped from this page's first commit with nothing
recorded behind it; every other number in the table can be pointed at an export.
That is what made it the one to give in the responsive pass below — and it is
also why nobody noticed for four months that three insets were stacking inside
one 311px column.

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

### The responsive pass of 2026-08-05

The sixth page to get one, and **the first whose correctness item was a measure
rather than a layout**. The five before it had a row that did not fit its column;
this one had a column that did not fit its text.

| Element                | <`lg` | `sm` | `lg`+ |
| ---------------------- | ----: | ---: | ----: |
| `<h1>` (unchanged, §2) |    30 |    — |    48 |
| header band            |    20 |    — |    24 |
| panel padding          |    16 |   24 |    36 |
| bullet body            |    16 |    — |    20 |
| agent caption          |    20 |    — |    20 |
| `ArchBand` title       |    24 |    — |    30 |

#### Three insets stacking in a phone column

`mx-3` (12 a side), the panel's own padding, and `BulletList`'s `pl-6` are each
defensible alone and come to 120px of chrome. Against the 311px column a 375px
phone gave at the time, that left the leaf's clinical copy **191px of measure —
~19 characters a line, and 163 on the nested bullets**. The narrowest measure in
the app, on the page whose whole content is prose a clinician is meant to read.

**The gutter narrowed 32 → 24px hours after this pass** (§11, §12), so every
below-`sm` figure in this subsection moved 16px with it. The defect this pass
fixed would read 207px rather than 191 on today's shell; the shipped numbers are
in the ladder below. Nothing at or above `sm` is affected, and no ramp decision
hinges below it.

The padding is the axis that gives, for the reason the geometry table above now
records: it is the only number in the block with no export behind it. `mx-3` is
drawn _and_ positional — it is where the `border-x` stroke and `last`'s bottom
corners land, so at `mx-0` the panel's sides run flush into the band above it and
the radius sits on the column edge — and `pl-6` is `BulletList`'s app-wide
indent, so moving it for 4px here would land on every chapter.

`px-4 sm:px-6 lg:px-9` is `Popup`'s own `px-4 sm:px-8 lg:px-16` shape (item 25),
and `lg` restores the drawn 36 untouched. Measured, after:

| Viewport | Section | Panel | Padding |  Measure |
| -------: | ------: | ----: | ------: | -------: |
|      320 |     272 |   248 |      16 | **~190** |
|      375 |     327 |   303 |      16 |     ~245 |
|      640 |     544 |   520 |      24 |      446 |
|      768 |     672 |   648 |      24 |      574 |
|     1024 |     816 |   792 |      36 |      694 |
|     1280 |    1072 |  1048 |      36 |      950 |
|     1440 |    1232 |  1208 |      36 |     1110 |

**The two `~` rows are derived, not measured.** Everything from 640 up came out
of the browser (below); 320 and 375 were measured at 174 and 229 against the
32px gutter and are carried forward at +16px each, since the gutter change moves
the column and nothing else. They were not re-rendered — the change was checked
visually rather than instrumented, which is why they wear a tilde where the rest
of this file's numbers do not.

The section is wider than `max-w-content` from `lg` up because this page carries
`lg:-mr-16` — the accordion bleeds into the rail clearance along with the arch
(item 23), which is why the 1024 row reads 816 rather than the 752 §12's ladder
would predict. 320 stays the worst case at ~190px and is recorded rather than
chased: it is roughly where 375 sat before the pass, and §12 records no design
canvas down there to be wrong against.

#### The body is §2's fifth exception page, and the first to land on the floor

The other four transcribe their body at the artboards' 26 and step to 20. This
page is drawn at **20**, so its one step is 16 — the size every education chapter
already ships and the floor open item 9 says there is nothing below.

The argument is `/wizard/scenario`'s: the `<h1>` drops 48 → 30 below `lg` under
§2's app-wide rule while the body sat at its drawn 20, rendering the leaf's
clinical copy at 0.67× its heading on a phone where the artboard draws 0.42×. At
16 it is 0.53×. The measure agrees (~23 characters a line at 375 becomes ~29) but
the padding above is what actually fixed that, so this is proportion rather than
fit.

**`leading-7` had to become `leading-[1.4]` with it.** 28px is absolute; against
a 16px step it renders 1.75, i.e. the step loosening what it was meant to
tighten. 1.4 is the ratio 20/28 already renders at, so one class covers both
steps and the canvas is unchanged — verified, the browser computes 22.4px at 16
and 28px at 20. That is §2's `fviiia-mimetics` lesson taken a second time: a
`leading-*` on the scale does not survive a size ramp, a ratio does.

The header bands take the same step for the ratio rather than for fit — the
longest title, _Considerations for Reducing Treatment Burden and Improving QoL_,
sets in three lines at either size against the 279px the button gets at 375 — so
what the step preserves is the header/body relationship at the drawn 1.2×, which
a flat 24 over a stepped 16 would have taken to 1.5×. `min-h-11` stays a floor at
every width and the band grows: measured 44px from 768 up, 56 at 640, 84 at 375
and **112 at 320**, where that title reaches four lines.

#### The agent caption is the one deliberate non-step

Every other element here steps because the viewport moves something about it.
Nothing about this one moves: the item is `w-40` at every width and fits the
224px a 320px phone leaves inside the row's `px-4`, `PopupButton` is a fixed 65px
`shrink-0` from the package, and the captions are single words that never wrap
and never touch a measure. So there is no fit argument, and no hierarchy argument
either — a caption's neighbour here is a button, not body copy — while 20 already
sits 2px under the drawn 22.

**The cost is visible and is recorded rather than argued away**: at 375 the
captions render 20px bold against a 16px body, so they read as the largest text
in the arch. That is the honest consequence of transcribing a fixed box, and it
is pinned in `therapies.test.tsx` so a later consistency pass cannot take it
silently.

The arch title is untouched for a related reason: `leading-none` is a **ratio**,
so it survives `ArchBand`'s own `text-2xl lg:text-3xl` step intact rather than
needing a second class, and `max-w-215` is inert below `lg` because the arch has
at most 271px of measure at 375. The title sets in five lines there at the same
proportion it sets two in at the canvas.

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

### Verified in a browser — the responsive pass

**All sixteen leaves × both open blocks × seven widths — 112 renders, measured in
Chromium rather than computed.** That makes this the first pass in the series of
six that is not arithmetic (items 36, 39, 41, 42, 43, 44), and the numbers in the
tables above are what came back rather than what was predicted.

**Caveat on the two narrowest widths.** The pass ran against the 32px below-`sm`
gutter, which became 24px the same day. The 640-and-up figures are unaffected;
the 320 and 375 ones are a floor rather than the current value, since the column
grew 16px under them. The header-band heights below are where that shows most —
the 112px four-line band at 320 has ~32px more to set in and very likely reads
three lines now. Not re-rendered; item 45.

- **No horizontal document overflow in any of the 112.** `scrollWidth` equals
  `innerWidth` at 320, 375, 640, 768, 1024, 1280 and 1440 on every leaf in both
  states.
- **Every ramp resolves where it should**: `<h1>` 30 → 48, header 20 → 24, body
  16/22.4 → 20/28, padding 16 → 24 → 36, caption a flat 20 at all seven.
- **Header bands grow past their floor and never clip**: 44px from 768 up, 56 at
  640, 84 at 375, 112 at 320.
- **The agent row wraps as §15 says above it does**, and the arch clears its own
  wall everywhere. Tightest clearance is **28px** (five agents at 1280) against
  the 16–56 that section records; the row is one-per-line at 320 and 375, 2–3 at
  640–768, 1–2 at 1024, and one line from 1280.
- **One item width was not previously recorded**: at 1280 the five-agent row is
  `xl:flex-nowrap` against 1040px of usable band and 1120px of content, so
  `xl:shrink` takes the items to **144px** — the only width at which they are not
  the drawn 160. Nothing clips, because the absence of `min-w-0` floors an item
  at its own caption.
- **The arch's `mt-auto` pin degrades exactly as that section predicts.** At 1440
  all sixteen leaves put the arch at the same y in both states; at 1280, 13 of 16;
  below that the column overflows and the arch follows the content, which is the
  intended fallback rather than a regression.
- **Every leaf now fits 1440 × 800 with no scroll** — `scrollHeight` is exactly
  800 across all sixteen in both states, where this section previously recorded
  the 8-bullet leaf at 822px. Same result open item 32 records for the chapters,
  and from the same cause: §2's tighter leading, not this pass. Page height runs
  828 at 1280, 1000 at 1024 and 2403 at 320.

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

| element     | value                                                                 | how it was fixed                                                                                                                                                      |
| ----------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<h1>`      | `text-2xl/none sm:text-3xl/none lg:text-4xl/none`, display, uppercase | least squares over all four drawn lines returns size 42 at 0.0234em, residuals ≤1.1px on lines up to 1139px; cap height agrees independently (30px ink / 0.70 = 42.9) |
| bullets     | `text-base/[1.6] lg:text-xl/[1.6]`                                    | rendered widths 655/1110/817/718 vs drawn 651/1106/813/715 — a constant +4, i.e. the indent, not the size                                                             |
| CTA         | `text-base/tight sm:text-xl/tight lg:text-2xl/5`, **sentence case**   | ink measures 24px ascender-to-descender; the drawn label is mixed case                                                                                                |
| caption     | `text-xl leading-5 font-bold text-brand-slate-100`                    | pixel-exact to `/wizard/therapies`; `leading-5` from the 20px baseline pitch of "Efanesoctocog / alfa"                                                                |
| class label | `text-2xl leading-5.5 tracking-wide`, display, uppercase              | 18px cap ink / Barlow Condensed's 0.70 = 25.7 → 26 = `text-2xl`; 22px line pitch off the three-line label                                                             |

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

### The responsive pass of 2026-08-05

The seventh page to get one, the **second to be measured rather than predicted** (after
`/wizard/therapies`, §15), and the first whose sweep found a bug that had shipped with the
page rather than one the pass itself introduced.

| Element       | <`sm` | `sm` | `lg`+ |
| ------------- | ----: | ---: | ----: |
| `<h1>`        |    24 |   30 |    36 |
| bullets       |    16 |    — |    20 |
| CTA           |    16 |   20 |    24 |
| agent caption |    20 |    — |    20 |
| class label   |    24 |    — |    24 |

**The `<h1>` ramps in three steps where §2 prescribes one**, and the sentence is the
argument: at 190 characters it is the longest heading in the app by some distance, and the
app-wide 30px sets it in **10 lines and 300px** of a 320px viewport before the bullets
start. 24 takes that to 240. The shape is `/wizard-intro`'s, whose hero ramps in three for
the same reason (§8); `sm`'s 30 is where every other page already sits below `lg`, so the
deviation is one step at the bottom rather than a different scale.

**Both absolute leadings became ratios**, which is §2's rule taken for the fourth time.
`leading-9` on `text-4xl` and `leading-8` on `text-xl` are ratios of 1.0 and 1.6 at the
canvas, so `/none` and `/[1.6]` change nothing at 1440 — but as absolutes they would have
followed the type down and rendered 1.5 and 2.0 at the smallest step, the step loosening
what it was meant to tighten. 1.0 is safe on a heading that wraps to ten lines because
uppercase Barlow Condensed has no descenders to collide; the drawn pitch is tighter still
(36/42 = 0.857).

**The bullets are this page's one body step and they land on the floor**, 20 → 16, which
makes `/explore` §2's **sixth exception page** and the second (after `/wizard/therapies`)
whose step ends where the education chapters already sit. The argument is proportion: with
the heading at 24 on a phone, 20px bullets read at 0.83× it where the artboard draws 0.52×.
At 16 they read 0.67×, and the list loses ~135px of column at 375.

**The CTA closes open item 33's last case.** `px-8 py-3 text-base/tight sm:px-12 sm:py-3.5
sm:text-xl/tight lg:px-16 lg:py-4.5 lg:text-2xl/5` — `/wizard-intro`'s fix verbatim, since
that CTA is the same package `Button` at the same drawn recipe. The drawn 24px-in-a-20px-box
survives at `lg` alone, where the label cannot wrap; the measured pill is 525.5 × 56 there,
i.e. the drawn 56px height exactly. Below `lg` it is one line at 640–1279 and two at 320/375,
against the four overlapping ones the item recorded.

**Neither the captions nor the class labels step**, which is §15's ruling applied to an
identical composition: nothing about the viewport moves these boxes — the item is a fixed
160px, `PopupButton` a fixed 65px, and neither string touches a page measure — so there is
no fit argument to answer. The cost is that at 320/375 the class labels (24) equal the
`<h1>` (24), which is the honest consequence of ramping a heading down past a fixed box and
is recorded rather than argued away. It is the same shape as §15's 20px-caption-over-16px-body.

#### Three arches become three cards

The user's three asks, all below `xl` and all one decision: **close the bottom edge, mirror
the top padding, and put a gap between them.** At the canvas the segments are cut by the
edge of the artboard, which is a composition and not a rule; stacked, a segment with no
bottom edge is just a shape that stops.

- `rounded-[128px] xl:rounded-b-none` — the same radius the top is drawn at and verified
  against, so the page still has exactly one. At 320 a 272px-wide segment reads as a lozenge,
  which is what mirroring an arch this size onto a phone column looks like.
- `pt-16 pb-16 xl:pb-0` — 64px above the buttons and 64 under the class label. `xl:pb-0`
  because padding against an edge that is not drawn only pushes the labels out of their
  measured row.
- `gap-6 xl:gap-0` — the page's own 24px rhythm, the same `mt-6` that separates heading,
  bullets, CTA and the row. `xl:gap-0` is not tidiness: the three tile the band exactly
  (339 + 524 + 353 = 1216) and any gap breaks the drawn tiling.

**64px is also what clears the curve.** At distance _d_ from a horizontal edge a 128px
radius has opened `128 − √(128² − (128−d)²)`; at d=64 that is **17.15px**, against the 16px
the inner row's `px-4` gives. The box corners therefore sit ~1px inside the arc, and what
saves it is that both the buttons and the wrapped labels are centred well short of their
box. Measured over every ink rect on the page, the worst clearance is **+9.4px** — the
middle segment's `HEMOSTATIC REBALANCING AGENTS`, 83px above its own bottom edge at 320.
Nothing is clipped at any width, but that is the number to re-check if a longer class label
is ever added.

#### `grow` had to become `xl:grow`, and `flex-1` `sm:flex-1`

Two of the same bug, one layer apart, both invisible until the segments had a bottom edge.

**The row.** The segments carry their drawn widths as `flex-grow` factors against a zero
basis — the thing that keeps 339 / 524 / 353 in proportion as the band narrows. Rotate that
into a column and the factors split leftover **height** in the same ratio, so a stacked
segment was as tall as the viewport allowed rather than as tall as its contents, held up
only by each one's automatic minimum. Denying the row its own `grow` below `xl` leaves no
free space to distribute, which makes the factors inert there without touching what they do
at the canvas; `basis-auto xl:basis-0` is the other half.

**The columns.** Only the three segments ever stacked. The right-hand one's two columns
stayed side by side at every width, each `flex-1` of a phone-width segment holding an item
that is `basis-40 shrink-0` and will not give. Measured at 320 before the fix: a **149px
column with a 160px item in it**, the caption painted 44px outside the arch's own
background, and `document.scrollWidth` at **340 against a 320 viewport** — a horizontal
overflow that had shipped since the page landed and that §17's first sweep missed by not
looking below 375. Two columns need 2 × 160 + 32 = 352px of segment, i.e. a 400px viewport,
so they stack below `sm` (`flex-col sm:flex-row`, `gap-y-8 sm:gap-y-0`) and `flex-1` goes
`sm:` only for the row's own reason — stacked, it is a height ratio, and it would force two
columns of one agent each to match on captions that wrap to different depths.

**The fills are unchanged and the reading they carry is not.** `bg-white/60` on the middle
segment and `crimson-50/5` on the flanks make the row read as a range with a peak when the
three are side by side; stacked, that is gone and the white one simply reads as different —
selected, or current. Kept anyway, because both values are drawn (one solved exactly at
α=0.60, one §17's single deliberate substitution) and a fill invented for below `xl` would be
the only value on this page with no artboard behind it. **A designer question, not a defect.**

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

**That last line is why 320 is now in every sweep.** The overflow this page actually had was
at 320, which the pass above did not look at.

### Verified in a browser — the responsive pass

Chromium at seven widths × 900px, measured off the render, after the pass. `<h1>` and
bullet heights are ink boxes; the CTA's line count is its box minus its own `py`, which is
why the pill reads 56px on one line at `lg`.

| Viewport | Band |            `<h1>` |      Bullets | CTA                      | Segments (w × h)          | Gap | Worst arc slack | `scrollWidth` |
| -------: | ---: | ----------------: | -----------: | ------------------------ | ------------------------- | --: | --------------: | ------------: |
|      320 |  272 | 24, 10 lines, 240 | 16/25.6, 307 | 16, 2 lines, 272 × 64    | 272 × 416 / 575 / 544     |  24 |        **+9.4** |           320 |
|      375 |  327 |  24, 7 lines, 168 | 16/25.6, 282 | 16, 2 lines, 327 × 64    | 327 × 416 / 575 / 544     |  24 |           +36.9 |           375 |
|      640 |  544 |  30, 5 lines, 150 | 16/25.6, 179 | 20, 1 line, 427 × 53     | 544 × 279 / 279 / 321     |  24 |           +36.1 |           640 |
|      768 |  672 |  30, 5 lines, 150 | 16/25.6, 128 | 20, 1 line, 427 × 53     | 672 × 279 / 279 / 321     |  24 |           +68.1 |           768 |
|     1024 |  800 |  36, 5 lines, 180 |   20/32, 160 | 24, 1 line, 525 × **56** | 800 × 279 / 279 / 319     |  24 |           +32.6 |          1024 |
|     1280 | 1056 |  36, 3 lines, 108 |   20/32, 160 | 24, 1 line, 525 × **56** | **294.4 / 455.1 / 306.6** |   0 |             n/a |          1280 |
|     1440 | 1216 |  36, 3 lines, 108 |   20/32, 128 | 24, 1 line, 525 × **56** | **339 / 524 / 353**       |   0 |             n/a |          1440 |

- **1440 is the drawn geometry to the pixel and nothing in it moved**: segments at x 112 /
  451 / 975, widths 339 / 524 / 353, the middle 36px above the flanks, all seven buttons on
  one line, four labels on one row, and the heading still in the three lines item 31
  records. Every `lg`-and-above value in the ramp is the value that shipped before the pass.
- **1280 divides the band in the drawn ratio exactly** — 294.4 / 455.1 / 306.6 is
  339 / 524 / 353 × 1056/1216 — which is the flex factors doing the job they were written
  for, at the one width between the canvas and the stack.
- **No horizontal overflow at any of the seven**, including 320, where there was 20px of it
  before this pass.
- The arc clearance is positive everywhere; the binding case is 320, where the middle
  segment's label has 9.4px in hand against its own bottom corner.
- Radii read `128px / 128px` below `xl` and `128px / 0px` at it; padding `64/64` below,
  `52/0` and `88/0` at — the drawn 36 + 52 and 88.
- Document height at 320 is 2376px against 900 of viewport. The page scrolls on a phone and
  is meant to; 1280 and 1440 fit in 900 with nothing cut.

**One prediction the render corrected.** The `<h1>` at 320 was estimated at ~8 lines from
~87.6em of ink over a 272px column and renders **10** — line-breaking wastes ~20% of a
narrow column on short trailing words, which the arithmetic does not model. 375 was
predicted at 7 and renders 7, so the estimate is only wrong where the column is narrowest.
Every other figure in the pass landed where it was predicted, including the CTA's two lines
at 375 (264px of ink in a 263px box, i.e. it wrapped by 1px as expected).

### Open: two carried forward, and three the pass added

The label tracking fits at 0.036em and ships at `tracking-wide` (0.025em) — open item 26.
`Popup` is too narrow for the nine-column table it will hold — open item 27, since **half
closed**: the card now takes `width="wide"` (1360px, ~136px a column) and what is left is
the scroll region the grid needs on a phone, not the card. See §13's width scale.

---

## 18. `/wizard/scenario` — the classes-to-consider screen

`src/routes/wizard/Scenario.tsx`, from **four** 1440 × 800 artboards rather than one:
the screen is `CLASSES_TO_CONSIDER[scenario]` end to end, so type, inhibitor status and
box count all vary and the four drawings disagree with each other in ways a template
would have flattened. Its geometry is documented at the call site — the boxes' size, the
`mt-40`, the caption's two positions — and only the responsive pass is recorded here,
which is the first thing about this screen that is one decision across all four.

### The responsive pass of 2026-08-04

Two ramps: **the box row's gap, which was wrong, and the prose, which was merely
undrawn.**

| Element                | <`lg` | `lg`+ |
| ---------------------- | ----: | ----: |
| `<h1>` (unchanged, §2) |    30 |    48 |
| lead                   |    20 |    24 |
| class list             |    20 |    24 |
| caveat (`B-with` only) |    20 |    24 |
| boxes caption          |    20 |    24 |

**1. The gap ramps; the boxes never do.** This is `rebalancing-agents`' row, on the same
pixel, failing the same way (§11) — the two screens draw the same reserved placeholder,
so they were always going to need the same fix. `lg:gap-x-30` put the drawn 120px gap
into the column that had just lost 175px to the gutter step (§12), so the pixel that
turned the row on was the pixel that made it too wide: 3 × 227 + 2 × 120 = **921**
against a 752px column. `lg:shrink` then took the difference out of the only axis
allowed to give, and the boxes rendered **171 × 185** — a quarter under drawn, and
portrait where all four artboards draw landscape.

The drawn gap moves to `xl`, where the drawn 921 group fits (1008px of column, 87 to
spare), and **at `lg` the row keeps the 32px the stack above it already states**:
3 × 227 + 2 × 32 = 745 in 752. So the middle step is a class this block does not have to
write. `rebalancing-agents` derived its own middle gap to fill the `lg` column exactly
and open item 39 records that zero slack as the weakest number in that pass; here the
largest gap that fits is 35.5px — off the scale, and 35 would leave one pixel — so
taking the stack's 32 is the same move with seven pixels in it.

| Viewport | Content column | Layout | Gap |             Box |
| -------- | -------------: | ------ | --: | --------------: |
| 375      |            311 | column |  32 |       227 × 185 |
| 768      |            672 | column |  32 |       227 × 185 |
| 1024     |            752 | row    |  32 |       227 × 185 |
| 1280     |           1008 | row    | 120 |       227 × 185 |
| 1440     |           1168 | row    | 120 | 227 × 185 drawn |

`lg:shrink` stays and is now a guard rather than the shipped behaviour: no width reaches
the row with a group wider than its column, so nothing shrinks unless the gutter, the
border width or `--spacing` moves underneath it. The `shrink-0` / `lg:shrink` split
itself is unchanged — §15 already cites it as this screen's idiom.

**2. Below `lg` the boxes stack, at the same size.** Three 185px boxes and two 32px gaps
is **619px of empty bordered rectangle** under a caption telling the reader to click
them, which is about a screenful of a 375 × 667 phone. It is `rebalancing-agents`' 640px
cost taken again, with its argument: a reserved box exists to hold the drawn size, and a
smaller one reserves the wrong thing. Bounded by open item 16, not by this pass — what a
box opens is what decides how much of a phone it deserves. On this screen it is also
bounded by the data: `B-with` draws one box and `A-with` two, so only half the branches
pay the full 619.

**3. The prose takes §2's one step down, and this screen is the third case of that
section's body-copy exception** — the other two being `rebalancing-agents` and
`prophylaxis-guidance`. The four artboards set lead, class list and caveat at the
chapters' own 26px (open item 9), so there is exactly one step to give and 20 is a step
rather than a collapse onto the other chapters' 16.

The argument is proportion, not fit: nothing overflows at either size at any width, and
the longest string on the screen is `B-with`'s 155-character caveat, which wraps as
prose does. What moves is the relationship to the heading — the `<h1>` drops 48 → 30
below `lg` under §2's app-wide rule while the prose sat at 24, rendering body at 0.8× the
heading on a phone where the artboard draws 0.5×. At 20 it is 0.67×. The comfort grade of
§2's argument, as on `prophylaxis-guidance`, not the correctness grade the `<h1>` itself
has.

The caption lands on `text-xl lg:text-2xl`, which is what `rebalancing-agents`' boxes
caption and all four chapters' disclosure captions already take, so **every caption in
the app now agrees on size as well as on colour** (open item 15 is about the value, not
the ramp).

**4. `mt-40` does not ramp**, and at 160px it is the largest gap in the app, so it is
stated rather than deferred to open item 10. At 375 this screen is ~1250px of column
against a 667px viewport — the box block alone is 619 of it — so it scrolls whatever
happens to that gap; halving it recovers 6% and buys no screenful. The same call §14
records for `/wizard`'s `mt-20`, and the opposite of the one `/wizard-intro` faced, where
the question was whether a hero fit at all. `mt-8` after the `<h1>` is §11's chapter gap
and moves with it, not with this page.

### Not verified in a browser

Nothing on this screen has been opened at any width, before this pass or in it — the
`<h1>` was covered by the §2 migration's 1440/375 sweep (open item 30) and nothing else
here was. Open item 43.

---

## 19. Above the canvas — the board scales, it does not reflow

Every artboard in this document is **1440 × 800**. Below it, ten routes were made
responsive one at a time (§11, §14, §17, §18) because a phone needs a different
layout. Above it, nothing had ever been decided: `max-w-content` capped the column
at 1168px and centred it, so a 2560px monitor showed the same island with 672/720px
of air either side. The top breakpoint in the whole app was `xl`; there was no
`2xl:` anywhere.

The rule added on 2026-08-05 is that above 1440 the drawing **scales**. Two media
queries at the foot of `tokens.css` step the root font size:

| Viewport                      | root   | factor | board       |
| ----------------------------- | ------ | -----: | ----------- |
| 1441–1799 (any height)        | 16px   |  1.00× | 1440 × 800  |
| ≥1800 wide **and** ≥900 tall  | 112.5% | 1.125× | 1620 × 900  |
| ≥2160 wide **and** ≥1000 tall | 125%   |  1.25× | 1800 × 1000 |

### Why scaling rather than widening

The alternative was to raise `--container-content` at a `2xl` step and let the
column grow. Three things ruled it out.

The measure is the first. 1168px is already at the top of a comfortable line
length; widening it makes the prose worse, not better. **Scaling does not touch
the measure** — the column grows to 1460px at 1.25× but the type grows with it, so
the line length in _characters_ is exactly what the artboard drew. That is a
property no reflow option can offer.

The second is the transcription. Every fixed track in this document — §11's 470px
figure, `treatment-landscape`'s three columns, §13's three-width pop-up scale,
§17's arch band — was measured off a 1440 canvas. Widening reopens all of them,
one route at a time, with no artboard to appeal to. Scaling reopens none: every
ratio in the drawing survives because every number moves together.

The third is that there is nothing to transcribe. No canvas exists above 1440, so
this is invented, and §12's rule for invented values applies pointed upward —
which is why the four numbers in the table above are plain values in a media query
rather than tokens. Naming them would claim an authority they do not have.

### Why the cap is 1.25× and not "fill the screen"

Filling 2560 means 1.78×, and that is the wrong size for the hardware. A 14"
laptop is ~127 CSS ppi; a 27" QHD is ~109 and a 32" is ~92. A big monitor already
has **physically larger pixels** than the canvas was drawn against — 16px body
text is 0.126″ on the laptop and 0.147″ on the 27" before any scaling at all.

Correcting for viewing distance (~50cm laptop, ~65cm monitor), against the laptop
as the reference:

| factor | physical on a 27" | angular vs. reference |
| -----: | ----------------: | --------------------: |
|  1.00× |            0.147″ |                 0.87× |
|  1.25× |            0.184″ |                 1.09× |
|  1.50× |            0.220″ |                 1.31× |
|  1.78× |            0.262″ |                 1.55× |

1.25× lands closest to parity. 1.78× is presentation sizing, and this is
self-paced CME — a solo reading activity at a desk.

**Presentation is not handled here, deliberately.** ⌘+ is full page zoom, it
scales a rem design perfectly (including the borders and shadows this rule leaves
alone), and it is the presenter's call rather than something guessed from a
viewport width. Adding a "presentation" step would also have been keyed to the
wrong number: 2560 CSS px is where Apple's 5K desk displays live (DPR 2) and where
27–32" QHD panels live (DPR 1), while actual projectors and meeting-room screens
are 1080p and report **1920**. A jump at 2560 would hit the iMac and miss the
projector.

### Why 1441–1799 is a deliberate dead band

That range is 1512 and 1728 — the default logical widths of 14" and 16" MacBook
Pros, at ~127 CSS ppi, which is the density the design was drawn at. They are the
reference, not a screen with room to spare. The most a page loses there is 144px
of air a side, which is the same character as the 1440 canvas itself.

### The steps are gated on height as well as width

A width-only step can take a page that fits and make it scroll **because the
screen got wider**. A 2560 × 1080 ultrawide is the case that proves it: it clears
2160 on width, and at 1.25× the tallest chapter would need 985px against a ~975px
viewport. With the height gate it takes the 1.125× step instead and still fits.

Each threshold is the tallest route at that step, rounded up to the next 100.
Measured in Chromium at 1440 × 800 on 2026-08-05, with `main`'s `min-h-dvh`
neutralised so the floor did not mask the natural height:

| route                             | 1.00× | 1.125× | 1.25× |
| --------------------------------- | ----: | -----: | ----: |
| `/education/disease-background`   |   788 |    887 |   985 |
| `/education/treatment-landscape`  |   729 |    821 |   912 |
| `/education/rebalancing-agents`   |   727 |    818 |   909 |
| `/wizard`                         |   724 |    815 |   905 |
| `/explore`                        |   723 |    814 |   904 |
| `/education/fviiia-mimetics`      |   705 |    794 |   882 |
| `/`                               |   413 |    465 |   517 |
| `/wizard-intro`                   |   361 |    407 |   452 |
| `/education/prophylaxis-guidance` |   282 |    318 |   353 |

887 → **900** and 985 → **1000**. Those multiples are exact rather than estimated:
the board scales proportionally, so line counts are preserved and height scales
with the factor.

Two notes on that table. **§11's long-standing "818px" for `disease-background` was
stale** — the 2026-08-04 pass that moved its split to `xl` took 30px out and nobody
re-measured; it is 788. And the five placeholder routes (`/resources`,
`/references`, `/glossary`, `/acronyms`, `/survey`) are 94px of bare padding today,
so they are not in the table. **Re-measure when issues 12/13 land** — the ~40-citation
bibliography in particular will exceed one screen at every factor, and a page that
scrolls anyway is not what this gate protects.

Rounding to 900 rather than a tidier 950 matters: a 1920 × 1080 desktop with a
bookmarks bar has a ~920px viewport, and 950 would have locked the single most
common desktop configuration out of scaling despite it having 33px to spare.

### What the breakpoints do NOT do

They do not move. Inside a media query `rem` resolves against the **initial** font
size (16px), not the root element's, so stepping the root leaves `64rem` in §5 and
every `sm:`/`lg:`/`xl:` utility exactly where they were. The Sidebar's JS
`matchMedia` is safe for a different reason — it builds `(min-width: ${px}px)` from
a hardcoded 1024 and never reads a font size. The desync §5 warns about does not
get worse.

`%` rather than `px` on the root so a user's own browser font-size preference stays
multiplied in rather than being overridden.

### The px that had to move, and why a grep did not find them

Four sets of fixed pixels defeated the whole premise, and **only the browser
caught them** — none is a plain `something-[123px]`, so no grep of class names
reaches them. Three hide inside compound arbitrary values; the fourth is not a
class at all:

| Where                       | Was                                                | Now                                 |
| --------------------------- | -------------------------------------------------- | ----------------------------------- |
| `Popup` (§13, three widths) | `w-[min(860px,92vw)]` / `1140px` / `1360px`        | `53.75rem` / `71.25rem` / `85rem`   |
| `DiseaseBackground` (§11)   | `xl:grid-cols-[1fr_470px]`                         | `xl:grid-cols-[1fr_29.375rem]`      |
| `TreatmentLandscape` (§11)  | `sm:grid-cols-[200px_1fr]`, `xl:[1fr_200px_300px]` | `12.5rem`, `[1fr_12.5rem_18.75rem]` |
| `PopupFigure` (§13)         | inline `maxWidth: min(${width}px, 100%)`           | `min(${width / 16}rem, 100%)`       |

**The fourth was found by a question, not by a tool**, and it is the reason the
other three are worth stating as a class: an inline `style` object is invisible to
every search that looks like a Tailwind class. `PopupFigure` caps each figure at
its drawn width on purpose — §13's assets are stored at 2× and no wider, so the cap
is what stops a raster upscaling past its own pixels. In `px` that cap pinned the
picture while the card around it grew: at 2560 × 1330 `disease-background`'s two
figures held **720px inside a 1413px body**, 15% and 19% under the drawing's own
proportion, while the other five pop-up figures scaled at exactly 1.250 because
their height cap or container bound first. In `rem` the cap is 900px at 1.25× —
still 1.6× oversampled against the 1440 stored on a DPR-1 panel, and the 2×
guarantee is what open item 47 now records as given up on retina ones.

The pop-up was the one that showed itself. Measured at 2560 × 1330 before the fix,
the card stayed **1140px wide while its type grew 1.25×** — the body rewrapped
inside a card that had not grown with it, and because §13 caps the card at
`max-h-[95dvh]` with an internal scroll region, the symptom was a cramped, scrolling
body rather than an obviously broken card. The fixed grid tracks are the same fault
in a quieter form: the `1fr` prose column grew, the 470px figure did not, and §11's
drawn composition drifted at every step.

After the fix, verified at 2560 × 1330 against the canvas — every ratio holds:

| thing                        |      canvas | 2560 (1.25×) |
| ---------------------------- | ----------: | -----------: |
| `Popup` default card         |      1140px |       1425px |
| `Popup` radius / border      |      40 / 5 |       50 / 6 |
| `disease-background` tracks  |     666/470 |  832.5/587.5 |
| `treatment-landscape` tracks | 620/200/300 |  775/250/375 |
| `PopupFigure` cap            |       720px |        900px |

The figure row reads differently from the others and it is not a fault: those two
figures render at **711 and 675** on the canvas, i.e. _below_ their 720 cap, because
`max-height: calc(95dvh - reserve)` binds first on an 800px-tall viewport. At
2560 × 1330 the height budget grows 1.77× (`dvh` is viewport-relative and does not
scale, while `reserve` does), so the width cap becomes the binding constraint and
both reach it. Rendered widths therefore move 711 → 900 and 675 → 900 — ratios of
1.27 and 1.33 rather than 1.25, which is the figure finally getting the room the
drawing gives it rather than anything scaling twice.

The `vw` half of each pop-up width stays viewport-relative on purpose: it is the
small-screen clamp, it must not move when the root does, and below the canvas it is
what bites anyway.

### What scales, and what deliberately does not

Everything the shell is built from was already rem — Tailwind's spacing and type
scales, and all five §12 tokens — so the geometry table moves in proportion for
free. Verified in Chromium: the column runs 1168 → 1314 → 1460 and `main`'s
padding 112/160 → 126/180 → 140/200, which is exactly ×1.125 and ×1.25.

**Radii and the pop-up's border were converted to rem** (2026-08-05), because a
radius is _shape_: holding a fixed 40px corner while the card grows 1.25× changes
the drawing rather than merely softening it, and §17 records the arch radius as
"verified, not asserted". Eight values on five lines — `Popup`'s `rounded-[2.5rem]`
and `border-[0.3125rem]`, `ArchBand`'s `9.375rem`/`18.75rem`, `Explore`'s `8rem`,
`FviiiaMimetics`' `3.75rem`/`7.3125rem`, and `Scenario`'s box moved onto the spacing
scale as `h-46.25 max-w-56.75`. Every one is the same number of pixels at a 16px
root, which is why the canvas did not move.

**Every drawn border scales too**, on the same shape argument, and this took two
passes to get right. The first named only `Popup`'s 5px edge; `border-4` turned out
to have three more source sites — `ArchBand`'s white top rule and the artwork
placeholder boxes on `rebalancing-agents`, `treatment-landscape` and `scenario`.
All four are now `border-[0.25rem]` / `border-t-[0.25rem]`, measured at 4px on the
canvas and 5px at 1.25×.

**`border-[0.25rem]` is not `border-4`, and an editor will tell you it is.** The
Tailwind language server offers `suggestCanonicalClasses` on every one of these,
because at a 16px root they compute the same. They are not the same: the numeric
utility is **px** and pins the edge while the object it outlines grows. Accepting
that suggestion silently reverts this. Each of the four call sites carries a comment
saying so, because the warning is what a future reader sees first.

**Shadows, hairlines and focus rings stay px, on purpose.** A root font-size step is
text-and-spacing zoom, not page zoom; leaving those fixed is the definition of that
mode rather than an oversight. It also keeps this rule clear of §13's and §15's
reverse-engineered shadow geometry — §15 argues at length that its `1px 2px 4px`
is one scale factor read off an export, and re-expressing that as `0.0625rem` would
make the provenance prose worse. Tailwind inlines `--shadow-*` at build time (§1),
which is the layer where mistakes are silent; it is the last place to make a
speculative edit.

### Verified in a browser

Chromium, 2026-08-05, ten viewport sizes against `/education/disease-background`.
Every root size landed as designed and nothing scrolled at any of them:

| viewport    | root | column | padding | what it is                    |
| ----------- | ---: | -----: | ------- | ----------------------------- |
| 1440 × 800  | 16px |   1168 | 112/160 | the canvas                    |
| 1512 × 850  | 16px |   1168 | 112/160 | 16" MBP, inside the dead band |
| 1799 × 1000 | 16px |   1168 | 112/160 | one px under step 1           |
| 1800 × 900  | 18px |   1314 | 126/180 | step 1 exactly                |
| 1920 × 975  | 18px |   1314 | 126/180 | 1920 × 1080 desktop           |
| 1920 × 920  | 18px |   1314 | 126/180 | …with a bookmarks bar         |
| 2160 × 1000 | 20px |   1460 | 140/200 | step 2 exactly                |
| 2560 × 1330 | 20px |   1460 | 140/200 | 2560 × 1440 QHD / 5K          |
| 2560 × 975  | 18px |   1314 | 126/180 | ultrawide — the height gate   |
| 2560 × 860  | 16px |   1168 | 112/160 | very wide, very short         |

**1440 is pixel-identical, and that was proved rather than asserted.** All nine
built routes were screenshotted at 1440 × 800 with the change applied, then again
with it `git stash`ed, and every pair is **byte-identical**. A control at 1920 × 975
confirms the method is not vacuous: stashed reports `root=16px` there, applied
reports `18px`, so HMR does pick the stash up and the identity at the canvas is a
real result.

Open items 47–49 record what this pass did not settle.
