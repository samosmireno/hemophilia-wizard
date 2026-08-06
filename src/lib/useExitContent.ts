import { useLayoutEffect, useRef, useState } from "react";

/**
 * The window must match the CSS that animates it; pass `MODAL_EXIT_MS`.
 */
export function useExitContent<T>(open: boolean, content: T, exitMs: number): T {
  const latest = useRef(content);
  const everOpened = useRef(false);

  useLayoutEffect(() => {
    if (!open) return;
    latest.current = content;
    everOpened.current = true;
  });

  const [held, setHeld] = useState<{ value: T } | null>(null);

  if (open && held) setHeld(null);

  useLayoutEffect(() => {
    if (open || !everOpened.current) return;

    setHeld({ value: latest.current });
    const timer = setTimeout(() => setHeld(null), exitMs);
    return () => clearTimeout(timer);
  }, [open, exitMs]);

  return !open && held ? held.value : content;
}
