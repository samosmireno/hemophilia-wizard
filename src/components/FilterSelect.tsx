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
 *
 * `max-w-full` caps the control at its bar: a native select's intrinsic width
 * is its widest option, and the inhibitors dropdown's glossed options (client
 * wording, 2026-08-26) measure ~330px — past a 375px phone's 318px card body,
 * where the uncapped control ran under the card's edge. Capped, the wrapper
 * stops at the bar and the column-flex stretch shrinks the select to match;
 * the closed control then clips the last characters of its longest option on
 * the narrowest phones, the OS picker showing the full text. Wider than that,
 * the cap is inert and the control keeps its intrinsic width.
 */
export default function FilterSelect({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  /** The selected option, or `""` for All. */
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const id = useId();

  return (
    <div className={cn("flex max-w-full flex-col gap-1", className)}>
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
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
