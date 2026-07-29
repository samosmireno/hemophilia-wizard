import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge, taught this project's six `@theme` font sizes.
 *
 * **Without this it silently deletes them.** Its default config resolves
 * `text-*` by validating the suffix: a t-shirt size or an arbitrary length is a
 * font size, and *anything else* falls through to the catch-all text-**colour**
 * group. `text-h4` is not a t-shirt size, so it lands in the same group as the
 * `text-white` beside it and loses — leaving the element at whatever size it
 * inherits, with no error and no visual clue beyond the type being wrong.
 *
 * That is not hypothetical. `BulletList` has shipped
 * `cn("list-disc pl-6 text-body text-black", …)` since it was written, and
 * `text-body` never once applied — every bullet list in the app has been
 * inheriting 16px and reading correctly by accident, while the 1.6 leading
 * docs/styling.md §2 specifies for that step was dropped. `Popup`'s subtitle is
 * what finally made it visible, because 20px inheriting 16px is a difference you
 * can see.
 *
 * Listed by name rather than by a validator: the six are the whole scale
 * (docs/styling.md §2), and a name added there without being added here would
 * fail the same silent way. A short list that must be kept in step is easier to
 * notice than a regex that quietly stops matching.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["h1", "h2", "h3", "h4", "body", "small"] }],
    },
  },
});

/** Merge conditional class lists and resolve conflicting Tailwind utilities
 *  (later wins), e.g. cn("px-2", isBig && "px-4") → "px-4". */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
