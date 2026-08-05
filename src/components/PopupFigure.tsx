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
 *
 *   **The cap is applied in `rem`, so above the canvas it scales with the board**
 *   (docs/styling.md §19). It was `px` until 2026-08-05, which pinned the picture
 *   at its drawn width while the card around it grew: measured at 2560 × 1330,
 *   the two `disease-background` figures held 720px inside a 1413px body and came
 *   out 15% and 19% narrower than the drawing's own proportion. The paragraph
 *   above is still the reason the cap EXISTS — the argument it makes is against
 *   upscaling past the asset, and the `rem` form does not do that at DPR 1: at
 *   1.25x a 720 drawn figure renders at 900 CSS px against 1440 stored, which is
 *   still 1.6x oversampled. What it gives up is the 2x guarantee on a DPR-2 panel,
 *   where 900 CSS px wants 1800 device px and the file has 1440 — mildly soft, and
 *   the trade §19's open item 47 records. Size was judged the more visible half:
 *   an undersized figure is wrong on every large screen, a slightly soft one only
 *   on retina large screens.
 * - The height cap subtracts the card's chrome from its own `max-h-[95dvh]` — a
 *   117px crimson band (the title wraps to two lines at 1440) plus
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
 * **The band now steps down below `lg` and this number does not follow it**, on
 * purpose: 117px is the two-line band at the drawn 48px title, and below the
 * breakpoint the title is 24–30px, so the band is shorter and the 10rem
 * reserved is generous rather than stale. The coupling only bites in the other
 * direction. `py-2` on the body is deliberately not part of that ramp for the
 * same reason — see `Popup`.
 *
 * **`Popup`'s `subtitle` is the live edge of that coupling.** A subtitle adds a
 * fourth line to the band, and the 10rem above allows for three. No caller of
 * this component passes one today, so nothing is stale — but the first figure
 * card that wants a subtitle needs this number re-measured, not just the prop
 * threaded through.
 *
 * **A caller may also put chrome in the body**, which the default cap does not
 * know about: `rebalancing-agents` puts a footnote and a back arrow under the
 * picture, so its card starts scrolling a little sooner than 10rem implies. A
 * footnote losing its last line to a scroll is a nuisance; a caller whose chrome
 * is the *point* — `fviiia-mimetics` sets the MOA sentence under the diagram —
 * loses it below the fold entirely. Hence `reserve`: the default stays measured
 * off `Popup` alone, so the callers with no chrome are unaffected, and a caller
 * that has some states its own budget rather than discovering it as a scrollbar.
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
  reserve = "10rem",
}: {
  src: string;
  alt: string;
  /** The asset's natural width in px — the cap, and half the aspect ratio. */
  width: number;
  /** The asset's natural height in px. */
  height: number;
  /**
   * How much of the card's `95dvh` is NOT this picture, as a CSS length.
   *
   * The default is `Popup`'s chrome alone — a 117px band plus the body region's
   * 16px of `py-2`, rounded up to 10rem so a title wrapping to a third line
   * still does not push the picture into a scroll. Raise it by whatever the
   * caller puts in the body beside the figure; see the note above.
   *
   * **117 was the drawn band, not the shipped one, until 2026-08-04** — the card
   * was rendering 114 at two lines and 77 at one, because its title was capped
   * 21% under the drawn size (docs/styling.md §13). This number was therefore
   * right about a card that did not exist yet, and generous about the one that
   * did. It is now simply right: two of the figure cards here gained a line in
   * that repair and both fit, at 117 + 16 = 133 inside the 160 reserved.
   */
  reserve?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        aspectRatio: `${width} / ${height}`,
        /* `rem`, not `px`, so the cap rides the board above the canvas — see the
           note on the width cap above. `/ 16` is the drawn px at the root's own
           16px, so every width at or below 1440 is unmoved. */
        maxWidth: `min(${width / 16}rem, 100%)`,
        maxHeight: `calc(95dvh - ${reserve})`,
      }}
      className="mx-auto"
    />
  );
}
