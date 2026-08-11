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
/**
 * `width` is each column's share of the table, summing to 100% — under
 * `table-fixed` these are the whole geometry, so filtering changes which rows
 * show, never where the columns sit (auto layout re-measured the survivors and
 * the columns jumped on every filter change). Sized from measurement, not an
 * artboard: a fixed column narrower than a word does not wrap it, it paints it
 * over the neighbour, so each share at the table's 72rem floor covers its
 * column's widest unbreakable chunk (bold header word or cell word — bold
 * "Hemophilia" ~89px, "Administration" ~117px, "immunosuppressive" ~149px,
 * measured in Chromium/DM Sans) plus the px-3 padding, with a few px over.
 * Monitoring still carries the most, for its prose.
 */
const COLUMNS: readonly { header: string; width: string; cell: (t: Treatment) => string }[] = [
  { header: "Treatment class", width: "12%", cell: (t) => t.treatmentClass },
  { header: "Agent", width: "12%", cell: (t) => t.agent },
  { header: "MOA", width: "9%", cell: (t) => t.moa },
  { header: "Hemophilia Type", width: "10%", cell: (t) => t.hemophiliaType },
  { header: "Indicated with inhibitors", width: "9%", cell: (t) => t.inhibitors },
  { header: "Patient Age", width: "8%", cell: (t) => t.age },
  { header: "Administration Route", width: "13%", cell: (t) => t.route },
  { header: "Schedule", width: "9%", cell: (t) => t.schedule },
  { header: "Monitoring & Safety", width: "18%", cell: (t) => t.monitoring },
];

/**
 * No "A + B" option, though the artboard draws one and the cells carry it: a
 * patient has hemophilia A or B, never both, so `A + B` is a property of the
 * TREATMENT (indicated for both types) and "everything serving either" is what
 * All already means. Ruled 2026-08-11 on that domain ground (user direction,
 * reversing the same day's exact-match call), flagged for the client gate —
 * the departure from the drawn three-value set is theirs to overrule.
 */
const TYPE_OPTIONS = ["A", "B"];
const INHIBITOR_OPTIONS = ["Yes", "No"];

/**
 * The §5 filterable comparison table — the body of `/explore`'s wide `Popup`
 * (issue 09). Three AND-combined filters over the nine-row roster. Type is a
 * PATIENT-type filter: "A" shows the eight rows that serve an A patient —
 * cells `A` and `A + B` alike — not the three whose cell reads `A` exactly
 * (ruled 2026-08-11, flagged for the client gate; CONTEXT.md §5.2). Inhibitors
 * matches its cell exactly; the class dropdown matches through
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
      (type === "" || t.hemophiliaType === type || t.hemophiliaType === "A + B") &&
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
        // association for assistive tech. The floor is the sum of the columns'
        // measured word floors (~1079px — see COLUMNS) plus slack; it fits the
        // wide `Popup`'s ~1222px body without scroll. `break-words` is the net
        // under that arithmetic: should a word outgrow its column anyway (font
        // substitution, new copy), it wraps mid-word rather than painting over
        // the neighbour. `min-h-0 flex-1` bounds the region at the frame so it
        // scrolls vertically too — `Popup`'s own body scroll would move the
        // filter bar away with the rows.
        <div className="mt-4 min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-288 table-fixed border-separate border-spacing-0 text-left break-words text-black">
            <colgroup>
              {COLUMNS.map((column) => (
                // Inline because the shares are data, like the segments' drawn
                // widths on the page beneath.
                <col key={column.header} style={{ width: column.width }} />
              ))}
            </colgroup>
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
