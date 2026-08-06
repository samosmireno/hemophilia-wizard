import { type ReactNode } from "react";

/** Ordered longest-first — load-bearing; keep the sort when adding terms. */
const CASED_TERMS: readonly string[] = ["FVIIIa", "BsAbs", "Inno8", "FIXa", "FXa"];

/** No `g` flag. */
const PATTERN = new RegExp(`(${CASED_TERMS.join("|")})`);

/**
 * `text` with its cased terms wrapped so they opt out of an ancestor's `uppercase`.
 * Changes painted glyphs only — callers must keep it that way by stating an
 * `aria-label` with the source string.
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
