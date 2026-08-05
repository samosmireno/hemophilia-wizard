import { type DrugSheet, sheetFor } from "../data/drug-sheets";
import { cn } from "../lib/cn";
import BulletList from "./BulletList";
import Popup from "./Popup";

/**
 * A per-drug information sheet as the §6 pop-up card — the thing the blueprint's
 * note asks for ("Please add a button for each drug which will pop up to an
 * information sheet").
 *
 * Seven artboards were delivered, one per sheet, and they are the same card
 * seven times: `Popup`'s crimson band wearing the drug's name, then five crimson
 * section labels each over a disc list. Everything below is measured off them;
 * the record is docs/styling.md §16.
 *
 * **It is component state, not a route.** Issue 10 specified a `?drug=<id>`
 * overlay; `docs/adr/0006-component-state-drug-sheets.md` records why that was
 * reversed, the short version being that `WizardGate` makes the deep link
 * unreachable on the one page that has these buttons today.
 *
 * **This owns the dialog, where the §7.5 cards do not.** Each of those four is a
 * body its chapter wraps in a `Popup` of its own, and each chapter states its own
 * card title as a local literal. That is right for them — a chapter's cards are a
 * chapter's. A drug sheet is not: the same seven cards are due on `/explore` and
 * on the education class blocks, and what a sheet is *called* is a property of
 * the drug (see `DrugSheet.title`), not of the page showing it. So the caller
 * passes the agent name it already has and gets the whole card.
 *
 * Mounted unconditionally by its callers, for the reason `DisclosureBand`
 * records: the effect that calls `showModal()` needs its element already in the
 * DOM. The body is `undefined` while closed, so nothing renders early.
 */
export default function DrugSheetPopup({
  agent,
  onClose,
}: {
  /**
   * The verbatim agent name whose sheet is open — the same string the caller
   * already holds as `Treatment.agent` / an `AGENTS` value — or `null` for none.
   *
   * **An unknown name closes the card rather than opening an empty one**, which
   * is the posture `DisclosureBand` takes for a disclosure with no content. Six
   * of the seven sheets are wizard-reachable; the seventh (Efanesoctocog alfa)
   * has no caller yet, and the two generic SHL/EHL rows in treatments.ts have no
   * sheet at all by design (CONTEXT.md §6). A caller that hands one of those over
   * gets nothing, not a card with five empty headings.
   */
  agent: string | null;
  /** Called for all three close routes — ESC, the ✕, and a backdrop click. */
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

/**
 * The five sections, in the order all seven artboards stack them.
 *
 * **The order is the component's, not the data's.** Every sheet draws
 * Class/Target → Indication → Dosage → Monitoring → Clinical Trials, so it is a
 * fact about the card rather than about a drug, and stating it here is what stops
 * seven records having to agree with each other.
 *
 * `py-6` (24px) top and bottom, the value all four §7.5 cards use, on top of
 * `Popup`'s own `py-2`. The artboards put the first heading's ink 28–43px below
 * the band, and 32 sits inside that.
 */
function DrugSheetBody({ sheet }: { sheet: DrugSheet }) {
  return (
    <div className="py-1">
      <Section heading={sheet.classHeading ?? "Class/Target"} items={sheet.classTarget} first />
      <Section heading="Indication" items={sheet.indication} />
      <Section heading="Dosage and Administration" items={sheet.dosing} />
      {/*
        One label for all seven. Denecimig's used to carry the source's whole-
        section qualifier ("Monitoring: TBD; based on phase 3 clinical trial
        data"); the client cut it on 2026-08-05 — see drug-sheets.ts.
      */}
      <Section heading="Monitoring" items={sheet.monitoring} />
      {/*
        `Name (NCTxxxxx)`, and nothing after it. The four Denecimig entries used
        to carry a citation tail drawn as a blue link; the client cut them on
        2026-08-04 — see drug-sheets.ts. Composed here rather than stored as a
        display string because `ClinicalTrial` is two fields for the same reason
        `Reference` is not: an id is a thing you can look up.
      */}
      <Section
        heading="Clinical Trials"
        items={sheet.trials.map((trial) => `${trial.name} (${trial.id})`)}
      />
    </div>
  );
}

/**
 * One crimson label over its list.
 *
 * **An `<h3>`**, not a styled paragraph: `Popup`'s band owns the `<h2>`, and both
 * the Emicizumab and the Etranacogene card run past a 1440 × 800 screen into the
 * card's scroll region — so a heading list is how a reader reaches Monitoring
 * without walking every bullet of Dosage first.
 *
 * 20px at `leading-[1.6]` for both the label and the bullets, which is the
 * established pop-up body value shared with all four §7.5 cards rather than a
 * reading off these seven PNGs. The exports draw ~20px type at a 26px pitch;
 * `DenecimigCard` records why that is not re-measured per artboard, and the
 * argument holds harder here — a reader can open one of these from a wizard leaf
 * and an agent card from an education chapter in the same minute.
 *
 * `crimson-50` is exact, not near: 26,144 pixels of `rgb(214, 58, 82)` across the
 * seven exports, with no other core value in the labels.
 *
 * **The two gaps are the measured extras over one line**, not invented rhythm.
 * Top-to-top, the artboards put a bullet 26px under the bullet above it, its
 * heading's first bullet 33px under the heading (all 35 sections, 32–34px), and a
 * heading 37px under the last bullet of the section above (median; 29–56, and the
 * one place the seven disagree — styling open item 24). Over a 26px line that is
 * +7 and +11, which round onto the scale as `mt-2` and `mt-3`.
 */
function Section({
  heading,
  items,
  first = false,
}: {
  /** Without its colon — the card appends that, so no record has to remember to. */
  heading: string;
  items: readonly string[];
  /**
   * Nothing above it, so it takes no top gap: the card's own `py-6` is what
   * separates it from the band.
   */
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
