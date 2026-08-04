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
 * The gap is `gap-x-30` — 120px, the scale step next to that measured 119. Three
 * boxes plus two gaps is 921px against the 1168px content column, so the row fits
 * with room to spare at the design width.
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

  const caption = (
    <p className="text-center text-2xl font-bold text-popup-caption uppercase">{screen.caption}</p>
  );

  /*
    Column on a phone, row from `lg`, exactly as `rebalancing-agents` stacks its
    own three — `shrink-0` while stacked so a box keeps its height, `lg:shrink`
    so the row can give if a narrow viewport asks it to.

    Centred on the content column. The artboards centre this block on the full
    1440 canvas instead, which puts it ~24px right of where `mx-auto` lands,
    because the drawing does not account for the sidebar rail the way `AppShell`
    does. Reproducing that would mean breaking the block out of the column it
    sits in, to honour a number the design did not mean to state.
  */
  const boxes = (
    <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-center lg:gap-x-30">
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

        Through `formatInline` for the italic polarity word, which is the whole
        reason that helper exists.
      */}
      <p className="mt-8 text-2xl text-black">{formatInline(screen.lead)}</p>

      {/*
        No top margin: the artboard runs the bullets straight on from the lead at
        the same line rhythm, so they read as its continuation rather than as a
        block under it.

        Formatted too, though no class label carries markup today — the point of
        a paired-delimiter parser is that pointing it at unmarked strings costs
        nothing, and emphasising a word later becomes a data change.
      */}
      <BulletList items={screen.classes} className="text-2xl" format={formatInline} />

      {/* Only HB +inhibitors has one. Plain prose under the list, not a bullet
          in it — it qualifies the whole list rather than joining it. */}
      {screen.caveat && <p className="mt-8 text-2xl text-black">{formatInline(screen.caveat)}</p>}

      {/*
        `mt-40` is 160px, against the 164 the exports draw from the last line of
        prose to the top of this block — a gap the four screens agree on even
        where their box geometry does not. Rounded to the whole scale step when
        this file's spacing was normalised; the rhythm it reproduces is the
        artboard's, four pixels tighter.
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
