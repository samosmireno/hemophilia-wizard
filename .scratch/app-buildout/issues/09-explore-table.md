# 09 — Explore comparison table

Status: in-progress — the page is built, the table inside it is not
Phase: 1
Blocked by: 01, 02, 03
Blocks on: nothing — open item 27 no longer blocks. `Popup` has a three-step `width`
scale and this card takes `wide` (1360px, ~136px a column). The scroll region below is
still due, but it is now inside a card wide enough that it only matters on small screens.
Gate: Gate 1 (client wireframe approval)

## Amended 2026-08-04 — `/explore` is not the table

The original scope put the filterable table **at** `/explore`. The `/explore` artboard makes
that route CONTEXT.md §9's **shared-decision-making conclusion node**, with the table
launched from a button on it. See `docs/adr/0007-explore-is-the-sdm-conclusion.md`.

The route, its place on the walkthrough spine and the button's name are all unchanged.
What changed is that the table is a `Popup` body rather than the page body.

## Done

- `/explore` renders the §9 SDM conclusion: heading + four bullets, verbatim in
  `src/data/explore.ts` (§9 had them abridged; the artboard supplied the full text).
- The "Explore therapy options for HA/HB" CTA opens a `Popup` — **the card, with a
  placeholder body**. It takes `width="wide"` (1360px), so the placeholder is already
  sitting in the box the grid will land in.
- The class-grouped index into the §6 drug sheets: three arched segments, seven `+`
  buttons, four verbatim class labels. This is **Efanesoctocog alfa's first caller**,
  closing the loose end CONTEXT.md §6 recorded.
- `explore.test.tsx` (16 tests), a `content.test.ts` coverage case, and `router.test.tsx`
  graduated off its "renders a stub" list. Geometry in docs/styling.md §17, verified in a
  browser at five widths.

## Remaining scope — the table itself, inside that card

- Three dropdown filters: Treatment class, Hemophilia type (A/B/A+B), Indicated with
  inhibitors (Yes/No) — `FilterSelect` primitive (issue 03).
- Result grid driven by `filterTreatments()` / `evaluateTreatments()` in
  `src/data/treatments.ts`; columns: Agent, MOA, Age, Route, Schedule, Monitoring.
- Empty/no-match state.
- Agent names in the grid open the drug sheet. **Not** via `?drug=<id>` — ADR 0006
  reversed that; hand the agent name to `DrugSheetPopup`, as `/explore` and
  `/wizard/therapies` already do. Note this means a sheet opening over the table card:
  decide whether the table closes first or the two stack.
- Structural + semantic tokens only.

## Acceptance

- Filter combinations produce correct rows, verified against `treatments.ts`.
- The nine columns are readable. The card is `wide` (1360px → ~136px a column at 1440),
  which is the half of open item 27 that is done; the other half is a horizontal scroll
  region inside the card, because 1360px is a laptop and not a phone.

## Notes

SECONDARY engine (computed filter), distinct from the wizard's authored lookup. Note the
table covers **nine** treatments including the generic SHL and EHL rows, where the class
index on the page above it draws only the **seven** that have a §6 sheet.
