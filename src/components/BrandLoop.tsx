import { useState } from "react";

import loopUrl from "../assets/landing-loop.mp4";
import posterUrl from "../assets/landing-poster.jpg";
import { cn } from "../lib/cn";

/** True when the OS asks for reduced motion. Read once, at mount — see below. */
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The brand's looping footage as a decorative layer, cropped to whatever box the
 * caller gives it (`object-cover`). It paints nothing else — no tint, no
 * positioning — because its two callers frame it differently: `Landing` fills the
 * viewport with it under `bg-page-landing`, `education/DiseaseBackground` crops
 * it into the severity band.
 *
 * Named for the brand rather than the route now that it is not `/`-only; the
 * asset keeps its `landing-loop` filename, which is where it was first used and
 * what docs/adr/0002-ping-pong-landing-loop.md and docs/styling.md §7 call it.
 *
 * `autoPlay muted playsInline` is the full set browsers require — Chrome blocks
 * unmuted autoplay and iOS Safari additionally requires `playsinline`. The clip
 * carries no audio track at all, so `muted` costs nothing. Note that autoplay is
 * refused outright under iOS Low Power Mode whatever the attributes say, which
 * makes the poster a state a real share of visitors will see rather than a
 * loading detail — it is frame 0, so it reads as the intended composite rather
 * than as a placeholder.
 *
 * Declarative `autoPlay` beats a `ref.current.play()` effect here for a second
 * reason: jsdom implements no media playback, so the effect form throws "Not
 * implemented" through the whole suite.
 *
 * Under `prefers-reduced-motion: reduce` the `<video>` is not mounted at all —
 * not mounted-and-paused — which also skips the 1.9 MB fetch. The still shown
 * instead is the same poster frame, so the two motionless paths agree. The query
 * is read once at mount with no `change` listener: the setting effectively never
 * moves mid-session, and subscribing would mean `useSyncExternalStore` for a
 * decorative layer.
 *
 * Decorative in both placements, so it is hidden from the accessibility tree
 * here rather than at each call site — `alt=""` does that job for the still, and
 * `aria-hidden` is what does it for the video.
 */
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
