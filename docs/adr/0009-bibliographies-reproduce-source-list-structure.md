# 0009 — Bibliographies reproduce the source's list structure

Date: 2026-08-07
Status: Accepted

## Context

`/references` shipped earlier the same day (ADR 0008, `docs/styling.md` §24) on two claims about
how `[PDF-V]` draws its bibliography:

1. **"The source draws no markers."** The page therefore invented a hanging indent
   (`pl-8 -indent-8`) to do the separating job a marker would have done, and
   `references.test.tsx` asserted the absence of an `<ol>` on that reasoning.
2. **Journal abbreviations are upright** — the 29 citations shipped as flat strings.

Both claims came from `documents/out_raw.txt`. That file is a **text extraction**, and a text
extraction has no bullets and no font style: it is a lossy view of the source, not the source.
Every transcription in this repo has been read from it.

Building `/resources` put the same block in front of the same question a second time, and this
time the artifact itself was consulted:

- **`pdftoppm -r 2400` crops** of the two blocks show **discs** on every entry of both the teal
  references list and the `Resources:` panel.
- **`pdftohtml -xml`** exposes the font subset per text run — `AAAAAA+` is NotoSans-Regular,
  `BAAAAA+` NotoSans-Italic, `CAAAAA+` Bold. The italic runs are **15 of the 29 references** and
  **14 of the 18 resources**, and in both blocks those are _exactly_ the entries that name a
  journal. PIs, websites and congress abstracts are upright. Not one exception in 47 entries.

So the page shipped with a device invented to replace a marker the source has, and without an
editorial convention the source applies without exception.

## Decision

**A bibliography in this app reproduces the list structure the board draws: bullets, and the
italic run on the journal.** This applies to `/references` and `/resources` alike.

- The hanging indent is withdrawn; both routes render through `BulletList`.
- Italic runs are marked **in the data** as `_J Thromb Haemost._` per ADR 0004, and
  `formatCitation` gains an `<em>` arm.

## Rationale

**This is a falsified premise, not a re-litigated preference.** §24 argued the hanging indent
carefully and correctly _given_ "no markers"; the argument was sound and the input was wrong. The
fix belongs at the input.

**The extraction is a view; the PDF is the record.** `out_raw.txt` is enormously useful and stays
the working transcription surface — but it silently drops two whole channels of information, and
neither absence looks like an absence when you read it. Rendering a crop and reading the font
subsets are cheap, repeatable checks, and they are now the documented way to settle "what does the
source actually draw here".

**The italics are semantic, not decorative.** In a citation the italic run is what marks where the
title ends and the journal begins — 47 for 47 is an editorial convention being applied, not a
designer's flourish. Dropping it makes every citation on both pages marginally harder to parse.

**ADR 0004's mechanism, not a term list.** Deriving italics by matching known journal names was
rejected for the reason ADR 0004 already gives, with a sharper example than the ADR's own: Mehta's
italic run is `Hemophilia.` — a StatPearls _chapter title_ — and "Hemophilia" appears as ordinary
prose throughout `src/data/`. Which run is italic is a fact about one citation, so it is marked at
that citation.

## Consequences

- **`formatCitation`'s alternation order is now load-bearing.** The URL arm must precede the `_…_`
  arm because `r8`'s HEMLIBRA URL carries `gad_source` _and_ `gad_campaignid` — two underscores
  that pair. Emphasis-first would italicise the middle of a query string and break the `href`.
  Pinned in `formatCitation.test.tsx`.
- **Two data arrays are no longer plain strings**, so a test comparing rendered text to source text
  needs a marker-stripped form — and that stripper must be **opaque to URLs**, because six URLs
  contain underscores that _are_ painted. `references.test.tsx` and `resources.test.tsx` each spell
  the rule out rather than importing the parser, so the assertion stays independent of it.
- **`/references`' geometry changed under a claim that had never been verified.** §24 flagged
  `break-words` on `r8`'s ~300-character URL as the thing to check first, and the bullet and the
  `<em>` runs landed on top of it. Both routes were opened and checked immediately after this
  rework (2026-08-07) and the `break-words` claim holds — **no widths were recorded**, so it is a
  sighting, not a sweep, and the residue stays with open item 30.
- **This is a class of defect, not an incident.** Everything else in `src/data/` was transcribed
  from the same flattened dump — the education chapters, the drug sheets, the glossary. ADR 0004
  already records one instance under suspicion (`F8`/`F9` shipping upright where nomenclature and
  CONTEXT.md §7.2/§7.3 set them italic). **This ADR does not sweep them**; it establishes that the
  question is checkable and how to check it.

## Alternatives considered

- **Bullets and italics on `/resources` only**, leaving `/references` as shipped. Rejected: the two
  pages are one sidebar click apart and hold five of the same citations in different forms already.
  Two list idioms with no rule behind them is worse than either idiom.
- **Correct the bullets, leave the italics.** Rejected as half a fix on the cheaper half — the
  bullet is structure the reader sees immediately, the italic is the one that carries meaning.
- **Record the finding and change nothing**, on the grounds that `/references` had just shipped.
  Rejected: it had not shipped anywhere. The work was uncommitted in the working tree, which made
  this the cheapest moment this decision will ever be available.
