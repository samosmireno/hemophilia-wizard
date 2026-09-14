import { classFilterFor, servesType } from "../data/explore";
import { TREATMENTS } from "../data/treatments";
import type { WizardHemophiliaType } from "../data/wizard";
import { TreatmentGrid } from "./ExploreTable";
import Popup from "./Popup";

/**
 * A `/wizard/scenario` illustration box's pop-up: the §5 comparison table cut
 * to the box's own class (ruled 2026-08-12) — `TreatmentGrid` over the rows
 * `classFilterFor(label)`'s bucket selects, under the clicked box's verbatim
 * label as the title. Deliberately NO `FilterSelect`s: the box already chose
 * the class, and the other two filters would let the fixed view contradict its
 * own title. The full filterable table stays `/explore`'s.
 *
 * The screen's own hemophilia type cuts the rows a second time (client,
 * 2026-09-14), for the same reason the dropdowns are absent: a row the
 * scenario's patient cannot take contradicts the title above it. The client
 * asked on the one case it shows up in — Efanesoctocog alfa, a FVIII product
 * sharing the "Clotting factor replacement" bucket, painted into hemophilia B's
 * "FIX prophylaxis" table — and the predicate is `/explore`'s own `servesType`,
 * so `A + B` rows stay on both types. The inhibitor column is deliberately NOT
 * cut with it: the client asked for the type, and what "indicated with
 * inhibitors" selects is a §5.2 question this pop-up should not re-answer.
 *
 * Same contract as `DrugSheetPopup`, for the same ADR 0006 reason: the page
 * owns which label is open; this resolves and paints it. `null` is closed.
 *
 * No fixed `h-[75dvh]` frame, unlike `ExploreTable`: that frame exists so
 * filtering changes what is inside the card rather than the card (user
 * direction 2026-08-11), and with the rows fixed there is nothing to hold the
 * frame against — the two- and three-row slices size the card themselves. The
 * `overflow-x-auto` wrapper is the grid's `min-w-288` floor met on narrow
 * viewports; `Popup`'s body scroll covers the vertical, since with no filter
 * bar there is nothing that must stay in view above the rows.
 */
export default function ClassTablePopup({
  classLabel,
  hemophiliaType,
  onClose,
}: {
  /** The verbatim class label from `classesFor`, or `null` while closed. */
  classLabel: string | null;
  /** The scenario's answered type; rows that do not serve it are cut. */
  hemophiliaType: WizardHemophiliaType;
  onClose: () => void;
}) {
  const bucket = classLabel === null ? undefined : classFilterFor(classLabel);

  return (
    <Popup
      card={
        classLabel !== null && bucket
          ? {
              title: classLabel,
              width: "wide",
              content: (
                <div className="overflow-x-auto py-4">
                  <TreatmentGrid
                    rows={TREATMENTS.filter(
                      (t) =>
                        bucket.classes.includes(t.treatmentClass) &&
                        servesType(t.hemophiliaType, hemophiliaType),
                    )}
                  />
                </div>
              ),
            }
          : null
      }
      onClose={onClose}
    />
  );
}
