import { type ReactNode } from "react";

/**
 * Inline emphasis inside a transcribed string, written as a markdown subset:
 * `_word_` for `<em>`, `**word**` for `<strong>`.
 *
 * The app's copy is transcribed from artboards and from CONTEXT.md, and some of
 * it is emphasised in the source — the `/wizard/scenario` lead sets the polarity
 * word in italic ("prophylaxis of HB _with_ inhibitors"), which is the branch the
 * whole screen turns on. Before this, every `font-bold` in the app styled a whole
 * block; nothing had ever emphasised a run *inside* a sentence, so there was
 * nowhere for that fact to live but the page.
 *
 * See `docs/adr/0004-inline-emphasis-in-transcribed-copy.md` for why the markup
 * is in the string rather than in the shape of the data, and why the delimiters
 * are these two.
 *
 * **Body prose only — never a heading, a caption or an `aria-label`.** This
 * returns fragments, and the accessible-name algorithm joins an element's
 * contributions with a separating space, so a name built from them gains spaces
 * the source string does not have. `preserveCase` documents the same hazard and
 * answers it by having both its callers state an `aria-label`; the answer here is
 * simpler, because nothing that needs a name has emphasis in it. Keep it that
 * way: format the `<p>` and the `<li>`, leave the `<h1>` raw.
 *
 * **No nesting.** `**_x_**` yields a `<strong>` whose text is the literal
 * `_x_` — the inner delimiters are not re-scanned. Both alternatives below
 * exclude their own delimiter, which is what keeps one emphasised run from
 * swallowing the next ("`_a_ and _b_`" is two runs, not one), and the same
 * exclusion is what stops the outer match from containing a usable inner one.
 * Nothing in this app's copy nests, and a source that wanted it would be better
 * served by markup than by a deeper parser.
 */

/**
 * Hoisted rather than rebuilt per call — the parts are constant, and this runs on
 * every render of every formatted string.
 *
 * A capturing group, so `split` keeps the delimiters: the parts concatenate back
 * to the input and nothing is dropped. That is also what makes the round trip
 * testable, and `formatInline.test.tsx` asserts it.
 *
 * **Only PAIRED delimiters match**, which is the property that makes this safe to
 * point at strings that were never marked up: a lone underscore or asterisk finds
 * no partner, falls out of the alternation, and passes through as text. So
 * applying this to a whole data module costs nothing until someone opts a string
 * in.
 *
 * `**` is listed first for the reason `preserveCase` records about its own
 * ordering — a regex alternation is first-match-wins at a given offset. Here the
 * two delimiters do not share a character, so nothing currently depends on it;
 * it is the sort a third delimiter would have to keep.
 *
 * No `g` flag: `split` never consults `lastIndex`, and on a module-scope regex
 * the flag is a trap for the next caller who reaches for `.test()`.
 */
const PATTERN = /(\*\*[^*]+\*\*|_[^_]+_)/;

/**
 * Anchored, and that is not belt-and-braces.
 *
 * `split` returns the unmatched text as well as the captures, and an unmatched
 * run can perfectly well begin with a delimiter character — "_abc" has no closing
 * partner, so it arrives here whole. A `startsWith` test would call that a match
 * and slice its first and last characters off, turning a stray underscore into a
 * silent one-character edit of clinical copy. Matching the whole segment is what
 * separates "this IS an emphasised run" from "this merely starts like one".
 */
const STRONG = /^\*\*[^*]+\*\*$/;
const EM = /^_[^_]+_$/;

/** `text` with its `_em_` and `**strong**` runs rendered as elements. */
export function formatInline(text: string): ReactNode[] {
  return text.split(PATTERN).map((part, index) => {
    if (STRONG.test(part)) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    if (EM.test(part)) {
      return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
