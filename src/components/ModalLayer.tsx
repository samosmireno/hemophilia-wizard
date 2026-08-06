import { type ReactNode, useEffect, useRef } from "react";

import { cn } from "../lib/cn";

/**
 * How long the exit fade runs, in milliseconds. This and the `duration-150` on
 * the closed state below are one number stated twice, and they must agree.
 */
export const MODAL_EXIT_MS = 150;

export default function ModalLayer({
  open,
  onClose,
  className,
  children,
  ...labelling
}: {
  open: boolean;
  onClose: () => void;
  className?: string;
  children?: ReactNode;
} & (
  | { "aria-label": string; "aria-labelledby"?: never }
  /** A space-separated id list, not `cn()`. */
  | { "aria-labelledby": string; "aria-label"?: never }
)) {
  const ref = useRef<HTMLDialogElement>(null);

  // Guards the backdrop click against a text selection that starts inside the
  // content and ends outside it.
  const pressedBackdrop = useRef(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    // Guarded both ways: showModal() on an already-open dialog throws, and
    // React may re-run this effect without `open` having actually changed.
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    // `hidden open:grid` and `size-full` both fight the UA dialog stylesheet,
    // and BOTH are load-bearing.
    <dialog
      ref={ref}
      {...labelling}
      /* Not belt-and-braces: Chrome puts nested dialogs in one CloseWatcher group,
         so without this one ESC closes both. preventDefault stops the close
         watcher; stopPropagation stops an enclosing ModalLayer seeing the key. */
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      /* Fallback for `cancel` without our keydown (no CloseWatcher; jsdom). It
         preventDefaults so the element never closes itself behind React's back. */
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
        /* `overlay` in the transition property list is load-bearing: without it
           the exiting layer leaves the top layer at once and is re-clipped by the
           ancestors it escaped. `pointer-events-none` while closed is a
           consequence of the exit, not polish — the fading layer would otherwise
           swallow the first click aimed at the page under it. */
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
