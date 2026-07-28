# 05 — Re-point the base ramp at brand teal

Status: **moot — closed unrun (2026-07-28)**
Blocked by: 01, 02, 03, 04 (all done)

## Outcome: not needed

Exactly what this issue anticipated below came true. Issue 04 set the last
outstanding token (`--color-ui-sidebar-bg`) and the spec's coverage check now
returns **empty** — all 38 component tokens are overridden, so the base ramp is
entirely unreferenced and re-pointing it would change nothing on screen.

Everything below is the original plan, kept because it stops being hypothetical
the moment the package adds a token we do not override. **Re-open this issue if
the coverage check ever returns a non-empty list** — that is the trigger, and
the safety-net argument below is the reason it is worth acting on rather than
patching the one token.

## Goal

Move the package's base ramp (`--color-ui-accent*`) off its default emerald and
onto the brand **teal** scale.

## This may turn out to be unnecessary

**38** component tokens resolve to the ramp. Components never read the ramp
directly (verified: no `bg-ui-accent*` / `text-ui-ink*` etc. appears in
`dist/index.js`). So if issues 01-04 override all of their tokens, **the ramp
ends up entirely unreferenced** and this issue is moot.

Coverage as of 2026-07-28: **38/38 done — check returns empty.**

The reason to keep this issue open anyway is as a **safety net**. A token missed
in 01-04 falls back to the ramp, and a stray _emerald_ artifact is far more
jarring than a slightly-off teal one. Setting the ramp to teal at the end makes
every gap degrade gracefully instead of loudly.

## Why teal, not crimson

`src/styles/tokens.css` labels teal **PRIMARY** and crimson **ACCENT**. The
arrows are deliberately painted in the _accent_ (issue 00, decision: prev/next
are the highest-frequency wizard controls and carry the accent while everything
else sits in the primary). Re-pointing the ramp at crimson would make the entire
library accent-coloured and invert that hierarchy.

## Why it runs last

Component-layer overrides beat the ramp, so this can never disturb a component
already re-skinned — the ordering is a matter of evidence, not safety.

Issues 01-04 are driven by **actual Figma exports**. This issue is driven by an
**inference**: that `tokens.css` labelling teal PRIMARY / crimson ACCENT means
the library's default family should be teal. The only design evidence in hand
(the arrows) is crimson, with one weak teal signal — the chevron's `#EEF8F6` is
exactly `brand-teal-0`.

Do the evidence-backed work first. By the time 01-04 are done the question is
either answered by the designs or irrelevant because the ramp is unreferenced.

## Scope

Six ramp steps map onto a five-step brand scale:

| Ramp token                  | Default   | Proposed                                |
| --------------------------- | --------- | --------------------------------------- |
| `--color-ui-accent-tint`    | `#ecfdf5` | `brand-teal-0` (`#eef8f6`) — near-exact |
| `--color-ui-accent-light`   | `#5eead4` | `brand-teal-25` (`#7ec5b6`)             |
| `--color-ui-accent`         | `#43cea4` | `brand-teal-50` (`#2d8a78`)             |
| `--color-ui-accent-strong`  | `#33a482` | ⚠ see below                             |
| `--color-ui-accent-deep`    | `#257b61` | `brand-teal-75` (`#1a5a4c`)             |
| `--color-ui-accent-darkest` | `#165542` | `brand-teal-100` (`#0d2e26`)            |

**The wrinkle:** `accent-strong` and `accent-deep` both fall between `teal-50`
and `teal-75`. Either derive a mid-value
(`color-mix(in oklab, var(--color-brand-teal-50) 50%, var(--color-brand-teal-75))`)
or collapse both onto `teal-75` — but note `Button` relies on `-strong` and
`-deep` being _distinct_ so a focused button never reads as pressed. Collapsing
them breaks that. **Derive the mid-value.**

Also check `--color-ui-ink` / `--color-ui-ink-deep` (used by `Sidebar` chrome
and tooltips) and `--color-ui-azure` — decide whether these move to
`brand-slate-*` or stay neutral.

## Watch for

- Run `color-delta.mjs` on the before/after pairs. The default ramp is a
  _brighter, lower-chroma_ emerald than brand teal; a naive step-for-step swap
  will darken every component noticeably. That may be correct — just confirm it
  is intended rather than incidental.
- Ramp overrides go in the `@theme` block in `src/styles/tokens.css`, after the
  palette definitions. Colour tokens would also work in `:root`; keeping
  everything in `@theme` is consistent and required for any shadow work.

## Verification

Render all five components on light and dark surfaces (see spec → Method step 6),
confirm the arrows are **unchanged** by this edit, then remove the preview block.
