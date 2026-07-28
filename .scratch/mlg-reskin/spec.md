# Spec: mlg-components re-skin → brand palette

## Summary

Re-skin the five `mlg-components` (`Button`, `NavBarButton`, `NavArrowButton`,
`PopupButton`, `Sidebar`) from the package's default emerald ramp onto this
project's brand palette, **one component at a time**, driven by per-state Figma
exports from the designer.

**All five components are done (issues 00-04), and the base ramp (05) is moot** —
the coverage check returns empty, so the ramp is entirely unreferenced.

## Package facts

- `mlg-components` is **owned by us** — `github.com/samosmireno/mlg-components`,
  published by `samosmireno`. Installed version: **0.4.0**.
- Wired up in `src/styles/tokens.css:6-11`: `@import "tailwindcss"`, then
  `@import "mlg-components/tokens.css"`, then
  `@source "../../node_modules/mlg-components/dist"` (path relative to that CSS
  file; the `@source` is required or the components render unstyled).
- **Two token layers.** A base ramp (`--color-ui-accent*`, `--color-ui-white`,
  `--color-ui-ink`, …) is the only place a literal colour is written. Each
  component owns an independent set (`--color-ui-arrow-*`, `--color-ui-btn-*`,
  `--color-ui-navbar-*`, `--color-ui-popup-*`, `--color-ui-popup-open-*`,
  `--color-ui-sidebar-bg`) that are `var()` references onto the ramp.
  Components never read the ramp directly.
- **Consequence:** component-layer overrides beat the ramp. Re-pointing the ramp
  later does **not** disturb a component already overridden. This is why
  incremental per-component work is safe and not rework.
- Every button exposes the same shape: `-bg`, `-bg-hover`, `-bg-active`, `-fg`,
  `-fg-hover`, `-fg-active`, `-ring`. Extras: `Button` adds `-bg-focus`;
  `NavBarButton` adds `-tooltip-bg`/`-tooltip-fg`; `PopupButton` adds
  `-outline-hover`.

## Hard constraints

1. **Shadows must be overridden in `@theme`, never `:root`.** Tailwind resolves
   `--shadow-*` at build time and inlines the value; a `:root` rule naming a
   shadow token compiles to nothing. Colour tokens work in either place. This is
   documented in the package README.
2. **No hardcoded colour may reach a rendered surface.** Every colour a
   component paints must come from a `--color-ui-*` token, or it becomes the one
   thing a consuming project cannot re-skin. This is why the dead
   `hover:border-white/20` in `NavArrowButton`/`NavBarButton` was deliberately
   left dead in v0.4.0 rather than activated — `white/20` is Tailwind's literal
   white with no token behind it.
3. **Hover edges are `inset 0 0 0 1px` folded into the `--shadow-ui-*-hover`
   token, never a `border`.** This is how `Button` already does it — one
   mechanism package-wide. Costs no layout box, cannot collide with the focus
   `outline`.

## Method: translating a Figma four-state export

The designer supplies a Figma "copy as Tailwind" dump of the four states
(default / clicked / hover / focus). That dump is **not** literal truth. Run it
through these steps.

### 1. Distrust the palette

Figma exports emit **stock Tailwind class names** (`bg-red-500`, `rose-900`,
`neutral-400`). These are the export generator's nearest-match approximations,
not the designer's values. Two follow-ons:

- Ask the designer for the **true hexes**. On the arrows, `slate-100`/`neutral-400`
  were actually `#EEF8F6`/`#939393`.
- Better: **sample the designer's PNG per-pixel** rather than reading either the
  class names or the accompanying hex list, which says which colours are in play
  but not where each one goes. On `Button` this settled the mapping outright —
  three states landed _exactly_ on brand steps, which is itself the proof the
  stock names were stand-ins, and the focus state's `bg-green-100` turned out to
  be a mid-teal. A dozen lines of Pillow; do it first, before any reasoning.
- Stock swatches are usually stand-ins for a **brand scale**, not literal intent.
  Map onto `--color-brand-*`, don't transcribe.
- Figma's exporter uses **Tailwind v3** hexes; this project is on **v4**, where
  e.g. `red-500` is a visibly different colour. Never carry a class name across —
  pin the resolved value.

### 2. Hunt for recolouring residue

A designer recolouring the mlg default component in Figma will leave the
original emerald/teal in places they didn't repaint. On the arrows there were
three: a green inner glow `rgba(100,142,100,.53)`, an untouched teal glow
`rgba(26,132,126,.53)`, and `#EEF8F6` (which is exactly `--color-brand-teal-0`).
Treat off-family colours as suspect and confirm intent before transcribing.

### 3. Measure the state deltas in OKLCH, don't eyeball them

**This is the step that caught the biggest error.** Use
`.scratch/mlg-reskin/color-delta.mjs` (`node color-delta.mjs`). It prints
L / C / H and relative luminance for any hex, and computes contrast ratios.

The trap: **the `-25` step of every brand scale is a pastel tint, not a lighter
sibling of `-50`.** `crimson-25` is 2.6x the luminance and half the chroma of
`crimson-50`. Meanwhile the designer's hover states are typically **hue
rotations at constant lightness** (the arrows' hover was a 1.03x luminance
ratio — essentially no lightening at all). Mapping such a hover to `-25`
produces a washed-out pastel nothing like the design.

When the scale has no step for the relationship the design needs, derive one and
keep it tied to the scale:

```css
color-mix(in oklab, var(--color-brand-crimson-50) 96%, var(--color-brand-crimson-25))
```

### 4. Check icon/text contrast at every state

Threshold is **3:1 for icon strokes and large text**, 4.5:1 for body text. A
correct palette mapping usually satisfies this for free — on the arrows, the
1.85:1 hover failure disappeared (→ 4.10:1) once the hover value was fixed.
A contrast failure is more often a symptom of a bad mapping than a real
design/accessibility tradeoff. Fix the mapping before accepting an exception.

### 5. Verify against compiled CSS, not source

`@theme` shadow inlining means source and output diverge. Confirm with:

```bash
npm run build
npx prettier --parser css dist/assets/index-*.css | grep -A5 "ui-<prefix>"
```

Colour tokens should appear in `:root` as `var()` chains; shadows are inlined
into the utility rules (`.hover\:shadow-ui-*-hover:hover`).

### 6. Confirm visually, then clean up

Temporarily render the component in `src/routes/Landing.tsx` on **both a light
and a dark surface** (focus rings are often white and invisible on light), run
`npm run dev`, then remove the block. Do not leave preview scaffolding behind.

## Coverage check

**38** component tokens resolve to the base ramp. Components never read the ramp
directly, so a component is fully re-skinned only when _all_ of its tokens are
overridden — miss one and it silently falls back to the package's emerald, which
reads as a stray artifact rather than a near-miss.

This lists every token still falling through:

```bash
comm -23 \
  <(grep -oE '^\s*--color-ui-[a-z-]+: var\(--color-ui-' node_modules/mlg-components/dist/tokens.css \
    | grep -oE '\-\-color-ui-[a-z-]+' | sort -u) \
  <(grep -oE '^\s*--color-ui-[a-z-]+:' src/styles/tokens.css \
    | grep -oE '\-\-color-ui-[a-z-]+' | sort -u)
```

Per-component totals: `navbar` 9, `btn` 8, `popup` 7, `arrow` 7, `popup-open` 6,
`sidebar` 1 — **38/38 done, output is empty (2026-07-28).** The ramp is entirely
unreferenced and issue 05 is closed unrun.

Run this at the end of every component issue. It is also the **trigger to
re-open issue 05**: if a package upgrade adds a token we do not override, this
stops being empty and that token silently falls back to the package's emerald.

## Decisions (settled)

1. **Per-component, incremental.** Not a single big-bang re-skin.
2. **`NavArrowButton` is crimson** — the palette's _accent_, not its primary.
   Deliberate: prev/next are the highest-frequency controls in the wizard, so
   they carry the accent while everything else sits in the primary.
   **Under question as of issue 01:** `Button` came back crimson too, so the
   accent currently marks nothing out. See issue 01 → "Raised".
   **Widened by issue 03:** `PopupButton` came back neither — it is **lagoon**,
   landing on `lagoon-25` exactly. The library is now three families across five
   components (crimson / teal / lagoon), which is the question to settle in the
   all-five review below, not one to settle per component.
3. **Components first, ramp last.** Issues 01-04 are driven by real Figma
   exports; issue 05 is driven by inference. Do the evidence-backed work first.
   Two consequences: the accent/primary hierarchy is only judgeable with all
   five components in front of you, not one at a time; and if 01-04 achieve full
   coverage, the ramp is unreferenced and 05 never needs to run.
4. **If the ramp is re-pointed, it goes to brand _teal_** (the primary), **not**
   crimson — that would make the whole library accent-coloured and invert the
   palette's own semantics. See issue 05.
5. **v0.4.0 needs no further package changes** for the arrows. The dead
   `hover:border-white/20` stays dead (constraint 2 above).

## Open

All component issues are closed. **Two things remain**: the all-five visual
review below (not done), and issue 06's package debts.

| Issue | Component        | Status                                           |
| ----- | ---------------- | ------------------------------------------------ |
| 00    | `NavArrowButton` | done (2026-07-28)                                |
| 01    | `Button`         | done (2026-07-28)                                |
| 02    | `NavBarButton`   | done (2026-07-28) — raised, resolved by 04       |
| 03    | `PopupButton`    | done (2026-07-28) — **2 raised, still open**     |
| 04    | `Sidebar`        | done (2026-07-28) — no export; inferred          |
| 05    | base ramp → teal | **moot, closed unrun** — coverage check empty    |
| 06    | package debts    | ready-for-human — 3 gaps found building issue 18 |

### Still owed: the all-five visual review

**Not done.** All five components are token-complete and every contrast claim in
issues 00-04 was measured, but nobody has yet put them on screen together and
looked. That review is what decision 2 below is waiting on — is the "arrows in
the accent, everything else in the primary" hierarchy actually reading, now that
`Button` is also crimson and `PopupButton` is lagoon?

It is now cheaper than when this was written: `Sidebar` is mounted for real in
`AppShell` (app-buildout issue 18), so four of the five are on every page. Run
`npm run dev`, check both the rail (>=1024px) and the bar (<1024px) — they read
differently, and the bar is the only place `--color-ui-sidebar-bg` is visible at
all. `Button` and `PopupButton` still need a temporary render (Method step 6);
remove the scaffolding afterwards.

Two things to look at specifically, both inferred rather than exported:
`--color-ui-sidebar-bg` (issue 04 — no Figma export ever arrived) and
`NavBarButton`'s tooltip (issue 02 — never supplied).

**Resolved (2026-07-28).** The paragraph that stood here said issue 04 carried a
constraint it could not satisfy: three focus rings resolving against the page
ground and disagreeing about whether it should be light or dark. Two corrections
came out of doing the work:

- **`PopupButton` is not in the `Sidebar`.** The bottom bar's "More" trigger is
  a bespoke button reading `--color-ui-navbar-*`. So only two rings were ever in
  play here — `NavBarButton` and `NavArrowButton` — and `PopupButton`'s rings
  resolve against whatever page mounts it (issue 10's drug sheets). Issue 03's
  "Raised" is therefore still open, but it is not issue 04's problem.
- **`SidebarRail` paints no background at all**, so `--color-ui-sidebar-bg` is a
  bottom-bar-only token and the rail's rings resolve against the _page_.

That second point is why no single value worked: the same token faced two
different grounds. The fix was to make the **ring** breakpoint-aware rather than
the ground, using a media query at the breakpoint `Sidebar` itself switches on.
Full contrast table and reasoning in `issues/04-sidebar.md`.

One forward risk survives: the rail passes only because the page has no
background yet. See `.scratch/app-buildout/issues/02-semantic-token-scaffold.md`.

## Related

- `.scratch/app-buildout/` — the main UI build-out WBS. Issue 14 (Gate-2 styling)
  and issue 18 (navigation sidebar) are the consumers of this work.
