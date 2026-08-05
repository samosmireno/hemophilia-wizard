import BulletList from "../../components/BulletList";
import { CLASSES_TO_CONSIDER, scenarioKey } from "../../data/wizard";
import { cn } from "../../lib/cn";
import { formatInline } from "../../lib/formatInline";
import { isComplete, useWizardAnswers } from "../../state/wizardAnswers";

/**
 * `/wizard/scenario` — the therapeutic classes to consider for the scenario the
 * three answers resolved to (CONTEXT.md §4), one screen per (type × inhibitors).
 *
 * Everything rendered here is `CLASSES_TO_CONSIDER[scenario]`: the scenario's
 * name as the heading, the lead sentence, the class list, the HB +inhibitors
 * caveat, and the caption by the illustration boxes. Nothing is composed from the
 * answers beyond the key itself — the four artboards disagree with each other in
 * ways a template would have flattened (see `lead` in the data module).
 *
 * **The boxes open nothing yet, and the caption says they do.** That is knowing,
 * and it is the state `education/rebalancing-agents` is already in: CONTEXT.md
 * §7.7 marks the per-scenario therapeutic-class illustration panels image-borne,
 * no asset for any of them exists, and of the five distinct class labels only two
 * — FVIIIa mimetics and hemostatic rebalancing agents — have an education chapter
 * to point at. Wiring them needs the designer to say what a box opens; until
 * then they ship as reserved boxes at the drawn size, holding the row open so
 * real artwork does not re-cut it.
 *
 * Reachable only with all three answers: `WizardGate` sends an incomplete session
 * back to `/wizard`.
 */

/**
 * The boxes' drawn geometry, and one set of numbers for all four screens.
 *
 * The exports do not agree with each other — ~230 wide throughout, but 166 tall
 * on the two three-box screens, 181 on the single-box one and 185 on the two-box
 * one, and a gap of ~119 between three boxes against ~186 between two. Read as a
 * rule that is incoherent; read as hand-placed rectangles standing in for
 * artwork, it is exactly what you would expect. So one geometry, at the 227×185
 * `rebalancing-agents` records as the drawn size of its own placeholder boxes:
 * inside this screen's own measured spread, and the same reserved box on both
 * pages that have one.
 *
 * The drawn gap is `gap-x-30` — 120px, the scale step next to that measured 119.
 * Three boxes plus two gaps is 921px, which fits the 1168px content column with
 * room to spare at the design width and does NOT fit the 752px one at `lg`; the
 * ramp that resolves that is on the row below, not on the box, which keeps its
 * drawn size at every width.
 */
const BOX = "h-[185px] w-full max-w-[227px] shrink-0 border-4 border-black lg:shrink";

export default function Scenario() {
  const { answers } = useWizardAnswers();

  /**
   * The guard is `WizardGate`'s, not this component's — but the compiler cannot
   * see through a layout route, so the narrowing has to be restated where the
   * three answers are read. Unreachable in the app: reaching this render at all
   * means the gate already let the session past.
   */
  if (!isComplete(answers)) return null;

  const screen = CLASSES_TO_CONSIDER[scenarioKey(answers.type, answers.hasInhibitors)];

  /**
   * Where the caption goes, derived from the box count rather than stored beside
   * the copy: the artboards draw it under the single box and over a row of them,
   * which is a fact about the layout and not about the scenario — the split
   * `Wizard.tsx` records for `REASON_READING_ORDER`.
   */
  const captionBelow = screen.classes.length === 1;

  /*
    `text-xl lg:text-2xl` — the boxes caption takes the same one step down below
    `lg` that `rebalancing-agents` gives its own, which is the same object with
    the same copy. All four chapters and both box rows now agree on caption size
    (open item 15 is about the colour, not the ramp).
  */
  const caption = (
    <p className="text-center text-xl font-bold text-popup-caption uppercase lg:text-2xl">
      {screen.caption}
    </p>
  );

  /*
    Column on a phone, row from `lg`, exactly as `rebalancing-agents` stacks its
    own three — `shrink-0` while stacked so a box keeps its height, `lg:shrink`
    so the row can give if a narrow viewport asks it to.

    **The gap ramps, and the boxes never do (2026-08-04)** — the same fix, on the
    same pixel, as the row on `rebalancing-agents`. `lg:gap-x-30` put the drawn
    120px gap into the column that had just lost 175px to the gutter step (§12),
    so the pixel that turned the row on was the pixel that made it too wide:
    3 × 227 + 2 × 120 = 921 against a 752px column. `lg:shrink` then took the
    difference out of the only axis allowed to give, and the boxes rendered
    **171 × 185** — a quarter under drawn, and portrait where the artboard draws
    landscape.

    So the drawn gap moves to `xl`, where the drawn 921 group fits (1008px of
    column, 87 to spare), and at `lg` the row simply keeps the 32px the stack
    above it already states: 3 × 227 + 2 × 32 = 745 in 752. That is a class this
    block does not have to write, where the largest gap that fits is 35.5px —
    off the scale, and 35 would leave one pixel of slack. `rebalancing-agents`
    derived its middle step to fill the column exactly and open item 39 records
    that zero slack as the weakest number in the pass; seven pixels is the same
    move with room in it.

      Viewport   Column   Layout   Gap             Box
      375           311   column    32       227 × 185
      768           672   column    32       227 × 185
      1024          752      row    32       227 × 185
      1280         1008      row   120       227 × 185
      1440         1168      row   120   227 × 185 (drawn)

    `lg:shrink` stays, and is now a guard rather than the shipped behaviour: no
    width reaches the row with a group wider than its column, so nothing shrinks
    unless the gutter, the border or `--spacing` moves underneath it.

    Below `lg` the three stack at drawn size — 619px of empty bordered rectangle
    under a caption that says to click them. That is `rebalancing-agents`' own
    accepted cost (640px there, argued in §11): a reserved box exists to hold the
    drawn size, and a smaller one reserves the wrong thing. It is bounded by open
    item 16 rather than by this pass — what a box opens is what decides how much
    of a phone it deserves.

    Centred on the content column. The artboards centre this block on the full
    1440 canvas instead, which puts it ~24px right of where `mx-auto` lands,
    because the drawing does not account for the sidebar rail the way `AppShell`
    does. Reproducing that would mean breaking the block out of the column it
    sits in, to honour a number the design did not mean to state.
  */
  const boxes = (
    <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-center xl:gap-x-30">
      {/*
        Empty `<div>`s rather than `<img>`s without a `src`, and rather than
        buttons — `rebalancing-agents` records the reasoning: a broken image
        announces itself and takes an `alt` it has nothing to say in, and a
        button here would be a control that does nothing. An empty div is
        already invisible to assistive tech, so it needs no `aria-hidden`.
      */}
      {screen.classes.map((label) => (
        <div key={label} className={BOX} />
      ))}
    </div>
  );

  return (
    <section aria-labelledby="wizard-scenario-heading">
      {/*
        Uppercase is CSS, not copy — the accessible name stays the sentence case
        the artboard was written in, as on every chapter and on `/wizard`.

        Raw, NOT through `formatInline`: this is the section's accessible name,
        and a name assembled from fragments gains separating spaces the source
        string does not have (ADR 0004). No scenario title carries markup, and
        this is the line that keeps it that way.
      */}
      <h1
        id="wizard-scenario-heading"
        // `text-5xl` from `lg` only, app-wide (docs/styling.md §2). The four
        // scenario titles clear a phone column at 52px today — `HEMOPHILIA` is
        // the longest word at 234px — but the title is a data read, so the rule
        // is what keeps a future one from overflowing.
        className="font-display text-3xl font-bold tracking-wide text-brand-crimson-50 uppercase lg:text-5xl"
      >
        {screen.title}
      </h1>

      {/*
        `mt-8` is the 32px h1 gap every education chapter uses, and 26px is their
        body size — the artboard sets this screen's prose at the same step.

        **`text-xl lg:text-2xl` is that step ramped**, and this page is the third
        case of §2's body-copy exception rather than a fourth reading of it: the
        floor is 16px and three chapters sit on it with nowhere to go, while the
        two that transcribe their body at 26 (`rebalancing-agents`,
        `prophylaxis-guidance`) have exactly one step to give and take it. This
        screen transcribes at the same 26 off its own artboards, so it gives the
        same one — 20 is a step on the scale, not a collapse onto the other
        three's value. The argument is proportion, not fit: nothing here
        overflows at either size, but the `<h1>` drops 48 → 30 below `lg` (§2)
        while the prose sat at 24, rendering body at 0.8× the heading on a phone
        where the artboard draws 0.5×. At 20 it is 0.67×.

        Through `formatInline` for the italic polarity word, which is the whole
        reason that helper exists.
      */}
      <p className="mt-8 text-xl text-black lg:text-2xl">{formatInline(screen.lead)}</p>

      {/*
        No top margin: the artboard runs the bullets straight on from the lead at
        the same line rhythm, so they read as its continuation rather than as a
        block under it.

        Formatted too, though no class label carries markup today — the point of
        a paired-delimiter parser is that pointing it at unmarked strings costs
        nothing, and emphasising a word later becomes a data change.
      */}
      <BulletList items={screen.classes} className="text-xl lg:text-2xl" format={formatInline} />

      {/* Only HB +inhibitors has one. Plain prose under the list, not a bullet
          in it — it qualifies the whole list rather than joining it. */}
      {screen.caveat && (
        <p className="mt-8 text-xl text-black lg:text-2xl">{formatInline(screen.caveat)}</p>
      )}

      {/*
        `mt-40` is 160px, against the 164 the exports draw from the last line of
        prose to the top of this block — a gap the four screens agree on even
        where their box geometry does not. Rounded to the whole scale step when
        this file's spacing was normalised; the rhythm it reproduces is the
        artboard's, four pixels tighter.

        It does not ramp, and at 160px it is the largest gap in the app, so the
        reason is stated rather than left to open item 10: at 375 this screen is
        ~1250px of column against a 667px phone — the box block alone is 619 of
        it — so it scrolls whatever happens here, and halving the one gap
        recovers 6% and buys no screenful. The same call `/wizard` makes for its
        own `mt-20` (§14), and the opposite of the one `/wizard-intro` faced,
        where the question was whether a hero fit at all.
      */}
      {/*
        `flex-col-reverse` rather than a branch that renders the two in the other
        order: source order stays caption-then-boxes, so a screen reader meets the
        caption before the thing it describes on all four screens, whichever way
        the two are painted.

        The 32px between them is the container's `gap`, not a margin on either
        child, and that is what makes the reversal safe — margins stay physical
        when a column reverses, so a `mt-8` on the boxes would open its gap above
        them on the screen that flips and leave the caption sitting flush.
      */}
      <div className={cn("mt-40 flex flex-col gap-8", captionBelow && "flex-col-reverse")}>
        {caption}
        {boxes}
      </div>
    </section>
  );
}
