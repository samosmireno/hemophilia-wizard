import { classFilterFor } from "../data/explore";
import { TREATMENTS } from "../data/treatments";
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
  onClose,
}: {
  /** The verbatim class label from `classesFor`, or `null` while closed. */
  classLabel: string | null;
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
                    rows={TREATMENTS.filter((t) => bucket.classes.includes(t.treatmentClass))}
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
