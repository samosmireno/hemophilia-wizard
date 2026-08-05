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
 * The page's `<h1>` — CONTEXT.md §9's SDM node, **shortened to its opening
 * clause at the client's direction**.
 *
 * Both longer statements of it — §9's, which ends at "…patient
 * goals/preferences", and the artboard's, which runs on into "when making
 * treatment decisions" — are the same sentence at different lengths. The page
 * now carries only its head, plural "patients"; the enumeration of risks,
 * benefits, and options it dropped is what the bullets below already say.
 *
 * Sentence case, because `uppercase` is CSS on every heading in this app — the
 * accessible name stays the case it was written in.
 */
export const SDM_CONCLUSION = "Leverage multidisciplinary care and SDM with patients";

/**
 * The sentence between the heading and the bullets.
 *
 * New on 2026-08-05 with the client's rewrite. The artboard drew four bullets of
 * which the last two were statements about what SDM does ("Improves…",
 * "Supports…") rather than the imperatives the first two are; the rewrite folds
 * both into this one sentence and lifts it out of the list, which is what
 * resolves the tense shift the artboard's set carried.
 */
export const SDM_LEAD =
  "SDM engages patients in their care, improves quality of care, and increases patient " +
  "satisfaction";

/**
 * The three bullets under that, per the client's 2026-08-05 rewrite.
 *
 * They are the artboard's first two, one of them shortened ("…in education and
 * treatment decisions" for "…in education and decision-making around treatment
 * selection"), plus "Utilize SDM to support improved adherence" — the adherence
 * half of the old fourth bullet, restated as an imperative so all three now
 * address the clinician in the same voice. The rest of that bullet and all of
 * the old third one are in `SDM_LEAD` above. §9 records the artboard's set.
 */
export const SDM_POINTS: readonly string[] = [
  "Focus on what matters most to patients, families, and caregivers",
  "Empower patients and caregivers to actively participate in education and treatment decisions",
  "Utilize SDM to support improved adherence",
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
    columns: [{ label: "FVIII mimetics", agents: ["Emicizumab", "Denecimig"] }],
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
