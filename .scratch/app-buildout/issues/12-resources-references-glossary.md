# 12 — Resources / References / Glossary / Acronyms (four routes)

Status: ready-for-human
Phase: 1
Blocked by: 00, 01, 02
Gate: Gate 1 (client wireframe approval)

## Goal

Build the four content pages that the blueprint's single "Resources / References /
Glossary" block splits into under the linear-walkthrough model (see
`docs/adr/0001-linear-walkthrough-navigation.md`):

| Route         | In linear flow?  | Content                                                |
| ------------- | ---------------- | ------------------------------------------------------ |
| `/resources`  | **Yes** (step 8) | Curated Resources panel (`CONTEXT.md §9`)              |
| `/references` | No (off-line)    | Full reference bibliography (`CONTEXT.md §9`)          |
| `/glossary`   | No (off-line)    | Domain-term definitions (`CONTEXT.md §8`)              |
| `/acronyms`   | No (off-line)    | Abbreviation expansions (split out of `CONTEXT.md §8`) |

The off-line three each have their own route + always-visible sidebar button (issue 18).

## Scope

- **`/resources`** — the curated Resources panel: clinical guidelines & recommendations,
  review articles, tools for clinical practice (`CONTEXT.md §9`), with the "URLs accessed
  July 14, 2026" note and the SDM conclusion framing.
- **`/references`** — the full bibliography (~40 citations). V3 reformatting: abbreviated
  author lists/journals, "PI" for Prescribing Information, **® / ™ superscripted**.
- **`/glossary`** — domain-term definitions from `CONTEXT.md §8`. Anchors must be stable and
  resolvable from cross-links in education (issue 11) and drug sheets (issue 10).
- **`/acronyms`** — the acronym/abbreviation list currently living inside `CONTEXT.md §8`;
  surfaced as its own page.
- Structural + semantic tokens only.

## Acceptance

- Four routes render their respective content from the typed data modules.
- Full bibliography rendered on `/references`; formatting matches V3 (® superscript).
- Glossary and acronym anchors resolve from cross-links.

## Notes

CME activities are fully referenced — bibliography completeness matters. If the content
model (issue 00) currently keeps acronyms bundled with the glossary, splitting them into a
separately addressable page may need a small data-module adjustment.
