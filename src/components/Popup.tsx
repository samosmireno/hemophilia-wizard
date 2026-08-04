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

/** Which of the three card widths a caller wants. See `CARD_WIDTH`. */
export type PopupWidth = "narrow" | "default" | "wide";

/**
 * The three card widths. A step scale rather than a free `className`, so that
 * the set of widths a card can be is a list someone can read — and so that a
 * body which outgrows its card is a one-word change rather than a new literal.
 *
 * `default` is what every card shipped at before the scale existed and what all
 * but three still ship at. **It reaches beyond this file**: the §7.6
 * hemostatic-mechanisms asset is stored at the body width this step used to have
 * (1024 − `border-5` − `px-16` = 886). The step is now 1140, so that body is
 * 1002 and the raster upscales — styling open item 29, and the reason to move
 * this number deliberately. See docs/styling.md §13.
 *
 * `narrow` and `wide` are measured and picked respectively, and the difference
 * is worth knowing: 869 is the narrowest of the three widths the designer drew
 * across the seven §6 drug sheets, and 860 is that reading nudged. 1360 is not
 * drawn anywhere — it is the widest card that still floats over the 1440 canvas
 * rather than taking it over (40px of page either side), chosen for the §5
 * comparison table's nine columns, which at `default` get 126px each.
 *
 * **`wide` alone is `96vw`, and that is the whole point of the number.** At
 * `92vw` the viewport term would bind first at 1440 (1324.8 < 1360) and the card
 * would never actually reach the width it is named for. The two cross at
 * 1416.7px, so below that the percentage governs, as it does for the other two.
 */
const CARD_WIDTH: Record<PopupWidth, string> = {
  narrow: "w-[min(860px,92vw)]",
  default: "w-[min(1140px,92vw)]",
  wide: "w-[min(1360px,96vw)]",
};

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
  width = "default",
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
  /**
   * How wide the card is — `CARD_WIDTH`'s three steps.
   *
   * A prop rather than a `className` because the widths are a closed set the
   * design supports, not a dimension each caller invents: two of the three are
   * read off artboards and the third exists to hold one specific table. A card
   * whose body does not fit should move a step, and a body that fits no step is
   * a conversation with the designer rather than a new arbitrary value.
   */
  width?: PopupWidth;
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
      {/* Every width is a `min()` rather than a bare px: the card is a content
          container and the app runs down to 375px. `overflow-hidden` is what
          clips the full-bleed band to the rounded corners — the band and the
          border are the same crimson, so the top edge reads as one mass either
          way. */}
      {/* The floor is `min(520px, 95dvh)`, not a bare 520px: `min-height` beats
          `max-height` in CSS, so an unguarded floor would push the card past the
          cap on any viewport shorter than ~612px — a phone in landscape — and
          overflow it off screen with no way to scroll back. Written this way the
          two can never disagree. */}
      <div
        className={cn(
          "flex max-h-[95dvh] min-h-[min(520px,95dvh)] flex-col overflow-hidden rounded-[40px] border-5 border-brand-crimson-50 shadow-popup",
          CARD_WIDTH[width],
          surface === "white" ? "bg-white" : "bg-popup",
        )}
      >
        {/* 12px of padding, not a fixed 118px: the band is content-height in the
            export (12 + two 46.73px lines + 12 = 117.5), so it grows with a
            title that wraps to three lines instead of clipping it.

            This shipped as `py-5` for eleven months, against a comment that has
            always said 12 — paired with a title capped 21% under the drawn size,
            which is why the band still measured within 4px of the export and
            nobody caught either. Both corrected together; docs/styling.md §13.

            **`min-h-[65px]` is the ✕, not a design value.** The button is 65px
            tall and centred on the band, so a band shorter than that overhangs
            it at both ends — and the card's `overflow-hidden` then clips the top
            of the button against the rounded corner. The design never draws a
            one-line band (its own is two lines at 118px), so there is no drawn
            floor to transcribe; the honest one is the height of the thing the
            band has to contain. It is the same 65 `BAND_INSET` is built from.
            Nothing at 1440 reaches it — a one-line band is 71px — and it binds
            only where the clamp is at its 22px floor, i.e. on a phone.

            `flex flex-col justify-center` is what makes that floor invisible:
            the ✕ is centred by `top-1/2`, so without it the title would sit at
            the top of a band taller than the title while the ✕ sat in the
            middle, ~9px apart. Only the header's direct children become flex
            items, so the `preserveCase` whitespace trap §17 records does not
            apply — the `<h2>`'s own spans and text nodes stay in normal flow. */}
        <header className="relative flex min-h-[65px] shrink-0 flex-col justify-center bg-brand-crimson-50 py-3">
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
              "text-center font-display text-[clamp(1.375rem,3.157vw,2.842rem)] leading-[1.0278] font-bold tracking-[0.0289em] text-white uppercase",
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
            `max-h-[95dvh]` and this never scrolls. */}
        <div className="min-h-0 flex-1 overflow-y-auto px-16 py-2">{children}</div>
      </div>
    </ModalLayer>
  );
}
