# 02 — NavBarButton → brand palette

Status: done (2026-07-28) — **tooltip inferred, not designed**

## Outcome

All nine `--color-ui-navbar-*` tokens plus three shadows overridden in `src/styles/tokens.css`.
The export was almost entirely recolouring residue: the designer repainted two things, and the
ring landed on `--color-brand-teal-100` exactly — which is what established the intent as teal,
so the rest was mapped onto the primary rather than transcribed.

**Still open — the tooltip was never supplied.** The export covers the button only; the shipped
ground/label (teal-100 / white) are **inferred**, flagged as such in `tokens.css`. Needs a real
export before it is churned. The dark-ground focus-ring risk this issue raised was resolved by
issue 04.
