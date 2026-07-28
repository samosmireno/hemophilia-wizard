import { useState } from "react";
import { Button } from "mlg-components";
import { useNavigate } from "react-router";

import loopUrl from "../assets/landing-loop.mp4";
import posterUrl from "../assets/landing-poster.jpg";
import { ACTIVITY_CODE, ACTIVITY_TITLE_LEAD, ACTIVITY_TITLE_TAIL } from "../data/activity";
import { nextOf } from "../data/sectionOrder";

/**
 * `/` — standalone landing page (issue 17), intentionally not a redirect to
 * `/education`. A full-bleed hero over the looping backdrop (issue 19): the
 * activity code, the title, and a single call to action.
 *
 * The five section entry points issue 17 originally specified are deliberately
 * NOT here. `AppSidebar` already jumps to Wizard, Acronyms, References and
 * Glossary, and ADR 0001 makes the app a linear walkthrough in which `/` is
 * step 0 — a card grid would be a second, competing navigation.
 *
 * Type sizes are the design's raw Tailwind steps (60 / 128 / 36 / 24px) rather
 * than the `text-h1`…`text-small` scale, which tops out at 52px. They are
 * wrapped in `clamp()` so the composition holds together on a phone: each one
 * reaches the design's exact value at ~1440px and stops there. The headline's
 * leading is the design's 96px expressed as the ratio 0.75 — a fixed leading is
 * meaningless once the size moves. See docs/styling.md §8.
 */
export default function Landing() {
  const navigate = useNavigate();

  /**
   * The CTA goes wherever the walkthrough goes — the same computation the
   * sidebar's Next arrow makes on this page, so the two can never disagree
   * about what follows `/`. Non-null because `/` is `SECTION_ORDER[0]` and the
   * array has more than one entry; a fallback path here would be a second,
   * unverified answer to the same question.
   */
  const next = nextOf("/")!;

  return (
    <>
      <LandingBackdrop />
      <section
        aria-labelledby="landing-heading"
        className="flex flex-1 flex-col items-center justify-center text-center text-white"
      >
        {/* Outside the <h1>: the activity code identifies the CME activity, it
            is not part of its title. */}
        <p className="font-display text-[clamp(1.5rem,4.2vw,3.75rem)] leading-none font-normal">
          {ACTIVITY_CODE}
        </p>
        {/* One heading, split into two typographic halves — so the accessible
            name is the whole title, exactly as `ACTIVITY_TITLE` spells it. */}
        <h1 id="landing-heading" className="mt-2 max-w-280 font-display">
          <span className="block text-[clamp(2.5rem,9vw,8rem)] leading-[0.75] font-bold">
            {ACTIVITY_TITLE_LEAD}
          </span>{" "}
          {/* The space is load-bearing, not formatting: without a text node
              between the two block spans the heading's accessible name runs the
              halves together. CSS discards white space between block boxes, so
              it costs no line box. */}
          <span className="mt-3 block text-[clamp(1.125rem,2.5vw,2.25rem)] leading-tight font-normal text-balance">
            {ACTIVITY_TITLE_TAIL}
          </span>
        </h1>
        {/*
          A destination rendered as a `<button>`: `Button` has no `href` or
          `render` escape hatch, unlike `SidebarItem` (mlg-components 0.5.0), so
          this costs cmd-click and "open in new tab". Accepted knowingly —
          nobody opens step 1 of a walkthrough in a background tab — and
          recorded as `.scratch/mlg-reskin/issues/06-package-debts.md` debt 5.

          The component is a single fixed scale (`px-16 py-[18px] text-[26px]`),
          which is 370px wide at a 24px label — wider than a 375px phone once the
          shell's padding is taken off. So the size is overridden with the same
          `clamp()` treatment as the hero above it, tuned to land on the design's
          24px type and 64/18px padding at ~1440px. A CTA that stayed fixed while
          the headline over it scaled would drift out of proportion at every
          width between.

          `leading-tight` is restated rather than inherited: tailwind-merge
          treats a font-size utility as resetting line-height, so passing a
          `text-*` class drops the component's own `leading-tight` and the label
          would fall back to whatever it inherits. The design's `leading-5` is
          deliberately not used — at 24px that is a 20px line box, and the label
          overlaps itself the moment it wraps.
        */}
        <Button
          className="mt-12 px-[clamp(2rem,4.4vw,4rem)] py-[clamp(0.75rem,1.25vw,1.125rem)] text-[clamp(1rem,1.7vw,1.5rem)] leading-tight lg:mt-20"
          onClick={() => void navigate(next)}
        >
          LET’S GET STARTED
        </Button>
      </section>
    </>
  );
}

/** True when the OS asks for reduced motion. Read once, at mount — see below. */
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The `/`-only backdrop: looping footage with the landing gradient washed over
 * it. Structurally a sibling of `AppShell`'s default backdrop rather than a
 * replacement for it — same `fixed inset-0 -z-10`, later in DOM order, so it
 * paints on top and `bg-page` never shows. Both land in one React commit (this
 * is the `<Outlet />` child), so there is no frame where the mint gradient is
 * visible alone.
 *
 * Composition is plain source-over, and that is not a guess: sampling the
 * designer's reference against the raw footage, `0.77 * teal-75 + 0.23 * video`
 * reproduces it to within 3/255. So `bg-page-landing` goes over the video
 * untouched — no `mix-blend-mode`, no filter, no second tint layer. It has to be
 * a sibling element rather than a background on the wrapper, because an
 * element's own background paints *behind* its children.
 *
 * The wrapper is grounded `bg-white`: the gradient's stops are 77% alpha and
 * were authored against the white page canvas, so before the video decodes `/`
 * looks exactly as it did prior to this feature rather than flashing an
 * invented colour.
 *
 * `autoPlay muted playsInline` is the full set browsers require — Chrome blocks
 * unmuted autoplay and iOS Safari additionally requires `playsinline`. The clip
 * carries no audio track at all, so `muted` costs nothing. Note that autoplay is
 * refused outright under iOS Low Power Mode whatever the attributes say, which
 * makes the poster a state a real share of visitors will see rather than a
 * loading detail — it is frame 0, so under the gradient it reads as the intended
 * composite, not as a placeholder.
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
 * `landing-loop.mp4` is a ping-pong of the delivered footage — see
 * docs/adr/0002-ping-pong-landing-loop.md for why, and docs/styling.md §7 for
 * the ffmpeg recipe.
 */
function LandingBackdrop() {
  const [reduced] = useState(prefersReducedMotion);

  return (
    <div
      aria-hidden="true"
      data-page-backdrop="landing"
      className="fixed inset-0 -z-10 overflow-hidden bg-white"
    >
      {reduced ? (
        <img src={posterUrl} alt="" className="size-full object-cover" />
      ) : (
        <video
          src={loopUrl}
          poster={posterUrl}
          autoPlay
          muted
          loop
          playsInline
          className="size-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-page-landing" />
    </div>
  );
}
