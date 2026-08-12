import { type ReactNode, useState } from "react";

import { cn } from "../lib/cn";
import Lightbox from "./Lightbox";
import Popup from "./Popup";

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
  thumbSrc: string;
  /**
   * `thumbSrc`'s own pixel dimensions — only their ratio is consumed. A
   * re-export that reshapes the raster must move these numbers with it.
   */
  thumbWidth: number;
  thumbHeight: number;
  title: string;
  surface?: "gradient" | "white";
  variant?: "card" | "bare";
  /** The thumbnail's layout box. The radius and the clip are not negotiable. */
  className?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
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
          // §28 kills selection but not the drag ghost — this does.
          draggable={false}
          className="block w-full"
        />

        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center bg-black/50 px-4 text-center font-display text-2xl font-semibold tracking-wide text-white uppercase opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          Click to enlarge
        </span>

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

      {variant === "bare" ? (
        <Lightbox open={open} title={title} onClose={() => setOpen(false)}>
          {children}
        </Lightbox>
      ) : (
        <Popup
          card={open ? { title, content: children } : null}
          surface={surface}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
