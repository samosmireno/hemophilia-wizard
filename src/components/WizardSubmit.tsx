import { useEffect, useRef, useState } from "react";
import { Button } from "mlg-components";

import { cn } from "../lib/cn";

/**
 * The "Submit inputs" row both wizard forms end on — right-aligned to the pill
 * grid, disabled until `open`. The release is announced, not just permitted
 * (docs/styling.md §20): the pulse marks the gate OPENING, not being open — it
 * re-arms per false→true flip of `open` on the current mount, so a page born
 * with its gate already open plays nothing.
 */
export default function WizardSubmit({ open }: { open: boolean }) {
  const prevOpen = useRef(open);
  const [released, setReleased] = useState(false);
  useEffect(() => {
    if (open === prevOpen.current) return;
    prevOpen.current = open;
    setReleased(open);
  }, [open]);

  return (
    <div className="mx-auto mt-8 flex max-w-110 justify-end lg:max-w-225">
      <Button
        type="submit"
        disabled={!open}
        className={cn(
          "bg-brand-lagoon-50 px-6 leading-5 hover:bg-brand-lagoon-25 active:bg-brand-lagoon-75 max-lg:text-lg lg:px-7.5 lg:py-4.5 lg:text-2xl",
          "transition-[background-color,box-shadow,color,opacity]",
          released && "animate-gate-release motion-reduce:animate-none",
        )}
      >
        Submit inputs
      </Button>
    </div>
  );
}
