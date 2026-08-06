/**
 * Treatment Wizard — the branching decision model (the MAIN engine).
 *
 * Source of truth: the blueprint in `documents/HM-85L Hemophilia Treatment
 * Wizard_V3_Vector.pdf`. Extracted with text coordinates so each recommendation
 * list is tied to the correct scenario branch.
 *
 * This is distinct from `treatments.ts`:
 *   - `treatments.ts`  = the "Explore therapy options" filterable comparison
 *     table (a COMPUTED attribute filter over all treatments).
 *   - `wizard.ts` (here) = the guided wizard: an AUTHORED lookup keyed by
 *     (hemophilia type, inhibitor status, reason for switching) that returns a
 *     clinically curated set of novel therapies. These lists are hand-picked in
 *     the source material and are intentionally NOT derivable by filtering
 *     (e.g. HA + "reduced monitoring" narrows to the two FVIIIa mimetics only).
 *
 * Flow: "Does the patient have Hemophilia A or B?" → "Does the patient have
 * inhibitors?" → "What is the primary reason for switching therapy?" → a
 * recommended agent list + the scenario-specific Considerations/Strategies note
 * pair for that (scenario, reason). Each recommended agent maps to a pop-up drug
 * information sheet (see drug-sheets.ts / DRUG_SHEETS).
 */

import type { Bullet } from "./education";
import { TREATMENTS, type Treatment } from "./treatments";

/**
 * The blueprint's entry node — the line the wizard opens on (CONTEXT.md §4),
 * verbatim but for the trailing full stop, which the source sets because it
 * draws the node as a sentence and `/wizard-intro` renders it as a heading.
 *
 * Title case is the source's own; the page uppercases it in CSS, as every
 * education chapter does with its sentence-case heading, so the accessible name
 * stays the copy that was written rather than a shout.
 */
export const WIZARD_ENTRY_PROMPT = "Explore Novel Prophylactic Therapy Options for Your Patient";

/**
 * The `/wizard` artboard's own title, and the label of the `/wizard-intro`
 * button that leads there — one constant so the button cannot name a
 * destination the destination does not call itself.
 *
 * Sentence case, uppercased in CSS at both call sites, as every heading in the
 * app is. Nowhere in CONTEXT.md: the blueprint has no such screen title, so this
 * is artboard copy, transcribed.
 */
export const WIZARD_INPUT_TITLE = "Input patient characteristics";

/**
 * The three question prompts as the artboard sets them, which is NOT how the
 * blueprint phrases them (CONTEXT.md §4):
 *
 * | | blueprint | artboard |
 * | --- | --- | --- |
 * | type | "Does the patient have Hemophilia A or Hemophilia B?" | "Disease type" |
 * | inhibitors | "Does the patient have inhibitors?" | "Does the patient have inhibitors" |
 * | reason | "Primary reason for switching therapy?" | "…for considering a treatment option?" |
 *
 * The artboard wins for anything rendered; the blueprint's wording stays the
 * domain vocabulary and is what §4.2's 32 note titles are written against (they
 * still say "…is the primary reason for switching therapies"). Verbatim
 * transcription includes the inconsistent punctuation — the inhibitor prompt
 * carries no question mark on the artboard and the reason prompt does.
 */
export const WIZARD_QUESTIONS = {
  type: "Disease type",
  inhibitors: "Does the patient have inhibitors",
  reason: "What is the primary reason for considering a treatment option?",
} as const;

export type WizardHemophiliaType = "A" | "B";

/** The two answers to Q1, in the artboard's left-to-right order. */
export const HEMOPHILIA_TYPES: { id: WizardHemophiliaType; label: string }[] = [
  { id: "A", label: "Hemophilia A" },
  { id: "B", label: "Hemophilia B" },
];

/** The wizard's third question — the primary reason for switching therapy. */
export type SwitchReason = "bleeding-control" | "adherence" | "treatment-burden" | "monitoring";

export interface SwitchReasonOption {
  id: SwitchReason;
  /** What the wizard screen renders: the artboard's imperative phrasing. */
  label: string;
  /**
   * The blueprint's own gerund phrasing (CONTEXT.md §4). Kept beside the label
   * rather than dropped because it is the wording the source uses everywhere
   * else — the §4.2 note titles and the leaf's "Novel therapies to consider if
   * [reason] is the primary reason for switching therapies:" header — so the
   * pages that render those need this form, not the button's.
   */
  sourceLabel: string;
}

/**
 * Order here is the blueprint's (CONTEXT.md §4.1's matrix reads in it). The
 * artboard lays the four out in a 2×2 grid in a *different* reading order; that
 * is a layout fact and lives on the page, not in the data.
 */
export const SWITCH_REASONS: SwitchReasonOption[] = [
  {
    id: "bleeding-control",
    label: "Improve bleeding control",
    sourceLabel: "Improving bleeding control",
  },
  { id: "adherence", label: "Increase adherence", sourceLabel: "Increased adherence" },
  {
    id: "treatment-burden",
    label: "Reduce treatment burden",
    sourceLabel: "Reduced treatment burden",
  },
  {
    id: "monitoring",
    label: "Reduce monitoring requirement",
    sourceLabel: "Reduced monitoring requirement",
  },
];

/** Scenario = hemophilia type + inhibitor status. Four in total. */
export type ScenarioKey = "A-without" | "A-with" | "B-without" | "B-with";

export function scenarioKey(type: WizardHemophiliaType, hasInhibitors: boolean): ScenarioKey {
  return `${type}-${hasInhibitors ? "with" : "without"}` as ScenarioKey;
}

/**
 * Canonical agent identifiers used by the wizard's recommendation lists.
 * Values match `Treatment.agent` in treatments.ts so the two models join.
 * "Gene therapy" in the blueprint = Etranacogene dezaparvovec-drlb.
 */
export const AGENTS = {
  emicizumab: "Emicizumab",
  denecimig: "Denecimig",
  concizumab: "Concizumab",
  marstacimab: "Marstacimab",
  fitusiran: "Fitusiran",
  etranacogene: "Etranacogene dezaparvovec-drlb",
} as const;

const MIMETICS = [AGENTS.emicizumab, AGENTS.denecimig];
const REBALANCING = [AGENTS.concizumab, AGENTS.marstacimab, AGENTS.fitusiran];
const GENE = [AGENTS.etranacogene];

/**
 * scenario → reason → recommended agent names (verbatim from the blueprint).
 * Order within each list follows the source (mimetics first, then rebalancing,
 * then gene therapy).
 */
export const RECOMMENDATIONS: Record<ScenarioKey, Record<SwitchReason, string[]>> = {
  "A-without": {
    "bleeding-control": [...MIMETICS, ...REBALANCING],
    adherence: [...MIMETICS, ...REBALANCING],
    "treatment-burden": [...MIMETICS, ...REBALANCING],
    monitoring: [...MIMETICS], // reduced monitoring → mimetics only
  },
  "A-with": {
    "bleeding-control": [...MIMETICS, ...REBALANCING],
    adherence: [...MIMETICS, ...REBALANCING],
    "treatment-burden": [...MIMETICS, ...REBALANCING],
    monitoring: [...MIMETICS],
  },
  "B-without": {
    "bleeding-control": [...REBALANCING],
    adherence: [...REBALANCING, ...GENE], // gene therapy offered for HB w/o inhibitors
    "treatment-burden": [...REBALANCING, ...GENE],
    monitoring: [...REBALANCING],
  },
  "B-with": {
    "bleeding-control": [...REBALANCING],
    adherence: [...REBALANCING],
    "treatment-burden": [...REBALANCING],
    monitoring: [...REBALANCING],
  },
};

/**
 * The "Therapeutic classes to consider" box each scenario band opens with,
 * shown BEFORE the reason question (CONTEXT.md §4). Labels are the verbatim box
 * wording — deliberately NOT the `TreatmentClass` enum, because the source
 * phrases the same class differently per scenario (e.g. "FIX prophylaxis" and
 * "Recombinant FVIII concentrates" are both clotting factor replacement).
 */
export interface ClassesToConsider {
  /**
   * The `/wizard/scenario` artboard's own `<h1>` — the scenario named in full.
   *
   * Sentence case, uppercased in CSS at the one call site, as every heading in
   * the app is. Not composed from `HEMOPHILIA_TYPES` and the inhibitor answer:
   * see `lead` below, whose four values prove the screens are transcribed rather
   * than templated, and this is the same four screens' other half.
   */
  title: string;
  /**
   * The sentence above the class list, as the artboard sets it.
   *
   * **Carries inline markup** — the polarity word is italic on all four screens,
   * written `_with_` / `_without_` and rendered through `formatInline` (ADR
   * 0004). That emphasis is not decorative: it is the one word distinguishing
   * two otherwise near-identical sentences, and the branch the screen turns on.
   *
   * **Transcribed, not templated, and HB +inhibitors is why.** Three screens
   * read "Therapeutic classes to consider for prophylaxis of …"; that one reads
   * "Therapeutic **options** for prophylaxis of …", because its list is a single
   * class rather than a choice between several. A template would have quietly
   * normalised that away.
   */
  lead: string;
  /** Verbatim class labels listed in the box. */
  classes: string[];
  /**
   * The line by the illustration boxes, telling the learner they open.
   *
   * Two distinct sentences across the four screens, again not derivable: the
   * three multi-box screens say "Click on the boxes below to learn more about
   * each type of therapy", and the one single-box screen abandons that phrasing
   * for the app's "Click here:" idiom and names the class outright. (The
   * blueprint hedged with "Click on the box(es) below" — CONTEXT.md §4 — where
   * the artboard rewrote the sentence instead.)
   *
   * WHERE it is drawn is not here: above the boxes on the multi-box screens,
   * below the single one. That is a layout fact and lives on the page, the same
   * split `Wizard.tsx` records for `REASON_READING_ORDER`.
   */
  caption: string;
  /** Scenario-specific caveat (only HB +inhibitors carries one). */
  caveat?: string;
}

/**
 * The caption the three multi-box screens share, stated once.
 *
 * A constant rather than three copies of the same sentence, because they ARE the
 * same sentence: the artboards draw one line of copy on three screens, and a
 * reword that reached two of them would be a bug the type system cannot see.
 * `B-with` states its own inline, which is what makes it visible as the
 * exception it is.
 */
const BOXES_CAPTION = "Click on the boxes below to learn more about each type of therapy";

/**
 * scenario → the class-level guidance box shown before the reason question.
 * `classes` and `caveat` are verbatim from `[PDF-V]` CENTER band
 * (`documents/out_raw.txt`); `title`, `lead` and `caption` are the four
 * `/wizard/scenario` artboards, which the blueprint has no equivalent of.
 *
 * **Double spaces in the exports are not transcribed.** "for  prophylaxis" on
 * the HA +inhibitors lead and "TO LEARN  MORE" in the shared caption are
 * justification artifacts of the drawn text block, not authored spacing — the
 * same call `disease-background` makes for the export's "FACOTOR".
 */
export const CLASSES_TO_CONSIDER: Record<ScenarioKey, ClassesToConsider> = {
  "A-without": {
    title: "Hemophilia A without inhibitors",
    lead: "Therapeutic classes to consider for prophylaxis of HA _without_ inhibitors",
    classes: [
      "Recombinant FVIII concentrates",
      "Factor VIIIa mimetics",
      "Hemostatic rebalancing agents",
    ],
    caption: BOXES_CAPTION,
  },
  "A-with": {
    title: "Hemophilia A with inhibitors",
    lead: "Therapeutic classes to consider for prophylaxis of HA _with_ inhibitors",
    /**
     * **"agents" is the artboard's; `[PDF-V]` sets it singular.** The artboard is
     * the filing authority for anything rendered — the call `fviii-mimetics`
     * records twice for its own copy — and the singular reads as a source slip
     * rather than a distinction, since the same list's FIRST item is deliberately
     * singular here where `A-without`'s is plural.
     *
     * **"Factor VIII mimetic", not "Factor VIIIa" (2026-08-05)** — a client copy
     * edit on this screen only, so `A-without` keeps the activated form the
     * artboards draw. Deliberate divergence; not a typo to reconcile.
     */
    classes: ["Factor VIII mimetic", "Hemostatic rebalancing agents"],
    caption: BOXES_CAPTION,
  },
  "B-without": {
    title: "Hemophilia B without inhibitors",
    lead: "Therapeutic classes to consider for prophylaxis of HB _without_ inhibitors",
    classes: ["Hemostatic rebalancing agents", "FIX prophylaxis", "Gene therapy"],
    caption: BOXES_CAPTION,
  },
  "B-with": {
    title: "Hemophilia B with inhibitors",
    // "options", where the other three say "classes to consider" — see `lead`.
    lead: "Therapeutic options for prophylaxis of HB _with_ inhibitors",
    classes: ["Hemostatic rebalancing agents"],
    caption: "Click here: information on hemostatic rebalancing agents",
    caveat:
      "Note: Bypassing agents (aPCC, rFVIIa) can manage breakthrough bleeds in patients with inhibitors, but sustained prophylaxis with these agents remains challenging",
  },
};

/** One "Pop-up note" — a title plus its bullet list. Text is verbatim from the source. */
export interface NoteBlock {
  title: string;
  /**
   * `Bullet`, not `string[]`, because four of the 32 notes genuinely carry a
   * nested level — the `treatment-burden` Considerations in every scenario open
   * a lead-in with a colon ("Frequent IV therapy is particularly challenging for
   * children:") and subordinate their age-restriction bullets to it.
   *
   * **The nesting is measured, not inferred from the colon.** `documents/out.txt`
   * is a layout-preserving dump, and in it the top-level bullets of those notes
   * start at column 1755 while the age bullets start at 1763 — a real indent the
   * `out_raw.txt` band extraction flattens away, because its `[x=…]` headers are
   * page regions rather than per-line positions. The same measurement is what
   * keeps `B-without`'s trailing gene-therapy bullet OUT of the nest: it sits
   * back at 1755, and on content grounds it is about gene therapy rather than
   * about children.
   *
   * Reusing `education.ts`'s type rather than declaring a second one: a bullet
   * with one nested level is the same shape wherever the source draws it, and
   * `BulletList` already renders it as markup rather than as indentation. The
   * import is `import type`, so it is erased at build and couples nothing.
   */
  points: Bullet[];
}

/**
 * The pair of light-blue pop-up notes a leaf shows for one (scenario, reason):
 * a "Considerations for …" list and a "Strategies for …" list.
 */
export interface ReasonNote {
  considerations: NoteBlock;
  strategies: NoteBlock;
}

/**
 * scenario → reason → { considerations, strategies } notes, verbatim from
 * `[PDF-V]` (see CONTEXT.md §4.2). The blueprint carries 32 distinct notes
 * (4 scenarios × 4 reasons × {Considerations, Strategies}); the copy is
 * SCENARIO-SPECIFIC, not shared per reason — e.g. the HB notes name hemostatic
 * rebalancing agents / gene therapy while the HA notes name FVIIIa mimetics and
 * a factor washout, and the "+inhibitors" bleeding-control note calls out
 * bypassing agents. Title wording also varies across scenarios (e.g. monitoring:
 * "…Requirements" / "…Requirement" / "…to Reduce Monitoring") and is preserved
 * as-is. Full verbatim source: `documents/out_raw.txt` (CENTER band).
 */
export const SCENARIO_NOTES: Record<ScenarioKey, Record<SwitchReason, ReasonNote>> = {
  "A-without": {
    "bleeding-control": {
      considerations: {
        title: "Considerations for Improving Bleeding Control",
        points: [
          "NFTs for hemophilia prophylaxis represent a major advance in effective bleeding prevention",
          "Patient selection for NFTs requires careful consideration of multiple factors, including response to current therapy, bleeding patterns, age restrictions, comorbidities, and concurrent medications",
          "Monitoring includes clinical bleeding assessment and product-specific laboratory monitoring",
          "Early evidence suggests that joint protection with NFTs is comparable to that of traditional factor prophylaxis",
        ],
      },
      strategies: {
        title: "Strategies for Improving Bleeding Control",
        points: [
          "Plan for multidisciplinary monitoring to maintain hemostatic coverage during transition from factor to non-factor prophylaxis",
          "Account for agent-specific initiation requirements, including loading dose, dose optimization, or laboratory-guided dose adjustment when applicable.",
          "Monitor for decreased clinical response or loss of bleed control",
          "Anticipate treatment interactions when managing breakthrough bleeding",
          "Plan for treatment with clotting factors or other hemostatic agents for more serious bleeding episodes or major surgery",
          "Plan for a washout period of 3 to 5 half-lives of factor therapy before starting anti-TFPI treatment; avoid high factor activity when initiating anti-TFPI mABs due to risk of thrombosis",
        ],
      },
    },
    adherence: {
      considerations: {
        title: "Considerations for Improving Treatment Adherence",
        points: [
          "SC administration with NFTs makes treatment more convenient compared with IV administration",
          "Prefilled single-use pens/devices support adherence by simplifying administration steps and reducing preparation time",
          "Less frequent dosing of NFTs may reduce missed doses and improve consistency",
        ],
      },
      strategies: {
        title: "Strategies for Improving Treatment Adherence",
        points: [
          "Educate patients when transitioning from factor to nonfactor therapies about MOAs, the importance of adhering to new dosing regimens, and when to seek medical intervention for breakthrough bleeds",
          "Employ SDM: Treatment decisions should account for lifestyle factors and patient/caregiver preferences regarding dosing schedules and administration",
          "Consider tools such as VERITAS-Pro, a patient/caregiver questionnaire designed to assess adherence to prophylactic therapy",
        ],
      },
    },
    "treatment-burden": {
      considerations: {
        title: "Considerations for Reducing Treatment Burden and Improving QoL",
        points: [
          "SC administration reduces the burden associated with IV access, infusion preparation, and venous access challenges",
          "Less frequent dosing schedules improve convenience",
          "Simplified dosing approaches, such as fixed or tiered dosing, may reduce the need for frequent dose calculations and ongoing treatment adjustments",
          "Prefilled dosing pens simplify preparation and administration, reduce dosing complexity, and support at-home treatment",
          {
            text: "Frequent IV therapy is particularly challenging for children:",
            /* `≥`, not the source's bare `>` — the fourth and last pass of the
               2026-08-05 client copy edit, which had already reached `B-with`,
               `B-without`, and `A-with`. Every scenario now carries `≥`; the
               bare `>` the source set survives only in `treatments.ts` and
               `drug-sheets.ts`, which the edit did not name. The denecimig
               bullet keeps its "of age" — the edit changed the sign, not the
               wording, so it still differs from `A-with`'s "≥1 year". */
            children: [
              "Emicizumab is indicated for younger patients, including newborns; denecimig was evaluated in patients ≥1 year of age",
              "Marstacimab is indicated for patients ≥ age 6 years",
              "Other FDA-approved options are indicated for children ≥12 years",
            ],
          },
        ],
      },
      strategies: {
        title: "Strategies for Reducing Treatment Burden and Improving QoL",
        points: [
          "Discuss options for less frequent or more convenient SC dosing with appropriate patients",
          "Consider options for less burdensome dosing and administration for younger patients when possible",
          "Plan follow-up and education to support safe at-home administration and timely management of breakthrough bleeds",
        ],
      },
    },
    monitoring: {
      considerations: {
        title: "Considerations for Reducing Monitoring Requirement",
        points: [
          "NFTs avoid the need for routine FVIII/FIX peak/trough monitoring and PK-guided dose optimization",
          "Monitoring patients on NFTs presents unique challenges; traditional tests, such as aPTT do not accurately measure bleeding risk",
          "FVIII mimetics require monitoring of clinical bleed control and product-specific safety considerations; for emicizumab, monitor for thrombotic microangiopathy or thromboembolic events if aPCC is administered",
          "Thoughtful patient selection for NFTs is essential",
        ],
      },
      strategies: {
        title: "Strategies for Reducing Monitoring Requirement",
        points: [
          "Develop protocols for bleed control and product-specific monitoring",
          "Use appropriate assays when laboratory assessment is needed",
        ],
      },
    },
  },
  "A-with": {
    "bleeding-control": {
      considerations: {
        title: "Considerations for Improving Bleeding Control",
        points: [
          "NFTs for hemophilia prophylaxis represent a major advance in effective bleeding prevention",
          "Patient selection for NFTs requires careful consideration of multiple factors, including response to current therapy and bleeding patterns, age restrictions, comorbidities, and concurrent medications",
          "Patients with inhibitors often have inadequate bleeding control with bypassing agents and may benefit significantly from novel NFTs",
          "Monitoring includes clinical bleeding assessment and product-specific laboratory monitoring",
          "Early evidence suggests that joint protection with NFTs is comparable to that of traditional factor prophylaxis",
          "For patients with inhibitors, guidelines recommend prophylaxis with emicizumab over bypassing agents; FVIIIa mimetics do not cause/increase FVIII inhibitors and maintain efficacy in their presence",
        ],
      },
      strategies: {
        title: "Strategies for Improving Bleeding Control",
        points: [
          "Plan for multidisciplinary monitoring to maintain hemostatic coverage during transition from factor to non-factor prophylaxis",
          "Account for agent-specific initiation requirements, including loading dose, dose optimization, or laboratory-guided dose adjustment when applicable.",
          "Monitor for loss of efficacy",
          "Anticipate treatment interactions when managing breakthrough bleeding",
          "Plan for treatment with clotting factors or other hemostatic agents for more serious bleeding episodes or major surgery",
          "Plan for a washout period when transitioning from prior therapies, as appropriate, based on the selected agent",
          "For patients requiring bypassing-agent therapy while receiving FVIIIa-mimetic prophylaxis, avoid or minimize aPCC when possible because of thrombotic risk",
        ],
      },
    },
    adherence: {
      considerations: {
        title: "Considerations for Improving Treatment Adherence",
        points: [
          "SC administration with NFTs makes treatment more convenient compared with IV administration",
          "Prefilled single-use pens/devices support adherence by simplifying administration steps and reducing preparation time",
          "Less frequent dosing of NFTs may reduce missed doses and improve consistency",
        ],
      },
      strategies: {
        title: "Strategies for Improving Treatment Adherence",
        points: [
          "Educate patients when transitioning from factor to nonfactor therapies about MOAs, the importance of adhering to new dosing regimens, and when to seek medical intervention for breakthrough bleeds",
          "Employ SDM: Treatment decisions should account for lifestyle factors and patient/caregiver preferences regarding dosing schedules and administration",
          "Consider tools such as VERITAS-Pro, a patient/caregiver questionnaire designed to assess adherence to prophylactic therapy",
        ],
      },
    },
    "treatment-burden": {
      considerations: {
        title: "Considerations for Reducing Treatment Burden and Improving QoL",
        points: [
          "SC administration reduces the burden associated with IV access, infusion preparation, and venous access challenges",
          "Less frequent dosing schedules (weekly, every-other-week, or monthly) improve convenience and support adherence",
          "Simplified dosing approaches, such as fixed or tiered dosing, may reduce the need for frequent dose calculations and ongoing treatment adjustments",
          "Prefilled dosing pens simplify preparation and administration, reduce dosing complexity, and support at-home treatment",
          {
            /* Same lead-in as `A-without`, and its first child differs by two
               words — "≥1 year" here, "≥1 year of age" there. Transcribed as the
               source sets each rather than reconciled. */
            text: "Frequent IV therapy is particularly challenging for children:",
            /* `≥`, not the source's bare `>` — a third pass of the 2026-08-05
               client copy edit extended to this scenario what it asked for in
               `B-with` and then `B-without`, and a fourth pass finished
               `A-without`. The denecimig bullet moves with the other two:
               `education.ts`'s FRONTIER3 bullet already writes that age limit
               as "≥1 year of age". */
            children: [
              "Emicizumab is indicated for younger patients, including newborns; denecimig was evaluated in patients ≥1 year",
              "Marstacimab is indicated for patients ≥ age 6 years",
              "Other FDA-approved options are indicated for children ≥12 years",
            ],
          },
        ],
      },
      strategies: {
        title: "Strategies for Reducing Treatment Burden and Improving QoL",
        points: [
          "Discuss options for less frequent or more convenient SC dosing with appropriate patients",
          "Consider options for less burdensome dosing and administration for younger patients when possible",
          "Plan follow-up and education to support safe at-home administration and timely management of breakthrough bleeds",
        ],
      },
    },
    monitoring: {
      considerations: {
        title: "Considerations to Reduce Monitoring",
        points: [
          "NFTs avoid the need for routine FVIII/FIX peak/trough monitoring and PK-guided dose optimization",
          "Monitoring patients on NFTs presents unique challenges; traditional tests, such as aPTT do not accurately measure bleeding risk",
          "NFTs require monitoring of clinical bleed control and product-specific safety monitoring, such as thrombotic risk, liver function, AT, or drug concentration, depending on the agent",
        ],
      },
      strategies: {
        title: "Strategies to Reduce Monitoring",
        points: [
          "Develop protocols for bleed control and product-specific monitoring",
          "Use appropriate assays when laboratory assessment is needed",
          "Thoughtful patient selection for NFTs is essential",
        ],
      },
    },
  },
  "B-without": {
    "bleeding-control": {
      considerations: {
        title: "Considerations for Improving Bleeding Control",
        points: [
          "Hemostatic rebalancing agents for HB prophylaxis represent a major advance in effective bleeding prevention",
          "Patient selection requires careful consideration of multiple factors, including response to current therapy, and bleeding patterns, as well as age restrictions, comorbidities, and concurrent medications",
          "Monitoring includes assessment of bleeding control and treatment response, along with product-specific laboratory and safety monitoring requirements",
        ],
      },
      strategies: {
        title: "Strategies for Improving Bleeding Control",
        points: [
          "Plan for multidisciplinary monitoring to maintain hemostatic coverage during transition to a new prophylaxis strategy",
          "Plan transition from FIX or bypassing-agent prophylaxis to hemostatic rebalancing therapy to avoid gaps in bleed protection",
          "Account for agent-specific initiation requirements, including loading dose, dose optimization, or laboratory-guided dose adjustment when applicable",
          "Monitor for decreased clinical response or loss of bleed control",
          "Anticipate treatment interactions when managing breakthrough bleeding, especially thrombotic risk with high or repeated doses of clotting factor concentrates or bypassing agents",
          "Develop a plan for breakthrough bleeding, including when clotting factor concentrates or bypassing agents may be needed for serious bleeding episodes or major surgery",
          "Use product-specific monitoring, including thrombotic risk, hypersensitivity, liver function, antithrombin activity, or drug concentration, depending on the selected agent",
        ],
      },
    },
    adherence: {
      considerations: {
        title: "Considerations for Improving Treatment Adherence",
        points: [
          "SC administration of hemostatic rebalancing agents makes treatment more convenient compared with IV administration",
          "Prefilled single-use pens/devices support adherence by simplifying administration steps and reducing preparation time",
          "Dosing schedules vary among agents: Less frequent dosing may reduce missed doses and improve consistency",
          "Fitusiran dosing is guided by AT activity, with dose and/or frequency adjusted as needed",
          "Gene therapy involves one-time IV administration, but requires adherence to post-infusion monitoring and immunosuppressive therapy",
        ],
      },
      strategies: {
        title: "Strategies for Improving Treatment Adherence",
        points: [
          "Educate patients when transitioning from factor to nonfactor therapies about MOAs, the importance of adhering to new dosing regimens, and when to seek medical intervention for breakthrough bleeds",
          "Employ SDM: Treatment decisions should account for lifestyle factors and patient/caregiver preferences regarding dosing schedules and administration",
          "Consider tools such as VERITAS-Pro, a patient/caregiver questionnaire designed to assess adherence to prophylactic therapy",
        ],
      },
    },
    "treatment-burden": {
      considerations: {
        title: "Considerations for Reducing Treatment Burden and Improving QoL",
        points: [
          "SC administration reduces the burden associated with IV access, infusion preparation, and venous access challenges",
          "Less frequent dosing schedules improve convenience and support adherence",
          "Prefilled dosing pens simplify preparation and administration, reduce dosing complexity, and support at-home treatment",
          {
            text: "Frequent IV therapy is particularly challenging for children:",
            /* `≥`, not the source's bare `>` — a second pass of the 2026-08-05
               client copy edit extended to this scenario what it first asked
               for in `B-with` below. Two further passes carried it to `A-with`
               and `A-without`. */
            children: [
              "Marstacimab is indicated for patients ≥ age 6 years",
              "Concizumab and fitusiran are approved for children ≥12 years",
            ],
          },
          /* Top level, NOT a third child, and this scenario is the only one where
             the distinction is live. `out.txt` puts it back at column 1755 with
             the other top-level bullets where the two age bullets above sit at
             1763 — and it is about gene therapy rather than about children, so
             the measurement and the content agree. */
          "Gene therapy may reduce long-term treatment burden by decreasing the need for routine prophylactic FIX infusions, but requires careful patient selection and structured post-treatment monitoring",
        ],
      },
      strategies: {
        title: "Strategies for Reducing Treatment Burden and Improving QoL",
        points: [
          "Discuss options for convenient SC administration and alternative dosing schedules with appropriate patients",
          "Plan follow-up and education to support safe at-home administration and timely management of breakthrough bleeds",
        ],
      },
    },
    monitoring: {
      considerations: {
        title: "Considerations for Reducing Monitoring Requirement",
        points: [
          "NFTs avoid routine FVIII/FIX peak/trough monitoring and PK-guided dose optimization",
          "Monitoring shifts from routine factor activity monitoring to clinical bleed control and product-specific laboratory or safety monitoring",
          "Product-specific monitoring may include thrombotic risk, liver function, AT activity, or drug concentration, depending on the selected agent",
        ],
      },
      strategies: {
        title: "Strategies for Reducing Monitoring Requirement",
        points: [
          "Develop monitoring protocols for clinical bleed control and product-specific toxicities, including thrombotic events",
          "Concizumab and marstacimab may increase fibrin-D and prothrombin fragment levels",
          "Fitusiran requires monitoring for AT and AST/ALT",
          "Gene therapy requires post-infusion monitoring of liver function, FIX activity, and inhibitor development",
        ],
      },
    },
  },
  "B-with": {
    "bleeding-control": {
      considerations: {
        title: "Considerations for Improving Bleeding Control",
        points: [
          "Hemostatic rebalancing agents for HB prophylaxis represent a major advance in effective bleeding prevention with improved patient convenience",
          "Patient selection for a hemostatic rebalancing agent requires careful consideration of multiple factors, including response to current therapy, bleeding patterns, age restrictions, comorbidities, and concurrent medications",
        ],
      },
      strategies: {
        title: "Strategies for Improving Bleeding Control",
        points: [
          "Plan for multidisciplinary monitoring to maintain hemostatic coverage during the transition to hemostatic rebalancing therapy",
          "Plan transition from factor or bypassing-agent prophylaxis to hemostatic rebalancing therapy to avoid gaps in bleed protection",
          "Account for agent-specific initiation requirements, including dose optimization or laboratory-guided dose adjustment when applicable",
          "Monitor for decreased clinical response or loss of bleed control",
          "Anticipate treatment interactions when managing breakthrough bleeding, especially potential thrombotic risk",
          "Develop a plan for breakthrough bleeding, including for serious bleeding episodes and major surgery",
          "Use product-specific safety monitoring, including thrombotic risk, liver function, antithrombin activity, or drug concentration, depending on the selected agent",
        ],
      },
    },
    adherence: {
      considerations: {
        title: "Considerations for Improving Treatment Adherence",
        points: [
          "SC administration of hemostatic rebalancing agents improves convenience over IV administration",
          "Prefilled single-use pens/devices support adherence by simplifying administration steps and reducing preparation time",
          "Dosing schedules vary among agents: Less frequent dosing may reduce missed doses and improve adherence",
          "Fitusiran dosing is guided by AT activity, with dose and/or frequency adjusted as needed",
        ],
      },
      strategies: {
        title: "Strategies for Improving Treatment Adherence",
        points: [
          "Educate patients when transitioning from FIX replacement to hemostatic rebalancing agents, including about MOAs, the importance of adhering to new dosing regimens, and when to seek medical intervention for breakthrough bleeds",
          "Employ SDM: Treatment decisions should account for lifestyle factors and patient/caregiver preferences regarding dosing schedules and administration",
          "Consider tools such as VERITAS-Pro, a patient/caregiver questionnaire designed to assess adherence to prophylactic therapy",
        ],
      },
    },
    "treatment-burden": {
      considerations: {
        title: "Considerations for Reducing Treatment Burden and Improving QoL",
        points: [
          "SC administration reduces the burden associated with IV access, infusion preparation, and venous access challenges",
          "Less frequent dosing schedules improve convenience and support adherence",
          "Prefilled dosing pens simplify preparation and administration and support at-home treatment",
          {
            text: "Frequent IV therapy is particularly challenging for children:",
            /* A client copy edit of 2026-08-05 asked for these `>` signs to be
               underlined — the slide-deck way of drawing "greater than or equal
               to", and the sense the indications carry. Set as the character for
               the same reasons as `education.ts`'s FRONTIER bullets: the codebase
               already writes it that way, and it is what a screen reader
               announces. The edit named this scenario first, then `B-without`,
               then `A-with`, then `A-without` — all four scenarios now carry
               `≥`. */
            children: [
              "Marstacimab is indicated for patients ≥ age 6 years",
              "Concizumab and fitusiran are approved for children ≥12 years",
            ],
          },
        ],
      },
      strategies: {
        title: "Strategies for Reducing Treatment Burden and Improving QoL",
        /* The same copy edit replaced this set with the three bullets the `A-*`
           scenarios carry — the client supplied them verbatim, so the HB
           wording ("convenient SC administration and alternative dosing
           schedules") is gone rather than merged. */
        points: [
          "Discuss options for less frequent or more convenient SC dosing with appropriate patients",
          "Consider options for less burdensome dosing and administration for younger patients when possible",
          "Plan follow-up and education to support safe at-home administration and timely management of breakthrough bleeds",
        ],
      },
    },
    monitoring: {
      considerations: {
        title: "Considerations for Reducing Monitoring Requirements",
        points: [
          "NFTs avoid routine FVIII/FIX peak/trough monitoring and PK-guided dose optimization",
          "Monitoring with NFTs shifts from factor activity levels to clinical bleed control and product-specific safety or exposure monitoring",
          "Product-specific monitoring may include thrombotic risk, liver function, AT activity, or drug concentration, depending on the selected agent",
          "Thoughtful patient selection for hemostatic rebalancing agents is essential",
        ],
      },
      strategies: {
        title: "Strategies for Reducing Monitoring Requirements",
        points: [
          "Develop monitoring protocols for clinical bleed control and product-specific toxicities, including thrombotic events",
          "Concizumab and marstacimab may increase fibrin-D and prothrombin fragment levels",
          "Fitusiran requires monitoring for AT and AST/ALT",
        ],
      },
    },
  },
};

export interface WizardResult {
  scenario: ScenarioKey;
  reason: SwitchReason;
  /** Recommended treatments, resolved to full Treatment records. */
  recommendations: Treatment[];
  /** Any recommended agent names that had no matching Treatment record. */
  unresolved: string[];
  /** The scenario-specific Considerations + Strategies pop-up pair for this leaf. */
  note: ReasonNote;
}

const BY_AGENT = new Map(TREATMENTS.map((t) => [t.agent, t]));

/** Run the wizard: (type, inhibitors, reason) → recommended treatments + note. */
export function recommend(
  type: WizardHemophiliaType,
  hasInhibitors: boolean,
  reason: SwitchReason,
): WizardResult {
  const scenario = scenarioKey(type, hasInhibitors);
  const names = RECOMMENDATIONS[scenario][reason];
  const recommendations: Treatment[] = [];
  const unresolved: string[] = [];
  for (const name of names) {
    const t = BY_AGENT.get(name);
    if (t) recommendations.push(t);
    else unresolved.push(name);
  }
  return { scenario, reason, recommendations, unresolved, note: SCENARIO_NOTES[scenario][reason] };
}
