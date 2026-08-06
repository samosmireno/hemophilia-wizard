# 12 — Resources / References / Glossary / Acronyms (four routes)

Status: in-progress
Phase: 1

## Goal

Build the four content pages: `/resources` (curated panel, on the spine) and the three
off-line reference routes `/references` (full bibliography, ® / ™ superscripted), `/glossary`
and `/acronyms`.

## Done

- **`/acronyms`** (2026-08-06). All 41 `ACRONYMS` entries verbatim, in source order, as a single
  scrolling column — the app's only scrolling page. `src/components/AcronymList.tsx` is deliberately
  separate from the route so `/glossary` can take it. Measurements and the reasoning in
  `docs/styling.md` §22; content decisions in `CONTEXT.md` §8. Never opened in a browser.

  **The anchor clause is retired, not deferred.** This issue originally required that "anchors must
  resolve from education and drug-sheet cross-links". No such cross-link exists anywhere in the app,
  and navigation to these pages is the sidebar button only — so `/acronyms` ships without per-entry
  ids. If a future pass links a term from body copy, the ids come back **with** `scroll-mt` against
  the fixed 14px `TopRule`. Same reasoning should apply to `/glossary` unless it grows a cross-link.

## Remaining

- **`/glossary`** — 12 `GLOSSARY` entries. The near-twin of `/acronyms`: same source section, same
  term↔definition shape. Start from `AcronymList` — but the definitions are sentences, not
  two-to-five-word expansions, so the `max-content` term track will not carry over unchanged.
- **`/references`** — the full bibliography, ® / ™ superscripted. `REFERENCES` typed and unconsumed.
- **`/resources`** — the curated categorised panel, and the only one of the four **on the walkthrough
  spine**, so it carries Prev/Next. `RESOURCES` typed and unconsumed.

## Open, not blocking

`CONTEXT.md` §8 records six abbreviations the app paints that the source list does not gloss
(`SDM`, `SHL`, `EHL`, `UHL`, `VHH`, `IgG4`). That is a client content question — answering it means
authoring CME copy — and it is not a defect in `/acronyms`.
