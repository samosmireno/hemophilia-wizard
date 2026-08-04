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
 * Tailwind step exactly: `text-6xl`, `text-9xl`, `text-4xl`, `text-2xl`. Those
 * are the **`xl:` values** — a four-step ramp carries each line down from there
 * (docs/styling.md §8):
 *
 * |                    | base | `sm:` | `lg:` | `xl:` |
 * | ------------------ | ---- | ----- | ----- | ----- |
 * | `HM-85L`           |   24 |    36 |    48 |    60 |
 * | `The Future Is Now:` | 48 |    72 |    96 |   128 |
 * | `Personalizing …`  |   14 |    20 |    30 |    36 |
 * | `LET’S GET STARTED`|   16 |    18 |    20 |    24 |
 *
 * Two things are load-bearing about those numbers.
 *
 * **The drawn values arrive at `xl:` (1280), not `lg:`.** The 128px headline is
 * ~1000px wide, and the content column `AppShell` gives it is 1024 − 112 − 160 =
 * 752px at `lg` against 1008px at `xl`. Attaching the top step to `lg` would put
 * the drawn headline in a column that cannot hold it, breaking the composition at
 * exactly the width where the sidebar becomes a rail. 1280 ≤ the 1440 canvas, so
 * **1440 is unaffected**.
 *
 * **The first three lines hold their drawn proportions at every step** — eyebrow
 * ÷ headline stays 0.47–0.50 and subtitle ÷ headline 0.28–0.31 all the way down,
 * so the hero is one composition scaled rather than three lines resized. The CTA
 * is deliberately NOT in that ratio: at 0.19 × a 48px headline its label would be
 * 9px. It is a control with a legibility floor, not a fourth line of type, so it
 * ramps on its own.
 *
 * These were `clamp()`s until 2026-08-04, then fixed sizes for the length of one
 * commit — which regressed the page below `lg` (the 128px headline set in four
 * lines at 375px, filled the viewport, pushed the CTA under the sidebar's bottom
 * bar and made the page scroll, 853px against 800). §8 held that a ramp "steps
 * all three at once and looks broken between stops"; holding the ratios above is
 * what answers that, and the column measurement is what settled where the top
 * step goes. Nothing here is a `clamp()` or an arbitrary size — every value is a
 * named Tailwind step.
 *
 * **Line-height is written as a slash modifier on every step.** That is a
 * choice, not a necessity, and the comment here claimed otherwise until
 * 2026-08-04: a bare `leading-[0.75]` would NOT have been overridden by
 * `sm:text-7xl`. A Tailwind v4 `leading-*` compiles to `--tw-leading:.75` as
 * well as a `line-height`, every `text-<size>` compiles to
 * `line-height:var(--tw-leading,<its own>)`, and a custom property is not scoped
 * to the media query a step arrives in — so one `leading-*` covers a whole ramp.
 * Verified in the built CSS (docs/styling.md §8). Restating it per step is kept
 * because four sizes reading one property at a distance is the thing that goes
 * wrong silently when someone edits one line, but it buys clarity, not
 * correctness.
 *
 * The CTA below is the case where the modifier IS required, for an unrelated
 * reason — see its own comment.
 *
 * The headline's leading is still the ratio 0.75 (= 96/128) rather than the
 * drawn 96px, which is load-bearing rather than merely tidy: the size moves at
 * three breakpoints.
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
        <p className="font-display text-2xl/none font-normal sm:text-4xl/none lg:text-5xl/none xl:text-6xl/none">
          {ACTIVITY_CODE}
        </p>
        {/* One heading, split into two typographic halves — so the accessible
            name is the whole title, exactly as `ACTIVITY_TITLE` spells it. */}
        <h1 id="landing-heading" className="mt-2 max-w-280 font-display">
          <span className="block text-5xl/[0.75] font-bold sm:text-7xl/[0.75] lg:text-8xl/[0.75] xl:text-9xl/[0.75]">
            {ACTIVITY_TITLE_LEAD}
          </span>{" "}
          {/* The space is load-bearing, not formatting: without a text node
              between the two block spans the heading's accessible name runs the
              halves together. CSS discards white space between block boxes, so
              it costs no line box. */}
          <span className="mt-3 block text-sm/tight font-normal text-balance sm:text-xl/tight lg:text-3xl/tight xl:text-4xl/tight">
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
          shell's padding is taken off. The `xl:` override is the design's own
          24px type and 64/18px padding, which is what the package ships less 2px
          of label.

          **The padding ramps with the label, and that is not decoration.** Type
          alone would leave a 16px label inside 64px of horizontal padding on a
          phone — a 268px pill in a 311px column, almost all of it air. So the
          package's one fixed scale becomes four:

              base  px-8  py-3     sm:  px-12 py-3.5
              lg:   px-14 py-4     xl:  px-16 py-4.5

          The label does NOT hold the hero's proportions (see the ratio note on
          the component above); a control has a legibility floor that a headline
          does not, so 16px is where it stops.

          Line-height is a slash modifier rather than a `leading-tight`
          alongside, and here that IS required — for a tailwind-merge reason
          rather than the CSS one the component doc-comment used to give.
          tailwind-merge lists `leading` as conflicting with `font-size`, so the
          `text-*` classes passed in strip the package's own `leading-tight`
          before the browser ever sees them, and the label would inherit whatever
          it finds. Restating it per step is what puts the value back. The
          design's `leading-5` is deliberately not used — at 24px that is a 20px
          line box, and the label overlaps itself the moment it wraps.
        */}
        <Button
          className="mt-12 px-8 py-3 text-base/tight sm:px-12 sm:py-3.5 sm:text-lg/tight lg:mt-20 lg:px-14 lg:py-4 lg:text-xl/tight xl:px-16 xl:py-4.5 xl:text-2xl/tight"
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
