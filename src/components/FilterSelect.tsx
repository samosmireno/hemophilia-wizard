import { useId } from "react";

import { cn } from "../lib/cn";

/**
 * One of the comparison table's dropdown column filters (issue 03's last
 * primitive): a labelled native `<select>` with "All" as its first option.
 *
 * Native rather than a custom listbox by decision (2026-08-11): no artboard
 * draws the open list, the option sets are 3–5 items, and the control sits
 * inside an already-modal `Popup` — correct keyboard, screen-reader and
 * mobile-picker behaviour for free beats owning ARIA and dismissal logic.
 *
 * `""` is the All sentinel — the one value that is not a cell string, so a
 * caller's predicate can read `value === ""` as "no filter" without a
 * reserved-word collision with the data.
 */

export interface FilterSelectOption {
  /** What `onChange` reports and a predicate matches — the verbatim cell value. */
  value: string;
  /** What the open list shows, where the cell value alone would mislead. */
  label: string;
}

export default function FilterSelect({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  /** The selected option's value, or `""` for All. */
  value: string;
  /** A bare string is an option whose label IS its value — the common case. */
  options: readonly (string | FilterSelectOption)[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const id = useId();

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={id} className="text-sm font-bold text-black">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        // The hairline borrows Table 1's inferred black/30; the open list is
        // OS-drawn and deliberately unstyled.
        className="rounded-lg border border-black/30 bg-white px-3 py-2 text-base text-black"
      >
        <option value="">All</option>
        {options
          .map((option) => (typeof option === "string" ? { value: option, label: option } : option))
          .map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
      </select>
    </div>
  );
}
