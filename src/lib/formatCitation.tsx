import { type ReactNode } from "react";

/**
 * Bibliography entries only — `/references` and `/resources`. Formats what the
 * source *draws* rather than what it says, so it paints every character of
 * `text` and adds none: the anchor's label is its own URL, the `®` stays where
 * it was, and an `_italic_` run is a journal abbreviation the board sets in
 * NotoSans-Italic (ADR 0009).
 *
 * Presentation-free like `formatInline` — the `<a>` comes out bare and the route
 * colours it (docs/styling.md §24, §25).
 */

/**
 * No `g` flag. **Alternation order is load-bearing**: the URL arm must precede
 * the `_…_` arm, because URLs in this list carry underscores that pair.
 * `r8`'s HEMLIBRA URL holds `gad_source` *and* `gad_campaignid`, so with the
 * arms the other way round the emphasis arm would match across the query string
 * and italicise the middle of a link. Matching the URL whole at that position
 * consumes them first. `formatCitation.test.tsx` pins this.
 *
 * `\S+` would also swallow a trailing `®`, but no citation puts one inside a
 * URL. `[®™]` covers both marks the client's direction names, though neither
 * list carries a `™`.
 */
const PATTERN = /(https?:\/\/\S+|_[^_]+_|[®™])/;

/** Anchored, like `formatInline`'s — and for the same reason. */
const EM = /^_[^_]+_$/;

const URL_RUN = /^https?:\/\//;

/**
 * The sentence period after a URL is not part of it. Splitting it back out keeps
 * the painted string whole while the `href` stays resolvable — `…/download.`
 * links to `…/download`, and `…-emicizumab/.` to `…-emicizumab/`.
 */
const TRAILING_PUNCTUATION = /[.,]+$/;

export function formatCitation(text: string): ReactNode[] {
  return text.split(PATTERN).flatMap((part, index) => {
    if (part === "®" || part === "™") {
      return <sup key={`mark-${index}`}>{part}</sup>;
    }

    if (EM.test(part)) {
      return <em key={`em-${index}`}>{part.slice(1, -1)}</em>;
    }

    if (URL_RUN.test(part)) {
      const href = part.replace(TRAILING_PUNCTUATION, "");
      const tail = part.slice(href.length);
      return [
        <a key={`url-${index}`} href={href} target="_blank" rel="noreferrer">
          {href}
        </a>,
        tail,
      ];
    }

    return part;
  });
}
