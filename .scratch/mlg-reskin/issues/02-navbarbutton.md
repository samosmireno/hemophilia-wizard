# 02 — NavBarButton → brand palette

Status: done (2026-07-28) — tooltip inferred, not designed
Blocked by: —

## Goal

Re-skin the round white utility button with hover/focus tooltip.

## What the export turned out to be

The designer's four-state export was **almost entirely recolouring residue**
(spec method, step 2) — the largest instance in the package so far. Sampling the
PNG per-pixel returned the mlg default emerald byte-for-byte in five of seven
fills and in all three shadows:

| slot        | sampled   | package default    | verdict   |
| ----------- | --------- | ------------------ | --------- |
| `bg`        | `#ffffff` | `ui-white`         | residue   |
| `fg`        | `#33a482` | `ui-accent-strong` | residue   |
| `bg-hover`  | `#dffff6` | `#ecfdf5`          | **moved** |
| `fg-hover`  | `#43cea4` | `ui-accent`        | residue   |
| `bg-active` | `#d2d5d4` | `ui-mist`          | residue   |
| `fg-active` | `#257b61` | `ui-accent-deep`   | residue   |
| `ring`      | `#0d2e26` | `#165542`          | **moved** |

The designer repainted exactly two things, and the ring landed on `#0d2e26` —
`--color-brand-teal-100` **exactly**. That exactness is the whole argument: the
intent was teal, the rest simply never got repainted. Transcribing the export
would have left this component emerald next to a crimson `Button`, which is the
"stray artifact" failure the coverage check exists to catch.

So the full set is mapped onto the primary, anchored on the two deliberate moves.
`bg-hover` corroborates it independently: `#dffff6` is `teal-0` to within
dL .004 (luminance ratio 1.02x) — the third time `#eef8f6` has surfaced as a
designer's "mint tint" in this package.

All three shadows carried emerald glows (`rgba(51,164,130,.5)` accent-strong,
`rgba(37,123,97,1)` accent-deep) plus the same stray `rgba(26,132,126,.53)`
`#1a847e` teal the arrows and `Button` both had. Restated on teal-50/teal-75.

## The hover glyph could not be transcribed

The export's hover lift is `accent-strong → accent`, a **1.66x luminance jump** —
and it fails its own contrast check at **1.86:1**, because on a tonally inverted
component the ground lightens on hover too. `teal-25` reproduces the failure
almost exactly (1.84:1): the `-25` pastel trap from the other side.

That lift is the _package's_ relationship, not a designer decision, so it is
residue like everything else around it. Direction kept, magnitude cut to what
the inverted tonality affords —
`color-mix(in oklab, teal-50 90%, teal-25)` → **3.56:1** on teal-0. The hover
still reads clearly because the ground carries it (white → mint).

Contrast, all states (3:1 icon threshold; 4.5:1 for the tooltip):

| state   | design   | shipped |
| ------- | -------- | ------- |
| default | 3.10:1   | 4.18:1  |
| hover   | 1.86:1 ✗ | 3.56:1  |
| active  | 3.48:1   | 5.44:1  |
| tooltip | —        | 14.62:1 |

## Raised — blocks issue 04 → RESOLVED by issue 04 (2026-07-28)

Issue 04 took a third exit, neither of the two below: keep teal-100 as the bar ground and
make the **ring** breakpoint-aware instead, matching the breakpoint `Sidebar` itself
switches on. Above it the ring stays teal-100 on the light page (14.62:1); below it flips
to white on the teal-100 bar (14.62:1). No package release.

The framing below was also slightly off in one respect, worth knowing if this is
revisited: it is not only the rail's ground that decides this. **`SidebarRail` paints no
background at all** — the token is bottom-bar-only, and in the rail the ring resolves
against the _page_. That is precisely why one value could not serve both. Details and the
full contrast table are in `04-sidebar.md`.

The forward risk remains: the rail passes only because the page currently has no
background. See `.scratch/app-buildout/issues/02-semantic-token-scaffold.md`.

### Original text

**The focus ring disappears on a dark ground.** `NavBarButton` draws its outline
with no `-outline-offset`, so the ring lands on the _page_ ground rather than the
button's own white fill. On teal-100 that is **1.00:1** — verified on-screen, not
inferred. `Button` is immune because it draws its ring inset, deliberately, for
this exact reason (see its token comment).

This component lives in the nav rail, so it is issue 04's ground that decides it.
Either:

1. `--color-ui-sidebar-bg` must not be teal-100 (note spec decision 4 sends the
   ramp to teal — so this is a live collision, not a hypothetical), or
2. v0.4.x adds `-outline-offset-[3px]` to `NavBarButton` to match `Button`.

A focus indicator that vanishes is a WCAG 2.4.11 failure. Do not close issue 04
without resolving this.

## Still open

**The tooltip was never supplied** — the export covers the button only. Shipped
values are _inferred_, flagged as such in `tokens.css`: teal-100 ground / white
label, matching the ring because teal-100 is the one colour the designer
explicitly reached for here. 14.62:1, well past the 4.5:1 body threshold this is
the only element in the package to owe.

Worth knowing if it gets revisited: `slate-100` was measured as an alternative
and gains nothing — against a teal-100 sidebar it separates at 1.16:1 versus
teal-100's 1.00:1, i.e. both merge as a _box_. Only the label's contrast is
doing real work, and that is fine either way. Not worth churning without a real
export.

## Notes

- `--color-ui-navbar-bg-active` is kept as the package's literal `#d2d5d4`. A
  pressed white tile going neutral grey is palette-agnostic by design and the
  brand has no equivalent — slate is blue-tinted and its `-0` is lighter than
  the white ground, the wrong direction for a press. Same precedent as
  `--color-ui-btn-fg-active: #939393`. This is the one token indistinguishable
  from residue; it is also the one where residue and correct answer coincide.
- The dead `hover:border-white/20` stays dead (spec constraint 2). There is no
  `--shadow-ui-navbar-hover` in the package — the component paints
  `shadow-ui-navbar` through hover, and the export agrees, so nothing was owed.
- `Sidebar`'s "More" trigger reads these tokens and moved with them, as intended.

## Verification

- Compiled CSS: all 9 colour tokens resolve in `:root` as `var()` chains; both
  `@theme` shadows inlined onto the utility rules carrying teal
  (`#2d8a7887`, `#1a5a4c`) — no emerald survives.
- Coverage check: `navbar` fully clear. 14 tokens remain (popup 7,
  popup-open 6, sidebar 1), down from 23.
- Rendered all four states on white and teal-100 grounds; preview scaffolding
  removed from `Landing.tsx`.
