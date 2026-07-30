import { PopupButton } from "mlg-components";

import BulletList from "../../components/BulletList";
import {
  type RebalancingMechanism,
  REBALANCING_AGENTS,
  rebalancingAgentLabel,
  topicById,
} from "../../data/education";
import { cn } from "../../lib/cn";

/**
 * `/education/rebalancing-agents` — CONTEXT.md §7.6, and a wizard cross-link
 * target (issue 08), so this slug is contractual.
 *
 * Non-null for the reason the other two chapters record: the id is a literal in
 * this repo's own data module, and the chapter test asserts it resolves.
 */
const AGENTS = topicById("rebalancing-agents")!;

/**
 * The chapter's `<h1>`, a **literal** — the artboard's title and the topic's
 * are not the same string. `rebalancing-agents` is called "Hemostatic
 * Rebalancing Agents in Treatment of HA/HB" in §7.6, and the design drops the
 * scope qualifier. The same call `disease-background` makes, and the opposite
 * of `treatment-landscape`, which reads its title because the artboard
 * reproduces it exactly.
 */
const HEADING = "Hemostatic Rebalancing Agents";

/**
 * The line under the three boxes.
 *
 * Sentence case here and shouted in CSS, as everywhere else in this codebase —
 * the accessible name stays readable.
 */
const BOXES_CAPTION = "Click on the boxes to learn more about hemostatic rebalancing agents";

/**
 * The one §7.7 click-through target on this chapter: the caption beside the
 * `+`, and the button's accessible name — `PopupButton` prefixes it with
 * "Expand"/"Close".
 *
 * §7.7's spelling, not the artboard's: the drawing reads "homeostatic
 * rebalancing agents", which is a different word — homeostasis is not
 * hemostasis — and CONTEXT.md §7.6/§7.7 both write "hemostatic", as does every
 * other mention in this repo. Not reproduced, the same call
 * `disease-background` makes for the export's "FACOTOR".
 */
const MECHANISMS_LABEL =
  "Mechanisms of hemostatic rebalancing agents within the coagulation cascade";

/**
 * Colour by mechanism class, which is what the artboard draws: the two
 * anti-TFPI mABs in blue, the AT-directed siRNA in crimson.
 *
 * A `Record` over the union, so it is **exhaustive by construction** — a third
 * mechanism added to `RebalancingMechanism` fails to compile here rather than
 * rendering an agent in no colour at all. That is the whole reason the data
 * module models `mechanism` as a union instead of a string.
 *
 * The two tokens are a pair; see `tokens.css`, where the blue is transcribed
 * verbatim because it derives from no step of any brand ramp.
 */
const MECHANISM_TONE: Record<RebalancingMechanism, string> = {
  "anti-TFPI mAB": "text-agent-mab",
  "AT-directed siRNA": "text-agent-sirna",
};

/**
 * Composed bullet → its tone, keyed by the exact string the data module puts in
 * the topic's `children`.
 *
 * Both sides call `rebalancingAgentLabel`, which is why this is a safe join
 * rather than a string match that quietly stops matching: there is one
 * composition, and if it changes, both keys and children change with it.
 */
const AGENT_TONE: ReadonlyMap<string, string> = new Map(
  REBALANCING_AGENTS.map((agent) => [
    rebalancingAgentLabel(agent),
    MECHANISM_TONE[agent.mechanism],
  ]),
);

/**
 * The width of the three-box group — 3 × 227 + 2 × 141, off the artboard below.
 *
 * Named because three things are measured against it and must agree: the boxes
 * themselves, and the bottom row, whose caption starts on the group's left edge
 * rather than the content column's.
 */
const GROUP = "mx-auto w-full max-w-240.5";

export default function RebalancingAgents() {
  return (
    <section aria-labelledby="chapter-heading">
      {/* Uppercase is CSS, not copy — the accessible name stays title-case, as
          on every other chapter. */}
      <h1
        id="chapter-heading"
        className="font-display text-h1 tracking-wide text-brand-crimson-50 uppercase"
      >
        {HEADING}
      </h1>

      {/*
        Two bullets, the second carrying the three agents — the topic's whole
        `body`, with no slicing, because the mechanism prose the artboard does
        not draw was split into `rebalancing-mechanisms` rather than left here
        to be cut off by an index.

        `mt-8` is the designer's 32px h1 gap, the same value both other
        chapters use.
      */}
      <BulletList
        items={AGENTS.body}
        className="mt-8 text-[26px]"
        // `font-bold` for every child, tone for the class it belongs to: the
        // weight is the same on all three, so it is stated once here rather
        // than folded into both entries of MECHANISM_TONE.
        childClassName={(child) => cn("font-semibold", AGENT_TONE.get(child))}
      />

      <div className="mt-14">
        {/*
          The three figures that are not here yet. CONTEXT.md §7.7 marks all 24
          §7 figures image-borne and these three have no asset — the artboard
          draws its own "PLACEHOLDER" in them, so the designer has not placed
          them either — and they ship as reserved boxes at the drawn 227×185,
          holding the group open so real thumbnails do not re-cut the row.

          Empty `<div>`s rather than `<img>`s without a `src`, and rather than
          buttons: a broken image announces itself and takes an `alt` it has
          nothing to say in, and a button here would be a control that does
          nothing. An empty div is already invisible to assistive tech, so it
          needs no `aria-hidden`.

          **The caption beneath them is therefore an instruction that does not
          yet work.** It ships as drawn because this pass is the layout; wiring
          it needs the designer to say what a box opens, which §7.7 does not.
        */}
        <div className={cn(GROUP, "flex flex-col items-center gap-8 lg:flex-row lg:gap-x-35.25")}>
          {REBALANCING_AGENTS.map((agent) => (
            <div
              key={agent.name}
              className="h-48 w-full max-w-56 shrink-0 border-4 border-black lg:shrink"
            />
          ))}
        </div>

        {/*
          Centred on the content column rather than on the group: the caption is
          1082px of ink against the group's 963, so it overhangs both sides on
          the artboard, and the two share a centre line.
        */}
        <p className="mt-4 text-center text-h3 font-bold text-popup-caption uppercase">
          {BOXES_CAPTION}
        </p>

        {/*
          The §7.7 disclosure. Caption to the LEFT of the button, which no other
          chapter does — `DisclosureBand` and `treatment-landscape` both stack
          it underneath — and left-aligned to the group's left edge rather than
          to the content column's.

          `flex-wrap` rather than an `lg:` switch: the only thing that has to
          give below the canvas is the button dropping under the caption, and
          the row does that on its own.
        */}
        <div className={cn(GROUP, "mt-20 flex flex-wrap items-start gap-x-6 gap-y-4")}>
          <p className="max-w-135 text-h3 font-bold text-popup-caption">{MECHANISMS_LABEL}</p>

          {/*
            **Opens nothing, deliberately.** The figure it names is image-borne
            and its asset has not landed, so there is no `Popup` mounted here
            and no `aria-haspopup` — announced only where something will
            actually open, per `DisclosureBand`. Uncontrolled, so the `+`
            sticks as `✕` once clicked; that is the placeholder state issue 11
            accepts, and the same one `treatment-landscape`'s three buttons
            shipped in.

            The prose the card will hold is already modelled, as the
            `rebalancing-mechanisms` topic.
          */}
          <PopupButton label={MECHANISMS_LABEL} />
        </div>
      </div>
    </section>
  );
}
