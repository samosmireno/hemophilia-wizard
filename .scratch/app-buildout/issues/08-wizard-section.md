# 08 — Wizard section

Status: ready-for-human
Phase: 1
Blocked by: 00, 01, 02, 03
Gate: Gate 1 (client wireframe approval)

## Goal

Build the branching decision-tree section at `/wizard` — the meatiest, highest-value
screen.

## Scope

- Flow: Q1 Hemophilia A or B → Q2 inhibitors (Yes/No) → Q3 reason for switching
  (adherence / treatment burden / bleeding control / monitoring) → leaf recommendation.
- Leaf renders the curated NFT list from `recommend(type, hasInhibitors, reason)` in
  `src/data/wizard.ts` plus the scenario's pop-up note pair.
- V3 requirement: each reason box gets **Considerations / Strategies tabs** (data from
  issue 00, Tabs primitive from issue 03). Note (per 2026-07-27 re-scan, `CONTEXT.md` §4.2):
  the note text is **scenario-specific** — the leaf shows _this scenario's_ Considerations list
  **and** Strategies list, one per tab (32 notes total across the tree), not a single shared
  per-reason note.
- Wizard state machine: forward/back/reset; answers as `RadioCard` (issue 03).
- Structural + semantic tokens only; behavior fully wired.

## Acceptance

- All 4 scenarios (HA/HB × ±inhibitors) reach correct curated leaf, verified against
  `wizard.ts`.
- Back/reset work; drug names in the leaf open the drug-sheet overlay by appending
  `?drug=<id>` to `/wizard` (issue 10) — no navigation away from the wizard.
- Tests cover the branch → recommendation mapping.

## Notes

Structural build starts after Gate 1. Do not block on final styling.
