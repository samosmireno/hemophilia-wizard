import { Button } from "mlg-components";
import { useNavigate } from "react-router";

import BrandLoop from "../components/BrandLoop";
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
 * Type sizes are the design's own 60 / 128 / 36 / 24px, and all four land on a
 * Tailwind step exactly: `text-6xl`, `text-9xl`, `text-4xl`, `text-2xl`.
 *
 * **These were `clamp()`s until 2026-08-04 and are now fixed sizes**, which is a
 * deliberate call and a costly one on a phone. The clamps existed so the
 * composition held together below the canvas — each reached the drawn value at
 * ~1440 and floored on a phone (the headline at 2.5rem, i.e. 40px against 128).
 * Without them the 128px headline sets "The Future Is Now:" in four lines at
 * 375px, fills the viewport, pushes the CTA under the sidebar's bottom bar and
 * makes the page scroll (853px against 800). Measured, not predicted. See
 * styling open item 33.
 *
 * The headline's leading stays the ratio 0.75 rather than the drawn 96px, which
 * costs nothing now the size is fixed and keeps the two in step if it moves again.
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
        <p className="font-display text-6xl leading-none font-normal">{ACTIVITY_CODE}</p>
        {/* One heading, split into two typographic halves — so the accessible
            name is the whole title, exactly as `ACTIVITY_TITLE` spells it. */}
        <h1 id="landing-heading" className="mt-2 max-w-280 font-display">
          <span className="block text-9xl leading-[0.75] font-bold">{ACTIVITY_TITLE_LEAD}</span>{" "}
          {/* The space is load-bearing, not formatting: without a text node
              between the two block spans the heading's accessible name runs the
              halves together. CSS discards white space between block boxes, so
              it costs no line box. */}
          <span className="mt-3 block text-4xl leading-tight font-normal text-balance">
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
          shell's padding is taken off. The override is the design's own 24px
          type and 64/18px padding, which is what the package ships less 2px of
          label.

          **This was a `clamp()` until 2026-08-04.** It floored at 1rem so the
          button stayed inside a phone; fixed at 24px it wraps to three lines at
          375 and, with the taller headline above it, lands under the sidebar's
          bottom bar. Styling open item 33.

          `leading-tight` is restated rather than inherited: tailwind-merge
          treats a font-size utility as resetting line-height, so passing a
          `text-*` class drops the component's own `leading-tight` and the label
          would fall back to whatever it inherits. The design's `leading-5` is
          deliberately not used — at 24px that is a 20px line box, and the label
          overlaps itself the moment it wraps.
        */}
        <Button
          className="mt-12 px-16 py-4.5 text-2xl leading-tight lg:mt-20"
          onClick={() => void navigate(next)}
        >
          LET’S GET STARTED
        </Button>
      </section>
    </>
  );
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
 * The footage itself — autoplay attributes, poster, the reduced-motion fallback —
 * is `BrandLoop`, which `education/DiseaseBackground` also crops into its
 * severity band. Everything specific to `/` stays here: full-bleed geometry and
 * the gradient over the top.
 *
 * `landing-loop.mp4` is a ping-pong of the delivered footage — see
 * docs/adr/0002-ping-pong-landing-loop.md for why, and docs/styling.md §7 for
 * the ffmpeg recipe.
 */
function LandingBackdrop() {
  return (
    <div
      aria-hidden="true"
      data-page-backdrop="landing"
      className="fixed inset-0 -z-10 overflow-hidden bg-white"
    >
      <BrandLoop />
      <div className="absolute inset-0 bg-page-landing" />
    </div>
  );
}
