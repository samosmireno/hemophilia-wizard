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
  title: string;
  subtitle?: string;
  onClose: () => void;
  surface?: "gradient" | "white";
  width?: PopupWidth;
  children?: ReactNode;
}) {
  const titleId = useId();
  const subtitleId = useId();

  const shown = useExitContent(open, { title, subtitle, children }, MODAL_EXIT_MS);

  return (
    <ModalLayer
      open={open}
      onClose={onClose}
      aria-labelledby={shown.subtitle ? `${titleId} ${subtitleId}` : titleId}
    >
      <div
        className={cn(
          "flex max-h-[95dvh] flex-col overflow-hidden rounded-[2.5rem] border-[0.3125rem] border-brand-crimson-50 shadow-popup",
          CARD_WIDTH[width],
          surface === "white" ? "bg-white" : "bg-popup",
        )}
      >
        <header className="relative flex min-h-11 shrink-0 flex-col justify-center bg-brand-crimson-50 py-3 sm:min-h-14 lg:min-h-16.25">
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
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2 sm:px-8 lg:px-16">
          {shown.children}
        </div>
      </div>
    </ModalLayer>
  );
}
