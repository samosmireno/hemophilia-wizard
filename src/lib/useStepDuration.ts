import { useEffect, useState } from "react";

import { trackStepDuration } from "./analytics";
import { createStepTimer } from "./stepTimer";

/**
 * Report foreground seconds per route as `step_duration` — the "use time" the
 * client asked for (2026-08-25), measured here because GA4's own engagement
 * time credits a route's reading time to the *next* route's pageview in an SPA.
 * Mount once, in `AppShell`, and feed it the current pathname.
 */
export function useStepDuration(pathname: string) {
  const [timer] = useState(() => createStepTimer(trackStepDuration, () => performance.now()));

  useEffect(() => {
    timer.enter(pathname, document.visibilityState === "visible");
  }, [timer, pathname]);

  useEffect(() => {
    // `visibilitychange` → hidden is the last reliable signal on mobile, where a
    // backgrounded tab can be killed without ever firing `pagehide`.
    const onVisibility = () =>
      document.visibilityState === "hidden" ? timer.hide() : timer.show();
    const onHide = () => timer.hide();
    const onShow = () => timer.show();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onHide);
    window.addEventListener("pageshow", onShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("pageshow", onShow);
      timer.end();
    };
  }, [timer]);
}
