# 09 — Explore comparison table

Status: in-progress — the page is built, the table inside it is not
Phase: 1

## Goal

`/explore` is the SDM conclusion node (ADR 0007); the filterable nine-treatment comparison
table is the body of a `Popup` launched from its CTA.

## Done

Page, architecture and `DrugSheetPopup` wiring (`Explore.tsx:314`): §9 bullets, the CTA opening
a `width="wide"` (1360px) `Popup`, and the class-grouped index into the seven §6 drug sheets.

## Remaining — the table itself

- The table is **not built**: placeholder text in the wide `Popup` at the bottom of `Explore.tsx`.
- Three dropdowns (class, hemophilia type, indicated-with-inhibitors) need `FilterSelect`
  (issue 03); columns Agent, MOA, Age, Route, Schedule, Monitoring; empty state.
- **There is no filter engine to wire up — write one.** See "The engine is gone" below.
- Horizontal scroll region inside the wide `Popup` still due (styling item 27) — precedents are
  `SeverityTable` and Table 1.
- **Open question:** a drug sheet opening over the table card — does the table close first, or
  do the two stack?
- **Open question:** does picking "A" mean the three rows whose cell reads `A`, or the eight that
  serve A? See below.

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

**2026-08-10** — the eligibility engine was deleted as part of an architecture review
(candidates 02 and 03). It had zero callers and zero tests since the first data pass, and the
review found it modelled patient eligibility where this issue needs column filters. The
"Remaining" section above now carries the specification instead of a pointer to code, and
`docs/adr/0007` is amended: its Consequences claimed the filter engine was "built and tested",
which was never true. Nothing about the page or the wide `Popup` changed.
