# 12 — Resources / References / Glossary / Acronyms (four routes)

Status: in-progress
Phase: 1

## Goal

Build the four content pages: `/resources` (curated panel, on the spine) and the three
off-line reference routes `/references` (full bibliography, ® / ™ superscripted), `/glossary`
and `/acronyms`.

## Done

- **`/acronyms`** (2026-08-06). All 41 `ACRONYMS` entries verbatim, in source order, as a single
  scrolling column — the app's first scrolling page. The list is deliberately separate from the
  route so `/glossary` could take it, which it now has: `src/components/AcronymList.tsx` became
  `src/components/DefinitionList.tsx`, holding only what the two pages share. Measurements and the
  reasoning in `docs/styling.md` §22; content decisions in `CONTEXT.md` §8. Confirmed by eye in
  Chromium, not measured.

- **`/glossary`** (2026-08-06). All 12 `GLOSSARY` entries verbatim, in source order. Shares
  `DefinitionList` with `/acronyms`; **the grid track did not carry over** and is now the route's,
  not the component's — a `20rem` term track gated at `xl`, because 1024 leaves only 400px beside it
  and a sentence set to 38 characters is not a column. Measured in Chromium at 1440/1280/1024/768/375
  (`docs/styling.md` §23); content decisions in `CONTEXT.md` §8.

  **The anchor clause is retired, not deferred.** This issue originally required that "anchors must
  resolve from education and drug-sheet cross-links". No such cross-link exists anywhere in the app,
  and navigation to these pages is the sidebar button only — so `/acronyms` ships without per-entry
  ids. If a future pass links a term from body copy, the ids come back **with** `scroll-mt` against
  the fixed 14px `TopRule`. Same reasoning should apply to `/glossary` unless it grows a cross-link.

## Remaining

- **`/references`** — the full bibliography, ® / ™ superscripted. `REFERENCES` typed and unconsumed.
- **`/resources`** — the curated categorised panel, and the only one of the four **on the walkthrough
  spine**, so it carries Prev/Next. `RESOURCES` typed and unconsumed.

## Open, not blocking

`CONTEXT.md` §8 records six abbreviations the app paints that the source list does not gloss
(`SDM`, `SHL`, `EHL`, `UHL`, `VHH`, `IgG4`). That is a client content question — answering it means
authoring CME copy — and it is not a defect in `/acronyms`.

Same class, from `/glossary`: the source defines "Nonfactor therapy" as including "homeostatic
balancing agents" where the term everywhere else is _hemostatic rebalancing_ agents. Shipped
verbatim and marked `sic` in `src/data/glossary.ts`; the client decides whether to correct it.
