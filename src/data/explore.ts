/**
 * `/explore`'s authored content — CONTEXT.md §9's shared-decision-making
 * conclusion node, and the class-grouped index into the §6 drug sheets that the
 * artboard draws beneath it.
 *
 * **Both live in one module for `wizard.ts`'s reason.** That module holds the
 * blueprint's 32 verbatim notes beside `CLASSES_TO_CONSIDER`, whose titles and
 * leads exist only on the artboards; the split is not source-vs-artboard but
 * content-vs-markup, and both halves of this file are content. The page reads
 * them and draws them; it authors nothing.
 *
 * See `docs/adr/0007-explore-is-the-sdm-conclusion.md` for why this page is the
 * SDM node at all, where issue 09 specified the comparison table itself.
 */

/**
 * The page's `<h1>` — CONTEXT.md §9's SDM node, **as the artboard states it**.
 *
 * §9 stops at "…patient goals/preferences"; the artboard runs on into "when
 * making treatment decisions", which is what turns the fragment into a sentence
 * a page can be titled with. Transcribed with the tail, per the standing rule
 * that the artboard is the filing authority where it and `[PDF-V]` disagree.
 *
 * Sentence case, because `uppercase` is CSS on every heading in this app — the
 * accessible name stays the case it was written in.
 */
export const SDM_CONCLUSION =
  "Leverage multidisciplinary care and SDM with patient, emphasizing consideration of " +
  "risks, benefits, alternative treatment options, and patient goals/preferences when " +
  "making treatment decisions";

/**
 * The four bullets under it, verbatim from the artboard.
 *
 * CONTEXT.md §9 carries these **abridged** — "Focus on what matters to
 * patients/families; empower participation; improve understanding; support
 * adherence, quality of care, satisfaction" — which is a summary of the blueprint
 * rather than the blueprint's own sentences. The artboard supplies them in full,
 * so these are the longer form and §9 now records them.
 *
 * Note the tense shift the source makes and we keep: the first two bullets are
 * imperatives addressed to the clinician ("Focus…", "Empower…"), the last two are
 * statements about what SDM does ("Improves…", "Supports…"). It reads like a slip
 * and is not ours to repair.
 */
export const SDM_POINTS: readonly string[] = [
  "Focus on what matters most to patients, families, and caregivers",
  "Empower patients and caregivers to actively participate in education and decision-making " +
    "around treatment selection",
  "Improves understanding of treatment options and engages patients in their care",
  "Supports improved adherence, quality of care, and patient satisfaction",
];

/** One labelled column of agents inside a segment. */
export interface ExploreColumn {
  /**
   * The class label drawn under the column, **verbatim from the artboard** — not
   * a `TreatmentClass`.
   *
   * Three of the four disagree with the enum in `treatments.ts`: it sets
   * "Factor VIII mimetic" and "Hemostatic rebalancing agent" singular where the
   * artboard sets both plural, and "UHL clotting factor replacement" names a
   * half-life the enum has no term for at all — `Treatment.moa` is where
   * "Ultralong half-life" lives. This is the same call `CLASSES_TO_CONSIDER`
   * records: the source phrases a class differently per screen, so the label is
   * transcribed rather than derived.
   */
  label: string;
  /**
   * The agents in the column, in drawn order. **Verbatim names**, because the
   * name is the join key — `sheetFor()` looks a sheet up by it, exactly as
   * `/wizard/therapies` does with `Treatment.agent`. No id scheme in between.
   */
  agents: readonly string[];
}

/** One arched segment: the columns it holds, left to right. */
export interface ExploreSegment {
  columns: readonly ExploreColumn[];
  /**
   * Drawn width on the 1440 canvas, used as the flex ratio so the three scale
   * together instead of snapping. The segments tile the band 112→1328 with no
   * gaps: 339 + 524 + 353 = 1216.
   */
  width: number;
}

/**
 * The three segments, left to right.
 *
 * **A segment is a drawn group, not a class.** The right-hand one carries two
 * class labels side by side — UHL clotting factor replacement over Efanesoctocog
 * alfa, gene therapy over Etranacogene — under a single arch, which is why the
 * column sits between the segment and the agent rather than the two being one
 * level.
 *
 * **Authored, not derived.** `filterTreatments({ treatmentClass })` would
 * reproduce three of these four columns and then hand back SHL and EHL as well —
 * the two generic rows CONTEXT.md §6 records as having no sheet by design, and
 * which the artboard does not draw. A derivation that needs a subtraction to
 * reach a hand-composed picture is not a derivation.
 *
 * All seven agents here have a §6 sheet; `content.test.ts` asserts it rather than
 * assuming it, which is what lets `Explore` mark every `+` `aria-haspopup`
 * unconditionally.
 */
export const EXPLORE_SEGMENTS: readonly ExploreSegment[] = [
  {
    width: 339,
    columns: [{ label: "FVIIIa mimetics", agents: ["Emicizumab", "Denecimig"] }],
  },
  {
    width: 524,
    columns: [
      {
        label: "Hemostatic rebalancing agents",
        agents: ["Concizumab", "Marstacimab", "Fitusiran"],
      },
    ],
  },
  {
    width: 353,
    columns: [
      { label: "UHL clotting factor replacement", agents: ["Efanesoctocog alfa"] },
      { label: "Gene therapy", agents: ["Etranacogene dezaparvovec-drlb"] },
    ],
  },
];

/** Every agent the page draws a `+` for, in drawn order. */
export const EXPLORE_AGENTS: readonly string[] = EXPLORE_SEGMENTS.flatMap((segment) =>
  segment.columns.flatMap((column) => column.agents),
);

/**
 * The title of the pop-up the "Explore therapy options for HA/HB" button opens,
 * and the button's own label.
 *
 * One constant for both, the move `WizardIntro` makes with `WIZARD_INPUT_TITLE`:
 * the card cannot end up named something other than the control that summons it.
 */
export const EXPLORE_TABLE_TITLE = "Explore therapy options for HA/HB";
