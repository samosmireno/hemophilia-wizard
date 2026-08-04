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

        `leading-9` is the drawn 36px pitch, well inside the font's own step —
        the same tightening `/wizard/therapies` applies to its arch title, and
        for the same reason: this is a display heading that wraps, and the
        natural step opens gaps the artboard does not draw.

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
        className="mx-auto max-w-content text-center font-display text-4xl leading-9 font-bold tracking-wide text-brand-crimson-50 uppercase"
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
      */}
      <BulletList items={SDM_POINTS} className="mt-6 text-xl leading-8" />

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

        **The clamps are what make `leading-5` safe**, and they are not optional —
        `WizardIntro` records the trap: 24px type in a 20px line box overlaps
        itself the moment the label wraps, which is why `Landing` refuses the
        trick outright. The size only leaves its 1rem floor above ~960px viewport
        width, and at every width where this label wraps it is set at 16px, i.e.
        inside a 20px box. Verified at 375px, where it wraps to three lines.

        All three clamps land on their maxima at 1440 — 1.667vw is 24px, 4.4vw
        exceeds the 4rem cap, 1.25vw is 18px — so the artboard renders untouched
        and nothing is restated for its own sake. The two padding clamps are
        `WizardIntro`'s values verbatim, since both buttons are the package's own
        `px-16 py-[18px]` at the canvas.

        A control that opens a dialog, so it is a `<button>` by rights rather than
        by the `Button`-has-no-`href` compromise `Landing` and `WizardIntro` both
        accept.
      */}
      <Button
        className="mt-6 self-center px-[clamp(2rem,4.4vw,4rem)] py-[clamp(0.75rem,1.25vw,1.125rem)] text-[clamp(1rem,1.667vw,1.5rem)] leading-5"
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

        `grow` runs them off the bottom of the column, which is how the artboard
        draws them — cut by the canvas edge, not closed.

        **Below `xl` the row stacks.** Summed, the columns need roughly 1015px
        before a caption wraps ("Marstacimab" is 143px, "Etranacogene
        dezaparvovec-drlb" already wraps to three lines at the drawn width), and a
        1024px viewport leaves the band only 800. `/wizard/therapies` found the
        same wall at the same place. Stacked, each segment is full width and its
        buttons wrap inside, which is legible where a clipped drug name is not.
      */}
      <div className="mt-6 flex grow flex-col xl:flex-row">
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
 * `rounded-t-[128px]` is verified against the export's own curve, not read off
 * it: at x=200 the left segment's top edge sits at 524, and `518 + 128 −
 * √(128² − 40²)` is 524.4. The same test passes on the opposite corner (544
 * measured, 543.8 predicted).
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
      // The drawn width as a grow factor against a zero basis. Inline because it
      // is data — `EXPLORE_SEGMENTS` carries the three numbers, and a lookup
      // table of three arbitrary `flex-[…]` classes here would be the same
      // numbers written twice.
      style={{ flex: `${segment.width} 1 0%` }}
      className={cn(
        "rounded-t-[128px]",
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
        // Stacked, there is no range to draw and no shared button line to hold.
        "pt-16",
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
      */}
      <div className="flex h-full px-4 xl:px-0">
        {segment.columns.map((column) => (
          /*
            `flex-1` per column, which is what places the buttons: a segment with
            one column gives it the whole width and the agents divide that, and
            the right-hand segment's two columns take half each. Predicted button
            centres land within 8px of the export at every one of the seven, and
            the one place it drifts is the middle segment — whose buttons the
            export draws 8px right of its own centred label, so the rule is
            arguably truer than the drawing.
          */
          <div key={column.label} className="flex flex-1 flex-col">
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
