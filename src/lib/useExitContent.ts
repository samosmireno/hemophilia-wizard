import { useLayoutEffect, useRef, useState } from "react";

/**
 * Holds the last non-null value for `exitMs` after it goes `null`, so a caller
 * that drops its content on the same render that closes still has something to
 * paint while the exit animation runs. The window must match the CSS that
 * animates it; pass `MODAL_EXIT_MS`.
 *
 * **Nullability is the openness** — one argument, not an `open` flag beside a
 * value. Two parameters invited them to disagree: `Popup` used to pass
 * `{ title, subtitle, children }` here while reading `width` off the live prop,
 * so a narrow card snapped to the default width for the length of its own fade.
 * With one value there is no subset to assemble and nothing to leave out.
 */
export function useExitContent<T>(value: T | null, exitMs: number): T | null {
  const latest = useRef(value);
  const everOpened = useRef(false);

  const open = value !== null;

  useLayoutEffect(() => {
    if (!open) return;
    latest.current = value;
    everOpened.current = true;
  });

  const [held, setHeld] = useState<{ value: T | null } | null>(null);

  if (open && held) setHeld(null);

  useLayoutEffect(() => {
    if (open || !everOpened.current) return;

    setHeld({ value: latest.current });
    const timer = setTimeout(() => setHeld(null), exitMs);
    return () => clearTimeout(timer);
  }, [open, exitMs]);

  return !open && held ? held.value : value;
}
