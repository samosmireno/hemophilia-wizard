# 12 — Resources / References / Glossary / Acronyms (four routes)

Status: done
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

- **`/references`** (2026-08-07). All 29 `REFERENCES` entries in source order, **unnumbered** as the
  source draws them — nothing in the app cites a reference, so numbers would be markers pointing at
  nothing. All **7 `®`** superscripted, honouring the client's one direction on this block; **there
  is no `™`** in the list, so this issue's "® / ™" overstated the job, and `®` appears nowhere else
  in `src/` — no app-wide propagation was needed. The **11 inline URLs are clickable**, each
  anchored to itself with the sentence period left outside the `href`; these are the app's first
  external links. Rendering split into `src/lib/formatCitation.tsx` (presentation-free, beside
  `formatInline`) and the route's own markup. Measurements and reasoning in `docs/styling.md` §24;
  content decisions in `CONTEXT.md` §9.

  **Two departures from the issue as written.** (1) **Five source defects are repaired**, making
  this the first content array in the app that is not verbatim — the rule and its limits are the new
  `docs/adr/0008-repair-bibliographic-defects.md`, and each repair is pinned in
  `src/routes/references.test.tsx` against the string it replaced. (2) The source block's closing
  line _"URLs accessed July 14, 2026."_ is **deliberately not shipped**; it is recorded in
  `CONTEXT.md` §9 so it is not re-found as a bug, and the same line belongs on `/resources`.

  **Verified by tests, then confirmed by eye** after the ADR 0009 rework below (2026-08-07). jsdom
  computes no layout, so the list indent, the URL wrap and the no-horizontal-overflow claim were
  arithmetic until then. This is the app's longest scroll (~1900px) and holds its only unbreakable
  string (`r8`'s ~300-character HEMLIBRA tracking URL) — the `break-words` claim was the one to
  check first and it holds. No widths recorded, so styling item 30 still covers this route.

- **`/resources`** (2026-08-07). All 18 items in source order across the 3 categories (5 / 8 / 5),
  bulleted, with the **5 URLs recomposed inline** — the data model splits `url` out of `text`, the
  board draws it at the tail of the citation, and the route puts it back. Categories are `<h2>` on
  §11's chapter ramp, which is also what the panel draws; the source's run-in colon is not carried.
  The only one of the four **on the walkthrough spine**, so Prev/Next come from `AppSidebar` free.
  Measurements and reasoning in `docs/styling.md` §25; content decisions in `CONTEXT.md` §9.

  **The _"URLs accessed July 14, 2026."_ line ships on neither page** (user decision). `[PDF-V]`
  draws it under both blocks; `CONTEXT.md` §9's omission note now covers both.

  **ADR 0008 applied three more times**, all in `RESOURCES` — the Duncan entry's volume year
  (`2020`→`2010`, confirmed against the PubMed record) and its title word (`prophylaxis`→
  `prophylactic`), plus a stray `3` in the WFH Workbook entry that the typed array had already
  silently replaced with a period. That third one was an undocumented repair predating the ADR;
  it is now recorded and pinned like the rest. Eight repairs across the two lists.

  **Verified by tests, then confirmed by eye** (2026-08-07), same as `/references`. No widths
  recorded, so styling item 30 covers this route too.

## The premise `/references` shipped on was wrong — ADR 0009

Building this page put the same source block under a second look, and the two claims `/references`
shipped on both turned out to be artifacts of reading `documents/out_raw.txt` rather than the PDF:

- **The board draws bullets** on every entry of both blocks. `/references`' hanging indent was
  invented to replace a marker the source has. Withdrawn; both routes now render through
  `BulletList`.
- **The board sets the journal abbreviation in italic** — 15 of 29 references, 14 of 18 resources,
  in both cases exactly the entries that name a journal, with no exception in 47 entries. Marked in
  the data per ADR 0004; `formatCitation` gained an `<em>` arm behind its URL arm.

A text extraction has neither bullets nor font style, and neither absence looks like an absence.
`docs/adr/0009-bibliographies-reproduce-source-list-structure.md` records the finding, the method
(`pdftoppm` crops, `pdftohtml -xml` font subsets) and the limit: **it does not sweep the rest of
`src/data/`**, which was transcribed from the same flattened dump.

## Open, not blocking

`CONTEXT.md` §9 records one bibliographic defect ADR 0008 deliberately does **not** license fixing:
`r14` cites _Kitazawa T, et al. **J** Thromb Haemost. 2017;117:1348-1357_, where volume 117 belongs
to _Thromb Haemost_. Changing a journal name rewrites which artifact the citation points at rather
than fixing how it points there, so it is a client question.

`CONTEXT.md` §8 records six abbreviations the app paints that the source list does not gloss
(`SDM`, `SHL`, `EHL`, `UHL`, `VHH`, `IgG4`). That is a client content question — answering it means
authoring CME copy — and it is not a defect in `/acronyms`.

Same class, from `/glossary`: the source defines "Nonfactor therapy" as including "homeostatic
balancing agents" where the term everywhere else is _hemostatic rebalancing_ agents. Shipped
verbatim and marked `sic` in `src/data/glossary.ts`; the client decides whether to correct it.
