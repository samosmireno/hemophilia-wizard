import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useExitContent } from "./useExitContent";

const EXIT_MS = 150;

/**
 * Fake timers throughout: the whole point of this hook is *when* it stops
 * holding, and a real 150ms wait would make the suite both slow and flaky.
 *
 * `null` is closed — the hook takes one value rather than an `open` flag beside
 * one, so "shut" and "shut with stale content still in hand" cannot be spelled
 * differently by two callers.
 */
describe("useExitContent", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const setup = (value: string | null) =>
    renderHook(({ value }) => useExitContent(value, EXIT_MS), {
      initialProps: { value },
    });

  /** Nothing to hold before anything has opened — the value passes straight through. */
  it("returns the live value while it has never been open", () => {
    const { result, rerender } = setup(null);

    expect(result.current).toBeNull();

    rerender({ value: null });
    expect(result.current).toBeNull();
  });

  it("returns the live value while open", () => {
    const { result, rerender } = setup("panel");

    expect(result.current).toBe("panel");

    // Content swapping while open — one disclosure replacing another — is not
    // held back; only a close freezes anything.
    rerender({ value: "another panel" });
    expect(result.current).toBe("another panel");
  });

  /**
   * The bug the hook exists for: the caller empties its content on the very
   * render that closes, so the held value has to be in place immediately —
   * not one frame later, which would blank the card for the first frame of
   * the fade.
   */
  it("holds the last open value from the render that closes", () => {
    const { result, rerender } = setup("panel");

    rerender({ value: null });

    expect(result.current).toBe("panel");
  });

  it("releases the held value once the exit window has passed", () => {
    const { result, rerender } = setup("panel");
    rerender({ value: null });
    expect(result.current).toBe("panel");

    act(() => void vi.advanceTimersByTime(EXIT_MS - 1));
    expect(result.current).toBe("panel");

    act(() => void vi.advanceTimersByTime(1));
    expect(result.current).toBeNull();
  });

  /**
   * Reopening mid-fade shows the NEW content rather than finishing the old
   * one's exit — the `DisclosureBand` case where a second disclosure is clicked
   * while the first is still fading. A hold that ran to its timer regardless
   * would paint the previous panel inside the newly opened card.
   */
  it("shows new content when reopened mid-exit, and does not release it later", () => {
    const { result, rerender } = setup("first");
    rerender({ value: null });

    act(() => void vi.advanceTimersByTime(EXIT_MS / 2));
    rerender({ value: "second" });
    expect(result.current).toBe("second");

    // The in-flight timer from the interrupted close must not fire and clear
    // anything now that we are open again.
    act(() => void vi.advanceTimersByTime(EXIT_MS));
    expect(result.current).toBe("second");
  });

  /** A second close after a completed one holds again, rather than once ever. */
  it("holds again on a later close", () => {
    const { result, rerender } = setup("first");

    rerender({ value: null });
    act(() => void vi.advanceTimersByTime(EXIT_MS));
    expect(result.current).toBeNull();

    rerender({ value: "second" });
    rerender({ value: null });
    expect(result.current).toBe("second");
  });

  /**
   * The whole value is held, not a subset a caller assembled — the shape of the
   * bug this signature exists to prevent. `Popup` passes its entire `PopupCard`,
   * so a field added to that record is inside the hold by construction.
   */
  it("holds every field of an object value", () => {
    const card = { title: "Mechanisms", width: "narrow", content: "body" };
    const { result, rerender } = renderHook(({ value }) => useExitContent(value, EXIT_MS), {
      initialProps: { value: card as typeof card | null },
    });

    rerender({ value: null });

    expect(result.current).toEqual(card);
  });
});
