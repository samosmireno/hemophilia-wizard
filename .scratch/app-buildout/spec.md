# Spec: HM-85L Treatment Wizard — app build-out

## Purpose

Build the interactive CME "Treatment Wizard" (code HM-85L) as a sectioned/routed React SPA,
from the starter shell to a deployed, styled, accredited-CME-style activity. The data engines
(`src/data/treatments.ts` filter, `src/data/wizard.ts` branching) were already built and
approved. Canonical content: `CONTEXT.md` at the repo root.

## Gates

- **Gate 1 — Wireframes.** The designer delivers page layouts (no styling) plus colour palette
  and typography; we deliver those to the client, and approval unblocks the Phase 1 structural
  build. Issues 08-13, 17 and 18 carry this gate.
- **Gate 2 — Styling. Passed 2026-07-27** (palette + typography in `src/styles/tokens.css`).
  There are **no hi-fi comps**, so the styling pass carries real design latitude — spacing,
  states, hover/focus, motion are ours to decide within the palette.

## Routes

Navigation is a linear walkthrough (ADR 0001). The spine lives in `src/data/sectionOrder.ts`:
`/` → the five `/education/:section` chapters (`disease-background`, `treatment-landscape`,
`rebalancing-agents`, `fviii-mimetics`, `prophylaxis-guidance`) → `/wizard-intro` → `/wizard`
→ `/wizard/scenario` → `/wizard/therapies` → `/explore` → `/resources` → `/survey`.

Off the line, each with its own always-visible sidebar button: `/references`, `/glossary`,
`/acronyms`. Drug sheets are a modal card opened from **component state**, not a route and not
a `?drug=` param (ADR 0006). No not-found page: unknown paths fall back to their section, or
to `/`.

## Phases

- **Phase 0** (no gate): content model + types (ran first, absorbing the deleted issues 04
  and 05) · router + shell · semantic tokens · headless primitives · survey stub · analytics.
- **Phase 1** (Gate 1): the routed sections, behaviour wired. Phase 2 folded in — both engines
  already existed.
- **Phase 3** (Gate 2): fill tokens → style a reference route → propagate → states/motion.
- **Phase 4**: a11y · QA · content proof · swap the real survey target · deploy.

## Issue index

| #   | Phase | Title                                             | Status                     |
| --- | ----- | ------------------------------------------------- | -------------------------- |
| 00  | 0     | Content model & shared types                      | done                       |
| 01  | 0     | Router + app shell / navigation                   | done                       |
| 02  | 0     | Semantic design-token scaffold                    | decide: rewrite or wontfix |
| 03  | 0     | Headless component primitives                     | in-progress                |
| 06  | 0     | Survey submission adapter seam + stub             | ready-for-agent            |
| 07  | 0     | Analytics: per-route pageviews                    | ready-for-agent            |
| 08  | 1     | Wizard section                                    | done except reset          |
| 09  | 1     | Explore comparison table                          | in-progress                |
| 10  | 1     | Drug info sheets                                  | in-progress                |
| 11  | 1     | Education blocks                                  | done except residues       |
| 12  | 1     | Resources / References / Glossary / Acronyms      | ready-for-human            |
| 13  | 1     | Survey UI                                         | ready-for-human            |
| 17  | 1     | Landing page (`/`)                                | done                       |
| 18  | 1     | Navigation sidebar                                | done                       |
| 19  | 4     | Landing background video                          | done                       |
| 14  | 3     | Styling: fill tokens + reference route            | in-progress                |
| 15  | 3     | Styling: propagate + states / motion / responsive | in-progress                |
| 16  | 4     | Hardening: a11y · QA · content proof · deploy     | ready-for-human            |
