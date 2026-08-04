import { type ReactNode, useId } from "react";
import { PopupButton } from "mlg-components";

import { cn } from "../lib/cn";
import { preserveCase } from "../lib/preserveCase";
import { CLOSE_BUTTON_SIZE } from "./closeButton";
import ModalLayer from "./ModalLayer";

/**
 * The crimson band's horizontal padding, shared by the title and the subtitle.
 * Stated once because the two must agree: it is what keeps both lines centred
 * on the card *and* clear of the ✕, and a band whose lines disagree on their
 * inset reads as one of them being off-centre.
 *
 * `clamp(5.5rem,7vw,6.25rem)` until 2026-08-04, then the 100px maximum flat —
 * which was the phone regression styling open item 33 recorded: at 375 the card
 * is 345px wide, so the band spent 200 of it on padding and left 145 for a 48px
 * title.
 *
 * **Every step is the ✕ plus the 22px inset it is drawn at**, i.e. the narrowest
 * inset at which the title can never run under the button. None of the three is
 * an invented comfort value the way `DisclosureBand`'s `md` is, and all three
 * are on Tailwind's scale, so the app keeps its no-arbitrary-length invariant:
 *
 *     base  px-16.5  66 = size-11    44 + 22
 *     sm:   px-19.5  78 = size-14    56 + 22
 *     lg:   px-25   100 = size-16.25 65 + 22, and the drawn maximum
 *
 * The `lg` step is 100 rather than the derived 87 because 100px is what the
 * design draws; the other two have no drawn value to transcribe, so they are the
 * floor. **Move `CLOSE_BUTTON_SIZE` and this has to move with it** — the band
 * floor on the `<header>` below is built from the same three numbers.
 */
const BAND_INSET = "px-16.5 sm:px-19.5 lg:px-25";

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
      {/* **There is no height floor: the card is its content's height, capped.**
          It carried `min-h-[min(520px,95dvh)]` until 2026-08-04 — 520 chosen
          short of the drawn 645 so a brief popup did not open a screen of empty
          gradient, and wrapped in `min()` because `min-height` beats
          `max-height` and a bare floor would overflow a landscape phone off
          screen. Both are gone; a short card is now short. The known cost is the
          one §13 recorded when the floor went in: a single-bullet body rendered
          193px and read as a bar rather than the drawn card, with `bg-popup`
          showing only its warm centre. Accepted deliberately.

          Nothing else is needed to get content height — no `h-fit`. `ModalLayer`
          lays this out with `place-items-center`, i.e. `align-items: center`
          rather than `stretch`, so the card's height was already `auto` and only
          the floor was overriding it. */}
      <div
        className={cn(
          "flex max-h-[95dvh] flex-col overflow-hidden rounded-[40px] border-5 border-brand-crimson-50 shadow-popup",
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

            **The floor is the ✕, not a design value.** The button is centred on
            the band, so a band shorter than it overhangs it at both ends — and
            the card's `overflow-hidden` then clips the top of the button against
            the rounded corner. The design never draws a one-line band (its own
            is two lines at 118px), so there is no drawn floor to transcribe; the
            honest one is the height of the thing the band has to contain. It is
            `CLOSE_BUTTON_SIZE` restated as a height, the same three numbers
            `BAND_INSET` is built from, and it ramps because the button does.

            Nothing at 1440 reaches it — a one-line band is 74px at `text-5xl`.
            It used to bind only where the title's `clamp()` sat at its 22px
            floor, i.e. on a phone; with the title fixed at 48px (2026-08-04) the
            band is taller everywhere and the floor went inert. Shrinking the ✕
            keeps it inert rather than reviving it: a one-line band at `text-2xl`
            is 12 + 24×1.0278 + 12 = 48.7px against a 44px button. Open item 33.

            `flex flex-col justify-center` is what makes that floor invisible:
            the ✕ is centred by `top-1/2`, so without it the title would sit at
            the top of a band taller than the title while the ✕ sat in the
            middle, ~9px apart. Only the header's direct children become flex
            items, so the `preserveCase` whitespace trap §17 records does not
            apply — the `<h2>`'s own spans and text nodes stay in normal flow. */}
        <header className="relative flex min-h-11 shrink-0 flex-col justify-center bg-brand-crimson-50 py-3 sm:min-h-14 lg:min-h-16.25">
          {/* `BAND_INSET` is symmetric so the title stays centred on the card,
              and sized to clear the ✕ on the right — its floor is the button's
              own 65px plus the 22px inset, so the two never overlap. Type is
              raw design values per §8's precedent; the scale has no 45.5px
              step.

              **This title falls two steps below `lg` where the chapter's `<h2>`
              falls one**, and the reason is the box rather than the type: a
              heading sits in the content column, but this sits in whatever the
              card's inset leaves, which on a 375px phone is 203px against the
              column's 311 — and it is `uppercase` display type, the widest thing
              the app sets. 48 → 36 would still take "Hemophilia Severity Based
              on Factor VIII/IX Level" to five lines in a band the ✕ has to stay
              centred on. (203 = 345px card − `border-5`×2 − `px-16.5`×2. It was
              159 until the ✕ shrank; docs/styling.md §13 carried 291, which was
              wrong in the direction that understated the case.)

              **The `leading-[1.0278]` is stated once and survives all three
              steps**, which is worth knowing because the opposite looks true. A
              Tailwind v4 `leading-*` compiles to `--tw-leading:1.0278` as well
              as a `line-height`, and every `text-<size>` compiles to
              `line-height:var(--tw-leading,<its own>)` — so the custom property
              is read by each step rather than replaced by it, and a custom
              property is not scoped to the media query the step arrives in. A
              slash modifier (`text-5xl/[1.0278]`) is the one that would need
              restating, because it emits a bare `line-height` and sets no
              property. Verified in the built CSS; docs/styling.md §8. */}
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
              "text-center font-display text-2xl leading-[1.0278] font-bold tracking-[0.0289em] text-white uppercase sm:text-3xl lg:text-5xl",
            )}
          >
            {preserveCase(title)}
          </h2>

          {/* Same inset as the title, so the two lines share one centre and one
              clearance from the ✕. 20px lands on `text-xl` exactly, but that
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
                "mt-1 text-center font-display text-xl font-medium tracking-wide text-white uppercase",
              )}
            >
              {preserveCase(subtitle)}
            </p>
          )}

          {/* The same `PopupButton` that triggers the popup, in its open skin —
              the export is literally that component's "+" rotated 45°. It is a
              controlled toggle here that only ever goes one way, so the click
              result is discarded. `label` gives it the accessible name "Close
              <title>".

              `right-5.5` is the drawn 22px and does not ramp; the *button* does,
              via `CLOSE_BUTTON_SIZE`. The inset is measured to the card's edge,
              so holding it fixed is what lets `BAND_INSET` and the band floor
              above be "the button at this step, plus 22". */}
          <div className="absolute top-1/2 right-5.5 -translate-y-1/2">
            <PopupButton
              label={title}
              open
              className={CLOSE_BUTTON_SIZE}
              onClick={() => onClose()}
            />
          </div>
        </header>

        {/* `min-h-0` is load-bearing: a flex item's default `min-height:auto`
            floors it at its content's height, so without it the card grows past
            `max-h-[95dvh]` and this never scrolls.

            **The 64px inset is the drawn one and it arrives at `lg`.** It is
            69px from the card's outer edge, which two of the seven drug-sheet
            exports draw and five draw at 49 (open item 25) — but neither
            reading is a phone number: at 375 the card is 345px, so `px-16`
            spends 128 of it and leaves the body 207px. Three `table-fixed`
            columns in that is ~29px of text a column. 16 → 32 → 64 instead,
            which gives the body 303 / 514 / 1002 at 375 / 640 / 1440.

            Only the horizontal padding ramps. `py-2` is 16px of clearance
            between the band and the content, which is the same job at every
            width — and `PopupFigure`'s `reserve` is measured off it. */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2 sm:px-8 lg:px-16">{children}</div>
      </div>
    </ModalLayer>
  );
}
