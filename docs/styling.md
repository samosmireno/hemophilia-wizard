# Styling & design tokens

Companion to `src/styles/tokens.css`: that file is the machine-readable token set, this file is the
rationale for every value in it. **Keep the two in sync — change a token, change the note here.** A
token with no note was a plain transcription. Related: `.scratch/mlg-reskin/spec.md`,
`.scratch/app-buildout/issues/02-semantic-token-scaffold.md`. **§9 is the authoritative open-items
ledger** — `.scratch` files cross-reference its item numbers. Never renumber a section or an item.

## 1. How the token layer works

Tokens are CSS variables in `@theme`; Tailwind v4 mints utilities from them — the CSS file is the
config. `tokens.css` = raw palette + mlg-components component-layer overrides (components never read
the base ramp directly, so **overrides beat the ramp**); the semantic layer is app-buildout
issue 02, unbuilt. The `@source ".../node_modules/mlg-components/dist"` path is **relative to
`tokens.css`**, not the project root — `@mlg-components/dist` reads as an npm scope, Tailwind
silently scans nothing, and every component renders unstyled with no error. **Shadows must be
declared in `@theme`, never `:root`**: Tailwind inlines `--shadow-*` at build time while colour
utilities compile to a runtime `var()` — the asymmetry that makes §5's media query possible for a
ring colour and impossible for a shadow. `color-mix()` over token stops stays live in the build
under `@supports` (§6), so palette changes still move derived values.

## 2. Typography

DM Sans is the app default; Barlow Condensed the display face (`font-display`); both `@fontsource`.
**No house type scale** (removed 2026-08-04): sizes are Tailwind's own defaults, `tokens.css`
declares no `--text-*`, a step sets size + line-height only, and weight is always at the call site
(preflight resets `h1`–`h6` to `font-weight: inherit`).

| Drawn | Utility     | Renders      | Weight at call site          |
| ----- | ----------- | ------------ | ---------------------------- |
| 52px  | `text-5xl`  | 48px / 1.0   | `font-bold`                  |
| 42px  | `text-4xl`  | 36px / 1.111 | as drawn                     |
| 32px  | `text-3xl`  | 30px / 1.2   | `font-bold`                  |
| 26px  | `text-2xl`  | 24px / 1.333 | `font-semibold`, `font-bold` |
| 24px  | `text-2xl`  | 24px / 1.333 | as drawn                     |
| 22px  | `text-xl`   | 20px / 1.4   | as drawn                     |
| 20px  | `text-xl`   | 20px / 1.4   | `font-semibold`              |
| 16px  | `text-base` | 16px / 1.5   | none                         |
| 14px  | `text-sm`   | 14px / 1.43  | as drawn                     |
| 12px  | `text-xs`   | 12px / 1.333 | `font-medium`                |

**A `leading-*` on the scale does not survive a size ramp; a ratio does** — transcribed absolute
leadings ship as the ratio they rendered at (`leading-tight`, `leading-[1.08]`, `leading-[1.4]`), so
one class covers every step and the canvas is unchanged.

**Every `<h1>` is `text-3xl font-bold … lg:text-5xl`** — one size down below `lg`. Correctness, not
comfort: uppercase Barlow Condensed cannot break a word, and `CHARACTERISTICS` (`/wizard`) is ~329px
at 48px against a 375 viewport's 311px column — a horizontal scrollbar (figures are arithmetic,
measured at 52px and rescaled ×48/52). Sub-headings and captions take the same one-step shape, but
there it is only hierarchy comfort. Body copy mostly does not step — 16px is a legibility floor, and
item 9 has the reference **larger** than shipped. **Six exception pages** are drawn above the floor
on their own artboards: `rebalancing-agents`, `prophylaxis-guidance`, `/wizard/scenario` (drawn
26 → 24, step to 20); `fviii-mimetics` (whole page on one drawn 26); `/wizard/therapies` (drawn 20 —
step lands ON the 16 floor); `/explore` (drawn 22 → 20, step to 16 for proportion). `/explore`'s
190-character `<h1>` ramps three steps (§17), as `/wizard-intro`'s hero does (§8) — the two places
one step is not enough. **Not `clamp()`** — the app contains none; every below-canvas step is an
invented comfort value stated on Tailwind's scale (§12's rule).

## 3. Brand palette

Five families, `--color-brand-<name>-<step>`, 0 → 100 lightest → darkest:

| Family    | Role         | 0         | 25        | 50        | 75        | 100       |
| --------- | ------------ | --------- | --------- | --------- | --------- | --------- |
| `teal`    | primary      | `#eef8f6` | `#7ec5b6` | `#2d8a78` | `#1a5a4c` | `#0d2e26` |
| `crimson` | accent       | `#fef0f2` | `#f4a0ab` | `#d63a52` | `#8f1a2e` | `#4a0a14` |
| `slate`   | neutral cool | `#f2f5f9` | `#9eadc4` | `#5a6f8a` | `#2e4056` | `#111d2e` |
| `lagoon`  | bright blue  | `#e6f7f9` | `#4abfd4` | `#0a94ae` | `#076278` | `#052a32` |
| `sand`    | warm neutral | `#fdf8f2` | `#e0ccb0` | `#b8956a` | `#7a5c38` | `#3a2810` |

**The `-25` pastel trap**: `-25` is a pastel tint (~2.6× the luminance, half the chroma of `-50`);
as a hover it has produced ~1.85:1 failures twice — a "slightly brighter" hover is usually a hue
rotation at constant lightness, derived with `color-mix` off `-50`. **Two provable gaps** (item 3),
shipped as literals: nothing brighter than `crimson-50` (`#f73150`), no saturated near-white
(`#bff5ff`). **The transcribe-vs-derive rule ("§3/§4 rule")**: a sample landing **exactly on a brand
step** is transcribed as that step; an off-scale colour reachable by a `color-mix` of steps within
**dE ≈ .002 OKLab** is **derived** (a palette change still moves it); anything further ships
**verbatim as a literal and is raised as a designer question**, never rounded in — §6's stop at
dE .042 is the canonical "too far", item 19's .0136 the one borderline the rule does not decide.

## 4. mlg-components overrides

All values come from per-state Figma exports via the re-skin spec. Two recurring facts: **Figma
exports lie about the palette** (the "copy as Tailwind" dump emits stock class names; per-pixel
sampling repeatedly lands exactly on a brand step — the tell) and **emerald residue** (the package's
default ramp; anything never repainted carries it through and must not be transcribed — `#1a847e`,
teal-50 rotated ~11°, appears in four components and maps back onto `teal-50` every time). **The
hover/press model** for undrawn states: the ground lifts slightly on hover (magnitude from the
design, derived off `-50`, never `-25`) and pushes **one step darker on press**; focus must never
read as pressed.

**4.1 NavArrowButton — crimson.** `-bg-hover` `color-mix(crimson-50 96%, crimson-25)` (not
`crimson-25` — pastel trap; only the 4% lift transfers); `-fg-hover` `teal-0` exact; `-fg-active`
`#939393` off-palette verbatim; green glows were residue → crimson-75.

**4.2 Button — crimson, teal focus.** Resting/press pairs exact on crimson-50/75; `-bg-hover`
`#f73150` literal (§3 gap). **Focus switches hue family to teal** so it never reads as press;
`-ring` teal-100 (the design's pairing was 2.10:1; an inset ring owes 3:1). `--shadow-ui-btn`
omitted (design = package default); the hover rim rides in the box-shadow as `inset 0 0 0 1px`.

**4.3 NavBarButton — teal, tonally inverted** (white surface, coloured glyph; the "More" trigger
reads the same tokens). Almost all residue — the designer repainted only the hover tint and the
ring, which landed on `teal-100` exactly. `-fg-hover` `color-mix(teal-50 90%, teal-25)` (the
design's glyph lift is residue failing contrast; direction kept, magnitude cut); `-bg-active`
`#d2d5d4` literal (residue and correct answer coincide — no brand neutral grey). **Tooltip
inferred, never exported** (item 5): teal-100. `-bg/fg-current` **deliberately unset** — current
page signalled via `disabled`; needs a Figma answer (item 4, debt 2).

**4.4 PopupButton — lagoon**, two independent skins (open = tonal inversion); closed ground =
`lagoon-25` to three decimals, a full repaint. Four off-scale colours are lagoon desaturated,
**derived** within dE .013 (see `tokens.css`); `-fg-hover` `#bff5ff` literal (§3 gap). The ground
does not move on hover (the glyph dims); `-bg-active` is also the open skin's resting ground —
referenced, not copied, so they cannot drift; `-open-outline-hover` **zeroed, not recoloured** (no
drawn ring — the shadow's edge does the work). Both rings land on the page ground — WCAG 2.4.11
exposure on any dark surface (item 2).

**4.5 Sidebar — teal-100 chrome**, painted only by the bottom bar and its popover; the rail sets no
background. **No export ever arrived, so teal-100 is inferred** — the primary's darkest step, the
direction the spec commits chrome to; clears every contrast check in the bar.
`--spacing-ui-sidebar-gap: 0.5rem` tightens the rail to `gap-2` — spacing is the only thing
grouping the unbackgrounded column.

## 5. Sidebar bottom-bar focus ring (the media query)

`NavBarButton`'s focus outline has no `outline-offset`, so the ring lands on whatever is behind the
button — the page in the rail, the teal-100 bar below `lg`; one token cannot serve both, so **the
ring follows the ground**: ≥64rem teal-100 on the light page, <64rem white on the bar (14.62:1 both
ways), matching `NavArrowButton`'s ring and correct in the popover. Works **only** because colour
utilities compile to a runtime `var()` — a shadow token could not be overridden this way (§1).
`64rem === 1024px === Sidebar`'s `breakpoint` prop default, a JS `matchMedia` the CSS cannot see —
`AppSidebar` leaves the prop unset; a custom value desyncs silently.

## 6. Page backgrounds

Two designer radial gradients, both **alpha** — a layer over the page ground, not the ground:

| Token                             | Route           | Stops                                  |
| --------------------------------- | --------------- | -------------------------------------- |
| `--background-image-page-landing` | `/` only        | `lagoon-25` → `teal-75`, both @ 77%    |
| `--background-image-page`         | everything else | `#ffffff` → off-scale mint, both @ 40% |

Utilities `bg-page` / `bg-page-landing`; never restate the gradient strings in JSX. Three of four
stops are exact brand steps, so the landing gradient is derived via `color-mix(… 77%, transparent)`
— verified live in the build under `@supports`. **The inner gradient's second stop is off-scale**
(fractional channels = a flattened Figma layer; dE .042 from teal-25) — literal per §3/§4, item 7.
Mounted by `AppShell` as a decorative `fixed inset-0 -z-10` sibling of `<main>` (`aria-hidden`,
`data-page-backdrop` — the router-test seam): the ellipses size in percentages of the painted box,
the layer must sit behind the rail, and `-z-10` keeps it under in-flow content. The shell paints
`bg-page` unconditionally — no route knowledge; `/` renders its own later-in-DOM backdrop over it.

## 7. Landing background video

`/` composites the §6 landing gradient over looping footage; `Landing` owns the layer. **The wash is
plain source-over** — measured: `0.77 × teal-75 + 0.23 × video` reproduces the reference within
3/255. The gradient must be a sibling stacked over the video (an element's own background paints
behind its children); the wrapper is `bg-white` so the pre-decode state is the old page. Assets:
`landing-video.mp4` (source, 9 MB, **gitignored**), `landing-loop.mp4` (ping-pong 720p, 1.9 MB),
`landing-poster.jpg` (frame 0 — poster and reduced-motion still). The derived files **cannot be
regenerated by any build step** (ffmpeg is not in `package-lock.json`), so the recipe:

```bash
ffmpeg -i landing-video.mp4 -filter_complex \
  "[0:v]scale=1280:720,split[a][b];\
   [b]reverse,trim=start_frame=1:end_frame=191,setpts=PTS-STARTPTS[r];\
   [a][r]concat=n=2:v=1[out]" \
  -map "[out]" -an -c:v libx264 -crf 30 -preset slow \
  -pix_fmt yuv420p -movflags +faststart landing-loop.mp4
# poster: -vf "select=eq(n\,0)" -vframes 1 -q:v 4 landing-poster.jpg
```

Palindrome because the clip is a continuous dolly-in — ends 46.5/255 apart, a hard cut every 8 s
(item 8, ADR 0002); VP9 measured larger than H.264, so no second `<source>`. `autoPlay muted
playsInline` is the browser minimum; iOS Low Power Mode refuses autoplay regardless, so the poster
is a state real visitors see; under `prefers-reduced-motion` the `<video>` is not mounted at all.
**7.1 The severity band** reuses the footage via `BrandLoop.tsx`; its wash is **not** the landing
composite — measured `0.20 × video + 0.80 × (crimson-50 @ 15% over the page gradient)`, so
`bg-brand-crimson-50/15` plus `opacity-20` on the video is the whole effect. **The two numbers move
together** — the 15% supplies the warm cast, the 20% the presence; raising opacity alone re-greens
the band.

## 8. Landing hero type

The hero sits outside §2's mapping — drawn 60/128/36/24px, and **all four land on Tailwind steps
exactly** (`text-6xl`/`text-9xl`/`text-4xl`/`text-2xl`). Those are the `xl:` values; each line ramps
down in named steps — no `clamp()`, no arbitrary size. **The top step is `xl:`, not `lg:`, because
the column decides**: the 128px headline is ~1000px wide against a 752px content column at 1024 and
1008px at 1280 — `xl` is the first that holds it; 1440 is unaffected. The three text lines hold
their drawn ratios at every step; the CTA is excluded (0.19 × a 48px headline is a 9px label).

**The line-height rule** (this file had it backwards until 2026-08-04): a v4 `leading-*` sets
`--tw-leading`, which every `text-<size>` resolves through, so **one `leading-*` covers a whole
ramp**; the **slash modifier** does not propagate and must be restated per step. Separately,
tailwind-merge lists `leading` under `font-size`, so a `text-*` class passed **into** a component
carrying its own `leading-*` strips that leading — why the CTA (into mlg `Button`, which ships
`leading-tight`) needs a modifier per step. The CTA ramps padding and label together (`px-8 py-3
text-base` → `px-16 py-4.5 text-2xl`), restating `leading-tight` — the design's `leading-5` is
refused, 24px type in a 20px box overlaps on wrap; it is a destination rendered as a `<button>`
(accepted, debt 5). `<main>` is `flex min-h-dvh flex-col`; the hero claims leftover height with
`flex-1`. **The second hero, `/wizard-intro`**: `<h1>` `text-4xl sm:text-5xl lg:text-7xl` (drawn 72
= `text-7xl`); **its top step is `lg:` by the same column rule** — its longest drawn line (729px)
fits 1024's 752px column, and the base step is set by the word "PROPHYLACTIC" against 320. Its CTA
takes `Landing`'s inset steps with the drawn `leading-5` at `lg` only and `/tight` below — its half
of item 33. Everything here is arithmetic — item 41.

## 9. Open items

The authoritative ledger. Closed: **13, 17, 20, 28, 33, 40, 49**. Open rows state what is open, who
unblocks it (designer / browser / code), and where it bites.

| #   | Item                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Where                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| 1   | `PopupButton` fails 3:1 in every state (2.17/1.83/2.49/2.66) — the mapping is exact; `lagoon-25` is a light step used as a saturated ground. Designer one-token fix: `-popup-bg: lagoon-50` → 3.58:1.                                                                                                                                                                                                                                                                | issue 03, RAISED 1    |
| 2   | Focus rings with no/positive `outline-offset` land on the page ground — contrast depends on a surface the component does not own. §5 resolves the bar; any new dark surface reopens it. Designer/code.                                                                                                                                                                                                                                                               | issues 00, 02, 03     |
| 3   | Palette has no step brighter than `crimson-50` and no saturated near-white; `#f73150` and `#bff5ff` stand in as literals. Designer.                                                                                                                                                                                                                                                                                                                                  | §3, issues 01, 03     |
| 4   | `-navbar-bg/fg-current` deliberately unset; current page signalled via `disabled` (a workaround). Needs a Figma answer. Designer.                                                                                                                                                                                                                                                                                                                                    | debt 2, issue 06      |
| 5   | `NavBarButton` tooltip colours inferred — no export ever supplied. Designer.                                                                                                                                                                                                                                                                                                                                                                                         | issue 02              |
| 6   | No semantic layer yet; the app reads raw brand steps. Code.                                                                                                                                                                                                                                                                                                                                                                                                          | app-buildout issue 02 |
| 7   | §6 inner gradient's second stop is off-scale (dE .042 from `teal-25`) while the other three are exact palette; probably wanted to be `teal-25`. Designer.                                                                                                                                                                                                                                                                                                            | §6                    |
| 8   | Landing footage does not loop (dolly-in, 46.5/255 end-to-end); ping-pong is a workaround. Ask for an 8–12 s cleanly looping clip — halves the asset, removes the reversal. Designer.                                                                                                                                                                                                                                                                                 | §7, ADR 0002          |
| 9   | The references disagree with the §2 scale **and each other** (~32/18/22px on one artboard, ~24/25 on another); the §2 migration made every reading round to one step without resolving which is right. Needs the designer's type sizes.                                                                                                                                                                                                                              | §11                   |
| 10  | One-screen rule: chapters should fit 1440 × 800; wants one rule across chapters, not per-page constants. `disease-background` re-measured **756px** (2026-08-05) and fits; still the tallest route — §19's height gates derive from it. Confirm with item 32, then close. Code/designer.                                                                                                                                                                             | §11                   |
| 11  | Four of `disease-background`'s eight vertical gaps are ink-to-ink measurements, rendering slightly loose; replace when the Figma numbers arrive. Designer.                                                                                                                                                                                                                                                                                                           | §11                   |
| 12  | The pop-up export has **no scrim**; the shipped `rgb(0 0 0 / .5)` backdrop is inferred. Designer.                                                                                                                                                                                                                                                                                                                                                                    | §13                   |
| 13  | Closed 2026-08-04 — the drawn 45.47px title is genuinely on screen (was capped at 36); §8's precedent answers the off-scale question.                                                                                                                                                                                                                                                                                                                                | §13                   |
| 14  | `--color-agent-mab` (`#003d93`) is a sixth hue derived from no ramp; transcribed verbatim. Its pair `-sirna` is `crimson-50` exactly. Designer: are the agent classes meant to be brand colours?                                                                                                                                                                                                                                                                     | §11                   |
| 15  | Artboards disagree on the disclosure-caption colour, 2 v 2 (`#074655` vs `lagoon-75`); all chapters use `--color-popup-caption` (the first value). Designer.                                                                                                                                                                                                                                                                                                         | §11                   |
| 16  | Closed 2026-08-10 **in code**: the boxes are `AgentBoxButton`s opening each agent's §6 drug sheet (ADR 0006's page-held state, as `/wizard/therapies` and `/explore` wire it) — the blueprint never named a target, so this is a code answer the designer can veto. The hover/press/focus skins are invented (see the Invented row). Phone cost resolved with it: the sheets are the same text pop-ups the wizard opens, not figures, so item 38 does not apply.     | §11                   |
| 17  | Closed 2026-08-05 — the prose card's footnote is deleted outright; the figure card keeps its `TFPI` line.                                                                                                                                                                                                                                                                                                                                                            | §11                   |
| 18  | `NavArrowButton` and `Button` are not `forwardRef` — no focus handle when the mechanisms card swaps steps. Package change (code).                                                                                                                                                                                                                                                                                                                                    | §11, mlg-reskin       |
| 19  | `--background-image-emerging-panel`'s mint (`#c6eee5`) is dE .0136 from `color-mix(teal-25 30%, teal-0)` — between the derive (~.002) and literal (.042) thresholds; the §3/§4 rule does not decide it. Shipped literal. Designer.                                                                                                                                                                                                                                   | §11                   |
| 20  | Closed — all four `fviii-mimetics` cards built; the diagrams arrived as rasters, not the requested SVGs.                                                                                                                                                                                                                                                                                                                                                             | §11                   |
| 21  | `--color-note-panel-border` (`#747474`) is a neutral grey off every ramp — a hue away, not a step. Transcribed verbatim. Designer, with item 14.                                                                                                                                                                                                                                                                                                                     | §15                   |
| 22  | The two `/wizard/therapies` exports disagree on inter-bullet gap (12 vs 0); shipped 0 (six observations v one, the only reading fitting the 8-bullet leaf on one screen); the Considerations panel renders 141 v drawn 152. Designer.                                                                                                                                                                                                                                | §15                   |
| 23  | Bands and arches are drawn on the 112→1328 band (1216px, ignoring the rail): three pages, three answers — `/wizard/therapies` ships `-mr-16` (1344), `/explore` `lg:-mr-rail` (1328 exact), `/wizard/scenario` the same divergence. Wants **one** designer ruling.                                                                                                                                                                                                   | §15, §12, §17         |
| 24  | The seven drug-sheet exports disagree only on the space **above** a section label (29–56px; everything else is 26 ± 1 / 33 ± 1 across 35 sections). Shipped uniform at the median (`mt-3`). Designer, same shape as 22.                                                                                                                                                                                                                                              | §16                   |
| 25  | Drug-sheet horizontal inset: the `lg` step is 64px where five of seven exports draw 49 (two draw 64). Not split — the card is shared with the §7.5 chapters. Designer, with items 9 and 13.                                                                                                                                                                                                                                                                          | §16, §13              |
| 26  | `/explore` class-label tracking fits 0.036em — on no step; ships `tracking-wide` (0.025em). One tracking rule across display headings beat a bespoke value. Designer to confirm.                                                                                                                                                                                                                                                                                     | §17                   |
| 27  | Closed 2026-08-11. `Popup`'s `wide` step (1360px — **a picked number, no artboard**; the designer may still overrule it) un-binds the nine-column table (~136px a column), and the grid now ships its scroll region: `overflow-x-auto` + a `min-w-240` floor inside the card, the `SeverityTable`/Table 1 answer (§11, §17). Nothing remains but the designer's option to redraw.                                                                                    | §13, §17, ADR 0007    |
| 28  | Closed 2026-08-04, in code — title 36 → drawn 45.47 and band `py-5` → drawn `py-3`; the two errors had cancelled for eleven months. The band gained a `min-h` floor = the ✕'s own height (not a design value). Verified on twenty cards.                                                                                                                                                                                                                             | §13                   |
| 29  | `narrow` 860 and `default` 1140 are undrawn (both moved 2026-08-04). Consequence: `hemostatic_mechanisms_diagram.webp` is stored 1772px for the old 886px body and now paints ~13% past stored width. Re-export at 2004 or return the default to 1024. Designer.                                                                                                                                                                                                     | §13, §7.6             |
| 30  | **Browser coverage.** The §2 migration verified all ten routes at **1440 and 375 only**. Since then `/wizard/therapies` was measured at **320/375/640/768/1024/1280/1440** (112 renders, §15) and `/explore` at the same seven (§17); 1024 and 768 behaved in both. **320 is where the app's one measured horizontal overflow was found. Eight routes have never rendered at 320, and `/wizard/scenario` has never been opened in a browser at any width.** Browser. | §2, §12, §15, §17     |
| 31  | Closed 2026-08-10 the other way: `/explore`'s `<h1>` joined `PageSection`'s app-wide §2 ramp (`lg:text-5xl` 48, left-aligned, cap dropped) on user direction — uniformity over the drawn 42, the reverse of the `text-[42px]` restoration this item floated. The 2026-08-05 copy cut is what made it viable. Item 46's `<h1>` sub-points predate this and are stale.                                                                                                 | §17, §2               |
| 32  | Every chapter fits 1440 × 800 (`scrollHeight` exactly 800 in the item-30 pass) — an observation, not a closure (the before-state was not measured). Confirm, then close item 10.                                                                                                                                                                                                                                                                                     | §11                   |
| 33  | Closed 2026-08-05. The 2026-08-04 `clamp()` removal regressed five below-`lg` cases; all five since fixed (hero ramp §8, `Popup` band §13, both CTAs — `/explore`'s the only one browser-verified). No arbitrary font size remains anywhere in the app.                                                                                                                                                                                                              | §8, §13, §14          |
| 34  | `--spacing-bar` (80px) overshoots the 65px bar it clears by 15px — a dead strip on every page below `lg`; only `ArchBand` patches it (`-mb-4`). Token should be 65 or derived from the package. Read off compiled classes, not a browser. Code.                                                                                                                                                                                                                      | §11, §12              |
| 35  | The ✕ ramp and its derived band inset/floor are arithmetic below `lg` — no card opened in a browser there; the card's height-floor removal is unverified at every width. Browser; rolls into 30.                                                                                                                                                                                                                                                                     | §13                   |
| 36  | `treatment-landscape` responsive pass is arithmetic end to end; weakest number is `min-w-165` (660 from character counts, not measurement). Browser — 1024 especially.                                                                                                                                                                                                                                                                                               | §11, §12              |
| 37  | Table 1's footnotes are `leading-none` and already wrap to two touching lines at the drawn width — a transcription question (the designer's own inspector value), left alone. Designer, with 9/13/25.                                                                                                                                                                                                                                                                | §11                   |
| 38  | `PopupFigure` caps at `min(drawn, 100%)`, so **all seven §7 diagrams are illegible on a phone** (~303px at 375). The tables' scroll-region answer transfers but must be taken for all seven at once or not at all. Designer/code.                                                                                                                                                                                                                                    | §11, §13              |
| 39  | `rebalancing-agents` pass is arithmetic; weakest is the 752-exact row fill at 1024 (zero slack — any token move re-shrinks the boxes silently); the CTA width is an estimate. Browser.                                                                                                                                                                                                                                                                               | §11, §12              |
| 40  | Closed 2026-08-06 — `@source not "../../docs"` and `not "../../.scratch"` in `tokens.css`. Rebuild diff: 22 phantom rules gone, none added, −1,905 bytes (73,869 → 71,964). Every one was prose-only; `.bottom-bar` was the phrase "bottom-bar" read as `bottom-` + the `--spacing-bar` token.                                                                                                                                                                       | §1, §9                |
| 41  | `/wizard-intro` + `prophylaxis-guidance` passes are arithmetic; weakest are `/wizard-intro`'s ink-width estimates (the base CTA at 321px in a 311px column is inside the error bar; built to survive either outcome). Browser.                                                                                                                                                                                                                                       | §8, §11               |
| 42  | `/wizard` pass is arithmetic; binding case is `lg` (~308px label in a 318px pill — 10px margin against a known ~4px export/render discrepancy). 640/1024/1280 never opened. Browser.                                                                                                                                                                                                                                                                                 | §14                   |
| 43  | `/wizard/scenario` pass is arithmetic **and the screen has never been opened in a browser at any width — even its 1440 case is untested**. Box row firmest (745 in 752); the type ramp rests on ~0.53em character estimates. Browser.                                                                                                                                                                                                                                | §18                   |
| 44  | `fviii-mimetics` pass is arithmetic on the firmest ground with the worst conclusion: the drawn row (1122px) overflowed the column at every width 1024–~1394 since it shipped, uncaught. If a render disagrees, suspect `PopupButton`'s rendered box and the caption's shrink first. Browser.                                                                                                                                                                         | §11, §13              |
| 45  | `/wizard/therapies` pass is **measured** (112 renders). Open: 320's ~190px measure (worst in the app); agent captions 20px bold over a 16px body at 375 (designer — no phone artboard); the five-agent row shrinks items to 144px at 1280 only; the below-`sm` gutter went 32 → 24 hours later, so the 320/375 figures are carried at +16px (approximate), not re-rendered — the 320 header-band height is unconfirmed.                                              | §15, §2, §12          |
| 46  | `/explore` pass is measured. Open: stacked, the middle segment's `bg-white/60` reads as selected (designer); class labels equal the `<h1>` at 320/375 (designer); arc clearance is 9.4px at 320 — re-check if a label grows; the `<h1>` renders 10 lines at 320 v the predicted 8 (narrow-column estimates under-count).                                                                                                                                             | §17, §2, §9           |
| 47  | Figure assets are stored at 2× drawn (a 1.00× budget); §19's 1.5× rung makes DPR-2 rendering ~0.67× on the tight ones. The cap is now rem (size correct everywhere; sharpness given up on retina large screens). Re-export the tight ones (`clotting-cascade-thumb`, 940-for-470) at 3× only if a 5K screen shows it.                                                                                                                                                | §13, §19              |
| 48  | `--shadow-popup`'s 50px blur does not scale — ~33% tight on a 1.5× card. Left deliberately (the value is straight-from-export); a one-line change if a 2560 render indicts it. Not yet examined at that size.                                                                                                                                                                                                                                                        | §13, §19              |
| 49  | Closed 2026-08-05 — all four drawn `border-4` sites converted to `border-[0.25rem]` so they scale (§19); the item had under-counted itself (four sites, not two) because scale utilities evade arbitrary-value greps. All four now test-pinned.                                                                                                                                                                                                                      | §19                   |
| 50  | `/explore`'s pinned arch row has 7px of bottom clearance at 1440 (8/9/10 on the scaled boards). Spent by a fourth label line (authored content) or by the 20px owed the drawing (`h-20` v the drawn ~100 — would buy 10px back). Designer on the 100; re-check if a label grows.                                                                                                                                                                                     | §17, §19, §9          |
| 51  | `/wizard`'s Submit: type fixed (`lg:text-2xl` — pill/button delta 0 at every board; 375 keeps its drawn +2 via `max-lg:text-lg`) and box (`lg:px-7.5 lg:py-4.5`). **`px-7.5` is a compensation, not a conversion** — an invented number preserving the drawn 223px width. Open premise: is 223 × 56 a shape to hold at every board, or a canvas-only transcription? Designer; arithmetic, not browser-verified.                                                      | §14, §19, §4, §12     |
| 52  | Gate-release cue half-shipped, wholly invented: the Submit pulse is measured (Chromium 2026-08-06 — peak 1.05, un-dim eases 0.35 → 1, reduced-motion correct); the sidebar arrow still snaps (package change, mlg-reskin debt 7); the pulse's numbers are derived but no artboard draws motion (designer); the scaled boards are arithmetic only.                                                                                                                    | §20, mlg-reskin       |

| 53 | `AppShell`'s `<main>` is `lg:pb-0` — **no page can breathe at the bottom edge at ≥1024**. Never bit, because every route fit one screen; `/acronyms` (§22) is the first that does not, `/glossary` (§23) the second, `/references` (§24) the third and `/resources` (§25) the fourth, and all four pad themselves. **Four routes repeating the same class is past the point at which the shell-wide fix costs less than the workaround** — but items 10/32 record every chapter at `scrollHeight` exactly 800, and bottom padding breaks that measurement for nine routes at once. Designer/code, with 10 and 32. | §12, §22, §23, §24, §9, §25 |
| 54 | **`src/data/` was transcribed from a text extraction, which carries no font style.** ADR 0009 found the two bibliographies shipping without the italic journal runs the board draws — 29 runs across 47 entries, missed because `out_raw.txt` cannot show them. The same dump is the source for the education chapters, the drug sheets, the glossary and the acronyms, and ADR 0004 already records `F8`/`F9` shipping upright where §7.2/§7.3 set them italic. **The bibliographies are fixed; nothing else has been checked.** `pdftohtml -xml` exposes the font subset per run (`BAAAAA+` = NotoSans-Italic), so this is a sweep, not an investigation. Code. | §24, §25, ADR 0009 |
| 55 | ~~**`/resources` and the reworked `/references` have never been opened in a browser.**~~ **Closed 2026-08-07** — both were opened and checked after the ADR 0009 rework, including §24's `break-words` claim on `r8`'s URL. No widths recorded, so the residue is item 30's, not its own. | §24, §25 |

**Invention ledger (summary)** — shipped values that are not straight transcriptions:

| Kind                                | Values                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Transcribed-literal (off-scale)** | `#939393` press fg (§4.1/4.2); `#f73150`, `#bff5ff` (item 3); `#d2d5d4` (§4.3); §6 gradient stop (7); chapter `text-black` (§11); `--color-agent-mab` (14); `--color-agents-panel` (`#00d8ff`, §11); emerging-panel mint (19); `#747474` (21)                                                                                                                                                                                                                                                                                                                  |
| **Inferred (never exported)**       | navbar tooltip (5); sidebar `teal-100` (§4.5); pop-up scrim (12); table hairlines `black/30` (§11)                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **Invented (no artboard)**          | below-`sm`/`sm` gutters + `lg` bottom padding (§12); every below-`lg` type step (§2); `DisclosureBand` `md` row, `ArchBand` 150px radius, panel 60px radius, `treatment-landscape` `sm` step (§11); `Popup` band floor + ✕ base/`sm` steps (§13); `wide` 1360 (27); hover/press derivations (§4.2, §14, §15) and the agent-box states incl. the crimson focus swap (16); `px-7.5` (51); gate pulse (52); scrollbars (§21); the §19 ladder; `/acronyms`' crimson terms and its own `lg:pb-16` (§22); `/references`' lagoon link colour and hanging indent (§24) |

## 10. Page top rule

Every page except `/` opens with a full-bleed `brand-crimson-50` band (sampled exactly on the step),
14px tall, pinned to the viewport top; height is `h-rule` (`--spacing-rule`), a token because the
shell must clear the same 14px (§12). Mounted as `src/routes/TopRule.tsx`, a pathless layout route —
which pages get the rule is a routing fact, readable from `routes`. `fixed` and out of flow (an
in-flow band over `min-h-dvh` gives every page a 14px scrollbar); `<main>` opens with
`pt-below-rule` from the same token. `z-30`: over page content, under the sidebar's z-40/z-50.

## 11. Education chapters

All five chapters are drawn on **1440 × 800** artboards (derived — the crimson rule measures to
§10's 14px through each export's scale); the app-wide gutter (112 left / 160 right = 112 + 48 rail,
edge x=1280) lives on `<main>` as §12 tokens, `lg:` only. Chapter-wide: **off-palette black** — body
copy samples pure `#000000`, nearest step slate-100 at dE .232, ships `text-black` verbatim per
§3/§4; **`--color-popup-caption`** samples `#074655`, derived as
`color-mix(lagoon-75 52%, lagoon-100)` at dE .0006 (item 15 holds the artboard disagreement); the
shared step-down table below `lg` (h1 30/48, sub-headings 24/30, captions 20/24, body 16 flat except
§2's exceptions); **eight vertical gaps** (32/32/28/16/22/66/45/40; four ink-to-ink, item 11) held
at 1440 values at every width, none ramping, pending items 10/32's one-screen rule.

**`disease-background`.** Two-column grid from **`xl`** (`1fr` + fixed 470px figure) — `xl` not
`lg`: at `lg` the gutter step left a 250px prose column (§12's cliff), and the single 752px column
is the better composition to 1279. Invented: `DisclosureBand` three-up from `md`; `ArchBand` radius
150px below `xl` — the arch title's wrapper inset (`px-13`/`xl:px-39`) is **derived from the radius
and ramps with it**, or the corner clip reopens. **The arch bleeds twice**: `-mx-6 sm:mx-0` cancels
the shell's phone gutter exactly (**coupled** — re-pointing `px-6` must move this too); `-mb-4
lg:mb-0` closes item 34's 15px overshoot, paired with `pb-4 lg:pb-0` — changing one alone reopens
the seam or hides content behind the nav. **`SeverityTable` scrolls rather than reflows**
(`min-w-105` in an `overflow-x-auto` div — item 27's answer; restacking flattens the column
association for assistive tech). Open: items 9, 10.

**`treatment-landscape`.** Three rows of `[prose | figure | caption]` in **one grid**; tracks
`1fr 200px 300px` = the residue of the 1168 column, `xl:` only (same cliff — 204px of prose at 1024
before), with an invented two-track `sm` step keeping each figure beside its `+`. PLACEHOLDER boxes
ship as empty bordered `<div>`s, uniform 200×166, holding the track open at drawn size at every
width. Fits one screen (verified). **Table 1 scrolls**; its `min-w-165` floor is **arithmetic off
character counts — item 36's weakest number**; the footnote list is left broken deliberately
(item 37); hairlines inferred `black/30`. Drawn typos are **not** reproduced ("FACOTOR" etc.); the
matrix carries the client's shorthand (**overriding the artboard**, 2026-08-05); AAV confirmed **HB
only**. The "TABLE 1" band names a figure number, not a subject — as drawn; a designer question.

**`rebalancing-agents`.** No grid: prose, a centred row of three boxes (224 × 192, squared from
drawn 227 × 185; group = the drawn 963) carrying the §7.7 agent thumbnails, caption, then a `+`
with the caption to its **left**. The row and its caption — those two alone — sit on a
`--color-agents-panel` wash at 10% (`bg-agents-panel/10`; the hex is off every ramp, transcribed
per §3/§4), radius 56 shipped `rounded-[3.5rem]` — rem, not px, so the corner scales with the
board (§19). Each box: `bg-slate-50` ground (the default-palette step, as exported), `py-1` inset (the export's
`px-12` dropped), `rounded-xl`, a 3px white ring at −3px offset (fully inside the edge; rem, §19),
and **`--shadow-agent-box`** — the export drew the shadow as **two `shadow-[]` classes, which
cascade to one rule**, so the token carries both layers; do not restore the two-class form.
**First chapter to transcribe its body rather than snap** (drawn ~24–26 → `text-2xl`; item 9
decided one way for one chapter); caption colour is item 15, agent colours item 14. **The boxes are
`AgentBoxButton`s** opening each agent's §6 drug sheet (item 16, closed in code; ADR 0006's
page-held state). Their states are invented: hover raises `--shadow-agent-box-hover` on a white
ground, press inverts to `--shadow-agent-box-active` on `slate-100`, and focus-visible swaps the
white ring to `crimson-50` — `ExpandableFigure`'s image-button focus colour, one rule for both. The mechanisms click-through is **two cards in one dialog** (a
`"prose" | "figure"` step, never closed between, so focus restoration fires once); no focus
management between cards (item 18); the footnote is deleted (item 17). Pass: **the gap ramps, the
boxes never do** — `lg:gap-x-10 xl:gap-x-35.25`, 40 derived as the exact 752 fill at `lg` (item
39's zero slack), the drawn 141 back at `xl`; below `lg` it stacks **at full size** (640px of empty
rectangle — the cost of not reserving the wrong size, bounded by item 16); body 24 → 20; the CTA
takes `Landing`'s inset ramp. The figure card is illegible on a phone (item 38 — a `PopupFigure`
question, all seven figures at once or not at all). Verified in Chrome at 1440×800 and 390×780.

**`prophylaxis-guidance`.** Heading, two bullets, full-bleed wash; **first to centre vertically**
(`flex flex-1 flex-col justify-center`); fits one screen. Heading steps to `text-3xl` below `lg`
(17-word sentence, invented comfort); bullets drawn 26 → `text-2xl leading-tight`, stepping to 20.
The backdrop is a second `fixed inset-0 -z-10` layer; the artboard's 15% wash **lives in CSS**
(`opacity-15` — the asset's baked-in alpha was flattened out so the value is greppable); stored
1920² against decode cost (wallpaper, not the §13 rule). Verified in Chrome at 1440×800 / 390×780.

**`fviii-mimetics`.** Bullets, agent captions and panel headings are one drawn 26px →
`text-xl … lg:text-2xl` with weights (900/500/400) at the call site; the two absolute leadings
became ratios `leading-tight` / `leading-[1.08]` (§2's rule). **Three two-toned strings** (hexes
exact on crimson-50/slate-100/`--color-popup-caption`), split by punctuation (`splitTitle`, colon
before paren, test-pinned) so the halves concatenate back to the source. **The corner panel**
(gradient + shadow declared as a pair — one drawn object): 675 × 350 bottom-right; the mint is
item 19's borderline literal; the drawn panel runs 48px into the rail's clearance — ships inside
the column; radius **117 → 60 below `lg`** (invented), on `lg` while the layout moves on `xl`. All
four cards built (item 20), three as rasters with chrome baked in; Pop up 13 is single-column at
every width (2.6:1 panel). **Responsive pass 2026-08-05** — the first drawn layout that never
fitted below the canvas: the bottom row (78 + 288 + 16 + 65 + 675 = **1122px**) needs ~1394px of
viewport and turned on at 1024, overflowing ~285px there since it shipped (item 44 — never
rendered). The row moved to `xl`; the left group pins and **the panel is the axis that gives** (a
fluid container — the opposite object to reserved boxes); below `xl` the pairs centre, below `sm`
they stack. The three two-column cards stack at `xl` too — Denecimig's `wide` card had **241px** of
prose at 1024 (`96vw` withholds the extra width below ~1417px while the fixed 580px panel stays).
Card bodies 20 → 16: a card may not set larger body type than the page that opened it in a narrower
measure. **Never opened in a browser since the §2 migration's 1440/375 sweep** — all arithmetic.

## 12. Layout geometry

`AppShell`'s `<main>` carries the padding every page inherits, as tokens:

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

**What is deliberately NOT a token** — the transcribed-vs-invented rule: the 24px gutter below `sm`,
the 48px at `sm`, and the 16px bottom padding at `lg` are invented comfort values with no design
canvas behind them and one consumer each; naming them would claim an authority they do not have.
§3's rule for off-scale colours, pointed at spacing: transcribe what the designer gave you, and
leave what you made up looking like what it is. Composed values are `calc()`, not hand sums — the
addends survive into the built CSS, so re-pointing the gutter moves the right edge. **Clearance and
measure are different boxes**: `<main>` holds the padding; `max-w-content` sits on an inner wrapper
(`flex w-full flex-1 flex-col`, load-bearing for §8's centring) — the cap that stops a 2560 monitor
giving prose a ~1790px measure. All tokens are rem, so §19's ladder scales the table (gutter
112 → 168, column 1168 → 1752) without changing the measure in characters. **Open: the 1024px
cliff** — the gutter steps 48 → 112 at `lg`, taking the content column 927 → 752 in one pixel; both
chapters that broke on it were fixed from the layout end (splits to `xl`), the gutter itself is
untouched, and with the clamps gone any fix is a breakpoint step moving all ten routes at 1024–1280.

## 13. Pop-ups

`src/components/Popup.tsx`, the card behind every §7.7 disclosure; reference Figma `144:431`,
1066 × 645. **A real `<dialog>`, opened with `showModal()`** — the platform supplies the focus trap,
restoration on close, and the **top layer** (escaping `DisclosureBand`'s `overflow-hidden` clip and
every z-index). The element is a transparent viewport-filling layer with the card as a child — what
makes a backdrop click detectable (`::backdrop` is never an event target); openness is the single
source of truth (`cancel` preventDefaulted, ESC routed through `onClose`); scroll lock is manual.

**The card is one nullable prop, and that is a width fix** (2026-08-10). `Popup` takes
`card: PopupCard | null` — `title`, `subtitle`, `width`, `content` — where it took an `open`
boolean beside them. It matters here because the card must stay _rendered_ while it fades
(`MODAL_EXIT_MS`, 150ms) and callers drop their content on the render that closes: the hold was a
hand-assembled `{ title, subtitle, children }`, so **`width` sat outside it** and was read live.
Closing `treatment-landscape`'s `narrow` NFT card therefore snapped it 53.75rem → 71.25rem and
faded it out **280px too wide**, from the day the width steps landed. Anything that is part of what
the card _is_ goes in `PopupCard` and is held by construction; `surface` is the one thing outside,
as caller configuration no card varies — a caller that needs it per-card has to move it in.
A closed `Popup` now draws no card element at all, where it used to wrap a blank crimson band; the
`<dialog>` still mounts either way, so nothing that counts or indexes dialogs moved.

Geometry, read off the code (a table transcribed from the design drifts): the `default` width step
under `max-h-[95dvh]`; `rounded-[2.5rem]` / `border-[0.3125rem]` crimson-50 (drawn 40.417/5.052, rem
since §19); `--shadow-popup` export-verbatim (item 48); band `py-3` (drawn 12), content-height; body
gutters `px-4 sm:px-8 lg:px-16` + `py-2`. Lesson kept: the title shipped 21% small and the band
padding 67% large for eleven months, cancelling to a band 4px off — found by checking two records
against each other, not the screen (items 13/28).

| Step      |   px | Body | Source                                             |
| --------- | ---: | ---: | -------------------------------------------------- |
| `narrow`  |  860 |  722 | the drug sheets' drawn 869, nudged (item 29)       |
| `default` | 1140 | 1002 | undrawn — moved from 1024 on 2026-08-04 (item 29)  |
| `wide`    | 1360 | 1222 | **picked, no artboard** — the §5 table's nine cols |

A closed set — a body fitting no step is a designer conversation. `wide` is the only step at `96vw`
(at `92vw` it would never reach 1360). Off-`default` callers: `narrow` — the non-factor card (client
direction, no drawing; the width travels on `Row`); `wide` — `/explore`'s table card (item 27) and
Denecimig (its fixed `xl:w-145` panel puts all the extra width in the prose column; 241px at 1024
moved its split to `xl`, §11).

**The title**: `text-5xl leading-[1.0278] tracking-[0.0289em]` — drawn 45.469/46.732/1.3136; 48 is
5.6% over and all four longest titles still set two lines at the real band width (measured). **The
band floor is the ✕, not a design number** — no one-line band is drawn, and a band shorter than its
button clips against the rounded corner. **The ✕ ramps, and three numbers ramp with it**:

| Step  | ✕               | Band inset (✕ + 22) | Band floor       |
| ----- | --------------- | ------------------- | ---------------- |
| base  | `size-11` 44    | `px-16.5` 66        | `min-h-11`       |
| `sm:` | `size-14` 56    | `px-19.5` 78        | `sm:min-h-14`    |
| `lg:` | `size-16.25` 65 | `lg:px-25` 100      | `lg:min-h-16.25` |

44 is the touch-target floor; the `lg` inset is the drawn 100 (smaller steps = ✕ + the fixed drawn
22); `lg:size-16.25` restates the package's own value because a caller `className` merges last
(test-pinned — a lost `lg:` ships a 56px button silently). The title ramps `text-2xl sm:text-3xl
lg:text-5xl` — two steps against the chapters' one: its box is narrower than any content column and
it is uppercase display type. `CLOSE_BUTTON_SIZE` is shared with `Lightbox`. Deliberate deviations:
the design's 20px title nudge off-centre is not reproduced; the band opts `FVIIIa`/`BsAbs`/`FIXa`/
`FXa` out of its own `uppercase` (`preserveCase`) — painted glyphs only, with an `aria-label` of the
raw title so the accessible name is not "FIX/ FIXa".

`ModalLayer` is the `<dialog>`; `Popup` dresses it as a destination, `Lightbox` as an enlargement
(its `w-fit` column means prose inside must carry `w-0 min-w-full`); `ExpandableFigure` picks with
`variant`. **Nested dialogs**: Chrome puts them in one CloseWatcher group — one ESC closes both, and
`onCancel` cannot fix it, so `ModalLayer` takes the keydown itself (`preventDefault` **and**
`stopPropagation`, then `onClose`; dropping either reinstates the bug); the inner backdrop's click
bubbles to the outer layer and the `target === currentTarget` guard rejects it. **Body gradient**:
outer stops `sand-0`/`teal-25` exact (live `var()` refs), the middle stop is their exact sRGB
midpoint and is dropped, the export's 12.9° rotation is dropped (CSS cannot rotate a radial
ellipse). **The scrim is inferred** (item 12). **Height floor: removed** — content height under
`max-h-[95dvh]`; any future floor must be `min(x, 95dvh)` (`min-height` beats `max-height`).

**Figures.** The cascade card is **composed, not photographed** (diagram crop, self-labelling
thumb, transcribed notes as markup); it takes `surface="white"` — an opt-in, the gradient would
frame a white diagram as a rectangle. `--color-figure-note` derived
(`color-mix(teal-25 27%, teal-0)`, dE .0021). `ExpandableFigure`'s hover hint reuses the scrim
value, fires on `:focus-visible`; touch gets a "Tap to enlarge" badge under `@media (hover: hover)`
— interaction chrome no artboard can draw; flag at the client review. `PopupFigure` caps at
`min(<w/16>rem, 100%)` (rem since §19 — item 47 holds the retina trade); **assets are stored at 2×
their drawn width and no wider** (decode cost, not bytes); keep stored size and props in step (they
feed `aspect-ratio`) — since 2026-08-06 the element is a definite `width` + `object-contain`, so a
cold card opens at final size. **Two UA `dialog` rules to fight** (both shipped as bugs once;
invisible to jsdom, which has no dialog UA styles): `hidden open:grid`, never bare `grid` (any
author `display` beats the UA's `display: none`, leaving an unclosable card from first render), and
`size-full` (the UA sizes dialogs `fit-content`; `inset-0` cannot stretch a sized element). The
jsdom shim is only the state machine. **Verified in a browser**: dialog behaviours at 1440×800 +
390×780; the width scale at five widths on `/explore` (band column stale below `lg`, item 35); the
title repair across all twenty cards at both canvases (45.46px everywhere, no band clips its ✕).

## 14. Wizard option buttons

`src/components/OptionGroup.tsx`, `/wizard`'s answer control; reference is two artboard exports —
every state the design has. **It is `Button`'s skin, referenced not copied**: unanswered =
`Button`'s resting pair; **passed-over = `Button`'s press pair used as a resting state**; Submit =
lagoon-50; only the chosen fill is new — `--color-choice-selected` (teal-75 aliased, plus
`-hover`/`-active`). **Hover, press, focus and disabled are not drawn**, derived by §4.2's model:
passed-over hover lifts to the resting crimson pair ("you can pick me" — the only invented
behaviour); chosen press is teal-100. Submit's disabled state has no reference at all.

> **Focus must be `has-[:focus-visible]:`, never `peer-focus-visible:`.** `peer-*` compiles to a
> sibling combinator and the input is a **child** of the label — the peer form matches nothing,
> completely silently; caught only by `getComputedStyle` in a browser, never by jsdom.

Pills 425 × 56 `rounded-lg`, 870px block centred on the content column; Submit 223 × 56. **Label
type is 24px, not `Button`'s 26** — settled by matching rendered string widths against the export's
ink; the line box is `leading-tight` stated once (v4 rule, §8), `min-h-14` holding 56px.
**Responsive pass**: below `lg` a single column of drawn-width pills (`max-w-110` = 440); at `lg`
two columns return (366px pills, the drawn 440 back at `xl` — the pills follow their own width, not
the viewport, hence the non-monotonic 16/20/24 ramp); the split is `lg` not `md` because 768's 326px
pills cannot hold the 369px longest label; the legend's `max-w-[700px]` is the midpoint of the
589–809px window that reproduces the drawn line break. **Submit**: `max-lg:text-lg` states the drawn
+2 over the pills below `lg` without restating the package's `text-[26px]` (the one `max-*` variant
in the app, test-pinned); **`lg:text-2xl` (2026-08-05) rounds the drawn 26 to 24** because §19's
boards turned the pinned px into an inversion (−10 at 1.5×) — delta now 0 at every board;
`lg:py-4.5` converts the package's `py-[18px]`; **`lg:px-7.5` compensates** — an invented number
preserving the drawn 223px width (item 51). Verified at 1440 and 390 (rows within 2px, every
fill/hover/press/focus computes); the pass predates the ramp — 640/1024/1280 never opened (item 42).

## 15. Wizard leaf — the Considerations/Strategies accordion

`/wizard/therapies`: two stacked header bands, one panel open beneath its header, exactly one open
always (ADR 0005). Two raster artboards plus a later **vector export of the bands** — the authority
for the shadows; it overruled two raster readings (radius 8 not 6, weight 600 not 700).

**State is carried by ground and shadow both.** Open samples `crimson-50`, closed `lagoon-25` —
exact, shipped as `--color-note-open`/`-closed` (one design fact, one home). The export draws no
chevron; shipped anyway (2026-08-11, deliberate usability deviation): the closed header alone gets a
chevron-down — inline SVG in `ExpandableFigure`'s stroke idiom (`currentColor`, round caps, 2.5
weight at `viewBox` 24), `size-5 lg:size-6`, absolutely pinned `right-4` so the centred title never
moves. The header's inset widened `px-4` → `px-11 lg:px-12` (symmetric, so centring holds) to
reserve the glyph's lane — measured, not guessed: at `px-4` the 62-character treatment-burden title
ran 20px under the chevron at 768. `currentColor` means the hover lift to `#bff5ff` is inherited,
not restyled. It fades out
over the button's 120ms ease-out step as the header opens — the open header shows **nothing**: a
chevron (or a `+`/`−` pair) there would promise a collapse ADR 0005 forbids, and `+` already means
"opens a modal" on this same page (`PopupButton`). State stays non-chromatic besides it:
`aria-expanded`, the open panel and the shadow carry it as before. The grammar: **open reads
pressed in** (dark inset + a 1px rim riding inside the shadow — the outline is spent on the focus
ring), **closed reads lifted** (white inset). The export's fractional values are one ~1.064 scale
factor, rounded; it also emits two competing `shadow-[…]` classes and contradictory fonts — only
cross-snippet agreement is signal. **Hover and press are borrowed, not derived**: §4.2's recipe
assumes a `-50` ground and this one already **is** the `-25`, so the closed header takes
`PopupButton`'s answer to the identical question — ground still, label lifts (`#bff5ff`), press
previews the open state; closed header only (the open one is `aria-disabled`).

**Panel fill** `bg-brand-teal-25/30` — fitted by least squares over ~85k pixels; `teal-25` @ .305 is
within .04 RMSE of the unconstrained optimum, an exact step at an exact opacity step. **Stroke**
`#747474` — exactly neutral, off every ramp by a hue: literal, item 21; drawn only where exposed.
Panel inset `mx-3` is drawn **and** positional (the stroke and corners land on it); **the panel
padding has no export behind it** — the only such number in the block, why it was the axis that gave.

**Responsive pass 2026-08-05 — the first measured one.** Three defensible insets stacked to 120px of
chrome, leaving clinical copy a 191px measure at 375 (worst in the app); the padding ramps
`px-4 sm:px-6 lg:px-9` (`lg` restores the drawn 36); measures run ≈190 (320) to 1110 (1440) — the
320/375 rows carried at +16px (approximate) after the gutter narrowed 32 → 24 the same day, not
re-rendered (item 45). The body is §2's fifth exception, the first to land ON the 16 floor (drawn
20); `leading-7` became `leading-[1.4]`. **The agent caption is the one deliberate non-step** — a
fixed `w-40` box nothing about the viewport moves; its cost (20px bold over a 16px body at 375) is
recorded and test-pinned. Inter-bullet gap: item 22, shipped 0.

**The arch is pinned, not flowed** (both artboards put the arch top at the same y under different
panels): `mt-auto grow-0`, now `ArchBand`'s base (§19). Captions are `brand-slate-100` (exact,
genuinely different from the chapters' — not item 15). The agent row is equal-width items at an
equal gap (`w-40 gap-x-30` — the artboard draws evenly spaced **button centres**); fuller rows take
`gap-x-20` above three agents (the drawn 120 pitch is a three-agent fact), **no `min-w-0`** (an
item's automatic minimum is its one-word caption — shrinking past it clipped "Emicizumab" mid-word),
nowrap at `xl:` not `lg:`. Motion: 220ms ease-out on `grid-template-rows` (the inner element needs
`overflow-hidden` **and** `min-h-0`), 150ms cross-fade, `motion-reduce:transition-none`.
**Verified**: a canvas pass against both exports, then **112 renders in Chromium** (all sixteen
leaves × both states × 320–1440, item 45): no horizontal overflow anywhere, every ramp resolves,
and every leaf fits 1440 × 800 (`scrollHeight` exactly 800).

## 16. Drug information sheets — the §6 card

`DrugSheetPopup`: the crimson band wearing the drug's name, five crimson labels over disc lists,
inside `Popup`; seven artboards; component state, not a `?drug=` route (ADR 0006). **The seven
exports share one scale (1:1)** — the band is 96px in all seven; the three card widths
(1136/1064/869) are the designer sizing each sheet to its content — `narrow`'s provenance (§13).
Labels 20px/700 `crimson-50` (**exact** — 26k pixels, no other value), bullets 20px/400, both
`leading-[1.6]` — the established pop-up body value reused (the exports draw 1.3; the 6px is the one
deliberate divergence). Gaps: bullet→bullet **zero** (§15's reading); label→list 33px within ±1
across all 35 sections (`mt-2` — a rule); list→label varies 29–56, ships the median `mt-3`
(item 24). Body `py-6`; horizontal inset follows `Popup` (item 25). Verified at 1440 × 800 on two
sheets: computed values exact, **the scroll region engages** (the thing jsdom cannot see), no
overflow at 1440 or 390.

## 17. `/explore` — the SDM conclusion and the class arches

CONTEXT.md §9's node over three arched segments indexing the drug sheets by class (ADR 0007). One
1440 × 800 artboard, **established 1:1 before anything was read off it** (five caption widths render
131/115/135/143/95 v the export). **The band is the gutter on both sides**: segments tile
x 112 → 1328 (339 + 524 + 353 = 1216) — the artboard ignores the rail (item 23); the page breaks out
with `lg:-mr-rail`, landing on 1328 exactly (v `/wizard/therapies`' `-mr-16` → 1344 — two answers,
one designer question). Everything centres on the band's centre (~720), not the column's 696.

**Arches**: `rounded-t-[128px]`, verified against the drawn curve at two corners; the middle's 40px
lift is kept (a range with a peak), the flanks' 7px difference averaged as placement noise.
**Fills**: the middle solved exactly at `bg-white/60`; the flanks solve to a pure red (the export
used Tailwind `red-600`) — **shipped `bg-brand-crimson-50/5` anyway**, the composited difference
under one quantisation step: the one place the code deliberately does not match the file. `<h1>`
drawn 42, shipped `text-4xl` 36 until 2026-08-10, when it **joined `PageSection`'s app-wide §2 ramp**
(`text-3xl` → `lg:text-5xl` 48, left-aligned, `max-w-content` cap dropped) on user direction,
closing item 31; class-label tracking is item 26. **The client cut the copy on 2026-08-05**, which
is what made the bespoke centred fit droppable — the 53-character clause no longer needs the
three-step ramp the 190-character sentence did. **The label row is a fixed height because the export says so four times** (all
four label midpoints at y = 751.5 to half a pixel): captions `h-15`, label row `h-20`, both `xl:`
only (item 50 holds `h-20` v the drawn ~100). **`preserveCase` + the flex whitespace trap**: a flex
container makes the returned span and text node anonymous items and drops the space between them —
centring lives on a wrapper; `px-4` sits on the inner row, not the flex item (padding on a `basis-0`
item floors its basis); `xl:px-0`.

**The table card** (issue 09, built 2026-08-11 — **no artboard**, every number below is picked, the
designer may overrule any of them): the wide `Popup`'s body is a filter bar (three `FilterSelect`s —
native `<select>`s by decision; the open list is OS-drawn and deliberately unstyled) over the
nine-column grid. The grid **scrolls rather than reflows** (`overflow-auto` + `min-w-240`,
closing item 27): the floor is arithmetic — nine columns at Table 1's ~107px/column reading floor,
item 36's weakness inherited knowingly. **The columns are `table-fixed` over a colgroup of
percentage shares** (12/11/10/7/8/8/12/10/22, Monitoring widest — proportioned to the cells'
prose, user direction 2026-08-11): under auto layout the columns re-measured whichever rows
survived a filter and jumped on every change; fixed, the geometry is markup and filtering only
ever changes rows. **The frame is fixed at `h-[75dvh]`** (user direction
2026-08-11): sized by its rows, the card collapsed and regrew as filters cut nine rows to one, so
the root is a fixed-height column and the grid region is bounded to it (`min-h-0 flex-1`) — rows
scroll vertically under a filter bar that stays, `Popup`'s own body scroll never engages (75dvh +
the header clears `max-h-[95dvh]` everywhere), and the empty state fills the same frame. **The grid wears Table 1's skin** (user direction
2026-08-12, overruling the picked hairlines this paragraph first shipped with — row rules
`black/10` under a `black/30` header rule): the header is `TreatmentOptionsTable`'s rounded
`rounded-{l,r}-2xl` `bg-white/50` band (the `SeverityTable` fill) at normal weight with no rule
under it, and the cells rule `black/30` (`MATRIX_RULE`'s inferred #A0A0A0) between rows **and**
between columns — nothing under the last row, nothing on the outer edges; every cell centres
vertically (`align-middle`, Table 1's own cell alignment, replacing the header's `align-bottom`
and the cells' `align-top`). Spacing did not move with the reskin. **The header is sticky**
(`sticky top-0` on the `th`s, 2026-08-12): nine dense columns scroll inside the 75dvh frame at
laptop heights, and the header carries the column semantics the way the pinned filter bar carries
the row set's cause — `backdrop-blur` is what lets the band keep its drawn `bg-white/50`
translucency while floating, smearing the rows that pass beneath instead of ghosting them
through; a shadow under the floating band was considered and left off to keep the resting look
unchanged. Inert in `ClassTablePopup`, whose `overflow-x-auto` wrapper is the sticky containing
block and never scrolls vertically. The selects keep their `black/30` hairline. `whitespace-pre-line` on the cells
carries the two MOA cells' transcribed newline.

**Responsive pass 2026-08-05** (the second measured pass): `<h1>` ramps three steps 24/30/36;
bullets 20 → 16 (sixth exception, proportion); both absolute leadings became ratios; the CTA takes
`/wizard-intro`'s fix verbatim, closing item 33 (measured 525.5 × 56 at `lg`); captions and class
labels do not step (item 46's costs). **Three arches become cards below `xl`**
(`rounded-[128px] xl:rounded-b-none`, `pt-16 pb-16 xl:pb-0`, `gap-6 xl:gap-0` — any gap breaks the
drawn tiling); 64px clears the curve, worst ink clearance **+9.4px** at 320 (item 46). `grow` →
`xl:grow`, `flex-1` → `sm:flex-1` (in a column, grow factors split leftover **height** in the drawn
width ratio); **the row is pinned, not grown** (`xl:mt-auto`, the 24px floor moved to `xl:mb-6` on
the CTA — `mt-auto` and `mt-6` are the same property): under `grow` the segments hit 998px at
2560 × 1440 where content needs 391; pinned they scale with the root and land 9px off the drawn tops
(item 50). **The page's shipped horizontal overflow was at 320** (scrollWidth 340: a 149px column
holding a `basis-40 shrink-0` item) — fixed by stacking the right segment's columns below `sm`; why
320 is now in every sweep. **Verified**: the canvas render matches the artboard to the pixel; the
seven-width sweep (320–1440, item 46) found no horizontal overflow anywhere, 1280 dividing the band
in the drawn 339:524:353 ratio exactly, and arc clearance positive everywhere.

## 18. `/wizard/scenario` — the classes-to-consider screen

`src/routes/wizard/Scenario.tsx`, from **four** 1440 × 800 artboards (the screen is
`CLASSES_TO_CONSIDER[scenario]` end to end); geometry is documented at the call site, only the
responsive pass here. **The gap ramps; the boxes never do** — `rebalancing-agents`' row failing on
the same pixel (§11): the drawn 120px gap moves to `xl` (the 921px group fits 1008), and at `lg` the
row takes the stack's own 32 (3 × 227 + 2 × 32 = 745 in 752 — 7px slack v item 39's zero);
`lg:shrink` stays as a guard only. Below `lg` the boxes stack **at full size** (227 × 185) — 619px
of empty rectangle, bounded by item 16 and the data (`B-with` draws one box). The prose takes §2's
one step (third body-copy exception, drawn 26): 24 → 20; the caption lands on `text-xl lg:text-2xl`,
so every caption in the app agrees on size. `mt-40` does not ramp — the screen scrolls on a phone
regardless. **This screen has never been opened in a browser at any width** — even the 1440 case is
untested. Item 43.

## 19. Above the canvas — the board scales, it does not reflow

Every artboard is 1440 × 800. Above the canvas the drawing **scales**: three media queries at the
foot of `tokens.css` step the root font size — **a step ladder, not a clamp**:

| Viewport                      | root   | factor | board       |
| ----------------------------- | ------ | -----: | ----------- |
| 1441–1799 (any height)        | 16px   |  1.00× | 1440 × 800  |
| ≥1800 wide **and** ≥900 tall  | 112.5% | 1.125× | 1620 × 900  |
| ≥1800 wide **and** ≥1000 tall | 125%   |  1.25× | 1800 × 1000 |
| ≥2160 wide **and** ≥1200 tall | 150%   |  1.50× | 2160 × 1200 |

The queries overlap, ordered shortest-to-tallest — a 2560 × 1440 panel matches all three and the
last wins; they only move together. **Why scaling, not widening**: 1168px is already the top of a
comfortable line length, and scaling leaves the measure in _characters_ exactly what the artboard
drew; every fixed track in this file was measured off a 1440 canvas — widening reopens all of them,
scaling reopens none; and nothing exists to transcribe up there, so the four numbers are **plain
values in a media query, not tokens** (§12's rule). **Why 1.5× and not fill-the-screen**: 1.25× is
the angular-size parity answer for a 27" panel; 1.5× ships as a preference, the parity argument kept
on record against it; 1.78× makes the factor a property of the window, not the hardware.
Presentation is deliberately not handled here (projectors report 1920; ⌘+ is the presenter's tool);
the 1441–1799 dead band is the 14"/16" MacBook Pro defaults — the reference density.

**The steps are gated on height AS WELL AS width** — a width-only step can make a fitting page
scroll because the screen got _wider_ (a 2560 × 1080 ultrawide clears 2160 on width but needs the
1.25× rung to fit). Each height threshold is the tallest route at that step rounded up to the next 100. **Measured in Chromium at every rung, 2026-08-05** (`min-h-dvh` neutralised):

| route                             | 1.00× | 1.125× | 1.25× | 1.50× |
| --------------------------------- | ----: | -----: | ----: | ----: |
| `/education/disease-background`   |   756 |    850 |   945 |  1134 |
| `/education/fviii-mimetics`       |   735 |    827 |   919 |  1103 |
| `/education/treatment-landscape`  |   729 |    821 |   912 |  1094 |
| `/education/rebalancing-agents`   |   727 |    818 |   909 |  1091 |
| `/wizard`                         |   724 |    810 |   896 |  1068 |
| `/explore`                        |   667 |    751 |   834 |  1001 |
| `/`                               |   413 |    465 |   517 |   620 |
| `/wizard-intro`                   |   361 |    406 |   451 |   542 |
| `/education/prophylaxis-guidance` |   282 |    318 |   353 |   423 |

850 → **900**, 945 → **1000**, 1134 → **1200**. Measuring each rung rather than multiplying caught
`/wizard` running 4.5/9/18px short of proportion — one thing not growing (item 51); rounding up
absorbed three later 1.00× changes without moving a gate, and 900 (not 950) keeps a 1920 × 1080
desktop with a bookmarks bar (~920px) on the ladder. The five placeholder routes are 94px of padding
and not in the table — **re-measure when issues 12/13 land** (the bibliography will exceed one
screen at every factor). Width gates are exact fits (1440 × factor) except **1.125×, which keeps
1800** — its exact 1620 would reopen the dead band, deliberately preserved.

**The breakpoints do not move**: inside a media query `rem` resolves against the initial 16px, so
every `sm:`/`lg:`/`xl:` utility and §5's `64rem` stay put; the Sidebar's `matchMedia` builds from a
hardcoded px. `%` not `px` on the root so a user's font-size preference stays multiplied in. **The
px that had to move** — none findable by grep (compound arbitrary values, an inline `style`, one
value in the package): `Popup`'s three widths, `DiseaseBackground`'s 470px and
`TreatmentLandscape`'s 200/300px tracks, and `PopupFigure`'s inline `maxWidth` → rem (the pop-up
showed the fault first: a 1140px card whose type grew 1.25× inside it); plus `/wizard`'s Submit
(`text-[26px]` in mlg-components through a deliberate `max-lg:` hole — item 51). Verified at
2560 × 1330: every ratio holds (card 1140 → 1425, radius 40 → 50, tracks ×1.25 exactly).

**What scales, and what deliberately does not**: everything rem scales for free. **Radii and drawn
borders were converted to rem** because a radius or border is _shape_ — eight radius values plus all
four `border-4` sites (now `border-[0.25rem]`, item 49). **`border-[0.25rem]` is not `border-4`** —
the numeric utility is px and pins the edge while the object grows; the editor's
`suggestCanonicalClasses` offers the revert, two sites took it silently the same day, and all four
are now test-pinned. **Shadows, hairlines and focus rings stay px on purpose** — a root step is
text-and-spacing zoom, not page zoom, and §15's reverse-engineered shadow provenance would be worse
in rem (`--shadow-*` is inlined at build time, §1). **A box that `grow`s is a box that does not
scale**: `ArchBand` under `grow` measured 861px at 2560 × 1440 against a 337px canvas (2.6×) while
the type grew 1.25× — pinned (`mt-auto grow-0`, now the component's base) it steps with the root
exactly; `/explore`'s segment row was the third case (§17). The pin cost the canvas 44px on
`disease-background` (arch 337 → 293) — the first §19 change not pixel-identical at 1440, named
deliberately; `mt-4` had to become `mb-4` on the block above (`mt-auto` and `mt-4` are the same
property to tailwind-merge; taking `mt-auto` alone dropped the floor to 0 on every scrolling width).

**Verified**: fifteen viewport sizes on `disease-background` — every rung lands, nothing scrolls on
either axis, and the one-px-under pair (2159 × 1200 / 2160 × 1199) proves the height gate fails on
either axis alone. **1440 was proved pixel-identical**: all nine routes screenshotted applied and
stashed — byte-identical pairs, with a control proving the method non-vacuous; two later changes
spend that identity and are named — the `ArchBand` pin and `/wizard`'s Submit (~1.7px, item 51).
Items 47, 48 and 51 record what this pass did not settle.

## 20. The wizard gate's release cue

Each wizard form's Submit and the sidebar Next arrow open together — on the second answer for
`/wizard`, on the reason for `/wizard/reason` (ADR 0003, amended for the 2026-08-12 reason split);
until 2026-08-06 the un-dim was an instant snap. Two classes on Submit in `WizardSubmit.tsx` (the
"Submit inputs" row both forms share): **the un-dim eases** (the caller restates the package's
transition list with `opacity` added — tailwind-merge keeps the caller's list whole) and **the
release plays a one-shot pulse**, `--animate-gate-release`, 300ms ease-out peaking at `scale: 1.05`.
**All three numbers are invented — no artboard draws motion** — each derived from an existing
value: the 5% mirrors `active:scale-95` (press pushes in, release swells out — §15's grammar), the
300ms is the app's 150ms fade step out and back (designer question, item 52). State-driven, not
CSS-only: a `:not(:disabled)` animation would fire on every mount where the button is born
enabled — the case that must NOT pulse (a learner returning from `/wizard/scenario`);
`WizardSubmit` arms the class only when its gate flips closed → open on the current mount. `motion-reduce:animate-none` drops the pulse and keeps the opacity ease. The sidebar
arrow still snaps — `Sidebar` exposes no class hook for its arrows, and reaching into the package's
DOM is the brittleness debt 4 rejected; the fix is the package's (`opacity` in its transition lists
— mlg-reskin debt 7). Verified in Chromium at the canvas 2026-08-06 (item 52); the scaled boards are
arithmetic only.

## 21. Scrollbars

One declaration at the end of `tokens.css`, outside `@theme`:

```css
:root {
  scrollbar-color: var(--color-brand-teal-25) transparent;
}
```

**Both values are invented — no artboard draws a scrollbar** — derived from the palette per §20's
rule for motion: the thumb is `teal-25` (chrome, not content — the tint reads as part of the mint
ground rather than competing with the controls that carry meaning); the track is transparent because
every route sits on a §6 gradient an opaque track would stripe over. `scrollbar-color`, not
`::-webkit-scrollbar`: the two cannot mix (the property disables the pseudo-elements in Chromium),
every current engine honours the standard property, **it is inherited** (one `:root` rule reaches
every scroll container, including the DOM inside mlg-components, which no app class can otherwise
touch), and it survives as a runtime `var()` so a teal change moves it — the §3/§4 rule. The cost is
control: no radius, no hover/press steps; a drawn thumb is the pseudo-element route and must then
REPLACE this declaration in Chromium, keeping `scrollbar-color` only under
`@supports not selector(::-webkit-scrollbar)`. Not a token (nothing drawn to pin); `scrollbar-width`
and `scrollbar-gutter` stay at their defaults — thinning is a legibility trade nobody asked for, and
a reserved gutter would shift the centring §19's gates were measured against. Verified in Chromium
2026-08-06: resolves to `teal-25` exactly on the root and a nested scroll container, confirming
inheritance.

## 22. `/acronyms` — the first scrolling page

**No artboard exists for this route.** Gate 2 delivered palette and typography only, and issue 12's
four content pages were never drawn. Every value here is invented within the palette (ledger, §9),
which is a weaker footing than any other section in this file — a later export overrules all of it.

**Shape.** One column, 41 entries, chosen over the two-column alternative that would have fitted
800px. At the chapter body ramp (`text-base/[1.6]` → `lg:text-xl/[1.6]`, so 20px on a 32px line at
`lg`) the rows come to ~1312px, so **the page scrolls — the first route in the app that does**, and
§23 is now the second. What makes that affordable rather than a defect: the `bg-page` backdrop is `fixed inset-0`
(`AppShell.tsx`), so the §6 gradient stays put instead of tiling, and §21 already tints scrollbars
into the teal ramp. What it costs is item 53 — `<main>` is `lg:pb-0`, so the page carries its own
`lg:pb-16` rather than moving nine other routes off a measured constant. Below `lg`, `pb-bar`
already clears the bottom bar.

**The list** (`src/components/DefinitionList.tsx`, shared with §23). The component holds only what
both pages share — the `<dl>` pairing, the body ramp, the two colours; **the grid track and the
breakpoint it turns on at are the route's**, because an expansion and a sentence do not want the
same column. `/acronyms` passes terms on a `max-content` track so every expansion aligns on the
widest term (`VERITAS-Pro`) without a pinned width, `sm:gap-x-8`, `sm:gap-y-2`. Below `sm` the grid
is off and the pair stacks (the `<dt>` takes `mt-4`)
— that track plus a 41-character expansion does not survive 320px side by side. Terms bold
`brand-crimson-50` (the drug-sheet section-label idiom, §16: it gives the column a scannable edge,
which is what earns its keep over 1312px), expansions `text-black` (§11's chapter body).

**No `uppercase`, and this is content rather than taste.** The app's heading idiom is
`font-display … uppercase` on every `<h1>` and on `/explore`'s class labels; applied to these terms
it would be a transcription error, not a style — `aPCC` is _activated_ PCC and `APCC` is not the
same thing, and `mAb`, `aPTT`, `rFVIIa`, `siRNA`, `BsAb`, `QoL`, `Fab` and `VWF:Act` all carry the
same load. (`preserveCase` in §17 is the same collision solved from the other side.) Terms stay in
the body face: `font-display` is condensed and this app has never set it at mixed case. The `<h1>`
is a plain word, so it takes §11's chapter treatment unchanged, left-aligned.
`src/routes/acronyms.test.tsx` pins the absent class and the mixed-case terms, since jsdom cannot
compute `text-transform`.

**No ids, no search, no A–Z bar.** Navigation to this page is the sidebar button only — nothing in
the app links to a term — so issue 12's "anchors must resolve from cross-links" clause is retired
rather than deferred. Adding fragments later also means adding `scroll-mt` against the fixed 14px
`TopRule` (§10).

**Confirmed in a browser, not measured** (2026-08-06, by eye). The scroll, the bottom padding and
the fixed backdrop holding under a scrolling page all behave. The **numbers** above — the ~1312px
row height, the `max-content` track width, the below-`sm` stack point — are still arithmetic: no
`scrollHeight` or `getBoundingClientRect` reading was taken, and no width other than the one looked
at was opened. Enough to say the page is not broken; not enough to close item 30 for this route.

---

## 23. `/glossary` — the same list, a different column

Built 2026-08-06 as the near-twin of §22, and everything §22 says about its footing applies here
unchanged: **no artboard exists**, every value is invented within the palette, a later export
overrules all of it. Same `<h1>` (§11's chapter treatment, `uppercase`, left-aligned), same
`DefinitionList`, same crimson-term/black-definition pairing, same `lg:pb-16` against item 53.

**What could not carry over is the column.** `/acronyms` sizes its term track to `max-content`;
here the widest term is a phrase — "Factor VIIIa-mimetic bispecific antibody", **406px** at the
`lg` ramp — so `max-content` would spend a third of the width on one entry _and_ forbid it wrapping.
The track is a flat `20rem` (320px) instead, which fits eleven of the twelve terms on one line and
wraps only that one.

**The pair stacks below `xl`, not below `sm`.** Measured in Chromium (2026-08-06): the content
column is `min(73rem, 100vw − 272px)` at `lg` and up, so the definition track resolves to

| board | definition track      |                                                                         |
| ----- | --------------------- | ----------------------------------------------------------------------- |
| 1440  | 816px (~78 chars)     | the design width — the measure this layout is for                       |
| 1280  | 656px (~62 chars)     | the `xl` floor, still a column                                          |
| 1024  | **400px (~38 chars)** | why `lg` is wrong: a sentence set that narrow is a gutter, not a column |

So `xl:grid xl:grid-cols-[20rem_1fr] xl:gap-x-8 xl:gap-y-6`, and 1024–1279 stacks with the full
752px (~72 chars) to itself. `gap-y-6` where §22 takes `gap-y-2`: these rows run two and three lines,
and 8px between them would not read as separation. Stacked, the `<dt>` takes `mt-6` for the same
reason.

**Scroll.** 1082px at 1440×900, 1530px at 1024×768, 1633px at 375×812 — it scrolls at every board,
like §22 and for the same reasons, with no horizontal overflow at any of the five measured. The
`uppercase` prohibition also carries over and is _not_ only inherited pedantry: `Factor VIIIa-mimetic`
uppercased reads `VIIIA`, which names nothing. `src/routes/glossary.test.tsx` pins it the same way.

**No ids, no search.** Same as §22 — the sidebar button is the only way in, nothing links a term.

---

## 24. `/references` — the bibliography, and the app's first links

Built 2026-08-07 as the third of the undrawn content pages, and §22's footing note applies here
word for word: **no artboard exists**, gate 2 delivered palette and typography only, every value
below is invented within the palette (ledger, §9), and a later export overrules all of it.

Same `<h1>` as §22/§23 — §11's chapter treatment, `font-display … uppercase text-brand-crimson-50`,
left-aligned — and the same `lg:pb-16` against item 53.

**Shape.** One column, 29 entries, `space-y-4`, at the chapter body ramp
(`text-base/[1.6]` → `lg:text-xl/[1.6]`). Two columns at `xl` were considered and rejected: they
would halve the scroll to roughly one screen, but each column drops to ~560px, the `r8` HEMLIBRA
URL alone eats several lines of that, and alphabetical order read down-then-across is the harder
order to follow. §22 made the same call on weaker grounds.

**~~Hanging indent — `-indent-8 pl-8` on the `<li>`.~~ Withdrawn the same day, see ADR 0009.** The
argument was: the list is **unnumbered** (CONTEXT.md §9: nothing in the app cites a reference, so
numbers would be markers pointing at nothing), which removes the device that normally separates one
entry from the next, and with neither a marker nor an indent a wrapped second line and a new
citation are the same glyph at the same x. The reasoning was sound and its premise was false —
**`[PDF-V]` draws a disc on every entry**, which `out_raw.txt` flattens away. The indent was
invented to replace a marker the source has. Both bibliographies now render through `BulletList`,
and the marker does the job the indent was standing in for.

**Italic journal runs.** Also from ADR 0009: the board sets the journal abbreviation in
NotoSans-Italic on **15 of the 29** entries here — exactly those that name a journal — and this page
first shipped them flat. They are marked `_like this_` in `src/data/references.ts` per ADR 0004 and
rendered by `formatCitation`. `r15` is the one entry whose terminal period sits outside the run, as
drawn.

**`break-words` on the `<ul>` is correctness, not taste.** `r8`'s citation carries roughly 300
characters of unbreakable HEMLIBRA tracking URL — one token with no space, no hyphen and no
opportunity to wrap. Without it the page scrolls sideways at every board, and at 375 the URL is
several times the viewport. This is the only place in the app where a single string can do that.

**Links: `brand-lagoon-50` underlined** (`[&_a]:text-brand-lagoon-50 [&_a]:underline` on the list).
**These are the app's first external links** — everything else is a router `<Link>` in the sidebar,
which the package styles. Lagoon is the palette's bright-blue family and already the app's
interactive colour on `PopupButton` (§4.4), and `DrugSheetPopup.test.tsx:147` records that the
source drew its trial citations as "blue underlined links" — so the derivation has both a palette
role and a source precedent behind it, which is more than most of §22's values have. Crimson was
the alternative (it is what both sibling pages use for emphasis) and was rejected because crimson
is this app's heading colour: a crimson URL reads as a highlight, not as something to click.

**The markup split.** `src/lib/formatCitation.tsx` is presentation-free like `formatInline` — it
emits a bare `<a>` and `<sup>`, and the route colours them through a descendant selector. That
keeps the one link idiom described in one place here, and keeps the lib file about _what the
source draws_ rather than about this page. Its two non-obvious jobs: superscripting the 7 `®` on
the client's direction, and splitting the sentence period back out of each URL so the `href`
resolves (`…/download.` → `…/download`, `…-emicizumab/.` → `…-emicizumab/`).

**Confirmed by eye, not measured.** Verified in `src/routes/references.test.tsx` and
`src/lib/formatCitation.test.tsx`, and **opened and checked after the ADR 0009 rework** (2026-08-07,
user) — same footing as §22. jsdom computes no layout, so the bullet indent, the URL wrap and the
horizontal-overflow claim above were all arithmetic until that point; this route is the app's
longest scroll (~1900px at `lg`) and holds its only unbreakable strings, which is precisely where
arithmetic stops being trustworthy.

**What that settles, and what it does not.** The `break-words` claim §24 named as the one to check
first has now had eyes on it: `r8`'s ~300-character HEMLIBRA URL does not push the page sideways.
**No widths were recorded**, so this is a sighting rather than a sweep — item 30 stays open for
this route on the same terms as every other, and 320 in particular is still unvisited.

---

## 25. `/resources` — the curated panel, and the only content page on the spine

Built 2026-08-07 as the last of issue 12's four content pages. **Unlike §22–§24 this one is not
wholly invented**: no app artboard exists, but `[PDF-V]` draws the panel itself with real
typographic structure — bold sentence-case category labels, bulleted items, italic journal runs and
blue underlined URLs — and that structure is read off the board rather than guessed (ADR 0009).
Everything _below_ that (the ramps, the spacing, the breakpoints) is still invented within the
palette, and a later export overrules it.

**On the spine.** `SECTION_ORDER` index 11, between `/explore` and `/survey`, so Prev/Next come
from `AppSidebar` and the route carries no navigation of its own. It is the only one of issue 12's
four pages in the walkthrough; the other three are sidebar jumps.

**Same `<h1>` as §22–§24** — §11's chapter treatment, `font-display … uppercase
text-brand-crimson-50`, left-aligned — and the same `lg:pb-16` against item 53. The source draws
`Resources:` with a colon, in the board's own small blue label style; that is panel-label
typography, not the page's title, and the `<h1>` follows its three siblings instead.

**Categories are `<h2>` on the chapter ramp** — `text-2xl font-bold tracking-wide text-black
lg:text-3xl`, which is both the app's existing answer for a bold black sentence-case heading inside
a chapter (§11) _and_ what the panel draws. Nothing is invented here, which is worth stating on a
route with no artboard. Crimson uppercase was the alternative and was rejected: that is the page
title's voice, and three of them under one `<h1>` flattens the hierarchy the scroll depends on.

**The run-in colon is not carried.** The board writes `Clinical guidelines and recommendations:`
because the label shares its line's visual space with the list beneath it. Vertical space does that
binding here, so the colon would be transcribing a typographic mechanism rather than the copy.

**Three lists, not one.** Each category owns its `<ul>`, so the heading is the list's label rather
than a paragraph floating above a longer list. `mt-10 first:mt-8` between blocks — the first sits
closer to the `<h1>` than the categories sit to each other.

**Shape.** One column, 18 entries, `space-y-4`, at the chapter body ramp (`text-base/[1.6]` →
`lg:text-xl/[1.6]`), bulleted through `BulletList` with `format={formatCitation}`. §22 and §24 both
rejected two columns and the reasoning holds harder here: at `xl` each column drops to ~560px and
these citations run three and four lines at full width. Categories side by side at `xl` was the
other option — rejected because 5 / 8 / 5 items bottom out at three different heights and the eye
has to hunt for where each column restarts.

**The URL is put back inline.** `ResourceItem` splits `url` out of `text`; `[PDF-V]` draws it at the
tail of the citation, so the route composes `${text} ${url}.` and paints what the panel paints.
`formatCitation` then lifts the sentence period back out of the `href`, exactly as on §24. The
alternative — anchoring the citation text and never showing the URL — was rejected twice over: it
invents an affordance the source does not draw, and it would make 5 of 18 entries look
categorically unlike the other 13.

**Links reuse §24's derivation**, `[&_a]:text-brand-lagoon-50 [&_a]:underline`. Worth recording
that §24 _invented_ that pairing from the palette and this panel then corroborated it: the board
draws these URLs blue and underlined.

**`break-words` is inherited caution, not a need.** No URL on this page is unbreakable — the
longest, MASAC's, is ~180 characters and hyphenated throughout. It stays for consistency with §24
and because the cost of being wrong is a sideways page.

**Verified in `src/routes/resources.test.tsx`, then confirmed by eye** (2026-08-07, user) — same
footing as §22 and §24. jsdom computes no layout, so the column, the wrap and the bullet indent
were arithmetic until the page was opened. **No widths were recorded**, so item 30 covers this
route too: it has been seen, not swept.

## 26. `/how-to` — the interaction legend

Built 2026-08-11 to the user's brief, condensing the client's reference "HOW-TO-USE" board
(a sibling activity's) onto one screen. No artboard of our own exists; everything here is
derivation, which is why the page owns almost no styling: **every demo is the real component
doing its real job** — the `+` opens a real `Popup`, the figure is §5's clotting-cascade
`ExpandableFigure` reused, the agent box serves Fitusiran's §16 sheet, the drawer pair is §15's
accordion bar extracted to `src/components/NoteDisclosure.tsx` — so the legend cannot drift from
the controls it explains. Two decided exceptions: the BEGIN `Button` is look-only (advancing is
the Next arrow's job, per the user), and the sidebar replicas press like the real thing — hover,
focus, active, the package's own skins — but navigate nowhere (2026-08-11, user: "behave like
buttons, they don't have to navigate"). The arrow replicas' accessible names append
"example" ("Previous example") and the jump replicas are icon-only with the printed labels beside
them, so no replica ever answers to a live rail control's name — the spine walk reaches the real
arrows by exactly "Previous"/"Next", on this page too.

**On the spine**, index 1 between `/` and the first chapter — the landing CTA and both arrows
route through it via `SECTION_ORDER` with no special-casing.

**The reference board's "sections unlock after viewing" line is not carried**: the app has no
such locking, and the legend describes only the real gate — Next disabled on `/wizard` until the
three inputs are answered.

**Shape — three layouts, not two** (the `lg`→`xl` step added 2026-08-11, user). Standard
`PageSection` `<h1>`, then one grid wearing three arrangements: a stack below `lg`; **two columns
from `lg`** (`lg:grid-cols-2`, auto-placed from DOM order into buttons+pop-ups / images+agent box
/ legend+drawers rows — which is why `SidebarLegend` sits after the agent box in the DOM); and
the four-column board from `xl` (`xl:grid-cols-[1fr_1fr_1.2fr_1.1fr]`, the legend explicitly
spanning both rows in the column nearest the live rail, the drawers `xl:col-span-2`). The
two-column step is taller than a viewport and scrolls, so item 53's clearance rides on the grid
as `lg:mb-16 xl:mb-0` — `padsOwnBottom` cannot be width-conditional. Cards are `rounded-3xl
bg-demo-card p-5` — `--background-image-demo-card`, a client-pasted Figma radial (2026-08-11)
whose stops decode onto the palette: `agents-panel` (#00d8ff) at 5% into the same hue × 0.6 at
5%, so the token derives its first stop from `--color-agents-panel` and transcribes the second
(the fractional channels are Figma's colour output, not the §9 length-scale trap). It replaced
the earlier `bg-white/50` — a faint cool tint over the page gradient instead of a frosted panel.
Captions are on the mechanisms-caption voice (`font-bold text-popup-caption`, sentence case, no
shout).

**The legend labels do not step to `lg:text-lg`.** At `xl`'s narrowest (1280) the larger size
wraps every note to three lines and pushes the board ~38px past the 800 line; `text-base` at
every width is what buys the fit, measured, not guessed. The one-screen rule (§9 item 10) must
hold across the whole `xl` band, 1280 through 1440 — verified in Chromium at 390 / 768 / 1152 /
1280 / 1440, all with no sideways scroll and the board at exactly 800 from 1280 up.

## 27. `/survey` — the outcomes form

Built 2026-08-11 (issue 13). **No artboard exists** — like §22–§25, gate 2 delivered palette and
typography only, so every value below is invented within the palette and a later export overrules
it wholesale.

**On the spine**, the last section — Prev comes from `AppSidebar`, there is no Next, and the route
carries no navigation of its own. Standard §11 chapter `<h1>` via `PageSection`, `padsOwnBottom`.

**Classic radios, not `OptionGroup`** (2026-08-11, user: "small rounded classic radio buttons like
in online questionnaires, styled according to our palette"). The three §10 questions render as
stacked fieldsets of native radio inputs, `size-4` and tinted through `accent-brand-teal-50` —
`accent-color` keeps the UA's drawn geometry (the "classic" part) while landing the check on the
primary. Issue 03's `LikertScale` primitive is therefore moot and was never built. Prompt ramp
`text-lg font-bold lg:text-xl` — under §25's `<h2>`, since these are questions inside one page,
not section headings; options `text-base lg:text-lg`; the form runs the full content column
(`max-w-none`).

**Every string except the questions is unsourced.** `CONTEXT.md` §10 supplies the three prompts
and their options verbatim; the title ("Survey"), the button ("Submit"), the error ("Please select
an answer.") and the thank-you ("Thank you — your response has been submitted.", with its
"Back to home" button — the landing CTA's `Button` + `useNavigate` idiom on the submit's size
ramp, since the thank-you is the walkthrough's dead end) are authored here — a client copy pass
overrules any of them.

**Validation is inline, not `disabled`.** Submit stays enabled; a click with gaps marks each
unanswered fieldset with a crimson line (`text-brand-crimson-50`, wired to the group by
`aria-describedby`) that clears the moment that question is answered. A disabled button that
cannot say why was rejected as the worse a11y pattern.

**Submit is the package `Button` in its resting §4.2 crimson skin, on the wizard submit's size
ramp** (`px-6 leading-5 max-lg:text-lg lg:px-7.5 lg:py-4.5 lg:text-2xl`, §14) — the package
default is a fixed 26px/`px-16` at every width, so the ramp is what makes the button step with
the page; only the colours stay unoverridden, the wizard's lagoon recolour (§14) being that
screen's own. Right-aligned at the end of the column, where the wizard also puts its submit.

**The confirmation is optimistic, and the submitted flag is per-tab.** `submitSurvey`
(`src/lib/submitSurvey.ts`, issue 06's seam — wired 2026-08-11 to the live Google Form, whose
linked Sheet the client reads) POSTs `no-cors`, so success is unreadable by design and the inline
thank-you asserts handoff, not delivery. The flag lives in `sessionStorage`: a refresh in the tab
keeps the thank-you, a new tab gets a fresh survey — deliberately unlike the wizard answers'
in-memory scope (ADR 0003), so a reload cannot double-count a response.

## 28. Buttons are not copy — the `user-select` base rule

One element rule at the end of `tokens.css`, in `@layer base`:

```css
@layer base {
  button {
    -webkit-user-select: none;
    user-select: none;
  }
}
```

**Why**: a double-click on a control, or a drag that starts on one, highlights its label (and
flashes a selection over icon/image content) — selection UI on something that is an action, not
copy. The element selector reaches every `<button>` in the app AND inside mlg-components, whose
DOM no app class can otherwise touch (§21's reasoning) — verified that all five package controls
render through a single `<button>` element. Layered under `base`, not left bare, so a one-off
`select-text` utility can still opt a specific button's content back in if one ever carries
copyable text.

**The one non-`<button>` button**: OptionGroup's options are radio-backed `<label>`s (§14), which
the element rule cannot see — they carry `select-none` at the call site instead. Plain links (the
sidebar jump items, §24's references) stay selectable: they are content, not controls.

Both declarations are what Tailwind's own `select-none` utility emits; the `-webkit-` form is
still required by Safari.
