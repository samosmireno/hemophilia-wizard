import { cn } from "../lib/cn";

/**
 * A §7.7 agent thumbnail box as a button — the drawn 227×185 box wearing its
 * exported skin (slate ground, white inset ring, `agent-box` shadow), opening
 * the agent's §6 drug sheet. The page owns what opens: this stays a dumb
 * trigger so the sheet state can live beside `DrugSheetPopup` per ADR 0006.
 *
 * The hover/press/focus states are invented (no artboard draws them —
 * docs/styling.md §9): hover raises the shadow onto a white ground, press
 * inverts it onto `slate-100`, and focus-visible swaps the white ring to
 * crimson — the same colour `ExpandableFigure` focuses with, so image-buttons
 * share one focus rule.
 */
export default function AgentBoxButton({
  src,
  agent,
  width = 912,
  height = 745,
  onClick,
  className,
}: {
  src: string;
  /** The S1 agent name — the button's "Expand {agent}" and the sheet's own dialog title. */
  agent: string;
  /** The asset's intrinsic pixels; the three §7.7 exports share 912×745. */
  width?: number;
  height?: number;
  onClick: () => void;
  /** Row-layout classes only (`shrink-*`) — the skin and box size are not overridable. */
  className?: string;
}) {
  return (
    <button
      type="button"
      // Named for what the click does; the image's painted text is the
      // caller's prose to announce (the chapter's bullets already do).
      aria-label={`Expand ${agent}`}
      // Not `aria-controls`: a modal dialog lives in the top layer, so it is
      // not a region of this page the button expands.
      aria-haspopup="dialog"
      onClick={onClick}
      className={cn(
        // The ring ships in rem (not the export's 3px) so it scales with the
        // board (§19); `-outline-offset` draws it fully inside the edge.
        "h-48 w-full max-w-56 cursor-pointer rounded-xl bg-slate-50 py-1 shadow-agent-box",
        "outline-[0.1875rem] -outline-offset-[0.1875rem] outline-white",
        "transition-[background-color,box-shadow] duration-150 ease-out",
        "hover:bg-white hover:shadow-agent-box-hover",
        "active:bg-slate-100 active:shadow-agent-box-active",
        "focus-visible:outline-brand-crimson-50",
        className,
      )}
    >
      <img
        src={src}
        alt=""
        width={width}
        height={height}
        className="h-full w-full object-contain"
      />
    </button>
  );
}
