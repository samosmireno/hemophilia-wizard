import { useState } from "react";

import loopUrl from "../assets/landing-loop.mp4";
import posterUrl from "../assets/landing-poster.webp";
import { cn } from "../lib/cn";

/** True when the OS asks for reduced motion. Read once, at mount. */
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function BrandLoop({ className }: { className?: string }) {
  const [reduced] = useState(prefersReducedMotion);
  const classes = cn("size-full object-cover", className);

  return reduced ? (
    <img src={posterUrl} alt="" className={classes} />
  ) : (
    <video
      src={loopUrl}
      poster={posterUrl}
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
      className={classes}
    />
  );
}
