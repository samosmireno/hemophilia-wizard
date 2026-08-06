import { type ReactNode, useEffect, useRef } from "react";

import { cn } from "../lib/cn";

/**
 * How long the exit fade runs, in milliseconds.
 *
 * **This and the `duration-150` on the closed state below are one number stated
 * twice, and they must agree.** The CSS runs the animation; this is what tells a
 * caller how long the fading card still has to be *rendered* for. Set this
 * shorter than the CSS and the content blanks mid-fade — the exact bug the
 * retention exists to fix; set it longer and the subtree lingers, hidden, past
 * the point anything can see it.
 *
 * Exported rather than duplicated because the only consumer is `Popup`, which
 * cannot read a Tailwind class. See `useExitContent`.
 */
export const MODAL_EXIT_MS = 150;

/**
 * The `<dialog>` itself: a transparent, viewport-filling layer with a scrim,
 * and the four behaviours every modal in this app needs. It draws nothing.
 *
 * Extracted from `Popup` when the §7.5 figure wanted the same machinery without
 * the card — the crimson band and border are one presentation of a modal, not
 * the definition of one. `Popup` is this plus that card; `Lightbox` is this plus
 * a centred picture.
 *
 * **A real `<dialog>` opened with `showModal()`**, not a positioned div. Three
 * things then come from the platform rather than from code: the focus trap, the
 * top layer, and focus restoration on close. The top layer is what makes this
 * work at all in its first caller — `DisclosureBand` wraps its content in
 * `isolate` + `overflow-hidden` to clip the arch, and any in-flow panel large
 * enough to be a card would be cut by it. A modal dialog escapes every
 * ancestor's clipping and stacking context by definition, so it also clears
 * `TopRule`'s `z-30` band and the sidebar's z-40/z-50 chrome without owning a
 * z-index of its own.
 *
 * **It nests.** `fviii-mimetics` opens a figure inside a card, and closing the
 * inner one leaves the outer standing — see the three reasons in docs/styling.md
 * §13. Two of them live here: the `cancel` handler is attached to the element
 * rather than delegated, and the backdrop guard compares against
 * `currentTarget`, which a descendant dialog's click fails.
 *
 * **`open` is the single source of truth.** The `cancel` handler
 * preventDefaults, so the element never closes itself behind React's back — ESC
 * routes through `onClose` like every other close, and the two cannot disagree.
 *
 * **It fades and scales both ways, and that is CSS on the `[open]` flip** — no
 * JS timing and nothing awaiting an animation, so the sentence above stays
 * true. `close()` is still called the moment `open` goes false; the exit is the
 * platform holding a closed element painted, not this component deferring the
 * close. See the class list, and `MODAL_EXIT_MS` for the one thing a caller
 * owes the exit.
 */
export default function ModalLayer({
  open,
  onClose,
  className,
  children,
  ...labelling
}: {
  open: boolean;
  /** Called for all close routes: ESC, a backdrop click, and the caller's ✕. */
  onClose: () => void;
  /** Layout for the layer's grid — how the content sits in the viewport. */
  className?: string;
  children?: ReactNode;
} & (
  | { "aria-label": string; "aria-labelledby"?: never }
  /**
   * A space-separated id list, not `cn()`: that helper runs tailwind-merge,
   * which is entitled to reorder or drop tokens it recognises — harmless for
   * classes, silent breakage for an accessible name.
   */
  | { "aria-labelledby": string; "aria-label"?: never }
)) {
  const ref = useRef<HTMLDialogElement>(null);

  /**
   * Guards the backdrop click against a text selection that starts inside the
   * content and ends outside it: a click event's target is the *common ancestor*
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
   *
   * Nests correctly: an inner layer captures `hidden` as its "previous" value
   * and restores that, leaving the outer one's own cleanup to restore the real
   * page value.
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
    // The element is a transparent, viewport-filling layer rather than the
    // content, so a click anywhere outside is a click on *it* — the ::backdrop
    // pseudo-element is not an event target, so a dialog sized to its own
    // content has no way to hear one. The scrim shows through.
    //
    // Two classes here fight the UA stylesheet's `dialog` rules, and BOTH are
    // load-bearing — dropping either one reproduces a bug this already had:
    //
    // - `hidden open:grid`, never a bare `grid`. The UA hides a closed dialog
    //   with `dialog:not([open]) { display: none }`, and ANY author `display`
    //   beats a UA one regardless of specificity — so a bare `grid` leaves an
    //   empty, unclosable panel painted over the page from first render.
    // - `size-full`, because the UA sizes a dialog `width/height: fit-content`.
    //   `inset-0` cannot defeat that (insets only stretch an element whose size
    //   is `auto`), so without it the layer shrinks onto the content and pins
    //   itself to the top-left instead of centring in the viewport.
    <dialog
      ref={ref}
      {...labelling}
      /*
        **ESC is handled here, ahead of the platform, and that is not belt-and-
        braces.** Chrome routes a dialog's Escape through a CloseWatcher, and
        nested dialogs land in a single close-watcher *group* — one Escape then
        closes every dialog in the group at once. Verified in Chromium: opening
        the §7.5 figure over its card and pressing ESC fired exactly one `cancel`
        event, on the inner dialog, and left both closed. There is no outer
        `cancel` to preventDefault, so `onCancel` alone cannot fix it.

        Both calls are load-bearing and neither is redundant:

        - `preventDefault` is what stops the close watcher. The close request is
          only processed if the keydown was not canceled, so cancelling it takes
          the whole group out of the platform's hands.
        - `stopPropagation` is what stops an *enclosing* `ModalLayer` seeing the
          same keypress bubble past. Without it the card's own handler runs on
          the same ESC and closes it a different way.

        `onClose` then drives the close through `open`, like the ✕ and the
        backdrop do — so all three routes agree and ESC dismisses exactly one
        layer, the topmost.
      */
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      /*
        Kept as the fallback for anything that reaches `cancel` without a keydown
        of ours first — a browser with no CloseWatcher, where ESC fires `cancel`
        on the topmost dialog directly, and jsdom, which implements no dialog
        behaviour at all and is dispatched a `cancel` by the tests.

        It preventDefaults for the reason it always did: the element must never
        close itself behind React's back, so `open` and the DOM cannot disagree.
      */
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
      className={cn(
        "fixed inset-0 m-0 hidden size-full max-h-none max-w-none place-items-center border-0 bg-transparent p-0 backdrop:bg-black/50 open:grid",
        /*
          Enter and exit, and all of it is CSS on the `[open]` flip — the layer
          fades from transparent and grows from 0.95, and the scrim fades under
          it. The layer is what scales, and the content is centred in it, so
          what reads is the card growing into place.

          Three platform pieces carry it, and each degrades to an instant
          open/close where unsupported rather than breaking:

          - **`starting:*` is `@starting-style`, and it is required rather than
            belt-and-braces.** `display` goes `none → grid` on open, so the
            element has no previously-rendered style to transition FROM;
            without a starting style there is nothing to interpolate and the
            entry is a hard cut with every transition here still in place.
          - **`transition-discrete` (`transition-behavior: allow-discrete`)
            plus `display` and `overlay` in the property list is the exit.**
            `close()` drops `[open]` immediately — the platform still gets its
            close event on time, and the scroll lock still lifts on it — but
            the discrete transition holds the rendered `display` and the
            top-layer membership until the fade finishes. `overlay` is the
            load-bearing half: without it the element leaves the top layer at
            once and is re-clipped by the ancestors it escaped, so a
            `DisclosureBand` card would vanish into the arch's `overflow-hidden`
            instead of fading.
          - The `::backdrop` needs its own copy of every state because it does
            not inherit from the dialog.

          **220ms in, 150ms out**, both on the app's existing duration scale
          (`OptionGroup` 120, `ExpandableFigure` 150, `Therapies` 220), and out
          faster than in because a dismissal is a confirmation rather than
          content to read. A transition takes its duration from the state it is
          heading TO, so the base `duration-150` times the exit and
          `open:duration-220` the entry — one pair of classes, both directions.

          **`pointer-events-none` while closed is a consequence of the exit,
          not polish.** For those 150ms the layer is still a full-viewport paint
          target, but `[open]` is gone, so the page behind it is no longer
          inert — without this the fading scrim would swallow the first click
          aimed at the page under it. (The `::backdrop` was never a hit target;
          see the element comment above.)

          `motion-reduce` drops both transitions and restores the instant
          open/close this component has always had.
        */
        "pointer-events-none scale-95 opacity-0 open:pointer-events-auto open:scale-100 open:opacity-100 starting:open:scale-95 starting:open:opacity-0",
        "transition-[opacity,scale,display,overlay] transition-discrete duration-150 ease-out open:duration-220 motion-reduce:transition-none",
        "backdrop:opacity-0 open:backdrop:opacity-100 starting:open:backdrop:opacity-0",
        "backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-150 backdrop:ease-out open:backdrop:duration-220 motion-reduce:backdrop:transition-none",
        className,
      )}
    >
      {children}
    </dialog>
  );
}
