import { type ReactNode, useId, useState } from "react";
import { PopupButton } from "mlg-components";

import BrandLoop from "./BrandLoop";

/** One "Click here:" disclosure — the caption under the button, and what it opens. */
export interface Disclosure {
  /**
   * Caption rendered under the button, and the button's accessible name —
   * `PopupButton` prefixes it with "Expand"/"Close", so it reads as a thing
   * that opens ("Expand Diagnostic algorithm for HA/HB").
   */
  label: string;
  /**
   * What the button opens. Optional because it genuinely is: the §7.7 targets
   * are image-borne (CONTEXT.md) and most of those 24 figures are not yet
   * available as assets. A disclosure without content still renders its button
   * and still toggles — the placeholder state issue 11 knowingly accepts — it
   * just has no panel to show. `ReactNode` rather than a `{src, alt}` figure
   * pair because §7.7 lists prose targets as well as diagrams.
   */
  content?: ReactNode;
}

/**
 * The arched band that closes an education chapter: a title over exactly three
 * "Click here:" disclosures, on the brand loop.
 *
 * **Three, enforced by the type** — the prop is a 3-tuple, not an array, so a
 * chapter cannot add a fourth. The layout is `lg:grid-cols-3` and the arch is a
 * fixed 300px radius; both are drawn around three columns, so a fourth would be
 * a design question rather than a data change, and the tuple is what makes the
 * compiler ask it.
 *
 * **Parent contract:** `grow` means this expects a growing flex column — see
 * `education/DiseaseBackground`, whose `<section>` is `flex flex-1 flex-col`
 * inside `AppShell`'s `min-h-dvh` wrapper. In a non-flex parent `grow` is inert
 * and the band simply ends under its own content, which is a degraded but not
 * broken layout.
 *
 * The heading is an `<h2>`: chapters own the `<h1>`.
 *
 * `isolate` + `-z-10` is what keeps the loop BEHIND the heading and the
 * disclosures without positioning either of them — a positioned child otherwise
 * paints over in-flow siblings whatever the DOM order. The isolation is
 * load-bearing: it makes this div a stacking context, so `-z-10` bottoms out
 * here, above the div's own background, instead of escaping up the tree and
 * disappearing behind the page.
 *
 * `opacity-20` over `bg-brand-crimson-50/15` is the whole wash — no overlay
 * element, no blend mode — and the pair is measured rather than eyeballed
 * (docs/styling.md §7.1). The two numbers move together; changing one alone
 * shifts the hue as well as the strength.
 */
export default function DisclosureBand({
  title,
  disclosures,
}: {
  title: string;
  disclosures: readonly [Disclosure, Disclosure, Disclosure];
}) {
  /**
   * One panel, so one open index rather than three booleans: the panel is
   * full-width under the row, and two open at once would have nowhere to go.
   * Opening a second closes the first; clicking the open one closes it.
   *
   * State lives here rather than in each `PopupButton` (which would happily
   * manage its own) precisely because that mutual exclusion is a fact about the
   * band, not about a button.
   */
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const panelId = useId();
  const open = openIndex === null ? undefined : disclosures[openIndex];

  return (
    <div className="-border-offset-4 relative isolate mt-4 grow overflow-hidden rounded-t-[300px] border-t-4 border-white/40 bg-brand-crimson-50/15">
      {/*
        `object-cover` fills the arch at whatever height `grow` settles on, and
        `overflow-hidden` clips it to the rounded top rather than leaving a
        rectangle of video behind it. On the walkthrough path (`/` → a chapter)
        the asset is already cached, so this is not a second 1.9 MB fetch.
      */}
      <BrandLoop className="absolute inset-0 -z-10 opacity-20" />

      <h2 className="mt-9 text-center font-display text-h2 tracking-wide text-brand-crimson-50 uppercase">
        {title}
      </h2>

      <ul className="mt-10 grid justify-items-center gap-10 lg:grid-cols-3">
        {/* The captions run 1–3 lines. Grid stretch makes every cell as tall
            as the longest, so the caption below takes the leftover space as a
            flex track and centres in it — the three blocks then read as one
            band instead of hanging off the buttons. */}
        {disclosures.map((disclosure, index) => (
          <li key={disclosure.label} className="flex flex-col items-center">
            <PopupButton
              label={disclosure.label}
              open={openIndex === index}
              // `aria-controls` only where a panel will actually exist — a
              // reference to a missing id is worse than no reference.
              aria-controls={disclosure.content ? panelId : undefined}
              onClick={(next) => setOpenIndex(next ? index : null)}
            />
            <p className="mt-4 flex max-w-68 flex-1 items-center text-center text-h3 font-bold text-popup-caption">
              {disclosure.label}
            </p>
          </li>
        ))}
      </ul>

      {/*
        Provisional presentation, deliberately: an in-flow panel, because §7.7
        calls these "in-chapter local-state pop-ups" and issue 03's Modal
        primitive — which owns focus trapping, the close affordance and the
        backdrop — does not exist yet. When it lands, this element is what it
        replaces; the props above do not change, since `content` is already
        "what opens" rather than "what renders here".

        Rendered unconditionally so `aria-controls` always resolves, and left
        empty when the open disclosure has no content yet.
      */}
      <div id={panelId} className="mx-auto mt-10 max-w-3xl px-8 pb-12 empty:hidden">
        {open?.content}
      </div>
    </div>
  );
}
