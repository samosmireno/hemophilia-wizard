# 00 — Content model & shared types (extract all data)

Status: done (2026-07-27)
Phase: 0 (runs first — prerequisite for all Phase 1 content screens)
Blocked by: —

## Done (2026-07-27)

All remaining content is now typed. New modules (separate files per the agreed plan):
`src/data/drug-sheets.ts` (`DRUG_SHEETS`, 7 sheets, `sheetFor()`), `education.ts`
(`EDUCATION_TOPICS` flat + `SEVERITY_TABLE` + `TREATMENT_OPTIONS_MATRIX` +
`TREATMENT_OPTIONS_FOOTNOTES`), `glossary.ts` (`GLOSSARY` + `ACRONYMS`), `references.ts`
(`REFERENCES` + `RESOURCES`), `survey.ts` (`SURVEY_QUESTIONS`). Wizard-flow content extended
in `wizard.ts` (`CLASSES_TO_CONSIDER`, keyed by `ScenarioKey`). `content.test.ts` verifies the
cross-model joins (12 tests). `npm run build` type-checks clean.

Decisions: drug sheets keyed by verbatim `agent` string (join to `Treatment.agent`/`AGENTS`);
**no SHL/EHL sheet** (source authored none — acceptance below softened accordingly); `trials`
structured `{ name, id, citation? }`, all other sheet fields verbatim `string[]`; ®/™ stored as
literal glyphs (superscripting deferred to Phase 3 styling); figures captured as captions only
(no `src` — assets pending); education kept flat, not per-archetype; demo mirrors
`CLASSES_TO_CONSIDER` only (other new surfaces are Phase 1 React work).

## Goal

Turn all project content into **typed data modules** and lock the **shared type
conventions** the rest of the app binds to. This is the "extract all the data up front,
define the types from there" pass. Do it before the content-consuming UI screens so they
bind to a stable shape.

## Scope

- **Extraction is mostly done already:** `CONTEXT.md` at the repo root consolidates all
  extracted content (wizard flow, drug sheets, glossary, references, survey copy), each
  tagged by source file. This issue converts that into typed TS, and pulls anything still
  missing straight from `HM-85L Hemophilia Treatment Wizard_V3_Vector.pdf`.
- **Do NOT redo the two approved engines** — `src/data/treatments.ts` (filter engine) and
  `src/data/wizard.ts` (branching engine) are built and approved. Extend around them and
  reuse their types where they already fit.
- Produce typed modules for the remaining content:
  - **Drug info sheets** → `src/data/drug-sheets.ts`, keyed by drug id, grouped by class
    (FVIIIa mimetics / hemostatic rebalancing / UHL factor replacement / gene therapy):
    Class/Target, Indication, Dosage & Administration, Monitoring, Clinical Trials (NCT#s).
    _(absorbs former issue 04)_
  - **Considerations / Strategies text** for the V3 tabs → extend `REASON_NOTES` in
    `wizard.ts`. **Resolved by the 2026-07-27 PDF re-scan (see `CONTEXT.md` §4.2):** the copy is
    **scenario-specific** — 32 notes = 4 scenarios × 4 reasons × {Considerations, Strategies}.
    **Done (2026-07-27):** `wizard.ts` now exports `SCENARIO_NOTES` keyed
    `Record<ScenarioKey, Record<SwitchReason, { considerations, strategies }>>` (32 notes
    verbatim), `recommend()` returns the scenario's note pair, and `treatment-wizard-demo.html`
    mirrors it; the old shared `REASON_NOTES` is removed. Source: `documents/out_raw.txt` (CENTER
    band). The monitoring-note title variants (…Requirement**s** / …Requirement / …to Reduce
    Monitoring) are preserved as-authored. _(absorbs former issue 05)_
  - **Per-scenario "Therapeutic classes to consider" boxes** (4 lists + the HB+inhib bypassing-
    agents caveat) → new typed content, see `CONTEXT.md` §4. Shown at each branch before the
    reason question.
  - **Education** content (disease/severity, bleeding patterns, NFT benefits/challenges,
    MOA), **glossary**, **references** bibliography (V3: ® superscripted), **survey**
    questions — as typed data feeding issues 11, 12, 13. `CONTEXT.md §7` is now the complete
    source (expanded 2026-07-27 from `[PDF-V]` + a `[PPTX]` re-scan): includes the severity/bleeding
    table (PPTX slide 6), the treatment-options class matrix (PPTX slide 7), and emerging agents
    (NXT007, Inno8, Mim8). Note the education is authored as click-through pop-ups + ~24 figures.
- Establish shared type conventions (ids, class enums, cross-reference keys) so every
  screen consumes one model.

## Acceptance

- All content above exists as typed modules; `npm run build` type-checks clean. ✅
- Every drug the wizard can **recommend** has a drug-sheet entry (all 6 novel `AGENTS` +
  Efanesoctocog). ✅ _(Softened from "every drug in wizard.ts/treatments.ts": the source authored
  no per-drug sheet for the generic SHL/EHL comparison-table rows; those are class-level, not
  branded agents, and their table rows are self-contained.)_
- Keep the `treatment-wizard-demo.html` mirror in sync where it references these notes. ✅
  (`CLASSES_TO_CONSIDER` added; the other new modules are Phase 1 UI surfaces, out of demo scope.)

## Caveat

Shape types to the content, keep them **additive** — let a Phase 1 screen request a field
it needs rather than over-modeling every consumer up front. Low risk (mostly display).

## Anti-over-modeling checklist

The goal is a typed draft good enough for Phase 1 to bind to and cheap to evolve — NOT a
frozen final schema. Front-loading extraction ≠ freezing the schema. Follow the lean
precedent already in the codebase (`RECOMMENDATIONS` stores drugs as plain `string[]`,
not a normalized drug registry; `TREATMENT_CLASSES` → derived union; `Record<...>` maps).

- [x] **Keep presentation OUT of content types** (the #1 trap). Model domain facts
      (indication, dosing, NCT#s, citation text, term/definition). Do NOT bake in tab
      order, class-tab grouping, "dark-green vs light-blue box", icons, or display sort.
      An `order`/`color`/`displayGroup` field on a data type = presentation leaking in;
      that belongs to Phase 1/3 UI. _(No order/color/group fields; popup-vs-page left to Phase 1.)_
- [x] **Model the source shape, add nothing speculative.** Type exactly what CONTEXT.md/
      the PDF contains, no "might need later" fields.
- [x] **References stay a display string**, not `{authors, title, journal, year, doi}` —
      nothing sorts/filters them, so `{ id, text }[]` with the formatted citation
      (® superscript included). Same for glossary: `{ term, definition }[]`.
- [x] **Additive-only.** Prefer optional (`?:`) and fewer fields now; adding later is
      non-breaking, restructuring is breaking. _(Optional `citation?`, `caveat?`,
      `benefitsChallenges?`, `figures?`, `footnote?`.)_
- [x] **Plain data + literal unions, no machinery.** No normalized ID graph, no generic
      "render any block" schema, no class hierarchies, no runtime validation layer — TS
      strict is the guard.
- [x] **Reuse existing vocabulary.** Key `drug-sheets.ts` off the same agent names/classes
      as `treatments.ts`/`AGENTS`; don't fork a parallel id scheme.
- [x] **Scenario-specific vs shared `REASON_NOTES` — RESOLVED (2026-07-27 re-scan): diverges,
      so scenario-specific.** Model as `Record<ScenarioKey, Record<SwitchReason, { considerations,
strategies }>>` (or similar). The copy genuinely differs across HB/HA and ±inhibitors, and
      each reason has a Considerations **and** a Strategies list — do not keep the shared per-reason
      shape. Verbatim source: `documents/out_raw.txt` CENTER band + `CONTEXT.md` §4.2.
- [x] **Validate cheaply, not with UI.** After writing the types, shake out gaps with a
      few typed accesses / one throwaway `.map` in a test — not by building a screen.
      Expect to touch these types once in Phase 1 when a real consumer needs a field;
      that's success, not rework. _(`content.test.ts` — 12 join/coverage assertions.)_

## Notes

Absorbs former issues 04 and 05 (deleted). Pure content/typing work, no design gate —
the long pole; start immediately, in parallel with the designer's wireframes.
