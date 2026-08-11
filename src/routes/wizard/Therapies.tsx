import { useState } from "react";
import { PopupButton } from "mlg-components";

import ArchBand from "../../components/ArchBand";
import BulletList from "../../components/BulletList";
import DrugSheetPopup from "../../components/DrugSheetPopup";
import NoteDisclosure from "../../components/NoteDisclosure";
import PageSection from "../../components/PageSection";
import { leafFor, type NoteBlock } from "../../data/wizard";
import { cn } from "../../lib/cn";
import { useCompleteWizardAnswers } from "../../state/wizardAnswers";

type BlockId = "considerations" | "strategies";

export default function Therapies() {
  const leaf = leafFor(useCompleteWizardAnswers());

  const [open, setOpen] = useState<BlockId>("considerations");

  const [openAgent, setOpenAgent] = useState<string | null>(null);

  return (
    <PageSection title={leaf.heading} className="flex flex-1 flex-col lg:-mr-16">
      <div className="mt-3 mb-4 lg:mb-0">
        <LeafNote
          block={leaf.considerations}
          open={open === "considerations"}
          onOpen={() => setOpen("considerations")}
        />
        <LeafNote
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
    </PageSection>
  );
}

/** A `NoteBlock` on the shared accordion bar — the leaf's binding of title to points. */
function LeafNote({
  block,
  open,
  onOpen,
  last = false,
}: {
  block: NoteBlock;
  open: boolean;
  onOpen: () => void;
  last?: boolean;
}) {
  return (
    <NoteDisclosure title={block.title} open={open} onOpen={onOpen} last={last}>
      <BulletList items={block.points} className="text-base leading-[1.4] lg:text-xl" />
    </NoteDisclosure>
  );
}
