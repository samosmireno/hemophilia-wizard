import { Button } from "mlg-components";
import { useNavigate } from "react-router";

import BrandLoop from "../components/BrandLoop";
import { nextOf } from "../data/sectionOrder";
import { WIZARD_ENTRY_PROMPT, WIZARD_INPUT_TITLE } from "../data/wizard";

/**
 * `/wizard-intro` — the step that hands the learner off from the last education
 * chapter into the wizard. Its own spine step (between
 * `/education/prophylaxis-guidance` and `/wizard`), not an education chapter and
 * not part of `/wizard` itself.
 *
 * The artboard is a title card: the blueprint's entry-node line in crimson over
 * the brand footage, and one button into the wizard proper. Structurally it is
 * `Landing` — a centred hero over a page-specific backdrop — which is why the
 * two share `BrandLoop` and the CTA-goes-where-the-spine-goes rule rather than
 * either restating it.
 */
export default function WizardIntro() {
  /**
   * The CTA goes wherever the walkthrough goes, exactly as on `/`, so it and the
   * sidebar's Next arrow cannot disagree about what follows this page. Non-null
   * because `/wizard-intro` is in `SECTION_ORDER` and is not its last entry.
   */
  const next = nextOf("/wizard-intro")!;

  const navigate = useNavigate();

  return (
    <>
      <IntroBackdrop />

      {/*
        `flex-1` + `justify-center` centres the card in the shell's padded box,
        which is what the artboard draws: the block's ink spans y 269–566 on the
        1440 × 800 canvas, centre 417, against the padded box's centre of 423.
        `AppShell` mounts every page inside a `flex flex-1 flex-col` wrapper on a
        `min-h-dvh` column precisely so a page can opt into this; `Landing` and
        `education/ProphylaxisGuidance` are the other callers.

        The artboard centres on the full canvas (measured centre 722 of 1440),
        i.e. on the viewport rather than on the content column — the shell's
        right gutter clears the sidebar rail, so centring here sits ~24px left of
        the drawn position. That is `Landing`'s behaviour too, and it is the
        cheaper of the two: honouring the canvas exactly would mean a page
        breaking out of the shell's padding, i.e. re-deriving the rail's width.
      */}
      <section
        aria-labelledby="wizard-intro-heading"
        className="flex flex-1 flex-col items-center justify-center text-center"
      >
        {/*
          72px/1.05 bold, measured off the export (cap height 51.1px on the 1440
          canvas ÷ Barlow Condensed's 0.72 cap ratio; line pitch 74.9px = 1.05,
          which is the old `h1` step's own ratio one size up). Raw rather than a scale
          step under docs/styling.md §8's precedent: the scale tops out at 52px
          and this card is set well above it, the same call `Landing` makes for
          its hero. 72px is `text-7xl` exactly.

          **This was a `clamp()` until 2026-08-04**, floored at 2.5rem so the
          card held together below the canvas instead of taking the whole screen.
          Fixed at 72px it no longer does; styling open item 33.

          `max-w-3xl` (768px) is what reproduces the artboard's line breaks —
          "EXPLORE NOVEL / PROPHYLACTIC THERAPY / OPTIONS FOR YOUR PATIENT" —
          without hard-coding them into the copy: the drawn last line measures
          729px and the first two words plus "PROPHYLACTIC" would run to ~830px,
          so any cap between those two wraps exactly where the designer did.
          768px is the midpoint of that window, i.e. the setting least likely to
          flip a line if the font rounds differently than measured.

          Uppercase is CSS, not copy — the accessible name stays the title case
          the blueprint writes, as on every education chapter.
        */}
        <h1
          id="wizard-intro-heading"
          className="max-w-3xl font-display text-7xl leading-[1.05] font-bold text-brand-crimson-50 uppercase"
        >
          {WIZARD_ENTRY_PROMPT}
        </h1>

        {/*
          The label is the artboard's, not the blueprint's — it names this
          button's destination (the wizard's patient questions) and exists
          nowhere in CONTEXT.md. Unlike `Landing`'s "LET'S GET STARTED", though,
          it is not a literal: `/wizard` titles itself with the same words, so
          the two read one constant and the button cannot end up naming a
          destination the destination does not call itself. Uppercase is the
          class, as everywhere else — which also means the accessible name is now
          the sentence case it was written in.

          Unlike `Landing`, the padding is the package's own default: the
          artboard's button measures 26px type in a 549 × 56px pill, and `Button`
          ships `text-[26px] px-16 py-[18px]`, which was 545 × 56 here. The type
          is now `text-2xl` (24px), rounded onto the scale on 2026-08-04, so the
          label is 2px under both the drawing and the package.
          The values below are the component's own, so the artboard renders
          untouched and nothing is restated for its own sake. They were `clamp()`s
          until 2026-08-04, which bent only the phone case.

          `leading-5` is the exception, and it is the design's: 26px type in a
          20px line box is what makes the pill 56px rather than the 68px the
          component's `leading-tight` gives. `Landing` deliberately does NOT do
          this, because there a wrapped label would overlap itself.

          **What made it safe here was the clamp, and the clamp is gone.** The
          size used to leave its 1rem floor only above ~889px, so wherever the
          label wrapped it was 16px inside a 20px box. Fixed at 26px the label is
          taller than its line box at every width and wraps to four lines at 375.
          `leading-tight`, as `Landing` uses, is the fix if that is not wanted —
          at the cost of the drawn 56px pill. Styling open item 33.

          Passing it is also mandatory
          rather than optional: tailwind-merge treats a `text-*` class as
          resetting line-height, so the size alone would drop the component's
          leading and the label would inherit whatever is around it.

          `mt-8` is the 32px gap: ink-to-ink the artboard measures 40px from the
          heading's cap bottom to the button's top edge, which is 32px once the
          last line box's descender space is taken off (docs/styling.md §11).

          A destination rendered as a `<button>` — same cost and same accepted
          trade-off as `Landing`'s CTA (`Button` has no `href`;
          `.scratch/mlg-reskin/issues/06-package-debts.md` debt 5).
        */}
        <Button
          className="mt-8 px-16 py-4.5 text-2xl leading-5 uppercase"
          onClick={() => void navigate(next)}
        >
          {WIZARD_INPUT_TITLE}
        </Button>
      </section>
    </>
  );
}

/**
 * This page's own backdrop: the brand footage washed under the page gradient's
 * mint.
 *
 * Structurally a sibling of `AppShell`'s default backdrop rather than a
 * replacement for it — same `fixed inset-0 -z-10`, later in DOM order, so it
 * paints over `bg-page` while the gradient still shows through. That is the
 * arrangement `education/ProphylaxisGuidance` records for its still wash, and
 * this is the same composite with the footage in place of the still.
 *
 * **25% is measured, not chosen.** Fitting `alpha * frame + (1 - alpha) *
 * bg-page-over-white` to the artboard's background — masking out the rule, the
 * card and the rail — puts the least-squares optimum at 0.23 (mean error
 * 6.6/255, against 11.8 at the 15% `prophylaxis-guidance` uses). `opacity-25` is
 * the nearest step on the scale and costs 0.5/255 of that fit, so the design
 * value is stated as a scale step rather than as `opacity-[0.23]` chasing the
 * noise in a JPEG export.
 *
 * The same fit is also what identifies the source: the artboard's background
 * matches the loop's **first frame** (best of 32 sampled at 2fps, and the ping-
 * pong makes it the last frame too) and does not match `bg_image.webp`, whose
 * best linear fit is nearly flat. So this is the footage the designer composited,
 * not the still from the chapter before.
 *
 * Everything motion-related — autoplay attributes, the poster, the
 * reduced-motion still — is `BrandLoop`'s, shared with `Landing` and
 * `education/DiseaseBackground`. Only the wash is this page's.
 */
function IntroBackdrop() {
  return (
    <div aria-hidden="true" data-page-backdrop="wizard-intro" className="fixed inset-0 -z-10">
      <BrandLoop className="opacity-25" />
    </div>
  );
}
