import { useEffect } from "react";

import { type DrugSheet, sheetFor } from "../data/drug-sheets";
import { trackDrugSheetOpen } from "../lib/analytics";
import { cn } from "../lib/cn";
import BulletList from "./BulletList";
import Popup from "./Popup";

export default function DrugSheetPopup({
  agent,
  onClose,
}: {
  agent: string | null;
  onClose: () => void;
}) {
  const sheet = agent === null ? undefined : sheetFor(agent);

  // One effect covers all four call sites, since every page renders this
  // component. The page name comes from `window.location`, not a prop or
  // `useLocation`: a prop would ask each caller to say where it is, and the
  // hook would make a router context part of this component's contract. By the
  // time an effect fires the router has long since written the URL.
  useEffect(() => {
    if (sheet) trackDrugSheetOpen(sheet.agent, window.location.pathname);
  }, [sheet]);

  return (
    <Popup
      card={
        sheet
          ? // `?? sheet.agent` is the usual case: only Denecimig carries a `title`.
            { title: sheet.title ?? sheet.agent, content: <DrugSheetBody sheet={sheet} /> }
          : null
      }
      onClose={onClose}
    />
  );
}

function DrugSheetBody({ sheet }: { sheet: DrugSheet }) {
  return (
    <div className="py-1">
      <Section heading={sheet.classHeading ?? "Class/Target"} items={sheet.classTarget} first />
      <Section heading="Indication" items={sheet.indication} />
      <Section heading="Dosage and Administration" items={sheet.dosing} />
      <Section heading="Monitoring" items={sheet.monitoring} />
      <Section
        heading="Clinical Trials"
        items={sheet.trials.map((trial) => `${trial.name} (${trial.id})`)}
      />
    </div>
  );
}

function Section({
  heading,
  items,
  first = false,
}: {
  /** Without its colon — the card appends that, so no record has to remember to. */
  heading: string;
  items: readonly string[];
  first?: boolean;
}) {
  return (
    <>
      <h3 className={cn("text-xl leading-[1.6] font-bold text-brand-crimson-50", !first && "mt-1")}>
        {heading}:
      </h3>
      <BulletList items={items} className="text-xl leading-normal" />
    </>
  );
}
