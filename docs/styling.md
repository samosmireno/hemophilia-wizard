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
of the bar and the rail rather than behind them — which does mean it sits left of
true viewport centre at ≥1024px, optically clearing the rail. That offset is
~25px since §11 widened the shell's gutters to 112/163 (it was ~48px under the
old `p-4 lg:pr-24`). The hero itself does not move: `max-w-280` is 1120px, still
narrower than the 1165px content column, so it stays centred within it.

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
| 9   | The references do not agree with the §2 scale **or with each other**: `disease-background` measures ~32px sub-headings, ~18px body and ~22px captions against the scale's 26/16/20, while `rebalancing-agents` measures ~24px body and ~25px captions. **The three chapters now answer it differently** — the first two render at the scale, `rebalancing-agents` transcribes a raw `text-[26px]` (§11). Needs the designer's sizes, then one call applied to all three.                               | §11                   |
| 10  | The chapter is specified to fit one screen and currently does not (818px at 1440×800). Wants one rule across all four chapters rather than per-page constants.                                                                                                                                                                                                                                                                                                                                         | §11                   |
| 11  | Four of the eight vertical gaps are ink-to-ink measurements off the reference PNG rather than the designer's box gaps, so they render slightly loose.                                                                                                                                                                                                                                                                                                                                                  | §11                   |
| 12  | The pop-up export has **no scrim** — nothing dims the page behind a dialog that traps focus. The shipped `rgb(0 0 0 / .5)` is inferred, like §4.3's tooltip and §4.5's sidebar. The card's own 55%-black shadow was drawn against Figma's dark canvas and does much less work over the light `bg-page`.                                                                                                                                                                                                | §13                   |
| 13  | The pop-up title is 45.47px, off the §2 scale, and ships as a raw value under §8's precedent. Same open question as item 9 — if the designer's sizes arrive for the chapters, this wants deciding with them rather than separately.                                                                                                                                                                                                                                                                    | §13                   |
| 14  | `--color-agent-mab` (`#003d93`) is a sixth hue: it derives from no brand ramp, and the nearest steps are a different colour rather than a different step. Transcribed verbatim pending a designer answer on whether the agent classes are meant to be brand colours at all. Its pair, `--color-agent-sirna`, is `crimson-50` exactly.                                                                                                                                                                  | §11                   |
| 15  | The artboards disagree on the disclosure-caption colour: `#074655` on the first two, `lagoon-75` (`#076278`) on `rebalancing-agents`. All three chapters use `--color-popup-caption`, the first value, pending a designer answer.                                                                                                                                                                                                                                                                      | §11                   |
| 16  | `rebalancing-agents` draws three figure boxes under a caption telling the reader to click them, but §7.7 names no target for any of the three and the export draws "PLACEHOLDER" in all of them. Needs the designer to say what a box opens.                                                                                                                                                                                                                                                           | §11                   |

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
layer is where it becomes `text-body` / `text-heading`.

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

The chapter uses the §2 scale — `text-h1` for the title, `text-h2` for the severity
heading, `text-h3` for the sub-headings, `text-body` for bullets, `text-h4` for
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
`disease-background` by instruction — `text-h1` title, `text-h2` sub-headings,
`text-body` bullets, `text-h3` captions, all with the same tracking — so open item 9
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
(`leading-none`), which is the designer's own inspector value. The `text-h4`/`text-h3`
steps are 20 and 26 but carry weight 600, so all five are raw under §8's precedent.

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

So the bullets ship at a raw `text-[26px]` over `BulletList`'s `text-body` base, and
the three agents at `font-semibold` under it. 26 is the measurement rounded to the
`text-h3` step's size, taken raw rather than as `text-h3` because that step carries
weight 600 where the prose is drawn at 400 — §8's precedent, the same call the
treatment-options table makes for all five of its sizes. The captions need no such
value: they are `text-h3` outright, and 26 against the drawn 25 is inside the
measurement.

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
"PLACEHOLDER" in them, so the designer has not placed them either), and the `+` opens
nothing. The caption above the boxes therefore instructs a click that does nothing —
it ships as drawn because this pass is the layout, and what a box opens is a question
§7.7 does not answer.

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

| Part            | Design                                    | Shipped                              |
| --------------- | ----------------------------------------- | ------------------------------------ |
| Card            | 1066 × 645                                | `w-[min(1066px,92vw)] max-h-[85dvh]` |
| Radius / border | 40.417px / 5.052px `crimson-50`           | verbatim                             |
| Shadow          | `0 22.735px 50.142px 5.052px` black @ 55% | `--shadow-popup`                     |
| Band padding    | 12px top and bottom                       | `py-3`                               |
| ✕ inset         | 22px from the card's right edge, centred  | verbatim                             |
| Body gutters    | 64px sides, 32px under the band           | `px-16 py-8`                         |

**The band is content-height, not 118px.** The text node measures y=15, h=94
inside a band running y=3–121, so 12 + (2 × 46.73) + 12 = 117.5 ≈ the 118px the
band renders at. Shipping the padding rather than the height is what lets a
title that wraps to three lines on a phone grow the band instead of being
clipped by it.

**The border is a plain CSS border and the band sits inside it.** In Figma the
band overhangs the card and is clipped; here `overflow-hidden` clips it to the
padding box instead. Band and border are the same `crimson-50`, so the top edge
reads as one mass either way.

### The title

45.469px / 46.732 leading / +1.3136px tracking, Barlow Condensed Bold, uppercase.
The §2 scale has no step there — `text-h1` at 52px is 13% larger and wraps the
title to three lines inside a band drawn for two — so this transcribes raw
values under §8's precedent, expressed relative so they survive the clamp:

```
text-[clamp(1.375rem,3.157vw,2.842rem)]   /* 45.47px at 1440 */
leading-[1.0278]                          /* = 46.732 / 45.469 */
tracking-[0.0289em]                       /* = 1.3136 / 45.469 */
```

The horizontal padding is `clamp(5.5rem,7vw,6.25rem)` — 100px at 1440, floored
at 88px, which is the ✕'s own 65px plus its 22px inset. Symmetric, so the title
stays centred on the card rather than in the space left beside the button.

**Deviation, deliberate:** the design's title box is 713.6px wide starting at
x=156, i.e. its centre sits **20.19px left of the card's**. That is a hand-drag,
not a rule — 1.9% of the card width — and replicating an asymmetric nudge would
make it look intentional. Centred instead.

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

### The height floor

The design draws 645px, and the card's height is otherwise its content's — which
left the one popup with content today (a single bullet) rendering 193px, reading
as a bar rather than the drawn card, with the body gradient showing only its warm
centre. So the card carries a floor as well as the `85dvh` cap:

```
min-h-[min(520px,85dvh)]   max-h-[85dvh]
```

520px is a chosen number, not a transcribed one — it is short of the drawn 645px
deliberately, so a popup whose content genuinely is brief does not open a screen
of empty gradient.

**The floor is guarded by the cap, and must stay that way.** `min-height` beats
`max-height` in CSS, so a bare `min-h-[520px]` would push the card past `85dvh`
on any viewport shorter than ~612px — a phone in landscape — and overflow it off
screen with no way to scroll back. Written as `min(520px, 85dvh)` the two cannot
disagree.

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

2x covers retina and stops there. The three that needed it were shipped at their
designer-export resolution — 2868×2492, 2988×1591, 1894×1084 — which is 4–6x the
drawn size, i.e. 16–36x the pixels to decode for no visible gain. Re-encoded at
q82, which is indistinguishable from the source at display scale on this line art
(checked at 3x zoom on the cascade's smallest labels) and takes the three from
384K to 246K.

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
