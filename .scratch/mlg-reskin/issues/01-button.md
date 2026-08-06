# 01 — Button → brand crimson (teal focus)

Status: done (2026-07-28)

## Outcome

All eight `--color-ui-btn-*` tokens plus two shadows overridden in `src/styles/tokens.css`
(shipped values live there); no package change needed. The export was sampled per-pixel:
default and press land exactly on `crimson-50`/`crimson-75`. Deviations — `-bg-hover` is the
literal `#f73150` (more chromatic than any step the scale has), and focus fill/ring map to
`teal-50`/`teal-100` rather than the export's near-identical off-scale teals.
For the designer: `#13615D` is in their colour list but appears nowhere in the export.
