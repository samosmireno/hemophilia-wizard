# 05 — Re-point the base ramp at brand teal

Status: **moot — closed unrun (2026-07-28)**

## Outcome

Not needed. Issue 04 set the last outstanding token, so the spec's coverage check returns
empty — all 38 component tokens are overridden, the base ramp is entirely unreferenced, and
re-pointing it would change nothing on screen.

**Re-open trigger:** the coverage check returning a non-empty list — i.e. a package upgrade
adding a token we do not override, which would silently fall back to the package's emerald.
If that happens, the ramp goes to brand **teal** (the primary), never crimson: crimson is the
accent, and re-pointing there would invert the palette's own semantics.
