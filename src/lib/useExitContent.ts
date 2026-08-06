import { useLayoutEffect, useRef, useState } from "react";

/**
 * What to render for something that is fading out: the live value while it is
 * open, the **last open value** for as long as the exit runs, and the live value
 * again once that window has passed.
 *
 * **The problem it solves is that "closed" and "empty" arrive together.** Every
 * modal caller in this app derives its content from *which* thing is open, so
 * the content goes on the same render the dialog closes — `DisclosureBand`
 * passes `undefined` children and an empty title, `DrugSheetPopup` resolves no
 * sheet, `fviiia-mimetics` unmounts each card body behind `openId === …`. That
 * was invisible while closing was instant. With an exit fade it is 150ms of
 * empty card under a blank band, which is worse than no animation at all.
 *
 * **Held for a window, not kept forever.** The obvious fix — snapshot the last
 * value and keep rendering it — is wrong in a way that only shows up later: the
 * held subtree stays *mounted*, so `fviiia-mimetics` would keep four card
 * bodies and their nested figure dialogs alive for the life of the page, and
 * the deliberate `openId === …` unmounting at those call sites would silently
 * stop meaning anything. Releasing on a timer puts the tree back exactly as it
 * was before the fade started.
 *
 * **A timer rather than a `transitionend` listener**, because the listener is
 * the one that can never fire: under `prefers-reduced-motion` the transition is
 * `none`, and a caller whose CSS never animates would hold its content for
 * good. A timer is unconditional, and holding a hidden subtree an extra 150ms
 * under reduced motion costs nothing — the element is `display: none` by then.
 *
 * The window must match the CSS that animates it; pass `MODAL_EXIT_MS` and see
 * its own note on the two being one number.
 */
export function useExitContent<T>(open: boolean, content: T, exitMs: number): T {
  /**
   * The last value seen while open, and whether there has ever been one.
   *
   * **Recorded in an effect rather than during render**, which is not merely
   * the lint rule's preference: the alternative of keeping this in state and
   * syncing it during render re-renders forever here. `content` is a fresh
   * object every time — `Popup` bundles `{title, subtitle, children}`, and
   * `children` is a new element on each of its callers' renders — so a
   * `held !== content` guard is never false while open.
   */
  const latest = useRef(content);
  const everOpened = useRef(false);

  useLayoutEffect(() => {
    if (!open) return;
    latest.current = content;
    everOpened.current = true;
  });

  /** The frozen value, boxed so that holding `undefined` is still "holding". */
  const [held, setHeld] = useState<{ value: T } | null>(null);

  /**
   * Opening ends any window still running, which is what makes a reopen
   * mid-fade show the new content rather than finish the old one's exit.
   *
   * Done during render — React's "adjusting state when props change" — rather
   * than in the effect below, and the reason is not only that an effect may not
   * setState synchronously. Clearing here means a *later* close can never read
   * a stale box: `held` is already null by the time the closing render runs, so
   * the value this returns is the one the effect is about to freeze rather than
   * the previous cycle's. It terminates on the next pass, since `held` is then
   * null and the condition is false.
   */
  if (open && held) setHeld(null);

  /**
   * **A layout effect, so the freeze lands before the browser paints.** A
   * passive `useEffect` runs after paint, which would show one frame of the
   * emptied card at the very start of the fade — a flicker instead of the blank
   * card, i.e. the same bug made brief rather than fixed. Setting state from a
   * layout effect re-renders synchronously ahead of the paint, so the first
   * frame of the exit already has the held content in it.
   *
   * The cleanup is what cancels an in-flight window when `open` flips back, so
   * the timer from an interrupted close cannot fire against a reopened card.
   */
  useLayoutEffect(() => {
    // Nothing to hold while open, and nothing to hold for something that has
    // never opened — without the second guard every mounted-but-shut `Popup`
    // would run a pointless timer on mount.
    if (open || !everOpened.current) return;

    setHeld({ value: latest.current });
    const timer = setTimeout(() => setHeld(null), exitMs);
    return () => clearTimeout(timer);
  }, [open, exitMs]);

  return !open && held ? held.value : content;
}
