import { type ReactNode, useState } from "react";
import { PopupButton } from "mlg-components";

import ArchBand from "./ArchBand";
import Popup from "./Popup";

/** One "Click here:" disclosure — the caption under the button, and what it opens. */
export interface Disclosure {
  /**
   * Caption rendered under the button, and the button's accessible name —
   * `PopupButton` prefixes it with "Expand"/"Close", so it reads as a thing
   * that opens ("Expand Diagnostic algorithm for HA/HB").
   */
  label: string;
  /**
   * The dialog's own heading, where the design gives it one that is not the
   * caption — which is the usual case, not the exception: the caption names the
   * target from the §7.7 index ("Diagnostic algorithm for HA/HB") while the card
   * wears the figure's own title ("Diagnostic approach for Hemophilia A/B").
   * Optional because the two do coincide for some targets, and because a caller
   * that has not been reconciled with the design yet is better off showing the
   * caption twice than showing nothing.
   */
  title?: string;
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
 * **The arch itself is `ArchBand`'s** — the drawing, the footage, the wash and
 * the heading, all shared with `/wizard/therapies`, which the artboards draw as
 * the same object. What is left here is the part that is a chapter's: three
 * disclosures, mutually exclusive, over one dialog. See `ArchBand` for the
 * stacking recipe and the parent contract `grow` assumes.
 */
export default function DisclosureBand({
  title,
  disclosures,
}: {
  title: string;
  disclosures: readonly [Disclosure, Disclosure, Disclosure];
}) {
  /**
   * One dialog, so one open index rather than three booleans: two modals at
   * once is not a state the top layer should be asked to represent. Opening a
   * second closes the first; clicking the open one closes it.
   *
   * State lives here rather than in each `PopupButton` (which would happily
   * manage its own) precisely because that mutual exclusion is a fact about the
   * band, not about a button.
   */
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const open = openIndex === null ? undefined : disclosures[openIndex];

  return (
    <ArchBand title={title}>
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
              // Not `aria-controls`: a modal dialog lives in the top layer, so
              // it is not a region of the page this button expands — and the
              // pattern for a control that summons one is `aria-haspopup`.
              // Announced only where something will actually open, for the same
              // reason the old `aria-controls` was conditional.
              aria-haspopup={disclosure.content ? "dialog" : undefined}
              onClick={(next) => setOpenIndex(next ? index : null)}
            />
            <p className="mt-4 flex max-w-68 flex-1 items-center text-center text-h3 font-bold text-popup-caption">
              {disclosure.label}
            </p>
          </li>
        ))}
      </ul>

      {/*
        `content` was always "what opens" rather than "what renders here", so
        swapping the provisional in-flow panel for issue 03's dialog changed
        nothing above this line.

        **A disclosure with no content opens nothing.** `open` is gated on the
        content existing, not on a disclosure being selected — most of the §7.7
        targets are figures whose assets do not exist yet, and an empty modal is
        a worse placeholder than the inert toggle issue 11 accepted. The button
        still flips to ✕, which is the state it was in before.

        Mounted unconditionally: the effect that calls `showModal()` needs the
        element to already be in the DOM, and the children it wraps are
        `undefined` while closed, so nothing renders early.
      */}
      <Popup
        open={open?.content !== undefined}
        title={open?.title ?? open?.label ?? ""}
        onClose={() => setOpenIndex(null)}
      >
        {open?.content}
      </Popup>
    </ArchBand>
  );
}
