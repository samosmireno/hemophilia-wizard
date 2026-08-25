/** Idle-tab guard: a route left open in a visible tab over lunch would otherwise
 *  swamp the average. 30 minutes matches GA4's own session timeout. */
export const MAX_STEP_SECONDS = 30 * 60;

export type StepReporter = (page: string, seconds: number) => void;

export interface StepTimer {
  /** A route became current: report the previous one, start this one's clock if the tab is visible. */
  enter(page: string, visible: boolean): void;
  /** Tab hidden or page hiding: report what has accrued now — the tab may never come back. */
  hide(): void;
  /** Tab visible again: resume the current route's clock. */
  show(): void;
  /** Stop for good: report what has accrued and forget the route. */
  end(): void;
}

/**
 * Foreground time on the current route, in whole seconds, reported in chunks —
 * on leaving the route and on every tab-hide, so a tab-switch mid-route splits
 * one visit into two reports (sums survive; see docs/analytics.md for the
 * per-route arithmetic). Pure: the clock is injected, the DOM wiring lives in
 * `useStepDuration`. Sub-second chunks are dropped, so redirect hops report nothing.
 */
export function createStepTimer(report: StepReporter, now: () => number): StepTimer {
  let page: string | null = null;
  let runningSince: number | null = null;
  let accruedMs = 0;

  function pause() {
    if (runningSince === null) return;
    accruedMs += now() - runningSince;
    runningSince = null;
  }

  function flush() {
    pause();
    const seconds = Math.min(Math.round(accruedMs / 1000), MAX_STEP_SECONDS);
    accruedMs = 0;
    if (page !== null && seconds >= 1) report(page, seconds);
  }

  return {
    enter(next, visible) {
      flush();
      page = next;
      if (visible) runningSince = now();
    },
    hide: flush,
    show() {
      if (page !== null && runningSince === null) runningSince = now();
    },
    end() {
      flush();
      page = null;
    },
  };
}
