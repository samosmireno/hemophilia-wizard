import { useState } from "react";
import { Button, PopupButton } from "mlg-components";

import BulletList from "../components/BulletList";
import DrugSheetPopup from "../components/DrugSheetPopup";
import PageSection from "../components/PageSection";
import Popup from "../components/Popup";
import {
  EXPLORE_SEGMENTS,
  EXPLORE_TABLE_TITLE,
  SDM_CONCLUSION,
  SDM_LEAD,
  SDM_POINTS,
  type ExploreSegment,
} from "../data/explore";
import { cn } from "../lib/cn";
import { preserveCase } from "../lib/preserveCase";

export default function Explore() {
  const [openAgent, setOpenAgent] = useState<string | null>(null);

  const [tableOpen, setTableOpen] = useState(false);

  return (
    // On the app-wide §2 ramp since 2026-08-10 (user direction), replacing the
    // page's bespoke centred three-step fit — docs/styling.md §17, item 31.
    <PageSection title={SDM_CONCLUSION} className="flex flex-1 flex-col lg:-mr-rail">
      {/* `ps-6` is the list's own `pl-6`, so this sentence's left edge sits on the
          bullets' text rather than on their discs. */}
      <p className="mt-6 ps-6 text-base/[1.6] text-black lg:text-xl/[1.6]">{SDM_LEAD}</p>

      <BulletList items={SDM_POINTS} className="mt-4 text-base/[1.6] lg:text-xl/[1.6]" />

      {/* `xl:mb-6` is the arch row's `mt-6`, moved to this side of the pin: a margin
          on the pinned row would be the pin. */}
      <Button
        className="mt-6 self-center px-8 py-3 text-base/tight sm:px-12 sm:py-3.5 sm:text-xl/tight lg:px-16 lg:py-4.5 lg:text-2xl/5 xl:mb-6"
        aria-haspopup="dialog"
        onClick={() => setTableOpen(true)}
      >
        {EXPLORE_TABLE_TITLE}
      </Button>

      {/* `xl:gap-0` because the three segments tile the band exactly
          (339 + 524 + 353 = 1216) — any gap breaks the drawn tiling. */}
      <div className="mt-6 flex flex-col gap-6 xl:mt-auto xl:flex-row xl:gap-0">
        {EXPLORE_SEGMENTS.map((segment, index) => (
          <Segment
            key={segment.columns[0].label}
            segment={segment}
            middle={index === 1}
            openAgent={openAgent}
            onToggleAgent={setOpenAgent}
          />
        ))}
      </div>

      <DrugSheetPopup agent={openAgent} onClose={() => setOpenAgent(null)} />

      <Popup
        card={
          tableOpen
            ? {
                title: EXPLORE_TABLE_TITLE,
                width: "wide",
                // The filters and the nine-column grid are issue 09's remaining scope.
                content: (
                  <p className="py-6 text-center text-xl leading-[1.6] text-black">
                    The filterable comparison table is not built yet.
                  </p>
                ),
              }
            : null
        }
        onClose={() => setTableOpen(false)}
      />
    </PageSection>
  );
}

/**
 * One arched segment: its columns side by side, each a row of agents over a
 * class label. A segment is a drawn group, not a class — the right-hand one
 * holds two class labels under one arch.
 */
function Segment({
  segment,
  middle,
  openAgent,
  onToggleAgent,
}: {
  segment: ExploreSegment;
  /** The white one, which also sits 36px above its neighbours. */
  middle: boolean;
  openAgent: string | null;
  onToggleAgent: (agent: string | null) => void;
}) {
  return (
    <div
      // The drawn width as a grow factor — inline because the three numbers are data.
      style={{ flexGrow: segment.width }}
      className={cn(
        // 128px radius, verified against the export's own curve at both corners.
        "rounded-[8rem] xl:rounded-b-none",
        "basis-auto xl:basis-0",
        // The crimson token at /5 substitutes the export's `red-600` at the same
        // alpha (within a quantisation step); `bg-white/60` is exact.
        middle ? "bg-white/60" : "bg-brand-crimson-50/5",
        // The middle sits 36px higher; the flanks share one top (drawn 478 / 518 / 511).
        // The padding absorbs it so the buttons stay on one line across all three.
        middle ? "xl:pt-22" : "xl:mt-9 xl:pt-13",
        "pt-16 pb-16 xl:pb-0",
      )}
    >
      <div className="flex h-full flex-col gap-y-8 px-4 sm:flex-row sm:gap-y-0 xl:px-0">
        {segment.columns.map((column) => (
          <div key={column.label} className="flex flex-col sm:flex-1">
            <ul className="flex flex-wrap justify-center gap-y-8 xl:flex-nowrap xl:gap-y-0">
              {column.agents.map((agent) => (
                // No `min-w-0`: the caption's min-content is the floor we want, and
                // removing that licence is what clips drug names against the arch wall.
                <li
                  key={agent}
                  className="flex shrink-0 basis-40 flex-col items-center xl:shrink xl:grow xl:basis-0"
                >
                  <PopupButton
                    label={agent}
                    // Not `aria-controls`: a modal dialog lives in the top layer,
                    // so it is not a region of this page the button expands.
                    aria-haspopup="dialog"
                    open={openAgent === agent}
                    onClick={(next) => onToggleAgent(next ? agent : null)}
                  />
                  {/* `xl:h-15` is the three-line height, fixed so every column's
                      label starts at the same y whatever its caption costs. */}
                  <p className="mt-5 text-center text-xl leading-5 font-bold text-brand-slate-100 xl:h-15">
                    {agent}
                  </p>
                </li>
              ))}
            </ul>

            {/* The centring is on the wrapper and the text is not a flex item — a
                flex container would drop the whitespace between the inline
                children `preserveCase` returns ("FVIIIaMIMETICS"). */}
            <div className={cn("mt-6 flex items-center justify-center", "xl:mt-0 xl:h-20")}>
              <p className="text-center font-display text-2xl leading-5.5 font-semibold tracking-wide text-brand-crimson-50 uppercase">
                {preserveCase(column.label)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
