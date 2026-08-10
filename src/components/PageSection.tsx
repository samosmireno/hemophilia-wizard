import { useId, type ReactNode } from "react";

import { cn } from "../lib/cn";

/**
 * The page frame: a `<section>` landmark named by its `<h1>` page title, shared
 * by every walkthrough step and off-line page. Two invariants live here so no
 * page restates them:
 *
 * - The page-title ramp (docs/styling.md §2). Uppercase is CSS, not copy — the
 *   accessible name keeps the case the title is written in.
 * - `padsOwnBottom` (docs/styling.md §9 item 53): `AppShell` sets `lg:pb-0`, so
 *   a page that always scrolls pads its own bottom instead.
 *
 * The heroes — `Landing` and `WizardIntro` — draw their own heading designs and
 * stay off this frame on purpose: one caller is not a variant.
 */
export default function PageSection({
  title,
  titleLabel,
  padsOwnBottom = false,
  className,
  children,
}: {
  title: ReactNode;
  /**
   * Accessible-name override, set as `aria-label` on the `<h1>` — only for a
   * title whose markup garbles the computed name (FviiiMimetics' two-tone split).
   */
  titleLabel?: string;
  /** The always-scrolls rule above; named so a fifth scroller states intent, not classes. */
  padsOwnBottom?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={cn(padsOwnBottom && "lg:pb-16", className)}>
      <h1
        id={headingId}
        aria-label={titleLabel}
        className="font-display text-3xl font-bold tracking-wide text-brand-crimson-50 uppercase lg:text-5xl"
      >
        {title}
      </h1>
      {children}
    </section>
  );
}
