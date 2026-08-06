import { Fragment } from "react";

import type { Acronym } from "../data/glossary";
import { cn } from "../lib/cn";

/**
 * Terms and their expansions, in the order given. No `uppercase`: the case is
 * content here (aPCC, mAb, rFVIIa, VWF:Act), not a heading style.
 */
export default function AcronymList({
  items,
  className,
}: {
  items: readonly Acronym[];
  className?: string;
}) {
  return (
    <dl
      className={cn(
        // `max-content` aligns every expansion on the widest term (VERITAS-Pro)
        // without pinning a width. Below `sm` the pair stacks — that track plus
        // a 41-character expansion does not survive 320px side by side.
        "text-base/[1.6] sm:grid sm:grid-cols-[max-content_1fr] sm:gap-x-8 sm:gap-y-2 lg:text-xl/[1.6]",
        className,
      )}
    >
      {items.map(({ abbr, full }) => (
        <Fragment key={abbr}>
          <dt className="mt-4 font-bold text-brand-crimson-50 first:mt-0 sm:mt-0">{abbr}</dt>
          <dd className="text-black">{full}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
