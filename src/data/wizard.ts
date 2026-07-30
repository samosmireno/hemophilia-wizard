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

export type WizardHemophiliaType = "A" | "B";

/** The wizard's third question — the primary reason for switching therapy. */
export type SwitchReason = "bleeding-control" | "adherence" | "treatment-burden" | "monitoring";

export const SWITCH_REASONS: { id: SwitchReason; label: string }[] = [
  { id: "bleeding-control", label: "Improving bleeding control" },
  { id: "adherence", label: "Increased adherence" },
  { id: "treatment-burden", label: "Reduced treatment burden" },
  { id: "monitoring", label: "Reduced monitoring requirement" },
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
  /** Verbatim class labels listed in the box. */
  classes: string[];
  /** Scenario-specific caveat (only HB +inhibitors carries one). */
  caveat?: string;
}

/**
 * scenario → the class-level guidance box shown before the reason question.
 * Verbatim from `[PDF-V]` CENTER band (`documents/out_raw.txt`).
 */
export const CLASSES_TO_CONSIDER: Record<ScenarioKey, ClassesToConsider> = {
  "A-without": {
    classes: [
      "Recombinant FVIII concentrates",
      "Factor VIIIa mimetics",
      "Hemostatic rebalancing agents",
    ],
  },
  "A-with": {
    classes: ["Factor VIIIa mimetic", "Hemostatic rebalancing agent"],
  },
  "B-without": {
    classes: ["Hemostatic rebalancing agents", "FIX prophylaxis", "Gene therapy"],
  },
  "B-with": {
    classes: ["Hemostatic rebalancing agents"],
    caveat:
      "Note: Bypassing agents (aPCC, rFVIIa) can manage breakthrough bleeds in patients with inhibitors, but sustained prophylaxis with these agents remains challenging",
  },
};

/** One "Pop-up note" — a title plus its bullet list. Text is verbatim from the source. */
export interface NoteBlock {
  title: string;
  points: string[];
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
          "Frequent IV therapy is particularly challenging for children:",
          "Emicizumab is indicated for younger patients, including newborns; denecimig was evaluated in patients >1 year of age",
          "Marstacimab is indicated for patients > age 6 years",
          "Other FDA-approved options are indicated for children >12 years",
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
          "NFTs require monitoring of clinical bleed control and product-specific safety monitoring, such as thrombotic risk, liver function, AT, or drug concentration, depending on the agent",
        ],
      },
      strategies: {
        title: "Strategies for Reducing Monitoring Requirement",
        points: [
          "Develop protocols for bleed control and product-specific monitoring",
          "Use appropriate assays when laboratory assessment is needed",
          "Thoughtful patient selection for NFTs is essential",
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
          "Frequent IV therapy is particularly challenging for children:",
          "Emicizumab is indicated for younger patients, including newborns; denecimig was evaluated in patients >1 year",
          "Marstacimab is indicated for patients > age 6 years",
          "Other FDA-approved options are indicated for children >12 years",
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
          "Use product-specific safety monitoring, including thrombotic risk, hypersensitivity, liver function, antithrombin activity, or drug concentration, depending on the selected agent",
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
          "Frequent IV therapy is particularly challenging for children:",
          "Marstacimab is indicated for patients > age 6 years",
          "Concizumab and fitusiran are approved for children >12 years",
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
          "Frequent IV therapy is particularly challenging for children:",
          "Marstacimab is indicated for patients > age 6 years",
          "Concizumab and fitusiran are approved for children >12 years",
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
        title: "Considerations for Reducing Monitoring Requirements",
        points: [
          "NFTs avoid routine FVIII/FIX peak/trough monitoring and PK-guided dose optimization",
          "Monitoring with NFTs shifts from factor activity levels to clinical bleed control and product-specific safety or exposure monitoring",
          "Product-specific monitoring may include thrombotic risk, liver function, AT activity, or drug concentration, depending on the selected agent",
        ],
      },
      strategies: {
        title: "Strategies for Reducing Monitoring Requirements",
        points: [
          "Develop monitoring protocols for clinical bleed control and product-specific toxicities, including thrombotic events",
          "Concizumab and marstacimab may increase fibrin-D and prothrombin fragment levels",
          "Fitusiran requires monitoring for AT and AST/ALT",
          "Thoughtful patient selection for hemostatic rebalancing agents is essential",
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
