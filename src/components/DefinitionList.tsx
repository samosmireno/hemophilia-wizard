import { Fragment } from "react";

import { cn } from "../lib/cn";

export interface Definition {
  term: string;
  definition: string;
}

/**
 * Term↔definition pairs as a `<dl>`, in the order given. The grid track and the
 * breakpoint it turns on at belong to the caller: an acronym's two-word
 * expansion and a glossary sentence do not want the same column
 * (docs/styling.md §22, §23). What both pages share is here — the pairing, the
 * body ramp and the two colours.
 *
 * No `uppercase` near a `<dt>`: the case is content on both pages (`aPCC` is
 * activated PCC; `FVIIIa` is not `FVIIIA`), not a heading style.
 */
export default function DefinitionList({
  items,
  className,
  termClassName,
}: {
  items: readonly Definition[];
  className?: string;
  /** Applied to every `<dt>` — the stacked-mode spacing between pairs. */
  termClassName?: string;
}) {
  return (
    <dl className={cn("text-base/[1.6] lg:text-xl/[1.6]", className)}>
      {items.map(({ term, definition }) => (
        <Fragment key={term}>
          <dt className={cn("font-bold text-brand-crimson-50", termClassName)}>{term}</dt>
          <dd className="text-black">{definition}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
