import { type ReactNode, useId } from "react";
import { PopupButton } from "mlg-components";

import { cn } from "../lib/cn";
import { preserveCase } from "../lib/preserveCase";
import ModalLayer from "./ModalLayer";

/**
 * The crimson band's horizontal padding, shared by the title and the subtitle.
 * Stated once because the two must agree: it is what keeps both lines centred
 * on the card *and* clear of the ✕, and a band whose lines disagree on their
 * inset reads as one of them being off-centre.
 */
const BAND_INSET = "px-[clamp(5.5rem,7vw,6.25rem)]";

/**
 * The §7.7 click-through pop-up — the card behind every "Click here:"
 * disclosure. This is the **skeleton** issue 03 calls for: chrome, behaviour
 * and a11y, with one scroll region the calling popup fills. It knows nothing
 * about what goes inside it.
 *
 * Figma `144:431` ("Pop 8"), 1066×645 on the 1440 canvas. Geometry and the two
 * deliberate deviations from the export are in docs/styling.md §13.
 *
 * **This is the card, not the modal.** The `<dialog>`, its scrim, ESC, the
 * backdrop click and the scroll lock are all `ModalLayer`'s — see there for why
 * each is shaped the way it is. What is left here is the crimson band, the
 * border, the ✕ and the scroll region: the presentation a §7.7 click-through
 * wears. `Lightbox` is the other one.
 */
export default function Popup({
  open,
  title,
  subtitle,
  onClose,
  surface = "gradient",
  children,
}: {
  open: boolean;
  /** Rendered in the crimson band, and the first half of the accessible name. */
  title: string;
  /**
   * A second, smaller line under the title, where the design gives the card
   * one — §7.4's "(Options include SHL, EHL, and UHL FVIII/FIX products)".
   *
   * **It joins the accessible name**, rather than being visible text only: the
   * parenthetical is a scope qualifier, naming *which* products the card is
   * about. Left out of the name, that scoping exists only in a line a screen
   * reader reaches after the dialog has already announced itself as being about
   * something broader than it is.
   */
  subtitle?: string;
  /** Called for all three close routes: ESC, the ✕, and a backdrop click. */
  onClose: () => void;
  /**
   * The body fill. `"gradient"` is the design's `--background-image-popup`
   * (§13) and the default; `"white"` is for a figure the designer drew on white
   * — rebuilt as markup, its own background would otherwise sit as a white
   * rectangle inside the tinted card.
   *
   * An opt-in rather than a global change: the severity table draws its header
   * pills with `bg-white/50`, which the gradient is what makes visible.
   */
  surface?: "gradient" | "white";
  children?: ReactNode;
}) {
  const titleId = useId();
  const subtitleId = useId();

  return (
    <ModalLayer
      open={open}
      onClose={onClose}
      aria-labelledby={subtitle ? `${titleId} ${subtitleId}` : titleId}
    >
      {/* `min()` rather than the drawn 1066px: the card is a content container
          and the app runs down to 375px. `overflow-hidden` is what clips the
          full-bleed band to the rounded corners — the band and the border are
          the same crimson, so the top edge reads as one mass either way. */}
      {/* The floor is `min(520px, 85dvh)`, not a bare 520px: `min-height` beats
          `max-height` in CSS, so an unguarded floor would push the card past the
          cap on any viewport shorter than ~612px — a phone in landscape — and
          overflow it off screen with no way to scroll back. Written this way the
          two can never disagree. */}
      <div
        className={cn(
          "flex max-h-[95dvh] min-h-[min(520px,95dvh)] w-[min(1024px,92vw)] flex-col overflow-hidden rounded-[40px] border-5 border-brand-crimson-50 shadow-popup",
          surface === "white" ? "bg-white" : "bg-popup",
        )}
      >
        {/* 12px of padding, not a fixed 118px: the band is content-height in the
            export (12 + two 46.73px lines + 12 = 117.5), so it grows with a
            title that wraps to three lines instead of clipping it. */}
        <header className="relative shrink-0 bg-brand-crimson-50 py-5">
          {/* `BAND_INSET` is symmetric so the title stays centred on the card,
              and sized to clear the ✕ on the right — its floor is the button's
              own 65px plus the 22px inset, so the two never overlap. Type is
              raw design values per §8's precedent; the scale has no 45.5px
              step. */}
          {/*
            `preserveCase` is what stops the `uppercase` below destroying an
            abbreviation the band is there to state — "EMICIZUMAB MOA:
            INTERACTIONS WITH FIX/FIXA AND FX/FXA" loses the only thing telling a
            zymogen from its activated form. See `lib/preserveCase`.

            **`aria-label` is required, not belt-and-braces.** The helper splits
            the title into text nodes and spans, and the accessible-name
            algorithm joins each element's contribution with a separating space —
            so the name this `id` supplies would drift to "FIX/ FIXa " and the
            dialog would announce itself with it. Labelling from the `title` prop
            states the one string the fragments are made of, so `aria-labelledby`
            on the dialog resolves to exactly what the caller passed. A title
            carrying no cased term renders as a single text node and the label is
            then a no-op, which is why it is unconditional.
          */}
          <h2
            id={titleId}
            aria-label={title}
            className={cn(
              BAND_INSET,
              "text-center font-display text-[clamp(1.375rem,3.157vw,2.25rem)] leading-[1.0278] font-bold tracking-[0.0289em] text-white uppercase",
            )}
          >
            {preserveCase(title)}
          </h2>

          {/* Same inset as the title, so the two lines share one centre and one
              clearance from the ✕. 20px lands on `text-h4` exactly, but that
              token carries weight 600 and the design draws 500 — hence the
              explicit `font-medium` rather than a raw size. */}
          {subtitle && (
            <p
              id={subtitleId}
              // Same treatment and the same reason as the title above: this line
              // is `uppercase` too, and it joins the accessible name.
              aria-label={subtitle}
              className={cn(
                BAND_INSET,
                "mt-1 text-center font-display text-h4 font-medium tracking-wide text-white uppercase",
              )}
            >
              {preserveCase(subtitle)}
            </p>
          )}

          {/* The same `PopupButton` that triggers the popup, in its open skin —
              the export is literally that component's "+" rotated 45°. It is a
              controlled toggle here that only ever goes one way, so the click
              result is discarded. `label` gives it the accessible name "Close
              <title>". */}
          <div className="absolute top-1/2 right-5.5 -translate-y-1/2">
            <PopupButton label={title} open onClick={() => onClose()} />
          </div>
        </header>

        {/* `min-h-0` is load-bearing: a flex item's default `min-height:auto`
            floors it at its content's height, so without it the card grows past
            `max-h-[85dvh]` and this never scrolls. */}
        <div className="min-h-0 flex-1 overflow-y-auto px-16 py-2">{children}</div>
      </div>
    </ModalLayer>
  );
}
