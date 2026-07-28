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

The type scale bundles size + weight + line-height per step, so a single utility
(`text-h1`, `text-body`, …) sets all three.

| Step    | Size | Weight | Line-height |
| ------- | ---- | ------ | ----------- |
| `h1`    | 52px | 700    | 1.05        |
| `h2`    | 36px | 700    | 1.1         |
| `h3`    | 26px | 600    | 1.2         |
| `h4`    | 20px | 600    | 1.25        |
| `body`  | 16px | 400    | 1.6         |
| `small` | 12px | 500    | 19.8px      |

Line-heights for `h1`–`h4` and `body` are house defaults. `small` is taken
verbatim from the source spec (12px / 500 / 19.8px), which is why it is the one
absolute value in the column.

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

---

## 8. Landing hero type

The hero on `/` is the one place in the app whose type sits **outside** the
`text-h1`…`text-small` scale of §2. The design specifies 60 / 128 / 36 / 24px,
and the scale tops out at 52px.

Those four numbers are Tailwind's own default steps exactly (`text-6xl`,
`text-9xl`, `text-4xl`, `text-2xl`), which is a strong hint that the designer
authored against them. Adding three `@theme` steps with a single consumer each
would be generalising from one usage, so the hero uses the raw values and this
section is where they are written down instead.

| Line                 | Design      | Shipped                           |
| -------------------- | ----------- | --------------------------------- |
| `HM-85L`             | 60px / 400  | `clamp(1.5rem, 4.2vw, 3.75rem)`   |
| `The Future Is Now:` | 128px / 700 | `clamp(2.5rem, 9vw, 8rem)`        |
| `Personalizing …`    | 36px / 400  | `clamp(1.125rem, 2.5vw, 2.25rem)` |
| `LET’S GET STARTED`  | 24px / 600  | `clamp(1rem, 1.7vw, 1.5rem)`      |

### Why `clamp()` and not breakpoints

At a fixed 128px, `The Future Is Now:` is ~1000px wide — wider than any phone,
and below 1024px the sidebar is a bottom bar, so mobile is a real case here. Each
`vw` slope above is set so the size reaches the design's exact value at ~1440px
and stops; the floors are what the narrowest common viewport (320px, minus the
shell's padding) can hold without wrapping the headline. A hero is a single
composition, so the three lines have to keep their relative sizes at every
width — a breakpoint ramp steps all three at once and looks broken between
stops.

**The headline's leading is a ratio, not a length.** The design gives 96px on
128px type; shipped as `leading-[0.75]` (= 96/128), because a fixed 96px line box
is meaningless the moment `clamp()` moves the size.

### The 400 weight

The eyebrow and subtitle are `font-normal`, and Barlow Condensed was previously
imported at 600/700 only — the two lines would have rendered as a
browser-synthesized regular. `src/main.tsx` now also imports
`@fontsource/barlow-condensed/latin-400.css` (+21 kB woff2).

### The CTA override

mlg `Button` is a single fixed scale by design — `px-16 py-[18px] text-[26px]`,
no breakpoints, matching the other atoms in the package. At the design's 24px
label that is ~370px wide, i.e. wider than a 375px phone once the shell's padding
comes off, and it would sit unchanged under a headline that scales. So the CTA
gets the same `clamp()` treatment as the type above it:

```
px-[clamp(2rem,4.4vw,4rem)] py-[clamp(0.75rem,1.25vw,1.125rem)] text-[clamp(1rem,1.7vw,1.5rem)]
```

Each stop lands on the design at ~1440px (64px / 18px / 24px) and holds there.
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
of the bar and the rail rather than behind them — which does mean it sits ~48px
left of true viewport centre at ≥1024px, optically clearing the rail.

---

## 9. Open items

| #   | Item                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Where                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| 1   | `PopupButton` fails the 3:1 non-text threshold in **every** state it specifies (2.17:1 default, 1.83:1 hover, 2.49:1 press/open, 2.66:1 open hover). This is **not** a mapping error — the mapping is exact. `lagoon-25` is a light step (lum .435) being used as a saturated ground under a white glyph; every other component in the library uses its scale's `-50` step for that job. The one-token fix, if the designer wants it, is `--color-ui-popup-bg: var(--color-brand-lagoon-50)` → 3.58:1. | issue 03, RAISED 1    |
| 2   | Focus rings drawn without `outline-offset` (`NavBarButton`, `PopupButton` open skin) or with a positive offset (`NavArrowButton`, `PopupButton` closed skin) land on the page ground, so their contrast depends on a surface the component does not own. Currently resolved for the bar by §5; any new dark surface reopens it.                                                                                                                                                                        | issues 00, 02, 03     |
| 3   | The palette has no step brighter than `crimson-50` and no saturated near-white; two literals stand in.                                                                                                                                                                                                                                                                                                                                                                                                 | §3, issue 01          |
| 4   | `--color-ui-navbar-bg-current` / `-fg-current` deliberately unset; current-page state is signalled with `disabled` instead.                                                                                                                                                                                                                                                                                                                                                                            | debt 2, issue 06      |
| 5   | `NavBarButton`'s tooltip colours are inferred — no export was ever supplied.                                                                                                                                                                                                                                                                                                                                                                                                                           | issue 02              |
| 6   | No semantic layer yet. `bg-surface`, `text-heading`, etc. do not exist; the app reads raw brand steps in the meantime.                                                                                                                                                                                                                                                                                                                                                                                 | app-buildout issue 02 |
| 7   | The inner gradient's second stop is off-scale (`rgba(114.61, 213.07, 191.53)`, dE .042 from `teal-25`) while the other three stops are exact palette. Probably meant to be `teal-25`; kept literal pending a designer answer.                                                                                                                                                                                                                                                                          | §6                    |
| 8   | The landing footage does not loop — it is a continuous dolly-in, 46.5/255 apart end to end. Ping-ponging it is a workaround; **ask the designer for an 8–12 s clip that loops cleanly**. That would halve the asset and remove the direction reversal.                                                                                                                                                                                                                                                 | §7, ADR 0002          |
