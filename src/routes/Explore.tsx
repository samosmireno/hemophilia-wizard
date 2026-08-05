import { useState } from "react";
import { Button, PopupButton } from "mlg-components";

import BulletList from "../components/BulletList";
import DrugSheetPopup from "../components/DrugSheetPopup";
import Popup from "../components/Popup";
import {
  EXPLORE_SEGMENTS,
  EXPLORE_TABLE_TITLE,
  SDM_CONCLUSION,
  SDM_POINTS,
  type ExploreSegment,
} from "../data/explore";
import { cn } from "../lib/cn";
import { preserveCase } from "../lib/preserveCase";

/**
 * `/explore` — CONTEXT.md §9's shared-decision-making conclusion, and the
 * launcher for the §5 comparison table.
 *
 * **Not the table itself**, which is what issue 09 specified. The artboard makes
 * this the SDM node with the table demoted to a pop-up behind one button;
 * `docs/adr/0007-explore-is-the-sdm-conclusion.md` records why the artboard won.
 *
 * Three things stack here, and only the first is the blueprint's: the SDM
 * conclusion (heading + four bullets), the button that opens the table, and a
 * class-grouped index into the §6 drug sheets drawn as three arched segments.
 * That last one is **Efanesoctocog alfa's first caller anywhere** — CONTEXT.md §6
 * has recorded its sheet as built-and-unreachable since the sheets landed.
 *
 * Everything on the page is centred on the arch band's centre, not the content
 * column's: the band runs 112→1328 on the 1440 canvas, i.e. `--spacing-gutter`
 * on both sides, where the column stops at 1280 to clear the rail. `lg:-mr-rail`
 * is what reclaims those 48px. `/wizard/therapies` draws the same band and takes
 * `-mr-16` for it, overshooting to 1344; that is its business, and this page is
 * measured rather than copied.
 *
 * Measurements in docs/styling.md §17.
 */
export default function Explore() {
  /**
   * Which agent's sheet is open, and therefore which `+` is showing its ✕.
   *
   * One agent name rather than a boolean per button, and one card for all seven,
   * which is `/wizard/therapies`' arrangement for its stated reasons: two open at
   * once is not a state worth representing, and `showModal()` makes the rest of
   * the document inert so the other `+`s are unreachable anyway.
   */
  const [openAgent, setOpenAgent] = useState<string | null>(null);

  /**
   * Whether the comparison table's card is up. A second, independent piece of
   * state rather than a member of the one above: the table is not an agent, and
   * a union that had to carry `"table"` beside seven drug names would make
   * `DrugSheetPopup`'s `agent` prop lie.
   *
   * Component state, not a route or a search param —
   * `docs/adr/0006-component-state-drug-sheets.md` decided that for the sheets
   * and the argument is the same here.
   */
  const [tableOpen, setTableOpen] = useState(false);

  return (
    <section aria-labelledby="explore-heading" className="flex flex-1 flex-col lg:-mr-rail">
      {/*
        **Drawn at 42px, not the 52 every other page sets.** This heading is a
        four-line sentence and the designer dropped it. Fitted rather than
        guessed: least squares over all four drawn lines in Barlow Condensed 700
        returns 42px at 0.0234em of tracking — `tracking-wide` to within a
        thousandth — with residuals under 1.1px on lines up to 1139px wide. Cap
        height agrees independently (30px of ink / 0.70 = 42.9).

        It shipped raw at `text-[42px]` until 2026-08-04 and now takes
        `text-4xl`, i.e. **36px — a 6px drop, the biggest fidelity loss in the
        §2 migration** (styling open item 31). The fit above is what it cost. If
        the heading reads wrong or re-flows past four lines, put `text-[42px]`
        back under §8's precedent rather than reaching for `text-5xl`, which at
        48 is further from the drawing than 36 is.

        **Three steps, not §2's one**, and the sentence is why: at 190 characters
        it is the longest `<h1>` in the app by some distance, and the app-wide
        30px would set it in ~10 lines and ~315px of a 320px viewport — 40% of
        the screen before the bullets start. 24 takes that to ~8 lines. The
        shape is `/wizard-intro`'s, whose own hero ramps in three for the same
        reason (§8), and `sm`'s 30px is where every other page already sits
        below `lg`.

        **`leading-none`, where this was `leading-9` until the responsive pass.**
        36px against `text-4xl` IS a ratio of 1.0, so nothing moves at the
        canvas — but as an absolute it would have followed the type down and
        rendered 1.2 at 30px and 1.5 at 24, i.e. the step loosening what the
        drawing tightens. §2's rule, taken for the fourth time: a `leading-*` on
        the scale does not survive a size ramp, a ratio does. The drawn pitch is
        tighter still (36/42 = 0.857), and uppercase Barlow Condensed has no
        descenders to collide, which is what makes 1.0 safe on a heading that
        wraps to eight lines.

        `max-w-content` is a LINE-BREAK cap, not styling — `/wizard/therapies`'
        `max-w-215` is the same device. The artboard breaks this sentence into
        four lines measuring 961 / 1019 / 1142 / 362, and the band it sits in is
        1216 wide, which is enough to pull "EMPHASIZING" up onto line 1 and set
        the whole thing in three. The window that reproduces the drawn break is
        [1142, 1178): at least line 3's own width, and less than line 1 plus the
        next word. 1168 is inside it — and it is `--container-content`, the
        column every other page measures against, so the cap is the app's own
        rather than a number picked to fit.

        `mx-auto` because a capped block inside a centred heading would otherwise
        sit left of the band it is centred on.

        Uppercase is CSS, not copy — the accessible name stays the sentence case
        `SDM_CONCLUSION` is written in, as on every other heading in the app.
      */}
      <h1
        id="explore-heading"
        className="mx-auto max-w-content text-center font-display text-2xl/none font-bold tracking-wide text-brand-crimson-50 uppercase sm:text-3xl/none lg:text-4xl/none"
      >
        {SDM_CONCLUSION}
      </h1>

      {/*
        22px at the drawn 32px pitch. Verified by rendering: DM Sans 400 at 22px
        sets the four bullets 655/1110/817/718 against the export's
        651/1106/813/715 — a constant 4px, which is the bullet indent's origin
        rather than a size error, since it does not grow with the string.

        Full band width and no measure cap: the export wraps bullet 2 after
        "treatment", and 22px type in the 1216px band puts "selection" at 1202px
        against ~1178px of room, so the drawn break falls out of the width rather
        than needing to be forced.

        **This page's one body step, and it lands on the floor** — 20 → 16 below
        `lg`, which makes `/explore` §2's sixth exception page and the second
        (after `/wizard/therapies`) whose step ends where the education chapters
        already sit rather than above them. The argument is proportion, not fit:
        the `<h1>` above drops to 24 at 375, and 20px bullets under it would
        read at 0.83× the heading where the artboard draws 0.52×. It buys ~135px
        of column at 375 as well.

        `leading-8` had to become `/[1.6]` with it, for the reason the heading's
        `leading-9` did: 32px is absolute and would render 2.0 against a 16px
        step. 1.6 is the ratio 20/32 already renders at, so one class covers both
        and the canvas is unchanged.
      */}
      <BulletList items={SDM_POINTS} className="mt-6 text-base/[1.6] lg:text-xl/[1.6]" />

      {/*
        The package `Button`, at `WizardIntro`'s recipe and not `WizardIntro`'s
        size. `px-16 py-[18px]` with `leading-5` is what makes a 56px pill instead
        of the component's own 68px, and the export measures 531 × 56 with 67/66
        of horizontal padding and 17/15 of vertical — the component's values
        exactly.

        **24px and sentence case**, where `Landing` and `WizardIntro` both set
        26px uppercase. The label's ink measures 24px ascender-to-descender, and
        the drawn label is mixed case. Third CTA in the app and the first that is
        not shouted; transcribed, not harmonised.

        `self-center` because the section is a flex column — the button is
        content-width and would otherwise stretch across the whole band.

        The three values are the drawn ones — 24px type, 64/18px padding —
        `WizardIntro`'s verbatim, since both buttons are the package's own
        `px-16 py-[18px]` at the canvas, **and they are now `lg:` only.**

        **The drawn 56px pill is a 1440 composition, not a rule**, and holding it
        at every width was styling open item 33's last live case. All three
        values were `clamp()`s until 2026-08-04; the clamp is what had made the
        tight leading work, since the size only left its 1rem floor above ~960px,
        so wherever the label wrapped it was 16px inside a 20px box. Fixed at
        24px that stopped being true — the label was taller than its own line box
        at every width, and at 375 it wrapped to four lines with the descenders
        sitting into the caps below.

        The fix is `/wizard-intro`'s, verbatim, because that CTA is the same
        package `Button` at the same drawn recipe and closed the same item one
        day earlier: the drawn 24px-in-a-20px-box survives at `lg` alone, where
        the label is 396px of ink in 672px of room and cannot wrap, and below it
        the type steps to 20 and 16 against a 1.25 ratio. The label is 33
        characters at ~0.50em — the drawn pill's own 398px of ink over 24px — so
        it sets one line from 640 up and two at 375 and 320, which `/tight`
        makes legible rather than overlapping. **That closes item 33 outright.**

        A control that opens a dialog, so it is a `<button>` by rights rather than
        by the `Button`-has-no-`href` compromise `Landing` and `WizardIntro` both
        accept.
      */}
      <Button
        className="mt-6 self-center px-8 py-3 text-base/tight sm:px-12 sm:py-3.5 sm:text-xl/tight lg:px-16 lg:py-4.5 lg:text-2xl/5"
        aria-haspopup="dialog"
        onClick={() => setTableOpen(true)}
      >
        {EXPLORE_TABLE_TITLE}
      </Button>

      {/*
        The three arched segments, tiling the band with no gaps: 339 + 524 + 353
        = 1216. `flex-basis: 0` with the drawn width as the grow factor is what
        keeps the three in proportion as the band narrows, rather than letting the
        widest give first.

        `xl:grow` runs them off the bottom of the column, which is how the
        artboard draws them — cut by the canvas edge, not closed.

        **Below `xl` the row stacks.** Summed, the columns need roughly 1015px
        before a caption wraps ("Marstacimab" is 143px, "Etranacogene
        dezaparvovec-drlb" already wraps to three lines at the drawn width), and a
        1024px viewport leaves the band only 800. `/wizard/therapies` found the
        same wall at the same place. Stacked, each segment is full width and its
        buttons wrap inside, which is legible where a clipped drug name is not.

        **`grow` is `xl:` only, and that is a fix rather than a tidy-up.** In a
        column, the segments' `flex-grow` factors (339 / 524 / 353 — see below)
        split leftover HEIGHT in the drawn ratio, so a stacked segment ended up
        as tall as the viewport allowed rather than as tall as its contents, held
        up only by each one's automatic minimum. That was invisible while the
        segments had no bottom edge to see it against; a closed arch and a gap
        between the cards is exactly what would have shown it. Denying the row
        its own `grow` leaves no free space to distribute, which makes the
        factors inert below `xl` without touching what they do at it.

        `gap-6` is the page's own rhythm — the same 24px `mt-6` puts between
        heading, bullets, CTA and this row — and it is `xl:gap-0` because the
        three tile the band exactly (339 + 524 + 353 = 1216) and any gap at all
        would break the drawn tiling. Between two facing 128px arcs it reads
        looser than 24px, since the curves pull apart either side of the centre.
      */}
      <div className="mt-6 flex flex-col gap-6 xl:grow xl:flex-row xl:gap-0">
        {EXPLORE_SEGMENTS.map((segment, index) => (
          <Segment
            key={segment.columns[0].label}
            segment={segment}
            middle={index === 1}
            openAgent={openAgent}
            onToggleAgent={setOpenAgent}
          />
        ))}
      </div>

      {/*
        Both cards sit outside the arch row. The segments carry no
        `overflow-hidden` — unlike `ArchBand`, they have no footage to clip — so
        this is convention rather than necessity, and it is the convention
        `/wizard/therapies` set for a reason that still applies: a dialog does not
        belong inside a box that might acquire a clip later.

        Mounted unconditionally, because the effect that calls `showModal()` needs
        its element already in the DOM. Both render nothing while closed.
      */}
      <DrugSheetPopup agent={openAgent} onClose={() => setOpenAgent(null)} />

      {/*
        The §5 comparison table's card — **the shell, not the table.** The three
        dropdown filters and the nine-column grid off `filterTreatments()` are
        still issue 09's scope; what is settled is where they go.

        It opens rather than staying inert, which is the opposite of
        `DisclosureBand`'s rule ("a disclosure with no content opens nothing"). The
        difference is what the emptiness means: that rule was written for §7.7
        figures whose assets may never arrive, where an empty card is a dead end.
        This table is specified, its data and filter engine are built and tested
        (`treatments.ts`), and the card is the container they drop into — so the
        placeholder is a state, not a stub.

        **`width="wide"` is the reason that prop exists**, and it is set here
        ahead of the body it is for. The table has nine columns; at `Popup`'s
        default card they get 113px each, which is not a table anyone can read.
        `wide` is 1360px, so they get about 136 — see docs/styling.md §13, where
        the number is picked rather than drawn. The card is the only caller off
        the default step, and it is set now rather than with the grid so that the
        placeholder is measured in the box the grid will actually land in.
      */}
      <Popup
        open={tableOpen}
        title={EXPLORE_TABLE_TITLE}
        width="wide"
        onClose={() => setTableOpen(false)}
      >
        <p className="py-6 text-center text-xl leading-[1.6] text-black">
          The filterable comparison table is not built yet.
        </p>
      </Popup>
    </section>
  );
}

/**
 * One arched segment: its columns side by side, each a row of agents over a
 * class label.
 *
 * **A segment is a drawn group, not a class** — the right-hand one holds two
 * class labels under one arch. See `EXPLORE_SEGMENTS`.
 *
 * The 128px radius is verified against the export's own curve, not read off it:
 * at x=200 the left segment's top edge sits at 524, and `518 + 128 −
 * √(128² − 40²)` is 524.4. The same test passes on the opposite corner (544
 * measured, 543.8 predicted). Below `xl` the same radius closes the bottom, so
 * a stacked segment is a card rather than a cut-off arch.
 */
function Segment({
  segment,
  middle,
  openAgent,
  onToggleAgent,
}: {
  segment: ExploreSegment;
  /**
   * The white one. Not derived from the index at the call site's convenience —
   * the middle segment differs in two measured ways at once (its fill, and a top
   * edge 36px above its neighbours'), and naming the difference once is what
   * keeps the two from drifting apart.
   */
  middle: boolean;
  openAgent: string | null;
  onToggleAgent: (agent: string | null) => void;
}) {
  return (
    <div
      // The drawn width as a grow factor. Inline because it is data —
      // `EXPLORE_SEGMENTS` carries the three numbers, and a lookup table of three
      // arbitrary `flex-[…]` classes here would be the same numbers written
      // twice.
      //
      // **The zero basis it used to carry is now `xl:` only**, and the grow
      // factor stays unconditional because it has nothing to act on below `xl`
      // (see the row). `basis-auto` there is what makes a stacked segment as tall
      // as its own contents; at `xl` the basis goes back to 0 and the three
      // divide the band in the drawn ratio rather than letting the widest give
      // first.
      style={{ flexGrow: segment.width }}
      className={cn(
        /*
          **Closed below `xl`, cut at it.** The artboard draws three arches
          running off the bottom of the canvas, so `xl:rounded-b-none` is the
          drawn state and the bottom radius is the stacked one. Same 128px as the
          top, verified against the drawn curve at both corners — one radius on
          the page, and it is the measured one. At 320 the segment is 272px wide,
          so both ends read as near-semicircles and the card is a lozenge; that
          is what mirroring an arch this size onto a phone column looks like.
        */
        "rounded-[128px] xl:rounded-b-none",
        // The other half of the grow factor above. `basis-auto` is the initial
        // value and is written out because it is load-bearing here rather than
        // inherited by accident.
        "basis-auto xl:basis-0",
        /*
          `bg-brand-crimson-50/5` on the flanks, where the export solves to
          Tailwind's `red-600` at that alpha. Substituted deliberately: at α=0.05
          the composited difference between the two is (−0.3, 1.0, 2.2) out of
          255 — under a quantisation step on two channels — and following the
          export would have made this the only native-palette colour in an app
          whose every other value is a token. `ArchBand` already washes its arch
          in the same crimson at /15. See docs/styling.md §17.

          `bg-white/60` is exact, not substituted: solving the middle segment's
          flat top over 245 columns returns (254.7, 254.7, 254.7) at α=0.60.
        */
        middle ? "bg-white/60" : "bg-brand-crimson-50/5",
        /*
          **The middle sits 36px higher, and the flanks share one top.** Measured
          478 / 518 / 511 — the middle's 40px lift is far too large to be a slip
          and is what makes the three read as a range with a peak, but the 7px
          between the two flanks is hand placement and they are drawn as a pair.
          So the flanks take one offset and it is the mean.

          The padding below absorbs it, so the BUTTONS stay on one line across all
          three segments whatever their arches do: 88px from the row's top edge in
          the middle, 36 + 52 on either side of it.
        */
        middle ? "xl:pt-22" : "xl:mt-9 xl:pt-13",
        /*
          Stacked, there is no range to draw and no shared button line to hold,
          so all three take one padding — and it is mirrored below the label,
          because below `xl` the segment has a bottom edge to be measured
          against. 64px above the buttons and 64px under the class label; the
          box is symmetric, which is what the closed arch asks for.

          `xl:pb-0` because at the canvas the segment has no bottom: it runs off
          the edge, and padding against an edge that is not drawn would only push
          the labels up out of their measured row.

          64px is also what clears the curve. At that distance from either edge a
          128px radius has opened to 17.15px (`128 − √(128² − 64²)`), against the
          16px `px-4` below gives the inner row — so the box corners sit ~1px
          inside the arc and the content stays clear of it, because both the
          buttons and the wrapped labels are centred well short of their box.
        */
        "pt-16 pb-16 xl:pb-0",
      )}
    >
      {/*
        `px-4` keeps the outermost caption off the arch wall where the segments
        are narrow, and `xl:px-0` takes it away where they are not — because the
        padding comes out of the space the buttons divide, and 32px of it moves
        every button in the middle segment by up to 21px against the drawing. The
        drawn case has no padding and needs none: at the button's own height the
        128px radius has already opened to within 25px of the segment edge, and
        the nearest button is 27px clear of that.

        **The columns stack below `sm`, and that is a fix for a bug this page had
        shipped since it landed.** Only the three SEGMENTS stacked below `xl`; the
        right-hand one's two columns stayed side by side at every width, each
        `flex-1` of a phone-width segment holding an item that is `basis-40
        shrink-0` and refuses to give. Measured at 320: a 149px column with a
        160px item in it, ink 44px past the arch's own background and
        `document.scrollWidth` at 340 against the viewport's 320 — the horizontal
        overflow §17's first sweep would have caught had it looked below 375.

        `sm` rather than a fitted width: two columns need 2 × 160 + 32 = 352px of
        segment, i.e. a 400px viewport, and `sm` is the nearest step above it
        that the rest of the shell already turns on (the gutter goes 24 → 48
        there). Between 400 and 639 the pair would fit and stacks anyway, which
        is the price of a named step over an arbitrary one.
      */}
      <div className="flex h-full flex-col gap-y-8 px-4 sm:flex-row sm:gap-y-0 xl:px-0">
        {segment.columns.map((column) => (
          /*
            `flex-1` per column, which is what places the buttons: a segment with
            one column gives it the whole width and the agents divide that, and
            the right-hand segment's two columns take half each. Predicted button
            centres land within 8px of the export at every one of the seven, and
            the one place it drifts is the middle segment — whose buttons the
            export draws 8px right of its own centred label, so the rule is
            arguably truer than the drawing.

            **`sm:` only**, for the reason the segment's own basis is `xl:` only:
            stacked, `flex-1` is a HEIGHT ratio, and two columns of one agent
            each would be forced to equal heights against captions that wrap to
            different depths. Below `sm` a column is simply as tall as it is.
          */
          <div key={column.label} className="flex flex-col sm:flex-1">
            {/*
              **Wraps below `xl`, nowraps at it.** A column's agents need their
              captions' width and no less — three of them come to 373px before the
              arch's own padding — which does not fit a 375px phone at any
              division. So below `xl` the items take a 160px basis and refuse to
              shrink, and the row wraps; at `xl` they go back to dividing the
              segment equally, which is what reproduces the drawing.

              That is `/wizard/therapies`' arrangement (`w-40 shrink-0` under a
              wrapping row, `xl:shrink` above) hinged on the same breakpoint, and
              it is the same finding: the gap gives before the item does, because
              the item is what carries the caption.
            */}
            <ul className="flex flex-wrap justify-center gap-y-8 xl:flex-nowrap xl:gap-y-0">
              {column.agents.map((agent) => (
                /*
                  No `min-w-0`: an item's automatic minimum size is its
                  min-content, and every caption's longest word is the floor we
                  want. That is `/wizard/therapies`' finding, and the licence it
                  removes is exactly what clipped drug names against the arch
                  wall there.
                */
                <li
                  key={agent}
                  className="flex shrink-0 basis-40 flex-col items-center xl:shrink xl:grow xl:basis-0"
                >
                  <PopupButton
                    label={agent}
                    // Not `aria-controls`: a modal dialog lives in the top layer,
                    // so it is not a region of this page the button expands.
                    // Unconditional because all seven agents drawn here have a §6
                    // sheet, which `content.test.ts` asserts rather than assumes.
                    aria-haspopup="dialog"
                    open={openAgent === agent}
                    onClick={(next) => onToggleAgent(next ? agent : null)}
                  />
                  {/*
                    Pixel-exact to `/wizard/therapies`' caption, which is why it is
                    the same three values: rendering DM Sans 700 at 22px gives
                    131/115/135/143/95 against the export's 131/115/135/143/94.

                    `leading-5` is this page's addition. Therapies' captions are
                    all one word on one line and never had to state a step; two of
                    these wrap, and the export sets them at a 20px pitch — tight
                    for 22px type, and measured off the baselines of
                    "Efanesoctocog / alfa".

                    `xl:h-15` is the three-line height, fixed so that every
                    column's label starts at the same y whatever its caption
                    costs. Stacked, the labels are not in one row, so it goes.
                  */}
                  <p className="mt-5 text-center text-xl leading-5 font-bold text-brand-slate-100 xl:h-15">
                    {agent}
                  </p>
                </li>
              ))}
            </ul>

            {/*
              **All four labels are centred on one line** — y=751.5 in the export,
              four for four, with 1, 1, 3 and 2 lines of text between them. That
              is a fixed-height row with the label centred in it, not labels
              flowing under their captions, so it is built as one: 100px tall
              from the captions' fixed bottom puts the centre at 752.

              `xl:` only, and deliberately. Below that the buttons wrap and the
              columns stack, so the four labels genuinely are not in one row and
              the fixed height would only be a gap.

              `text-2xl` is measured: 18px of cap ink / Barlow Condensed's 0.70 cap
              ratio = 25.7, and rendering at 26px reproduces all four label widths
              to within 2px. `leading-[22px]` is the drawn pitch, taken off the
              three-line label's line tops.

              `tracking-wide` is a deliberate 9px of narrowing on the longest
              label: fitting letter-spacing across all four strings returns
              0.036em, between `wide` and `wider` and on no step at all. One
              tracking rule across every display heading in the app beats an exact
              bespoke value on a centred label that shifts no layout. Recorded as
              a styling open item.
            */}
            {/*
              **The centring is on the wrapper and the text is not a flex item**,
              and that split is load-bearing rather than tidiness. `preserveCase`
              returns a span beside a bare text node; a flex container makes each
              of those an anonymous flex item and **drops the whitespace between
              them**, which renders this label "FVIIIaMIMETICS". The helper's other
              two callers are an `<h1>` and a pop-up band, neither of which is a
              flex container, so this is the first place it bites.

              No `aria-label`, unlike those two callers. The helper's contract asks
              for one because the accessible-*name* algorithm joins each element's
              contribution with a separating space — but that computation only runs
              on elements whose name is being computed, and this is a `<p>` of body
              text that names nothing. A screen reader reads its concatenated text
              content, which still has the space in it. An `aria-label` on a
              generic element would be the riskier choice, not the safer one.
            */}
            <div className={cn("mt-6 flex items-center justify-center", "xl:mt-0 xl:h-20")}>
              {/*
                `preserveCase` is required, not decorative: `uppercase` renders
                "FVIIIa mimetics" as "FVIIIA MIMETICS" and destroys the one letter
                that says *activated* factor VIII. The artboard draws that `a` in
                lower case for exactly that reason, and `FVIIIa` is already in the
                helper's term list.
              */}
              <p className="text-center font-display text-2xl leading-5.5 font-semibold tracking-wide text-brand-crimson-50 uppercase">
                {preserveCase(column.label)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
