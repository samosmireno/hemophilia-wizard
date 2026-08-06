# 03 — PopupButton → brand lagoon

Status: done (2026-07-28) — **RAISED 1 still open: an a11y decision only the designer can
make.** RAISED 2 resolved in `mlg-components` v0.4.1.

## Outcome

The `+` → `×` disclosure trigger is **lagoon** — neither the arrows' crimson nor the library's
teal. All 14 `--color-ui-popup-*` / `--color-ui-popup-open-*` tokens are overridden in
`src/styles/tokens.css`; the four off-scale colours are one desaturated lagoon sub-ramp,
derived with `color-mix` so a lagoon change still moves them.

RAISED 2 (the open skin's focus ground was hardcoded to its hover ground) was fixed upstream in
v0.4.1, which added `--color-ui-popup-open-bg-focus`; the consumer takes it in one line.

## RAISED 1 — the design fails WCAG 1.4.11 (3:1) in every state it specifies

| state          | fg / bg                | ratio      |
| -------------- | ---------------------- | ---------- |
| closed default | `#fff` on lagoon-25    | **2.17:1** |
| closed hover   | `#bff5ff` on lagoon-25 | **1.83:1** |
| closed press   | `#46595c` on `#67a0aa` | **2.49:1** |
| closed focus   | `#fff` on lagoon-25    | **2.17:1** |
| open default   | `#46595c` on `#67a0aa` | **2.49:1** |
| open hover     | `#317b8a` on `#79ccdb` | **2.66:1** |
| open focus     | `#46595c` on `#67a0aa` | **2.49:1** |

**0 of 7 states pass.** Unlike issues 00 and 02, this is **provably not a mapping error** —
the sampled ground `#4abfd4` _is_ `lagoon-25`, to three decimals in L, C and H. The cause is
structural: lagoon-25 is a **light** step being used as a saturated ground under a white
glyph, and every other component in the library uses its scale's **-50** step for that job
(`arrow-bg` and `btn-bg` are crimson-50, `navbar-fg` is teal-50). This is the only component
painting a `-25` as a fill. The `+`/`×` is what distinguishes the control's expanded state, so
1.4.11 applies.

Shipped faithfully as designed. The four exits:

| fix                                | ratio  | cost                                                                                    |
| ---------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| `--color-ui-popup-bg` → lagoon-50  | 3.58:1 | ground goes from bright cyan to a deeper teal-blue — changes the component's character  |
| keep lagoon-25, glyph → lagoon-75  | 3.20:1 | dark glyph on bright cyan; collides with the open skin, which already owns "dark glyph" |
| keep lagoon-25, glyph → lagoon-100 | 7.01:1 | same collision, stronger                                                                |
| accept as designed                 | —      | 1.4.11 failure across all seven states                                                  |

The first is a one-token change and the only one that does not break the design's own
closed/open tonal logic — but **the choice is the designer's, not ours**, and it moves all
seven states at once. Nothing else is blocked on it.
