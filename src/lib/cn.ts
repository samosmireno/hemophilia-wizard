import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * twMerge must learn any new token class family; reintroducing a `--text-<name>`
 * token in `tokens.css` fails silently unless the merge config here is extended
 * in the same commit.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
