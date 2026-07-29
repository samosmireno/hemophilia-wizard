import { type ReactNode, useEffect, useId, useRef } from "react";
import { PopupButton } from "mlg-components";

import { cn } from "../lib/cn";

/**
 * The §7.7 click-through pop-up — the card behind every "Click here:"
 * disclosure. This is the **skeleton** issue 03 calls for: chrome, behaviour
 * and a11y, with one scroll region the calling popup fills. It knows nothing
 * about what goes inside it.
 *
 * Figma `144:431` ("Pop 8"), 1066×645 on the 1440 canvas. Geometry and the two
 * deliberate deviations from the export are in docs/styling.md §13.
 *
 * **A real `<dialog>` opened with `showModal()`**, not a positioned div. Three
 * things come from the platform rather than from code here: the focus trap, the
 * top layer, and focus restoration on close. The top layer is what makes this
 * work at all in its first caller — `DisclosureBand` wraps its content in
 * `isolate` + `overflow-hidden` to clip the arch, and any in-flow panel large
 * enough to be this card would be cut by it. A modal dialog escapes every
 * ancestor's clipping and stacking context by definition, so it also clears
 * `TopRule`'s `z-30` band and the sidebar's z-40/z-50 chrome without owning a
 * z-index of its own.
 *
 * **`open` is the single source of truth.** The `cancel` handler below
 * preventDefaults, so the element never closes itself behind React's back — ESC
 * routes through `onClose` like every other close, and the two cannot disagree.
 */
export default function Popup({
  open,
  title,
  onClose,
  surface = "gradient",
  children,
}: {
  open: boolean;
  /** Rendered in the crimson band, and the dialog's accessible name. */
  title: string;
  /** Called for all three close routes: ESC, the ✕, and a backdrop click. */
  onClose: () => void;
  /**
   * The body fill. `"gradient"` is the design's `--background-image-popup`
   * (§13) and the default; `"white"` is for a figure the designer drew on white
   * — rebuilt as markup, its own background would otherwise sit as a white
   * rectangle inside the tinted card.
   *
   * An opt-in rather than a global change: the severity table draws its header
   * pills with `bg-white/50`, which the gradient is what makes visible.
   */
  surface?: "gradient" | "white";
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  /**
   * Guards the backdrop click against a text selection that starts inside the
   * card and ends outside it: a click event's target is the *common ancestor*
   * of its mousedown and mouseup, which for that drag is the dialog itself —
   * indistinguishable from a real backdrop click without remembering where the
   * press landed.
   */
  const pressedBackdrop = useRef(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    // Guarded both ways: showModal() on an already-open dialog throws, and
    // React may re-run this effect without `open` having actually changed.
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  /**
   * `showModal()` makes everything behind the dialog inert, but does not stop
   * the page scrolling under it — the one thing in issue 03's list the platform
   * does not hand us.
   */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    // The element itself is a transparent, viewport-filling layer rather than
    // the card, so a click anywhere outside the card is a click on *it* — the
    // ::backdrop pseudo-element is not an event target, so a dialog sized to
    // its own content has no way to hear one. The scrim shows through.
    //
    // Two classes here fight the UA stylesheet's `dialog` rules, and BOTH are
    // load-bearing — dropping either one reproduces a bug this already had:
    //
    // - `hidden open:grid`, never a bare `grid`. The UA hides a closed dialog
    //   with `dialog:not([open]) { display: none }`, and ANY author `display`
    //   beats a UA one regardless of specificity — so a bare `grid` leaves an
    //   empty, unclosable card painted over the page from first render.
    // - `size-full`, because the UA sizes a dialog `width/height: fit-content`.
    //   `inset-0` cannot defeat that (insets only stretch an element whose size
    //   is `auto`), so without it the layer shrinks onto the card and pins
    //   itself to the top-left instead of centring in the viewport.
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onMouseDown={(event) => {
        pressedBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pressedBackdrop.current && event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 m-0 hidden size-full max-h-none max-w-none place-items-center border-0 bg-transparent p-0 backdrop:bg-black/50 open:grid"
    >
      {/* `min()` rather than the drawn 1066px: the card is a content container
          and the app runs down to 375px. `overflow-hidden` is what clips the
          full-bleed band to the rounded corners — the band and the border are
          the same crimson, so the top edge reads as one mass either way. */}
      {/* The floor is `min(520px, 85dvh)`, not a bare 520px: `min-height` beats
          `max-height` in CSS, so an unguarded floor would push the card past the
          cap on any viewport shorter than ~612px — a phone in landscape — and
          overflow it off screen with no way to scroll back. Written this way the
          two can never disagree. */}
      <div
        className={cn(
          "flex max-h-[95dvh] min-h-[min(520px,95dvh)] w-[min(1066px,92vw)] flex-col overflow-hidden rounded-[40px] border-5 border-brand-crimson-50 shadow-popup",
          surface === "white" ? "bg-white" : "bg-popup",
        )}
      >
        {/* 12px of padding, not a fixed 118px: the band is content-height in the
            export (12 + two 46.73px lines + 12 = 117.5), so it grows with a
            title that wraps to three lines instead of clipping it. */}
        <header className="relative shrink-0 bg-brand-crimson-50 py-5">
          {/* The horizontal padding is symmetric so the title stays centred on
              the card, and sized to clear the ✕ on the right — its floor is the
              button's own 65px plus the 22px inset, so the two never overlap.
              Type is raw design values per §8's precedent; the scale has no
              45.5px step. */}
          <h2
            id={titleId}
            className="px-[clamp(5.5rem,7vw,6.25rem)] text-center font-display text-[clamp(1.375rem,3.157vw,2.25rem)] leading-[1.0278] font-bold tracking-[0.0289em] text-white uppercase"
          >
            {title}
          </h2>

          {/* The same `PopupButton` that triggers the popup, in its open skin —
              the export is literally that component's "+" rotated 45°. It is a
              controlled toggle here that only ever goes one way, so the click
              result is discarded. `label` gives it the accessible name "Close
              <title>". */}
          <div className="absolute top-1/2 right-5.5 -translate-y-1/2">
            <PopupButton label={title} open onClick={() => onClose()} />
          </div>
        </header>

        {/* `min-h-0` is load-bearing: a flex item's default `min-height:auto`
            floors it at its content's height, so without it the card grows past
            `max-h-[85dvh]` and this never scrolls. */}
        <div className="min-h-0 flex-1 overflow-y-auto px-16 py-2">{children}</div>
      </div>
    </dialog>
  );
}
