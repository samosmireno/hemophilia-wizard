import { useEffect, useId, useRef, useState } from "react";
import { PopupButton } from "mlg-components";

import ArchBand from "../../components/ArchBand";
import BulletList from "../../components/BulletList";
import DrugSheetPopup from "../../components/DrugSheetPopup";
import { leafFor, type NoteBlock } from "../../data/wizard";
import { cn } from "../../lib/cn";
import { useCompleteWizardAnswers } from "../../state/wizardAnswers";

type BlockId = "considerations" | "strategies";

export default function Therapies() {
  const leaf = leafFor(useCompleteWizardAnswers());

  const [open, setOpen] = useState<BlockId>("considerations");

  const [openAgent, setOpenAgent] = useState<string | null>(null);

  return (
    <section aria-labelledby="wizard-therapies-heading" className="flex flex-1 flex-col lg:-mr-16">
      <h1
        id="wizard-therapies-heading"
        className="font-display text-3xl font-bold tracking-wide text-brand-crimson-50 uppercase lg:text-5xl"
      >
        {leaf.heading}
      </h1>

      <div className="mt-3 mb-4 lg:mb-0">
        <NoteDisclosure
          block={leaf.considerations}
          open={open === "considerations"}
          onOpen={() => setOpen("considerations")}
        />
        <NoteDisclosure
          block={leaf.strategies}
          open={open === "strategies"}
          onOpen={() => setOpen("strategies")}
          last
        />
      </div>

      <ArchBand title={leaf.archTitle} titleClassName="mx-auto max-w-215 leading-none">
        <ul
          className={cn(
            "mt-5 flex flex-wrap justify-center gap-y-10 px-4 pb-6 xl:flex-nowrap",
            leaf.recommendations.length > 3 ? "gap-x-20" : "gap-x-30",
          )}
        >
          {leaf.recommendations.map((treatment) => (
            <li
              key={treatment.agent}
              className="flex w-40 shrink-0 flex-col items-center xl:shrink"
            >
              <PopupButton
                label={treatment.agent}
                // Not `aria-controls`: a modal dialog lives in the top layer, so
                // it is not a region of this page the button expands.
                aria-haspopup="dialog"
                open={openAgent === treatment.agent}
                onClick={(next) => setOpenAgent(next ? treatment.agent : null)}
              />
              <p className="mt-3 text-center text-xl font-bold text-brand-slate-100">
                {treatment.agent}
              </p>
            </li>
          ))}
        </ul>
      </ArchBand>

      <DrugSheetPopup agent={openAgent} onClose={() => setOpenAgent(null)} />
    </section>
  );
}

function NoteDisclosure({
  block,
  open,
  onOpen,
  last = false,
}: {
  block: NoteBlock;
  open: boolean;
  /** Open this one. Not a toggle: closing is not a state this accordion has. */
  onOpen: () => void;
  last?: boolean;
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
            "flex min-h-11 w-full items-center justify-center rounded-lg px-4",
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
          {block.title}
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
            <BulletList items={block.points} className="text-base leading-[1.4] lg:text-xl" />
          </div>
        </div>
      </div>
    </>
  );
}
