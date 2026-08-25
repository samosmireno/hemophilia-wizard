import { type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "mlg-components";

import { cn } from "../lib/cn";
import { WIZARD_BUTTON_SKIN } from "./wizardButton";

/**
 * The "Submit inputs" row both wizard forms end on — right-aligned to the pill
 * grid, disabled until `open`. The release is announced, not just permitted
 * (docs/styling.md §20): the pulse marks the gate OPENING, not being open — it
 * re-arms per false→true flip of `open` on the current mount, so a page born
 * with its gate already open plays nothing.
 *
 * `children` share the row from its start — `/wizard`'s Reset. Below `sm` the
 * row is a stack instead: a one-column grid aligned to the pill grid's right
 * edge, so the two share one track sized by the wider label (the survey pair's
 * idiom, docs/styling.md §27). `justify-end` is what keeps the track at
 * max-content — a grid's auto track only stretches under `normal`. A row
 * without children is Submit alone, as before.
 */
export default function WizardSubmit({ open, children }: { open: boolean; children?: ReactNode }) {
  const prevOpen = useRef(open);
  const [released, setReleased] = useState(false);
  useEffect(() => {
    if (open === prevOpen.current) return;
    prevOpen.current = open;
    setReleased(open);
  }, [open]);

  return (
    <div className="mx-auto mt-8 grid max-w-110 justify-end gap-4 sm:flex lg:max-w-225">
      {/* `grid` so the button inside stretches to the stack's track; a bare
          wrapper would hold its intrinsic width and the pair would not match. */}
      {children && <div className="grid sm:mr-auto">{children}</div>}
      <Button
        type="submit"
        disabled={!open}
        className={cn(
          WIZARD_BUTTON_SKIN,
          "transition-[background-color,box-shadow,color,opacity]",
          released && "animate-gate-release motion-reduce:animate-none",
        )}
      >
        Submit inputs
      </Button>
    </div>
  );
}
