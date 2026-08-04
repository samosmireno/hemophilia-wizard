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
          Fixed at 72px it did not, and it took a three-step ramp the same day —
          36 / 48 / 72, all named steps, no `clamp()` and no arbitrary size.
          `Landing`'s hero is the shape being followed (§8) and the reason is the
          same: a hero is one composition that must survive a column it was never
          drawn for, where a chapter heading is a single line failing on a single
          word.

          **The drawn size arrives at `lg`, not `xl` as `Landing`'s does**, and
          the difference is the cap below rather than a different rule. The
          drawn last line measures 729px against a 752px column at 1024, so the
          composition the artboard draws fits the first breakpoint that has to
          hold it — where `Landing`'s ~1000px headline does not, and waits for
          `xl`'s 1008. 1024 is where the sidebar becomes a rail and the gutter
          takes 175px away (§12); this page is one of the few that can pay it.

          | Viewport | Column | Step | `PROPHYLACTIC` |
          | -------- | -----: | ---: | -------------: |
          | 320      |    256 |   36 |         ~199px |
          | 375      |    311 |   36 |         ~199px |
          | 640      |    544 |   48 |         ~265px |
          | 1024     |    752 |   72 |         ~397px |
          | 1440     |   1168 |   72 |         ~397px |

          The word is what sets the base step, exactly as in §2's `<h1>` table:
          Barlow Condensed uppercase cannot break, so a 12-letter word at 72px is
          ~397px of unbreakable ink against a 311px phone column. `text-5xl` (48)
          clears 375 but not the 256px column a 320px phone gives — ~265 against
          256 — so the base step is `text-4xl`, one further down than the fit at
          375 alone would ask for.

          `max-w-3xl` (768px) is what reproduces the artboard's line breaks —
          "EXPLORE NOVEL / PROPHYLACTIC THERAPY / OPTIONS FOR YOUR PATIENT" —
          without hard-coding them into the copy: the drawn last line measures
          729px and the first two words plus "PROPHYLACTIC" would run to ~830px,
          so any cap between those two wraps exactly where the designer did.
          768px is the midpoint of that window, i.e. the setting least likely to
          flip a line if the font rounds differently than measured. It is inert
          below `xl`, where the content column is the narrower of the two — and
          the column stays inside that window at `lg` (752), which is the other
          half of why the drawn size can arrive there.

          Line-height is restated on every step rather than left as one
          `leading-[1.05]`. One would do — a Tailwind v4 `leading-*` sets
          `--tw-leading` and each `text-<size>` reads it back — and §8 keeps the
          restatement anyway on the hero this page is modelled on, for the reason
          it gives there: three sizes reading one property at a distance is what
          goes wrong silently when someone edits one line. The ratio rather than
          the drawn 74.9px, because the size now moves twice.

          Uppercase is CSS, not copy — the accessible name stays the title case
          the blueprint writes, as on every education chapter.
        */}
        <h1
          id="wizard-intro-heading"
          className="max-w-3xl font-display text-4xl/[1.05] font-bold text-brand-crimson-50 uppercase sm:text-5xl/[1.05] lg:text-7xl/[1.05]"
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

          At the canvas the padding is the package's own default: the artboard's
          button measures 26px type in a 549 × 56px pill, and `Button` ships
          `text-[26px] px-16 py-[18px]`, which was 545 × 56 here. The type is now
          `text-2xl` (24px), rounded onto the scale on 2026-08-04, so the label is
          2px under both the drawing and the package.

          **Below `lg` those values were the app's last live regression from the
          clamp removal, and this closes it** (open item 33, which named this
          button and `/explore`'s as the two remaining). The label is 29
          characters — "Input patient characteristics", against `Landing`'s 17 —
          so at 24px it is ~385px of ink, and the package's `px-16` puts 128px of
          inset around it. That is a 513px pill in a 311px column at 375, which
          did not overflow (the component carries `max-w-full` and `break-words`)
          but wrapped into the 183px left over: three lines of 24px type in a
          20px line box, i.e. lines that overlap each other's caps. §14 records
          the identical trap on the wizard's option pills.

          So the inset and the type ramp together, on `Landing`'s own steps (§8)
          rather than a scale invented for one button — three of them here
          against its four, because the drawn values arrive at `lg` with the
          heading above:

          | Viewport | Column | Inset | Type | Label ink |    Pill |
          | -------- | -----: | ----: | ---: | --------: | ------: |
          | 375      |    311 |    64 |   16 |     ~257 |  2 lines |
          | 640      |    544 |    96 |   20 |     ~321 |  ~417px |
          | 1024     |    752 |   128 |   24 |     ~385 |  ~513px |
          | 1440     |   1168 |   128 |   24 |     ~385 |  ~513px |

          The base step lands within ~10px of the column either way — 321 against
          311 — so whether the label sets in one line or two is inside the
          estimate's error bar, and **that is what the line box has to survive**.

          `leading-5` is the design's: 24px type in a 20px line box is what makes
          the pill 56px rather than the 68px the component's `leading-tight`
          gives. It is safe only where the label does not wrap, which is why it
          is now `lg:` alone — written as the `/5` modifier so it travels with
          the size it belongs to. Below that the steps take `/tight`, which is
          `Landing`'s call for the same reason ("a wrapped label would overlap
          itself"), and it costs nothing drawn: the drawn height is a 1440 fact
          and 16px in a 20px box is a taller line box, not a shorter one. The
          pill is 44px at 375 on one line and 64 on two, 53 at `sm`, and the
          drawn 56 from `lg` up.

          Passing a line height at all is mandatory rather than optional:
          tailwind-merge treats a `text-*` class as resetting line-height, so the
          size alone would drop the component's leading and the label would
          inherit whatever is around it. The `/…` modifier per step is what puts
          a value back at each one.

          `mt-8` is the 32px gap: ink-to-ink the artboard measures 40px from the
          heading's cap bottom to the button's top edge, which is 32px once the
          last line box's descender space is taken off (docs/styling.md §11). It
          does not ramp — the vertical gaps are being left alone until one rule
          covers them (open item 10), and 32px is small enough that the phone
          case is not what is asking.

          A destination rendered as a `<button>` — same cost and same accepted
          trade-off as `Landing`'s CTA (`Button` has no `href`;
          `.scratch/mlg-reskin/issues/06-package-debts.md` debt 5).
        */}
        <Button
          className="mt-8 px-8 py-3 text-base/tight uppercase sm:px-12 sm:py-3.5 sm:text-xl/tight lg:px-16 lg:py-4.5 lg:text-2xl/5"
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
