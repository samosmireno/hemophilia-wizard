# 10 — Drug info sheets (modal card, opened from component state)

Status: in-progress (scope narrowed)
Phase: 1

## Goal

Per-drug info sheets as a `Popup` over the current route, opened by component state — no
`/drugs/:id` route and no `?drug=` param (ADR 0006 reversed that).

## Done

`src/components/DrugSheetPopup.tsx` + all seven sheets in `src/data/drug-sheets.ts`, keyed by
verbatim agent name; five fixed sections, unknown/absent name opens nothing. Tests sweep all
seven. Wired on `/explore` and `/wizard/therapies`. Client cut 2026-08-04: trial citation
tails deleted, only the name + NCT number is kept.

## Remaining

Education-chapter wiring is an **untaken design decision**, not just unbuilt work:

- `RebalancingAgents`' three named agents (Concizumab / Marstacimab / Fitusiran) render as
  plain text — nobody has said whether they should open their §6 sheets.
- `FviiiMimetics`' four cards open **chapter** Popups, not the §6 sheets, so a reader meets two
  different cards for the same drug depending on the surface. Needs the designer to rule.
