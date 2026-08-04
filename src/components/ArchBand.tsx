import type { ReactNode } from "react";

import BrandLoop from "./BrandLoop";
import { cn } from "../lib/cn";

/**
 * The arch that closes a page: a title over whatever the caller puts under it,
 * on the brand loop.
 *
 * Extracted when it got its second caller, which is the same moment `BrandLoop`
 * itself was pulled out of `Landing` — not before. Its two consumers are
 * `DisclosureBand` (an education chapter's three "Click here:" disclosures) and
 * `/wizard/therapies` (the leaf's 2–5 recommended agents). The `/wizard/therapies`
 * artboard draws the same object: `rounded-t-[300px]` fits its measured left edge
 * to within a pixel over 230 rows, and its `<h2>` measures the same `text-3xl`
 * at the same `mt-9`.
 *
 * What it owns is the drawing — the arch, the wash, the footage, the heading's
 * type and position. What a caller owns is the row beneath, because that is where
 * the two genuinely differ: three by type against two-to-five by scenario, and a
 * `PopupButton` that opens a card against one that does not open yet.
 *
 * **Parent contract:** `grow` means this expects a growing flex column — see
 * `education/DiseaseBackground`, whose `<section>` is `flex flex-1 flex-col`
 * inside `AppShell`'s `min-h-dvh` wrapper. In a non-flex parent `grow` is inert
 * and the band simply ends under its own content, which is a degraded but not
 * broken layout.
 *
 * The heading is an `<h2>`: pages own the `<h1>`.
 *
 * `isolate` + `-z-10` is what keeps the loop BEHIND the heading and the row
 * without positioning either of them — a positioned child otherwise paints over
 * in-flow siblings whatever the DOM order. The isolation is load-bearing: it
 * makes this div a stacking context, so `-z-10` bottoms out here, above the div's
 * own background, instead of escaping up the tree and disappearing behind the
 * page.
 *
 * `opacity-20` over `bg-brand-crimson-50/15` is the whole wash — no overlay
 * element, no blend mode — and the pair is measured rather than eyeballed
 * (docs/styling.md §7.1). The two numbers move together; changing one alone
 * shifts the hue as well as the strength.
 *
 * (`DisclosureBand` also carried a `-border-offset-4` class here. It is not a
 * Tailwind utility and appeared nowhere else in the project, so it compiled to
 * nothing; it is dropped rather than propagated to a second caller.)
 */
export default function ArchBand({
  title,
  titleClassName,
  className,
  children,
}: {
  title: string;
  /**
   * Extra classes for the arch box — in practice how it takes its height.
   *
   * The default `grow` is `DisclosureBand`'s: a chapter's band starts under the
   * content and fills whatever is left. `/wizard/therapies` needs the other
   * behaviour and passes `mt-auto grow-0`, because its two artboards put the
   * arch's top edge at the SAME y whichever note is open — 553 with a 152px
   * panel above it and 553 with a 335px one — which is a band pinned to the
   * bottom of the column, not one that follows the content down.
   *
   * `grow-0` rather than omitting `grow` from the base: tailwind-merge resolves
   * the flex-grow conflict, so the caller wins, and the default stays visible
   * here rather than being assembled at two call sites.
   */
  className?: string;
  /**
   * Extra classes for the `<h2>` — in practice a measure cap, which is what
   * controls where a long title breaks.
   *
   * `DisclosureBand`'s titles are phrases that set on one line and need none.
   * `/wizard/therapies` sets a full sentence whose drawn break ("…BLEEDING
   * CONTROL IS / THE PRIMARY REASON…") is narrower than the content column, so
   * it is a line-break cap rather than styling, and it belongs to that caller's
   * copy rather than to the arch.
   */
  titleClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative isolate mt-4 grow overflow-hidden rounded-t-[300px] border-t-4 border-white/40 bg-brand-crimson-50/15",
        className,
      )}
    >
      {/*
        `object-cover` fills the arch at whatever height `grow` settles on, and
        `overflow-hidden` clips it to the rounded top rather than leaving a
        rectangle of video behind it. On the walkthrough path the asset is
        already cached by the time either caller renders, so this is not a
        second 1.9 MB fetch.
      */}
      <BrandLoop className="absolute inset-0 -z-10 opacity-20" />

      <h2
        className={cn(
          "mt-9 text-center font-display text-3xl font-bold tracking-wide text-brand-crimson-50 uppercase",
          titleClassName,
        )}
      >
        {title}
      </h2>

      {children}
    </div>
  );
}
