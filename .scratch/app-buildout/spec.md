# Spec: HM-85L Treatment Wizard — app build-out

## Summary

Build the interactive CME "Treatment Wizard" (code HM-85L) as a **sectioned/routed
React SPA**. The data layer is already built and approved (`src/data/treatments.ts`
filter engine, `src/data/wizard.ts` branching engine, `treatment-wizard-demo.html`
proof). The React UI is still the starter shell (`src/App.tsx` is placeholder). This
spec covers everything from that shell to a deployed, styled, accredited-CME-style
activity.

Canonical content reference: `CONTEXT.md` at repo root (all wizard flow, drug sheets,
glossary, references, survey copy — each tagged by source file).

## Client arrangement (two delivery gates)

The client approves in two stages:

- **Gate 1 — Wireframes:** the designer delivers **page layouts (no styling) +
  color palette + typography**. We deliver these to the client. Approval unblocks the
  Phase 1 structural build.
- **Gate 2 — Styling:** once layouts are approved, we apply styling.

There are **no hi-fi comps** — only palette + typography. So the styling pass carries
real design latitude (spacing, states, hover/focus, motion, polish are ours to decide
within the palette), not a find-and-replace skin.

## Decisions (settled)

1. **App shell = sectioned/routed** (not one scrolling canvas). Adds `react-router`;
   `vercel.json` already ships the catch-all rewrite for client routes.
2. **Survey destination = not yet defined.** Build submission as a pluggable adapter
   with a stub now; swap the real target later in one file. Off the critical path.
3. **Palette + typography only, no hi-fi comps.** Styling pass is design-inclusive.

## Governing principle

Build so **structure/behavior and styling are separable passes**. `tokens.css`
`@theme` is the seam: Phase 1 code uses **semantic tokens** (`bg-surface`,
`text-heading`, `border-muted`) with placeholder values; Phase 3 fills those tokens
with the client palette/type with near-zero markup churn. Do NOT hand-code
`bg-white text-slate-900` like the current placeholder `App.tsx`.

## Routes (top-level sections)

- `/` or `/education` — Education blocks (background, MOA, glossary entry)
- `/wizard` — branching decision tree (Q1 type → Q2 inhibitors → Q3 reason → leaf)
- `/explore` — filterable comparison table (3 dropdowns)
- `/drugs/:id` — per-drug info sheet (renders as modal over a real, deep-linkable route)
- `/resources` — Resources / References / Glossary
- `/survey` — 3 Likert/usage questions

## Phases

```
Phase 0 (parallel to designer, no gate):  content model + types (FIRST) · router+shell ·
                                           semantic tokens · headless primitives ·
                                           survey stub · analytics
Gate 1 → Phase 1:  6 routed sections, structural + semantic tokens, behavior wired
Gate 2 → Phase 3:  fill tokens → style one reference route → propagate → states/motion
Phase 4:  a11y · QA · content proof · swap real survey target · deploy
```

Issue 00 (content model & shared types) runs **first** within Phase 0 — it converts
CONTEXT.md into typed data modules and locks the type conventions the Phase 1 content
screens bind to. It absorbs the former issues 04 (drug-sheet data) and 05 (Strategies
extraction), which are deleted. Phase 2 (behavior wiring) is folded into Phase 1 since
both engines already exist.

## Issue index

| #   | Phase | Title                                             | Gate   |
| --- | ----- | ------------------------------------------------- | ------ |
| 00  | 0     | Content model & shared types (extract all data)   | —      |
| 01  | 0     | Router + app shell / navigation                   | —      |
| 02  | 0     | Semantic design-token scaffold in tokens.css      | —      |
| 03  | 0     | Headless component primitives                     | —      |
| 06  | 0     | Survey submission adapter seam + stub             | —      |
| 07  | 0     | Analytics: per-route pageviews                    | —      |
| 08  | 1     | Wizard section                                    | Gate 1 |
| 09  | 1     | Explore comparison table                          | Gate 1 |
| 10  | 1     | Drug info sheets (modal-over-route)               | Gate 1 |
| 11  | 1     | Education blocks                                  | Gate 1 |
| 12  | 1     | Resources / References / Glossary                 | Gate 1 |
| 13  | 1     | Survey UI                                         | Gate 1 |
| 14  | 3     | Styling: fill tokens + reference route            | Gate 2 |
| 15  | 3     | Styling: propagate + states / motion / responsive | Gate 2 |
| 16  | 4     | Hardening: a11y · QA · content proof · deploy     | —      |

Gate 1 = client wireframe approval. Gate 2 = client palette/type delivered + approved.
