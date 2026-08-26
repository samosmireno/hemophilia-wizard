import { type ReactNode, useId } from "react";
import { PopupButton } from "mlg-components";

import { cn } from "../lib/cn";
import { preserveCase } from "../lib/preserveCase";
import { useExitContent } from "../lib/useExitContent";
import { CLOSE_BUTTON_SIZE } from "./closeButton";
import ModalLayer, { MODAL_EXIT_MS } from "./ModalLayer";

/**
 * Move `CLOSE_BUTTON_SIZE` and this must move with it — the header's band floor
 * is built from the same numbers.
 */
const BAND_INSET = "px-16.5 sm:px-19.5 lg:px-25";

export type PopupWidth = "narrow" | "default" | "wide";

/* The drawn widths are `rem` so the card scales with the board above 1440; the
   `vw` guard stays viewport-relative on purpose. */
const CARD_WIDTH: Record<PopupWidth, string> = {
  narrow: "w-[min(53.75rem,92vw)]",
  default: "w-[min(71.25rem,92vw)]",
  wide: "w-[min(85rem,96vw)]",
};

/**
 * Everything the card *is*. One nullable payload rather than an `open` flag
 * beside the fields it governs: `null` is closed, and there is no title to
 * invent for a card that is not showing.
 *
 * The reason it is one object is the exit fade. `Popup` holds its last open card
 * rendered for `MODAL_EXIT_MS` after it closes, and that hold used to be a
 * hand-assembled `{ title, subtitle, children }` — so `width` sat outside it and
 * a `narrow` card snapped 280px wider for the length of its own fade. A field
 * added to this record is inside the hold by construction.
 *
 * `surface` is **not** here, and is the one thing outside the hold: it is caller
 * configuration rather than a property of the card, and no caller varies it per
 * card. A caller that needs to would have to move it in.
 */
export interface PopupCard {
  title: string;
  subtitle?: string;
  width?: PopupWidth;
  /**
   * Below `sm` the card fills the viewport — `h-dvh`, full width, no radius or
   * border, the band at the top edge — and its body becomes a column flex
   * container, so content that wants the leftover height can claim it with
   * `min-h-0 flex-1`. Opt-in per card (2026-08-26, for the §5 table: on a
   * 375px phone the card's chrome and 95dvh cap were costing ~106px of a
   * table already down to one row); a short card would only gain empty
   * ground, so it stays off by default. No safe-area inset on purpose: the
   * viewport meta carries no `viewport-fit=cover`, so `env()` resolves to 0 —
   * a real-iPhone check is styling open item 58.
   */
  phoneFill?: boolean;
  /** Required: a card with nothing in it is `null`, not an empty card. */
  content: ReactNode;
}

export default function Popup({
  card,
  onClose,
  surface = "gradient",
}: {
  card: PopupCard | null;
  onClose: () => void;
  surface?: "gradient" | "white";
}) {
  const titleId = useId();
  const subtitleId = useId();

  const shown = useExitContent(card, MODAL_EXIT_MS);

  return (
    <ModalLayer
      open={card !== null}
      onClose={onClose}
      /* Before the first open there is no heading to point at, so the layer is
         named directly. It is empty and shut; the name is never announced. */
      {...(shown
        ? { "aria-labelledby": shown.subtitle ? `${titleId} ${subtitleId}` : titleId }
        : { "aria-label": "" })}
    >
      {shown && (
        <div
          className={cn(
            "flex max-h-[95dvh] flex-col overflow-hidden rounded-[2.5rem] border-[0.3125rem] border-brand-crimson-50 shadow-popup",
            CARD_WIDTH[shown.width ?? "default"],
            shown.phoneFill &&
              "max-sm:h-dvh max-sm:max-h-dvh max-sm:w-full max-sm:rounded-none max-sm:border-0",
            surface === "white" ? "bg-white" : "bg-popup",
          )}
        >
          <header className="relative flex min-h-11 shrink-0 flex-col justify-center bg-brand-crimson-50 py-4 sm:min-h-14 lg:min-h-16.25">
            {/* `aria-label` is required, not belt-and-braces: `preserveCase` splits the
                title into fragments the accessible-name algorithm would join with spaces. */}
            <h2
              id={titleId}
              aria-label={shown.title}
              className={cn(
                BAND_INSET,
                "text-center font-display text-2xl leading-[1.0278] font-bold tracking-[0.0289em] text-white uppercase sm:text-3xl lg:text-5xl",
              )}
            >
              {preserveCase(shown.title)}
            </h2>

            {shown.subtitle && (
              <p
                id={subtitleId}
                // Same treatment and the same reason as the title above: this line
                // is `uppercase` too, and it joins the accessible name.
                aria-label={shown.subtitle}
                className={cn(
                  BAND_INSET,
                  "mt-1 text-center font-display text-xl font-medium tracking-wide text-white uppercase",
                )}
              >
                {preserveCase(shown.subtitle)}
              </p>
            )}

            <div className="absolute top-1/2 right-5.5 -translate-y-1/2">
              <PopupButton
                label={shown.title}
                open
                className={CLOSE_BUTTON_SIZE}
                onClick={() => onClose()}
              />
            </div>
          </header>

          {/* `min-h-0` is load-bearing: without it the card grows past
              `max-h-[95dvh]` and this never scrolls. */}
          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto px-4 py-2 sm:px-8 lg:px-16",
              // The column flex is what lets a `phoneFill` card's content take
              // the height the chrome gave back; see `PopupCard.phoneFill`.
              shown.phoneFill && "max-sm:flex max-sm:flex-col",
            )}
          >
            {shown.content}
          </div>
        </div>
      )}
    </ModalLayer>
  );
}
