# 00 — NavArrowButton → brand crimson

Status: done (2026-07-28)

## Outcome

Re-skinned from the package emerald onto brand crimson as component-layer overrides in
`src/styles/tokens.css` (the `--color-ui-arrow-*` and `--shadow-ui-arrow*` sets — see that
file for the shipped values). No package change needed.

Two calls worth remembering: hover is a `color-mix` toward `crimson-25`, **not** `crimson-25`
itself — the design's hover is a hue rotation at constant lightness, and the `-25` step is a
pastel tint; and the press state's `#939393` chevron is an off-palette literal supplied by the
designer. Focus ring is white — **open risk** if the arrows ever sit on a light background.
