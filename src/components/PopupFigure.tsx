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
 *   dimensions are props and not a shared constant: the §7.7 figures are not one
 *   shape — the diagnostic diagram is 720×608 here and the bleeding one 720×626,
 *   and a single cap would either shrink the wide one into a corner of the card
 *   or upscale the narrow ones.
 *
 *   **They are half the asset's pixel dimensions, not a third of them or a
 *   guess.** The files are stored at 2x for retina and nothing wider (see
 *   docs/styling.md §13), so "half the asset" IS the drawn width — and because
 *   the same numbers supply the `aspect-ratio` below, a pair that does not match
 *   the file reserves a box of the wrong shape and the card resettles when the
 *   picture lands.
 * - The height cap subtracts the card's chrome from its own `max-h-[95dvh]` — a
 *   measured 117px of crimson band (the title wraps to two lines at 1440) plus
 *   the body region's 16px of `py-2`, rounded up to 10rem so a title that wraps
 *   to a THIRD line on a narrower card still does not push the picture into a
 *   scroll. At 720 the bleeding diagram is 626px tall and a 1440×800 laptop
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
 * would have supplied is set explicitly instead, so the card reserves the right
 * box before the image *decodes*.
 *
 * **That reservation needs the bytes, though, not just the ratio.** `width` is
 * `auto` here, so its used value comes from the image's intrinsic width — and an
 * image that has not loaded has none, leaving `aspect-ratio` nothing to multiply
 * and collapsing the box. A cold figure therefore opens to an empty card and
 * then jumps taller when the picture lands, which is a *loading* bug and not a
 * layout one: with the asset already fetched, first layout has the intrinsic
 * size and neither the gap nor the jump happens.
 *
 * So this component does not warm its own URL — inside a `DisclosureBand` it
 * mounts on the frame the card opens, far too late to matter. The chapter warms
 * them; see `DiseaseBackground`.
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
