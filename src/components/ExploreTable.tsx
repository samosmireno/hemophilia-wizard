import { useId, useState } from "react";
import { Button } from "mlg-components";

import { EXPLORE_AGE_FILTERS, EXPLORE_CLASS_FILTERS, minAge } from "../data/explore";
import { TREATMENTS, type Treatment } from "../data/treatments";
import { cn } from "../lib/cn";
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
 * column's widest unbreakable chunk (header word or cell word — "Hemophilia"
 * ~89px, "Administration" ~117px, "immunosuppressive" ~149px, measured in
 * Chromium/DM Sans **in bold**; the header dropped to normal weight with the
 * 2026-08-12 reskin, so the bold figures stand as upper bounds) plus the px-3
 * padding, with a few px over. Monitoring still carries the most, for its
 * prose.
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

/**
 * The inhibitors dropdown's two options, each glossed with the use it admits
 * (client relabel, 2026-08-26, alongside the dropdown's own "Indicated for use
 * with or without inhibitors" label): under the serves-this-patient semantics
 * ruled the day before, a bare "No" read as "hide the inhibitor-indicated
 * rows" where it in fact shows every row. As with the class and age dropdowns
 * the option string IS the filter value, so the predicate compares against
 * these constants, never the bare cell words. Wording verbatim from the client.
 */
const INHIBITOR_YES = "Yes (for use with or without inhibitors)";
const INHIBITOR_NO = "No (for use without inhibitors only)";
const INHIBITOR_OPTIONS = [INHIBITOR_YES, INHIBITOR_NO];

/**
 * The §5 filterable comparison table — the body of `/explore`'s wide `Popup`
 * (issue 09). Four AND-combined filters over the nine-row roster. Type,
 * Inhibitors and Age are PATIENT filters, not column filters. Type "A" shows
 * the eight rows that serve an A patient — cells `A` and `A + B` alike — not
 * the three whose cell reads `A` exactly (ruled 2026-08-11). Inhibitors "No"
 * shows every row: the S1 column is a capability flag (`Yes` = *also*
 * indicated with inhibitors), and all nine agents serve a patient without
 * them, so only "Yes" narrows — to the five `Yes` cells (client correction,
 * 2026-08-25; the exact-cell reading had hidden the mimetics and rebalancing
 * agents from an inhibitor-free patient; the dropdown and both options were
 * relabelled to spell the semantics out, 2026-08-26 — `INHIBITOR_OPTIONS`).
 * Age is a band of patient ages
 * (`EXPLORE_AGE_FILTERS`, added 2026-08-25 on the client's ask): a row is in
 * when its `minAge()` is at or under the band's floor. CONTEXT.md §5.2 holds
 * all three rulings. The class dropdown matches through
 * `EXPLORE_CLASS_FILTERS`' drawn-label buckets.
 *
 * Filter state lives here so it resets on close for free: the card's content is
 * `null` while closed, so reopening mounts a fresh instance — and so does the
 * phone toggle's open/closed state, which is the same kind of thing.
 */
export default function ExploreTable() {
  const [classLabel, setClassLabel] = useState("");
  const [type, setType] = useState("");
  const [inhibitors, setInhibitors] = useState("");
  const [age, setAge] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const panelId = useId();

  const bucket = EXPLORE_CLASS_FILTERS.find((filter) => filter.label === classLabel);
  const band = EXPLORE_AGE_FILTERS.find((filter) => filter.label === age);
  const rows = TREATMENTS.filter(
    (t) =>
      (!bucket || bucket.classes.includes(t.treatmentClass)) &&
      (type === "" || t.hemophiliaType === type || t.hemophiliaType === "A + B") &&
      (inhibitors === "" || inhibitors === INHIBITOR_NO || t.inhibitors === "Yes") &&
      (!band || minAge(t.age) <= band.floor),
  );

  const clearFilters = () => {
    setClassLabel("");
    setType("");
    setInhibitors("");
    setAge("");
  };

  /**
   * The active filters as the phone summary line reads them — "Type: A ·
   * Age: 6–11" — and, counted, the toggle's badge. The inhibitors entry
   * shortens the glossed option to its first word; the gloss is for the open
   * list, not a one-line recap.
   */
  const active = [
    classLabel && `Class: ${classLabel}`,
    type && `Type: ${type}`,
    inhibitors && `Inhibitors: ${inhibitors === INHIBITOR_YES ? "Yes" : "No"}`,
    age && `Age: ${age}`,
  ].filter((entry): entry is string => Boolean(entry));

  return (
    // The height is the CARD's, not the content's (user direction 2026-08-11):
    // sized by its rows, the dialog collapsed and regrew as filters cut nine
    // rows to one. Fixed, filtering changes what is inside the frame, never the
    // frame. 75dvh + `Popup`'s header stays under its `max-h-[95dvh]` cap at
    // every viewport, so the card's own scroll never engages — the grid region
    // below scrolls instead, which also keeps the filter bar in view.
    //
    // Below `sm` the frame is instead `flex-1` of the card: `/explore` opens
    // this card with `Popup`'s `phoneFill`, whose body is then a column flex
    // filling the screen, and the leftover height is the table's (2026-08-26).
    // `flex-1` is inert in the block body a desktop card has, so one class list
    // serves both. Without `phoneFill` the phone frame would size to its rows
    // and the card would scroll — degraded, not broken.
    <div className="flex min-h-0 flex-1 flex-col py-4 sm:h-[75dvh]">
      <FiltersToggle
        open={filtersOpen}
        count={active.length}
        controls={panelId}
        onToggle={() => setFiltersOpen((open) => !open)}
      />
      {/* The bar. On phones it is the toggle's panel: `hidden` until opened,
          stacked full-width (`max-sm:flex-col`) rather than wrapped, so the
          four selects read as one form under the control. From `sm` up the
          toggle is gone and the panel is always the drawn wrapping bar —
          `sm:flex` restores it whatever the phone state says. */}
      <div
        id={panelId}
        className={cn(
          "flex-wrap gap-x-6 gap-y-3 max-sm:mt-3 max-sm:flex-col",
          filtersOpen ? "flex" : "hidden sm:flex",
        )}
      >
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
          label="Indicated for use with or without inhibitors"
          value={inhibitors}
          options={INHIBITOR_OPTIONS}
          onChange={setInhibitors}
        />
        <FilterSelect
          label="Patient age (years)"
          value={age}
          options={EXPLORE_AGE_FILTERS.map((filter) => filter.label)}
          onChange={setAge}
        />
        {/* Phone-only: with the panel open over a table that is mostly out of
            sight, resetting select by select is blind work. The desktop bar
            keeps the empty state's button as the only reset (issue 09) — and
            this one is gated on the panel being OPEN, not merely on filters
            being set: the panel is CSS-hidden, so an ungated link would sit in
            the DOM beside the empty state's button on every viewport. */}
        {filtersOpen && active.length > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="self-start text-sm text-black underline sm:hidden"
          >
            Clear filters
          </button>
        )}
      </div>
      {/* Closed with filters set, the phone says what they are — the toggle's
          count alone would leave the row set's cause off screen, which is the
          argument that pins the desktop bar. */}
      {!filtersOpen && active.length > 0 && (
        <p className="mt-2 text-sm text-black/70 sm:hidden">{active.join(" · ")}</p>
      )}

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
        // `min-h-0 flex-1` bounds the region at the frame so the rows scroll
        // vertically under a filter bar that stays — `Popup`'s own body scroll
        // would move the bar away with them.
        <div className="mt-4 min-h-0 flex-1 overflow-auto">
          <TreatmentGrid rows={rows} />
        </div>
      )}
    </div>
  );
}

/**
 * The phone-only control the filters sit behind (2026-08-26, the user's pick
 * from six measured phone layouts — docs/styling.md §17): on a 375px phone the
 * four stacked selects took ~310px of a 75dvh frame and left one row of the
 * table in view. Full width in the selects' own skin (`FilterSelect`'s
 * hairline box, bold), a funnel so it reads as filters before it is read, the
 * count in the name so a closed control still says something is set, and
 * `NoteDisclosure`'s chevron path, turned when open. `sm:hidden`: from the
 * tablet up the drawn bar is always shown and there is nothing to toggle.
 */
function FiltersToggle({
  open,
  count,
  controls,
  onToggle,
}: {
  open: boolean;
  count: number;
  /** The panel's id, for `aria-controls`. */
  controls: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between rounded-lg border border-black/30 bg-white px-3 py-2 text-base font-bold text-black sm:hidden",
        "focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ui-btn-ring",
      )}
    >
      <span className="flex items-center gap-2">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-5"
        >
          <path d="M3 4h14l-5.5 6.5V16l-3-1.5V10.5L3 4z" />
        </svg>
        Filters{count > 0 ? ` (${count})` : ""}
      </span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        data-testid="filters-chevron"
        className={cn(
          "size-5 transition-transform duration-120 ease-out motion-reduce:transition-none",
          open && "rotate-180",
        )}
      >
        <path d="M6 9.5L12 15.5L18 9.5" />
      </svg>
    </button>
  );
}

/** The hairline between cells — `TreatmentOptionsTable`'s `MATRIX_RULE`, adopted with the rest of its skin. */
const GRID_RULE = "border-black/30";

/**
 * The nine-column grid alone, shared between the filterable card above and
 * `ClassTablePopup`'s fixed-class views — one grid so the scenario popups can
 * never drift from the §5 table they claim to be a slice of.
 *
 * The skin is `TreatmentOptionsTable`'s (user direction 2026-08-12, overruling
 * issue 09's picked-without-artboard hairlines): the header is that table's
 * rounded `bg-white/50` band at normal weight with no rule under it, and the
 * cells rule `black/30` between rows and between columns — nothing under the
 * last row, nothing on the outer edges. Every cell centres vertically
 * (`align-middle`, the matrix's own `MATRIX_CELL` alignment — followed the
 * skin by user direction, same day) and horizontally (`text-center`, headers
 * and cells alike — user direction 2026-08-12, moving off the skin's left
 * alignment). The spacing (`px-3 py-3`, `text-base`) deliberately did NOT
 * move.
 *
 * The header is sticky (user direction 2026-08-12): nine dense columns in
 * `ExploreTable`'s 75dvh frame scroll at laptop heights, and a cell reading
 * "Yes" or "Weekly" is meaningless once its header has left — the same
 * argument that keeps the filter bar pinned above the scroll region. The
 * `backdrop-blur` is load-bearing, not decoration: the band keeps its drawn
 * `bg-white/50` translucency, so without the blur the rows would ghost
 * through it as they pass beneath. In `ClassTablePopup` the whole construction
 * is inert by geometry — its `overflow-x-auto` wrapper is the sticky
 * containing block and never scrolls vertically — which is why the grid can
 * carry it unconditionally.
 *
 * Scrolls rather than reflows, like `SeverityTable` and Table 1 (styling item
 * 27): restacking nine columns would flatten the row association for assistive
 * tech. The `min-w-288` floor is the sum of the columns' measured word floors
 * (~1079px — see COLUMNS) plus slack; it fits the wide `Popup`'s ~1222px body
 * without scroll. `break-words` is the net under that arithmetic: should a word
 * outgrow its column anyway (font substitution, new copy), it wraps mid-word
 * rather than painting over the neighbour. The scroll container is the
 * caller's, because the two callers bound it differently.
 */
export function TreatmentGrid({ rows }: { rows: readonly Treatment[] }) {
  return (
    <table className="w-full min-w-288 table-fixed border-separate border-spacing-0 text-center break-words text-black">
      <colgroup>
        {COLUMNS.map((column) => (
          // Inline because the shares are data, like the segments' drawn
          // widths on the page beneath.
          <col key={column.header} style={{ width: column.width }} />
        ))}
      </colgroup>
      <thead>
        <tr>
          {COLUMNS.map((column, index) => (
            <th
              key={column.header}
              scope="col"
              className={cn(
                "sticky top-0 bg-white/50 px-3 py-3 align-middle text-base font-normal backdrop-blur",
                index === 0 && "rounded-l-2xl",
                index === COLUMNS.length - 1 && "rounded-r-2xl",
              )}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((treatment, rowIndex) => (
          <tr key={treatment.agent}>
            {COLUMNS.map((column, columnIndex) => (
              // `whitespace-pre-line` carries the MOA cells' transcribed
              // newline ("FVIIIa mimetic\nBsAb") to the screen.
              <td
                key={column.header}
                className={cn(
                  "px-3 py-3 align-middle text-base whitespace-pre-line",
                  rowIndex > 0 && cn("border-t", GRID_RULE),
                  columnIndex > 0 && cn("border-l", GRID_RULE),
                )}
              >
                {column.cell(treatment)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
