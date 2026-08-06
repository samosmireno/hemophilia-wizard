# 15 — Styling: propagate + states / motion / responsive

Status: in-progress
Phase: 3
Blocked by: 14

## Goal

Propagate the visual language across every section and add interactive polish: hover / focus /
active / disabled on all primitives, responsive coverage with no horizontal body overflow,
optional motion.

## Done

Most of the scope shipped **inside the Phase-1 work** rather than as a separate pass — state
token sets for all five mlg components, per-page responsive sweeps verified in Chromium, and
motion honouring `prefers-reduced-motion`.

## Remaining

- **Cross-section consistency is unreachable** while `/resources`, `/references`, `/glossary`,
  `/acronyms`, `/survey` (issues 12, 13) and the explore table (issue 09) are stubs — there is
  nothing to be consistent with.
- Residual polish is tracked as `docs/styling.md` §9 open items — **46 open**.
