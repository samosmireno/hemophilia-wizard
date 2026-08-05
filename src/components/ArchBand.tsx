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
 *
 * **The radius halves below `xl`, and that replaces a browser default rather
 * than adding a rule.** Two 300px corners want 600px of top edge; a 375px phone
 * gives the band 311px, so CSS's own overlapping-curve reduction scales both by
 * 311/600 and draws ~155px corners. Nothing clips — but the shape is then an
 * artefact of the viewport rather than a decision, and it changes continuously
 * as the window moves. 150px is stated instead: it fits inside 311px outright,
 * so the arch is the same drawing at every width below the breakpoint. Like the
 * `md` in `DisclosureBand`, it is an invented value — no artboard exists below
 * 1440 (docs/styling.md §12).
 *
 * **The title is inset to clear that curve** — see the wrapper below. The two
 * numbers are computed from the radius, so the pair moves together.
 *
 * The title steps 30 → 24 below `lg`, the same one-step rule §2 gives the app's
 * `<h1>`. **A caller's `leading-*` in `titleClassName` survives that step
 * untouched** — `/wizard/therapies` passes `leading-none` for a measured 32px
 * pitch and keeps it, because a Tailwind v4 `leading-*` sets `--tw-leading` and
 * every `text-<size>` resolves through that property rather than overwriting
 * it. Worth stating because the reverse looks true, and because a caller
 * passing a slash modifier instead would genuinely need one per step.
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
        "relative isolate -mx-6 mt-4 -mb-4 grow overflow-hidden rounded-t-[9.375rem] border-t-4 border-white/40 bg-brand-crimson-50/15 pb-4 sm:mx-0 lg:mb-0 lg:pb-0 xl:rounded-t-[18.75rem]",
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

      {/*
        The padding is the corner curve, expressed as a measure. `overflow-hidden`
        clips to the padding-box radius, so at the title's own depth the arch has
        already eaten a fixed amount off each side — and nothing else here stops
        a long title running into it. Inner radius is the class value less
        `border-t-4`, and the inset at depth y is `r − √(r² − (r−y)²)`; the `<h2>`
        starts at `mt-9` = 36:

            r = 146 (<xl)   146 − √9216  =  50.0px
            r = 296 (xl+)   296 − √20016 = 154.5px

        `px-13` / `px-39` are those two rounded up. They ramp at the breakpoint
        the RADIUS ramps at, because they are derived from it — move one and the
        other has to move.

        It is a wrapper rather than padding on the `<h2>` because preflight sets
        `box-sizing: border-box`: on the heading itself this would eat into a
        caller's `max-w-*`, and `/wizard/therapies`' 860px cap exists to place a
        drawn line break. On the wrapper the cap still measures text. It costs
        that caller 4px (1168 − 312 = 856), which is inside the ≥809/<895 window
        that reproduces the break.

        Only the first line is ever at risk — the inset is 22.6px by y=68 — so the
        lower lines have room to spare and simply centre inside the same measure.

        `mt-9` keeps its measured position: the arch is `overflow-hidden`, which
        establishes a block formatting context, so the heading's top margin
        cannot collapse out through this div.
      */}
      <div className="px-13 xl:px-39">
        <h2
          className={cn(
            "mt-9 text-center font-display text-2xl font-bold tracking-wide text-brand-crimson-50 uppercase lg:text-3xl",
            titleClassName,
          )}
        >
          {title}
        </h2>
      </div>

      {children}
    </div>
  );
}
