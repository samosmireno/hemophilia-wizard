import { cn } from "../lib/cn";

export interface Option<T extends string> {
  id: T;
  label: string;
}

interface OptionGroupProps<T extends string> {
  /** The question, rendered as the group's `<legend>`. Sentence case; shouted in CSS. */
  legend: string;
  /** The radio `name`. Must be unique on the page — it is what groups the inputs. */
  name: string;
  options: Option<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  optionClassName?: string;
  className?: string;
}

export default function OptionGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  optionClassName,
  className,
}: OptionGroupProps<T>) {
  const answered = value !== null;

  return (
    // `min-w-0`: a `<fieldset>` carries `min-inline-size: min-content` in the UA
    // stylesheet — without it the page scrolls sideways on a phone.
    <fieldset className={cn("mx-auto max-w-110 min-w-0 lg:max-w-225", className)}>
      <legend className="mx-auto mb-2.5 w-full max-w-175 text-center font-sans text-xl font-bold text-brand-teal-75 uppercase lg:text-3xl">
        {legend}
      </legend>

      <div className="grid grid-cols-1 gap-x-5 gap-y-4 lg:grid-cols-2">
        {options.map((option) => {
          const selected = value === option.id;

          return (
            <label
              key={option.id}
              className={cn(
                "flex min-h-14 cursor-pointer items-center justify-center rounded-lg px-6 py-3",
                "text-center text-base leading-tight font-semibold wrap-break-word lg:text-xl xl:text-2xl",
                "shadow-ui-btn transition-[background-color,color] duration-120 ease-out",
                selected &&
                  "bg-choice-selected text-ui-btn-fg hover:bg-choice-selected-hover active:bg-choice-selected-active",
                !selected &&
                  answered &&
                  "bg-ui-btn-bg-active text-ui-btn-fg-active hover:bg-ui-btn-bg hover:text-ui-btn-fg",
                !selected &&
                  !answered &&
                  "bg-ui-btn-bg text-ui-btn-fg hover:bg-ui-btn-bg-hover hover:text-ui-btn-fg-hover",
                !selected && "active:bg-ui-btn-bg-active",
                // `has-[:focus-visible]`, NOT `peer-focus-visible` — the peer
                // form matches nothing and fails silently.
                "has-focus-visible:outline-[3px] has-focus-visible:outline-offset-[-3px] has-focus-visible:outline-ui-btn-ring",
                optionClassName,
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={selected}
                onChange={() => onChange(option.id)}
                // The deselect: a click on the already-chosen option fires no
                // `change` at all and lands here to clear it.
                onClick={() => {
                  if (selected) onChange(null);
                }}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
