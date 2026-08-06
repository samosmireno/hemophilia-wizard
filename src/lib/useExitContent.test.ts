import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useExitContent } from "./useExitContent";

const EXIT_MS = 150;

/**
 * Fake timers throughout: the whole point of this hook is *when* it stops
 * holding, and a real 150ms wait would make the suite both slow and flaky.
 */
describe("useExitContent", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const setup = (open: boolean, content: string) =>
    renderHook(({ open, content }) => useExitContent(open, content, EXIT_MS), {
      initialProps: { open, content },
    });

  /** Nothing to hold before anything has opened — the value passes straight through. */
  it("returns the live value while it has never been open", () => {
    const { result, rerender } = setup(false, "");

    expect(result.current).toBe("");

    rerender({ open: false, content: "still shut" });
    expect(result.current).toBe("still shut");
  });

  it("returns the live value while open", () => {
    const { result, rerender } = setup(true, "panel");

    expect(result.current).toBe("panel");

    // Content swapping while open — one disclosure replacing another — is not
    // held back; only a close freezes anything.
    rerender({ open: true, content: "another panel" });
    expect(result.current).toBe("another panel");
  });

  /**
   * The bug the hook exists for: the caller empties its content on the very
   * render that closes, so the held value has to be in place immediately —
   * not one frame later, which would blank the card for the first frame of
   * the fade.
   */
  it("holds the last open value from the render that closes", () => {
    const { result, rerender } = setup(true, "panel");

    rerender({ open: false, content: "" });

    expect(result.current).toBe("panel");
  });

  it("releases the held value once the exit window has passed", () => {
    const { result, rerender } = setup(true, "panel");
    rerender({ open: false, content: "" });
    expect(result.current).toBe("panel");

    act(() => void vi.advanceTimersByTime(EXIT_MS - 1));
    expect(result.current).toBe("panel");

    act(() => void vi.advanceTimersByTime(1));
    expect(result.current).toBe("");
  });

  /**
   * Reopening mid-fade shows the NEW content rather than finishing the old
   * one's exit — the `DisclosureBand` case where a second disclosure is clicked
   * while the first is still fading. A hold that ran to its timer regardless
   * would paint the previous panel inside the newly opened card.
   */
  it("shows new content when reopened mid-exit, and does not release it later", () => {
    const { result, rerender } = setup(true, "first");
    rerender({ open: false, content: "" });

    act(() => void vi.advanceTimersByTime(EXIT_MS / 2));
    rerender({ open: true, content: "second" });
    expect(result.current).toBe("second");

    // The in-flight timer from the interrupted close must not fire and clear
    // anything now that we are open again.
    act(() => void vi.advanceTimersByTime(EXIT_MS));
    expect(result.current).toBe("second");
  });

  /** A second close after a completed one holds again, rather than once ever. */
  it("holds again on a later close", () => {
    const { result, rerender } = setup(true, "first");

    rerender({ open: false, content: "" });
    act(() => void vi.advanceTimersByTime(EXIT_MS));
    expect(result.current).toBe("");

    rerender({ open: true, content: "second" });
    rerender({ open: false, content: "" });
    expect(result.current).toBe("second");
  });
});
