import { type ReactNode } from "react";

/**
 * Terms whose internal casing has to survive a CSS `uppercase`.
 *
 * A plain transform produces "FVIIIA-MIMETIC BSABS" and destroys both
 * abbreviations — `FVIIIa` is factor VIII *activated*, and a `BsAb` is a
 * bispecific antibody, neither of which survives being shouted. `FIXa`/`FXa`
 * are the same fact one letter smaller: "INTERACTIONS WITH FIX/FIXA AND FX/FXA"
 * loses the only thing that distinguishes a zymogen from its activated form,
 * which is precisely what the caption naming it exists to say.
 *
 * Matching by TERM rather than by position: the `fviii-mimetics` artboard
 * spends seven hand-placed spans on exactly this and its last letter slips
 * ("BsAbS:", with the trailing s shouted). A named list means a string that
 * stops containing a term simply matches nothing, where a position would
 * silently exempt the wrong letter.
 *
 * **`Inno8` is here for a different reason than the other four**, and the
 * distinction is worth keeping straight: nothing about it is *destroyed* by being
 * shouted — it is a product name, and "INNO8" loses no meaning the way "FIXA"
 * does. It is here because the Pop up 13 artboard draws it cased inside a band
 * that shouts everything else, so preserving it is transcription rather than
 * repair. That is the same authority the sibling card's `Mim8` is decided on and
 * lands the other way: the designer shouts that one, so it is not listed.
 *
 * **Ordered longest-first, and that ordering is load-bearing.** A regex
 * alternation is first-match-wins at a given offset, so a prefix listed ahead of
 * the term it prefixes strands the remainder outside the span — add `BsAb`
 * before `BsAbs` and you reproduce the export's own "BsAbS". Nothing in the
 * current five collides (`FIXa` contains `IXa`, not `FXa`), but the next term
 * added has to keep the sort.
 */
const CASED_TERMS: readonly string[] = ["FVIIIa", "BsAbs", "Inno8", "FIXa", "FXa"];

/**
 * Hoisted rather than rebuilt per call — the parts are constant, and this runs
 * on every render of every pop-up band.
 *
 * A capturing group, so `split` keeps the delimiters: the parts concatenate back
 * to the input and nothing is dropped.
 *
 * No `g` flag. `split` never consults `lastIndex` — it clones the pattern
 * sticky internally — so the flag buys nothing here, and on a module-scope
 * regex it is a trap: the next caller to reach for `.test()` would get
 * alternating answers.
 */
const PATTERN = new RegExp(`(${CASED_TERMS.join("|")})`);

/**
 * `text` with its cased terms wrapped so they opt out of an ancestor's
 * `uppercase`.
 *
 * **This changes painted glyphs only, and callers must keep it that way.** The
 * accessible-name algorithm concatenates each element's contribution with a
 * separating space, so a heading built from these fragments announces
 * "FIX/ FIXa " unless it carries an `aria-label` stating the source string. Both
 * callers do — `Popup`'s band and the `fviii-mimetics` `<h1>` — and a third
 * that does not would degrade the name it was reaching for.
 */
export function preserveCase(text: string): ReactNode[] {
  return text.split(PATTERN).map((part, index) =>
    CASED_TERMS.includes(part) ? (
      <span key={`${part}-${index}`} className="normal-case">
        {part}
      </span>
    ) : (
      part
    ),
  );
}
