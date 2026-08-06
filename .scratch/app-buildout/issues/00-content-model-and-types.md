# 00 — Content model & shared types (extract all data)

Status: done (2026-07-27)
Phase: 0

## Outcome

All project content is typed. Shipped `src/data/drug-sheets.ts` (7 sheets + `sheetFor()`),
`education.ts` (`EDUCATION_TOPICS`, `SEVERITY_TABLE`, `TREATMENT_OPTIONS_MATRIX`),
`glossary.ts`, `references.ts`, `survey.ts`; `wizard.ts` extended with `CLASSES_TO_CONSIDER`
and the 32 scenario-specific `SCENARIO_NOTES`. `content.test.ts` covers the cross-model joins.
Absorbed former issues 04 and 05. No SHL/EHL sheet — the source authored none.
