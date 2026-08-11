import { useState } from "react";
import { Button } from "mlg-components";

import { EXPLORE_CLASS_FILTERS } from "../data/explore";
import { TREATMENTS, type Treatment } from "../data/treatments";
import FilterSelect from "./FilterSelect";

/**
 * The nine S1 columns, headers verbatim, in S1 order — all nine, including the
 * three filtered ones (decided 2026-08-11): the unfiltered view is the default
 * and the reset target, so it has to carry the comparison on its face, which a
 * grid with the type column hidden cannot.
 */
const COLUMNS: readonly { header: string; cell: (t: Treatment) => string }[] = [
  { header: "Treatment class", cell: (t) => t.treatmentClass },
  { header: "Agent", cell: (t) => t.agent },
  { header: "MOA", cell: (t) => t.moa },
  { header: "Hemophilia Type", cell: (t) => t.hemophiliaType },
  { header: "Indicated with inhibitors", cell: (t) => t.inhibitors },
  { header: "Patient Age", cell: (t) => t.age },
  { header: "Administration Route", cell: (t) => t.route },
  { header: "Schedule", cell: (t) => t.schedule },
  { header: "Monitoring & Safety", cell: (t) => t.monitoring },
];

/**
 * The drawn dropdown values, which are also the S1 cell values, verbatim — with
 * one gloss (user direction 2026-08-11): bare "A + B" read as a second All,
 * when it is the five rows eligible for both types against All's nine. The
 * label says what the exact match actually shows; the VALUE stays the verbatim
 * cell, so the predicate and the table's own cells keep agreeing.
 */
const TYPE_OPTIONS = ["A", "B", { value: "A + B", label: "A + B (eligible for both)" }];
const INHIBITOR_OPTIONS = ["Yes", "No"];

/**
 * The §5 filterable comparison table — the body of `/explore`'s wide `Popup`
 * (issue 09). Three AND-combined column filters over the nine-row roster,
 * matching cells **exactly** ("A" is the three rows whose cell reads `A`, not
 * the eight that serve A — decided provisionally 2026-08-11, flagged for the
 * client gate; CONTEXT.md §5.2). The class dropdown matches through
 * `EXPLORE_CLASS_FILTERS`' drawn-label buckets.
 *
 * Filter state lives here so it resets on close for free: the card's content is
 * `null` while closed, so reopening mounts a fresh instance.
 */
export default function ExploreTable() {
  const [classLabel, setClassLabel] = useState("");
  const [type, setType] = useState("");
  const [inhibitors, setInhibitors] = useState("");

  const bucket = EXPLORE_CLASS_FILTERS.find((filter) => filter.label === classLabel);
  const rows = TREATMENTS.filter(
    (t) =>
      (!bucket || bucket.classes.includes(t.treatmentClass)) &&
      (type === "" || t.hemophiliaType === type) &&
      (inhibitors === "" || t.inhibitors === inhibitors),
  );

  const clearFilters = () => {
    setClassLabel("");
    setType("");
    setInhibitors("");
  };

  return (
    // The height is the CARD's, not the content's (user direction 2026-08-11):
    // sized by its rows, the dialog collapsed and regrew as filters cut nine
    // rows to one. Fixed, filtering changes what is inside the frame, never the
    // frame. 75dvh + `Popup`'s header stays under its `max-h-[95dvh]` cap at
    // every viewport, so the card's own scroll never engages — the grid region
    // below scrolls instead, which also keeps the filter bar in view.
    <div className="flex h-[75dvh] flex-col py-4">
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <FilterSelect
          label="Treatment class"
          value={classLabel}
          options={EXPLORE_CLASS_FILTERS.map((filter) => filter.label)}
          onChange={setClassLabel}
        />
        <FilterSelect
          label="Hemophilia Type"
          value={type}
          options={TYPE_OPTIONS}
          onChange={setType}
        />
        <FilterSelect
          label="Indicated with inhibitors"
          value={inhibitors}
          options={INHIBITOR_OPTIONS}
          onChange={setInhibitors}
        />
      </div>

      {rows.length === 0 ? (
        // The bar above stays, so the cause of the emptiness is on screen; the
        // button is the recovery, and this is its only appearance. `flex-1`
        // fills the fixed frame, so the empty state holds the card's size too.
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-xl leading-[1.6] text-black">
            No treatments match the selected filters.
          </p>
          <Button className="mt-6 px-8 py-2 text-base/tight" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        // Scrolls rather than reflows, like `SeverityTable` and Table 1
        // (styling item 27): restacking nine columns would flatten the row
        // association for assistive tech. The floor is arithmetic: nine columns
        // at Table 1's ~107px/column reading floor. `min-h-0 flex-1` bounds the
        // region at the frame so it scrolls vertically too — `Popup`'s own body
        // scroll would move the filter bar away with the rows.
        <div className="mt-4 min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-240 border-separate border-spacing-0 text-left text-black">
            <thead>
              <tr>
                {COLUMNS.map((column) => (
                  <th
                    key={column.header}
                    scope="col"
                    className="border-b border-black/30 bg-white/50 px-3 py-3 align-bottom text-base font-bold"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((treatment) => (
                <tr key={treatment.agent}>
                  {COLUMNS.map((column) => (
                    // `whitespace-pre-line` carries the MOA cells' transcribed
                    // newline ("Factor VIIIa–mimetic\nBsAb") to the screen.
                    <td
                      key={column.header}
                      className="border-b border-black/10 px-3 py-3 align-top text-base whitespace-pre-line"
                    >
                      {column.cell(treatment)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
