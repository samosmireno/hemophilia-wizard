import { useEffect, useId, useRef, type ReactNode } from "react";

import { cn } from "../lib/cn";

/**
 * A leaf-note bar with an expanding panel — the header/panel half of the
 * one-open accordion (ADR 0005, docs/styling.md §15). The one-open invariant
 * itself lives with the caller: this component only knows whether *it* is open,
 * and `onOpen` is not a toggle — closing is not a state it has. `/wizard/therapies`
 * pairs two over the leaf's note blocks; `/how-to` pairs two as its demo.
 */
export default function NoteDisclosure({
  title,
  open,
  onOpen,
  last = false,
  children,
}: {
  title: string;
  open: boolean;
  /** Open this one. Not a toggle: closing is not a state this accordion has. */
  onOpen: () => void;
  last?: boolean;
  children: ReactNode;
}) {
  const headerId = useId();
  const panelId = useId();

  const wrapperRef = useRef<HTMLDivElement>(null);

  const wasOpen = useRef(open);
  useEffect(() => {
    const justOpened = open && !wasOpen.current;
    wasOpen.current = open;
    if (justOpened && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      wrapperRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [open]);

  return (
    <>
      <h2>
        <button
          type="button"
          id={headerId}
          aria-expanded={open}
          aria-controls={panelId}
          /* `aria-disabled` on the OPEN one — APG's own prescription; not
             `disabled`: the header is the panel's label and must stay focusable. */
          aria-disabled={open || undefined}
          onClick={() => {
            if (!open) onOpen();
          }}
          className={cn(
            /* The inset clears the pinned chevron (right-4 + size-5/6 + a gap),
               symmetrically, so the centred title can never run under it. */
            "relative flex min-h-11 w-full items-center justify-center rounded-lg px-11 lg:px-12",
            "text-center text-xl font-semibold text-white lg:text-2xl",
            "transition-[background-color,box-shadow,color] duration-120 ease-out",
            open
              ? "cursor-default bg-note-open shadow-note-open"
              : cn(
                  "cursor-pointer bg-note-closed shadow-note-closed",
                  "hover:text-ui-popup-fg-hover hover:shadow-note-closed-hover",
                  "active:bg-ui-popup-bg-active",
                  "active:shadow-note-closed-active",
                ),
            "focus-visible:outline-[3px] focus-visible:outline-offset-[-3px] focus-visible:outline-ui-btn-ring",
          )}
        >
          {title}
          {/* Chevron only while closed — the open header can't collapse, so it
              makes no expand/collapse promise. Deviation from the export's
              "no chevron" is recorded in docs/styling.md §15. */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            data-testid="note-chevron"
            className={cn(
              "absolute top-1/2 right-4 size-5 -translate-y-1/2 lg:size-6",
              "transition-[opacity] duration-120 ease-out",
              open ? "opacity-0" : "opacity-100",
            )}
          >
            <path d="M6 9.5L12 15.5L18 9.5" />
          </svg>
        </button>
      </h2>

      <div
        ref={wrapperRef}
        /* The target check matters: the panel's own opacity transition bubbles
           through here earlier, and scrolling on it would measure the row
           mid-expansion. */
        onTransitionEnd={(e) => {
          if (open && e.target === e.currentTarget) {
            e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }}
        className={cn(
          "grid transition-[grid-template-rows] duration-220 ease-out motion-reduce:transition-none",
          "scroll-mb-bar lg:scroll-mb-0",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        {/* `min-h-0` and `overflow-hidden` are both load-bearing: a grid item's
            automatic minimum size is its content, which would pin the row open. */}
        <div className="min-h-0 overflow-hidden">
          <div
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            /* Both panels are always in the DOM, so the closed one must be taken
               out of the accessibility tree explicitly. */
            aria-hidden={!open}
            inert={!open}
            className={cn(
              "mx-3 border-x border-note-panel-border bg-brand-teal-25/30",
              last && "rounded-b-xl border-b",
              "px-4 pt-2 pb-3 sm:px-6 lg:px-9",
              "transition-opacity duration-150 ease-out motion-reduce:transition-none",
              open ? "opacity-100" : "opacity-0",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
