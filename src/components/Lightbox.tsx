import { type ReactNode } from "react";
import { PopupButton } from "mlg-components";

import ModalLayer from "./ModalLayer";

/**
 * The other presentation of a modal: the content on the scrim, with no card
 * around it. `Popup` is the §7.7 click-through card; this is an enlargement.
 *
 * **Why a figure gets this and not the card.** A §7.7 pop-up is a *destination*
 * — it has a name, prose, sometimes a table, and the crimson band tells you what
 * you opened. An enlarged picture is the same object you just clicked, bigger;
 * banding and bordering it says "you are somewhere new" about a gesture that
 * went nowhere. It also stacks badly, since the only place an enlargement is
 * reached from is inside a card that already has a band and a ✕ of its own.
 *
 * **It is still a modal, with all four behaviours.** ESC, the backdrop click,
 * the focus trap, focus restoration and the scroll lock are `ModalLayer`'s and
 * are not traded away for the lighter look — including the nesting guarantee
 * that lets this close without taking the card behind it.
 *
 * **The name comes from `aria-label`, not from visible text**, because there is
 * no band to carry a heading. It is the same string the trigger was named with,
 * so a screen-reader user hears "Expand <title>" on the way in and "<title>" on
 * arrival, which is the pairing the card gives too.
 */
export default function Lightbox({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  /** The dialog's accessible name, and the ✕'s. Never painted. */
  title: string;
  onClose: () => void;
  children?: ReactNode;
}) {
  return (
    <ModalLayer open={open} onClose={onClose} aria-label={title} className="p-4 sm:p-8">
      {/*
        No background, no border, no radius: whatever the caller renders is what
        is seen. `max-h-full` against the layer's padding keeps a tall figure
        inside the viewport, and `overflow-y-auto` is the fallback for the case
        where a picture plus a caption still cannot fit — a phone in landscape.

        `w-fit` so the column is the picture's own width rather than the layer's,
        which is what lets a caller centre a caption on the image. **A caption
        must not widen it** — a paragraph's max-content is its longest unbroken
        line, which is wider than most figures — so callers state `w-0
        min-w-full` on prose here: zero contribution to the intrinsic width,
        then fill whatever the picture settled on.
      */}
      <div className="flex max-h-full w-fit max-w-full flex-col items-center overflow-y-auto">
        {children}
      </div>

      {/*
        The same `PopupButton` in its open skin that the card uses, so closing an
        enlargement looks like closing anything else in this app.

        **Pinned to the layer, not to the content**, and absolute rather than a
        third grid item — an out-of-flow child does not take a grid cell, so the
        content stays centred in the viewport rather than being pushed off by a
        button in the row above it. It also cannot be clipped by the scroll
        container above, which is what happened when it hung off the content's
        corner.

        `showModal()` has made the rest of the document inert, so this and the
        backdrop are the only pointer targets. A button in the corner is the
        convention every image viewer uses, and it stays put whatever shape the
        asset is — a portrait figure would leave a content-anchored ✕ stranded
        mid-scrim.
      */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <PopupButton label={title} open onClick={() => onClose()} />
      </div>
    </ModalLayer>
  );
}
