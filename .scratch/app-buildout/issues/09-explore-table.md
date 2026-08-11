# 09 — Explore comparison table

Status: done — table built 2026-08-11; one semantics ruling provisional, flagged for the client gate
Phase: 1

## Goal

`/explore` is the SDM conclusion node (ADR 0007); the filterable nine-treatment comparison
table is the body of a `Popup` launched from its CTA.

## Done

Page, architecture and `DrugSheetPopup` wiring (`Explore.tsx:314`): §9 bullets, the CTA opening
a `width="wide"` (1360px) `Popup`, and the class-grouped index into the seven §6 drug sheets.

The table (2026-08-11): `ExploreTable` — a filter bar of three `FilterSelect`s (native selects,
issue 03's last primitive) over all nine S1 columns, AND-combined exact-cell-match filtering,
S1 row order, `overflow-x-auto` + `min-w-240` scroll region (closing styling item 27), empty
state with a Clear-filters recovery, filters reset on close. Behaviour pinned in
`explore.test.tsx`; the class buckets in `content.test.ts`.

## Remaining

Nothing. The table landed 2026-08-11 (`src/components/ExploreTable.tsx` + `FilterSelect` +
`EXPLORE_CLASS_FILTERS`); the decisions that closed this issue's open questions are recorded in
CONTEXT.md §5.2 and in the 2026-08-11 comment below. One is provisional: **exact-cell-match type
filtering is flagged for the client gate.**

## The engine is gone (2026-08-10)

`evaluateTreatments()` / `filterTreatments()` and their helpers `typesServed`, `minAge`,
`isAgeProvisional`, `classOf` were deleted from `src/data/treatments.ts`, along with
`PatientCriteria`, `EligibilityResult`, `TREATMENT_CLASSES`, `TreatmentClass` and
`HemophiliaType`. They had zero callers and zero tests for their whole life, and this issue was
their only intended consumer.

They were deleted rather than wired up because **they answer a different question than the
artboard asks.** The engine modelled _patient eligibility_ — "is this treatment right for a
6-year-old with inhibitors" — where the three drawn dropdowns are _column filters_ — "show me the
rows whose cell says B". Three concrete mismatches, any one of which would have had to be quietly
changed inside an untested module:

| artboard dropdown                        | what the engine did                                                                                                                                              |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Treatment class                          | `classOf` collapsed column A into a canonical four-class enum — but three of `/explore`'s own four drawn labels disagree with that enum (see `EXPLORE_SEGMENTS`) |
| Hemophilia Type — **A / B / A + B**      | took a two-member `"A" \| "B"` union; `typesServed` read "A + B" as _both_, so "A" returned 8 rows, not the 3 whose cell says `A`                                |
| Indicated with inhibitors — **Yes / No** | `hasInhibitors: false` applied **no filter at all** — picking "No" would have shown all nine rows                                                                |
| _(none is drawn)_                        | `age?: number`, plus 8 lines of age parsing and a `provisional` flag                                                                                             |

`EligibilityResult.reasons` — four authored per-row exclusion sentences — had no drawn consumer
either; §5 specifies an empty state, not per-row explanations.

### What to build instead

- **Column filters over `TREATMENTS`**, roughly 15 lines. The roster is already transcribed,
  tested, and in S1 row order, which is the order the unfiltered grid should render.
- **Class dropdown options: use `EXPLORE_SEGMENTS`' four labels**, not a new enum. They are what
  the same page already paints, in the artboard's wording, and `/explore` is the only page this
  dropdown will ever appear on. Note they group nine rows into four buckets, and SHL/EHL are not
  among them — decide whether "clotting factor replacement" covers all three factor rows or only
  the UHL one the arch draws.
- **Decide the A / B / A + B semantics first.** CONTEXT.md §5 glosses "A + B" as _"eligible for
  both"_, which leans toward "A" meaning _serves A_ (8 rows) and makes the three options overlap
  rather than partition. The alternative — exact cell match, 3 / 1 / 5 rows — partitions cleanly
  and is what a column filter normally means. This is a content decision; worth putting to the
  client at the next gate rather than guessing.
- The age-parse rule is preserved in **CONTEXT.md §5.2** in case an age filter is ever drawn.

## Comments

**2026-08-11** — built, closing the issue, after a grilling session settled every open branch:

- **Type filter: exact cell match** — "A" is the 3 rows whose cell reads `A`; the options
  partition 3/1/5. **Provisional, flagged for the client gate** (the "serves A" reading is a
  one-line predicate swap). This resolves this issue's second open question.
  **Reversed later the same day — see the follow-ups below.**
- **Class dropdown: the four drawn labels**, bucketed to S1 class cells via
  `EXPLORE_CLASS_FILTERS` in `explore.ts` — "UHL clotting factor replacement" covers **all
  three** factor rows (the S4 saved-view precedent), so SHL/EHL stay reachable.
- **Nine columns, not six** — the column list this issue carried ("Agent, MOA, Age, Route,
  Schedule, Monitoring") is corrected: the three filtered columns render too, since the
  unfiltered default view has to carry the comparison on its face. CONTEXT §5 and styling
  item 27 always said nine.
- **No agent→sheet links, ever** (user decision) — which dissolves this issue's first open
  question (sheet-over-table stacking): the situation cannot arise.
- Filter bar above the grid (not in-header); "All" defaults; empty state
  "No treatments match the selected filters." + Clear filters (its only appearance).

Three same-day follow-ups on user direction:

1. The card's frame is **fixed at `h-[75dvh]`** so filtering never resizes the dialog (rows
   scroll under a filter bar that stays; styling §17).
2. The type dropdown's third option was **glossed "A + B (eligible for both)"** after the bare
   cell value read as a second All — then superseded by (3).
3. **The type filter reversed to patient-type ("serves") semantics, and the "A + B" option was
   dropped**: there is no A + B patient — the cell is a property of the treatment — so "A" shows
   the 8 rows serving an A patient, "B" the 6 serving B, and a third option could only duplicate
   All. The dropdown is All / A / B, a deliberate departure from the drawn three-value set;
   **still flagged for the client gate** (both the semantics and the dropped drawn option). The
   gloss machinery in `FilterSelect` went with it — no caller. CONTEXT §5.2 is the full record.
4. **Column geometry fixed**: `table-fixed` over a colgroup of percentage shares
   (12/11/10/7/8/8/12/10/22) — auto layout re-measured the surviving rows and the columns
   jumped on every filter change. Shares picked, no artboard; styling §17.

**2026-08-10** — the eligibility engine was deleted as part of an architecture review
(candidates 02 and 03). It had zero callers and zero tests since the first data pass, and the
review found it modelled patient eligibility where this issue needs column filters. The
"Remaining" section above now carries the specification instead of a pointer to code, and
`docs/adr/0007` is amended: its Consequences claimed the filter engine was "built and tested",
which was never true. Nothing about the page or the wide `Popup` changed.
