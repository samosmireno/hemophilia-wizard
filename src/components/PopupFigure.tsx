/**
 * A §7.7 figure that IS its pop-up — the whole content of the card, centred.
 *
 * Every one of these targets is image-borne (CONTEXT.md §7.7): the labels and
 * annotations exist in no text layer, so `alt` is the only route to what the
 * diagram says, which is why the callers' are as long as they are. Where the
 * chapter body already carries the same prose (diagnosis), repeating it inside
 * the card would only push the picture out of view.
 *
 * **Sized by BOTH axes**, from the asset's own pixel dimensions:
 *
 * - The width cap is the figure's drawn width, because upscaling a raster past
 *   its native size only softens it. It is `min(…, 100%)` so a card narrower
 *   than the asset still shrinks it rather than overflowing. This is why the
 *   dimensions are props and not a shared constant: the §7.7 exports are not
 *   one size — the diagnostic and bleeding diagrams are drawn at 720 wide, the
 *   clotting cascade at 1894, and a single cap would either shrink the wide one
 *   into a corner of the card or upscale the narrow ones.
 * - The height cap subtracts the card's chrome from its own `max-h-[95dvh]` — a
 *   measured 117px of crimson band (the title wraps to two lines at 1440) plus
 *   the body region's 16px of `py-2`, rounded up to 10rem so a title that wraps
 *   to a THIRD line on a narrower card still does not push the picture into a
 *   scroll. At 720 the bleeding diagram is 655px tall and a 1440×800 laptop
 *   leaves ~627px inside the card, so a width-only rule put the last inch of it
 *   behind a scrollbar.
 *
 * Those two numbers are read off `Popup`, so they are a coupling: if that card's
 * `max-h` or its band padding moves, this goes stale in the direction of a
 * scrollbar rather than a broken layout.
 *
 * Two maxima and no fitting mode: given `width`/`height` that are `auto`, the
 * browser scales the image down to satisfy whichever constraint binds first and
 * preserves the aspect ratio itself — the box never needs to letterbox because
 * the image is never stretched to fill one. That is also why the `width`/
 * `height` *attributes* are absent: they are presentational hints that would
 * make the width definite again, and a definite width against a `max-height` is
 * exactly the squash `object-contain` exists to undo. The `aspect-ratio` they
 * would have supplied is set explicitly instead, so the card still reserves the
 * right box before the image decodes.
 */
export default function PopupFigure({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  /** The asset's natural width in px — the cap, and half the aspect ratio. */
  width: number;
  /** The asset's natural height in px. */
  height: number;
}) {
  return (
    <img
      src={src}
      alt={alt}
      style={{ aspectRatio: `${width} / ${height}`, maxWidth: `min(${width}px, 100%)` }}
      className="mx-auto max-h-[calc(95dvh-10rem)]"
    />
  );
}
