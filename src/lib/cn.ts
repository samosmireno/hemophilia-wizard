import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class lists and resolve conflicting Tailwind utilities
 *  (later wins), e.g. cn("px-2", isBig && "px-4") → "px-4". */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
