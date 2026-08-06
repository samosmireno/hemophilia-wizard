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
4. **`/` = dedicated landing page** (net-new, not in the blueprint), not a redirect to
   `/education`.
5. **Drug sheets = `?drug=<id>` modal overlay** on the current route; no standalone
   `/drugs/:id` page.
6. **`/education` = multi-chapter `/education/:section` subroutes; `/wizard` = single
   route** with all state computed in-page.
7. **Navigation = linear walkthrough**, not a section portal. A persistent sidebar with
   **Prev/Next** steps through a fixed nine-step section order; **Glossary, Acronyms, and
   References are standalone always-accessible routes off that line** (each its own sidebar
   button). This splits the blueprint's combined "Resources/References/Glossary" block into
   four routes. See `docs/adr/0001-linear-walkthrough-navigation.md`. The canonical order
   lives in `src/data/sectionOrder.ts` (issue 01); the styled sidebar is issue 18.

## Governing principle

Build so **structure/behavior and styling are separable passes**. `tokens.css`
`@theme` is the seam: Phase 1 code uses **semantic tokens** (`bg-surface`,
`text-heading`, `border-muted`) with placeholder values; Phase 3 fills those tokens
with the client palette/type with near-zero markup churn. Do NOT hand-code
`bg-white text-slate-900` like the current placeholder `App.tsx`.

## Routes

Navigation is a **linear walkthrough** (ADR-0001). Steps 1–9 below form the Prev/Next
spine (order encoded in `src/data/sectionOrder.ts`); the three reference pages sit **off**
the line, each reachable anytime from its own sidebar button.

**In the linear flow (Prev/Next order):**

1. `/` — **Landing page** (net-new; not in the blueprint). Dedicated page, not a redirect.
   2–5. `/education/:section` — Education is a **multi-chapter module**; chapters in order:
   `disease-background`, `treatment-landscape`, `rebalancing-agents`, `fviii-mimetics`
   (last two are wizard cross-link targets, so their URLs must be stable). Bare `/education`
   redirects to `disease-background`; unknown `:section` → `disease-background` (first chapter).
2. `/wizard` — branching decision tree (Q1 type → Q2 inhibitors → Q3 reason → leaf).
   **Single route** — all step state computed in-page, no per-step subroutes.
3. `/explore` — filterable comparison table (3 dropdowns).
4. `/resources` — curated **Resources** panel only.
5. `/survey` — 3 Likert/usage questions.

**Off the line (standalone, always-accessible, not in Prev/Next):**

- `/references` — full bibliography (~40 citations).
- `/glossary` — domain-term definitions.
- `/acronyms` — abbreviation expansions (split out of `CONTEXT.md §8`).

**Overlay (not a route):**

- Drug info sheets — **modal overlay via `?drug=<id>`** on the current route (e.g.
  `/explore?drug=marstacimab`); **no** standalone `/drugs/:id` page.

No not-found page: an unknown path under a section resolves to that section (nested `*`
under `/education` → `disease-background`); any other unknown route redirects to `/` (landing).

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

| #   | Phase | Title                                                   | Gate   |
| --- | ----- | ------------------------------------------------------- | ------ |
| 00  | 0     | Content model & shared types (extract all data)         | —      |
| 01  | 0     | Router + app shell / navigation                         | —      |
| 02  | 0     | Semantic design-token scaffold in tokens.css            | —      |
| 03  | 0     | Headless component primitives                           | —      |
| 06  | 0     | Survey submission adapter seam + stub                   | —      |
| 07  | 0     | Analytics: per-route pageviews                          | —      |
| 08  | 1     | Wizard section                                          | Gate 1 |
| 09  | 1     | Explore comparison table                                | Gate 1 |
| 10  | 1     | Drug info sheets (modal overlay via `?drug=`)           | Gate 1 |
| 11  | 1     | Education blocks                                        | Gate 1 |
| 12  | 1     | Resources / References / Glossary / Acronyms (4 routes) | Gate 1 |
| 13  | 1     | Survey UI                                               | Gate 1 |
| 17  | 1     | Landing page (`/`)                                      | Gate 1 |
| 18  | 1     | Navigation sidebar (Prev/Next + jump buttons)           | Gate 1 |
| 14  | 3     | Styling: fill tokens + reference route                  | Gate 2 |
| 15  | 3     | Styling: propagate + states / motion / responsive       | Gate 2 |
| 16  | 4     | Hardening: a11y · QA · content proof · deploy           | —      |

Gate 1 = client wireframe approval. Gate 2 = client palette/type delivered + approved.
