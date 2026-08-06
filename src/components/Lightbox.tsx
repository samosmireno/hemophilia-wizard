import { type ReactNode } from "react";
import { PopupButton } from "mlg-components";

import { CLOSE_BUTTON_SIZE } from "./closeButton";
import ModalLayer from "./ModalLayer";

export default function Lightbox({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  /** The dialog's accessible name, and the ✕'s. Never painted. */
  title: string;
  onClose: () => void;
  children?: ReactNode;
}) {
  return (
    <ModalLayer open={open} onClose={onClose} aria-label={title} className="p-4 sm:p-8">
      {/* A caption must not widen it — callers state `w-0 min-w-full` on prose. */}
      <div className="flex max-h-full w-fit max-w-full flex-col items-center overflow-y-auto">
        {children}
      </div>

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <PopupButton label={title} open className={CLOSE_BUTTON_SIZE} onClick={() => onClose()} />
      </div>
    </ModalLayer>
  );
}
