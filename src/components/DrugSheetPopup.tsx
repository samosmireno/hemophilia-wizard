import { type DrugSheet, sheetFor } from "../data/drug-sheets";
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

  return (
    <Popup
      open={sheet !== undefined}
      // `?? sheet.agent` is the usual case: only Denecimig carries a `title`.
      title={sheet ? (sheet.title ?? sheet.agent) : ""}
      onClose={onClose}
    >
      {sheet && <DrugSheetBody sheet={sheet} />}
    </Popup>
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
