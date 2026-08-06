import { type ReactNode } from "react";

/**
 * Body prose only — never a heading, caption or `aria-label`; format the `<p>` and
 * the `<li>`, leave the `<h1>` raw. See ADR 0004.
 */

/** No `g` flag. */
const PATTERN = /(\*\*[^*]+\*\*|_[^_]+_)/;

/** Anchored, and that is not belt-and-braces. */
const STRONG = /^\*\*[^*]+\*\*$/;
const EM = /^_[^_]+_$/;

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
