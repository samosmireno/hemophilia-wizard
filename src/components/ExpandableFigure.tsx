import { type ReactNode, useState } from "react";

import { cn } from "../lib/cn";
import Lightbox from "./Lightbox";
import Popup from "./Popup";

/**
 * A §7.7 figure that sits in the page as a thumbnail and opens itself in the
 * pop-up card — the click-through targets that are NOT reached from a
 * `DisclosureBand`, because the design draws the figure in the chapter body
 * rather than behind a "Click here:" button.
 *
 * **It owns its own open state**, exactly as `DisclosureBand` does and for the
 * same reason: whether a figure is open is a fact about that figure, not about
 * the chapter, so the chapter stays a pure function of its data. Two of these on
 * one page cannot both be open — not because anything here enforces it, but
 * because `showModal()` makes the rest of the document inert, so the second
 * trigger is unreachable while the first is up.
 *
 * **It knows nothing about what it opens**, the way `Popup` doesn't: `children`
 * is the card's body. The clotting cascade rebuilds its annotations as markup
 * over a bare diagram, while the `DisclosureBand` figures are a single raster
 * through `PopupFigure` — one prop covers both, and neither shape is baked in
 * here.
 *
 * **The thumbnail is decorative and the body carries the description.** An image
 * button takes its accessible name from `alt`, and a §7.7 figure's description
 * is the only route to image-borne content (CONTEXT.md §7.7), so it runs long —
 * announced as the *name of a control* that would be hostile, and it would then
 * be announced a second time when the card opens.
 *
 * The name is `Expand {title}`, which is `PopupButton`'s own convention
 * (`aria-label={open ? `Close ${label}` : `Expand ${label}`}`) — a screen-reader
 * user hears the same verb on this figure as on the disclosures below it.
 */
export default function ExpandableFigure({
  thumbSrc,
  thumbWidth,
  thumbHeight,
  title,
  surface,
  variant = "card",
  className,
  children,
}: {
  /** The closed state: the same figure with the pop-up's ✕ cropped out. */
  thumbSrc: string;
  /**
   * `thumbSrc`'s own pixel dimensions — only their ratio is consumed. The
   * thumbnail is `w-full`, so with a declared `aspect-ratio` its box exists at
   * its final size before the file has bytes; without one an unloaded thumbnail
   * is 0px tall, and a thumb inside a `Popup` opens the card short and shifts
   * the whole body when the picture lands — the same collapse `PopupFigure`
   * fixed on 2026-08-06, one level down. Any pair in the right ratio works;
   * state the file's actual pixels so the next reader can check them against
   * the asset, and note that a pair in the *wrong* ratio stretches the thumb
   * (the image fills the box it is given), so a re-export that reshapes the
   * raster has to move these numbers with it.
   */
  thumbWidth: number;
  thumbHeight: number;
  /** The figure's own heading — the expansion's title, and the trigger's name. */
  title: string;
  /** Passed through to `Popup`; see its own `surface` prop. Ignored when bare. */
  surface?: "gradient" | "white";
  /**
   * What the expansion looks like.
   *
   * `"card"` is the §7.7 pop-up — crimson band, border, the title painted. Right
   * where the expansion is a destination with a name and content of its own: the
   * clotting cascade rebuilds annotations as markup over its diagram, and the
   * band is what says which figure you are looking at.
   *
   * `"bare"` is the picture on the scrim and nothing else. Right where the
   * expansion IS the thumbnail, larger — chrome there announces a new place for
   * a gesture that went nowhere — and where the trigger already sits inside a
   * card, since two bands and two ✕ stacked read as two things to dismiss.
   *
   * Both are modal and both close three ways; only the drawing differs.
   */
  variant?: "card" | "bare";
  /** The thumbnail's layout box. The radius and the clip are not negotiable. */
  className?: string;
  /** The expansion's body. */
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/*
        `block w-full` with the caller's `max-w-*`: the button and the image
        agree on one box, so the hint below can be `inset-0` and land exactly on
        the picture. A height cap here instead would let the two disagree — the
        image would satisfy it by narrowing, and the overlay would hang off the
        side of a picture that no longer fills its own button.

        `aria-haspopup="dialog"`, not `aria-controls`: a modal dialog lives in
        the top layer, so it is not a region of this page that the button
        expands — the same reasoning `DisclosureBand` records for its triggers.
      */}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={`Expand ${title}`}
        onClick={() => setOpen(true)}
        className={cn(
          "group relative block w-full cursor-pointer overflow-hidden rounded-xl",
          "focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-brand-crimson-50",
          className,
        )}
      >
        <img
          src={thumbSrc}
          alt=""
          style={{ aspectRatio: `${thumbWidth} / ${thumbHeight}` }}
          className="block w-full"
        />

        {/*
          `bg-black/50` is `Popup`'s own `::backdrop`, reused rather than
          re-chosen: hovering the thumbnail previews the wash that is about to
          cover the page.

          On `:focus-visible` as well as `:hover` — a keyboard user never
          hovers. Touch reaches neither, so where no input can hover the badge
          below stands in — reversing the "reads as static; accepted" call
          recorded here until 2026-08-06.
        */}
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center bg-black/50 px-4 text-center font-display text-2xl font-semibold tracking-wide text-white uppercase opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          Click to enlarge
        </span>

        {/*
          The touch stand-in for the wash above: where no input can hover, a
          hint is persistent or it does not exist, and a learner on a tablet
          has no other route to discovering the enlargement. Bottom-right
          because the open card's ✕ owns top-right; "Tap", not "Click", because
          the badge only renders where the gesture is a tap. The arbitrary
          `[@media(hover:hover)]:hidden` rather than a tokens.css variant —
          one use site, and the desktop rendering stays byte-identical. Hidden
          from the accessible name for the same reason as the wash.
        */}
        <span
          aria-hidden="true"
          className="absolute right-0 bottom-0 flex items-center gap-1.5 rounded-tl-xl bg-black/50 px-3 py-1.5 font-display text-base font-semibold tracking-wide text-white uppercase [@media(hover:hover)]:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="size-4"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
            <path d="M11 8v6" />
            <path d="M8 11h6" />
          </svg>
          Tap to enlarge
        </span>
      </button>

      {/*
        Mounted either way — the effect that calls `showModal()` needs the
        element in the DOM — and only one of the two ever exists, so a figure
        cannot be half-open in both presentations.
      */}
      {variant === "bare" ? (
        <Lightbox open={open} title={title} onClose={() => setOpen(false)}>
          {children}
        </Lightbox>
      ) : (
        <Popup open={open} title={title} surface={surface} onClose={() => setOpen(false)}>
          {children}
        </Popup>
      )}
    </>
  );
}
