import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Stock tailwind-merge. It needs no configuration, and that is now a property
 * worth protecting rather than an accident.
 *
 * Until 2026-08-04 this file called `extendTailwindMerge` to teach it six
 * `@theme` font sizes (`text-h1`…`text-small`), because **without that it
 * silently deleted them**. Its default config resolves `text-*` by validating
 * the suffix: a t-shirt size or an arbitrary length is a font size, and
 * *anything else* falls through to the catch-all text-**colour** group. `text-h4`
 * is not a t-shirt size, so it landed in the same group as the `text-white`
 * beside it and lost — leaving the element at whatever size it inherited, with
 * no error and no visual clue beyond the type being wrong.
 *
 * That was not hypothetical. `BulletList` shipped
 * `cn("list-disc pl-6 text-body text-black", …)` from the day it was written and
 * `text-body` never once applied — every bullet list in the app inherited 16px
 * and read correctly by accident, while the step's 1.6 leading was dropped.
 *
 * §2 removed the house scale, so every font size in the app is now either a
 * built-in t-shirt size or an arbitrary `text-[…]` value, and the default config
 * handles both. **The bug class is gone, not merely fixed.** Reintroducing a
 * `--text-<name>` token in `tokens.css` brings it straight back, and it fails
 * silently — if you add one, extend the merge config here in the same commit.
 */

/** Merge conditional class lists and resolve conflicting Tailwind utilities
 *  (later wins), e.g. cn("px-2", isBig && "px-4") → "px-4". */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
