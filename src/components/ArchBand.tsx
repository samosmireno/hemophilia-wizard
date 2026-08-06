import type { ReactNode } from "react";

import BrandLoop from "./BrandLoop";
import { cn } from "../lib/cn";

/** Parent contract: `mt-auto` expects a growing flex column. */
export default function ArchBand({
  title,
  titleClassName,
  className,
  children,
}: {
  title: string;
  /** `grow-0` stays written out deliberately. */
  className?: string;
  titleClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      /* `border-t-[0.25rem]` is NOT `border-t-4`, and an editor will offer to
         "canonicalise" it into one. Tailwind's numeric border utilities are px,
         so that swap silently pins this rule at 4px while the arch it edges grows
         above the canvas — the whole point of docs/styling.md §19. Same for the
         two radii: they are rem so the curve scales with the band. */
      className={cn(
        "relative isolate -mx-6 mt-auto -mb-4 grow-0 overflow-hidden rounded-t-[9.375rem] border-t-[0.25rem] border-white/40 bg-brand-crimson-50/15 pb-4 sm:mx-0 lg:mb-0 lg:pb-0 xl:rounded-t-[18.75rem]",
        className,
      )}
    >
      <BrandLoop className="absolute inset-0 -z-10 opacity-20" />

      {/* `px-13` / `px-39` are derived from the corner radii (`r − √(r² − (r−y)²)` at the
          title's depth) and ramp at the breakpoint the radius ramps at — move one, move both. */}
      <div className="px-13 xl:px-39">
        <h2
          className={cn(
            "mt-9 text-center font-display text-2xl font-bold tracking-wide text-brand-crimson-50 uppercase lg:text-3xl",
            titleClassName,
          )}
        >
          {title}
        </h2>
      </div>

      {children}
    </div>
  );
}
