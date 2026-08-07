import { AGENT_NAMES, type AgentName } from "./agents";
import type { Bullet } from "./education";
import { TREATMENTS, type Treatment } from "./treatments";

export const WIZARD_ENTRY_PROMPT = "Explore Novel Prophylactic Therapy Options for Your Patient";

export const WIZARD_INPUT_TITLE = "Input patient characteristics";

/**
 * Verbatim from the artboard, inconsistent punctuation included — the inhibitor
 * prompt carries no question mark and the reason prompt does.
 */
export const WIZARD_QUESTIONS = {
  type: "Disease type",
  inhibitors: "Does the patient have inhibitors",
  reason: "What is the primary reason for considering a treatment option?",
} as const;

export type WizardHemophiliaType = "A" | "B";

export const HEMOPHILIA_TYPES: { id: WizardHemophiliaType; label: string }[] = [
  { id: "A", label: "Hemophilia A" },
  { id: "B", label: "Hemophilia B" },
];

export type SwitchReason = "bleeding-control" | "adherence" | "treatment-burden" | "monitoring";

export interface SwitchReasonOption {
  id: SwitchReason;
  label: string;
  sourceLabel: string;
}

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

export type ScenarioKey = "A-without" | "A-with" | "B-without" | "B-with";

export function scenarioKey(type: WizardHemophiliaType, hasInhibitors: boolean): ScenarioKey {
  return `${type}-${hasInhibitors ? "with" : "without"}` as ScenarioKey;
}

/**
 * The six the wizard can recommend — the roster's novel agents, so SHL, EHL and
 * Efanesoctocog alfa are absent by design. The names come from `AGENT_NAMES`, which
 * is what keeps them equal to `Treatment.agent`; this record only picks.
 */
export const AGENTS = {
  emicizumab: AGENT_NAMES.emicizumab,
  denecimig: AGENT_NAMES.denecimig,
  concizumab: AGENT_NAMES.concizumab,
  marstacimab: AGENT_NAMES.marstacimab,
  fitusiran: AGENT_NAMES.fitusiran,
  etranacogene: AGENT_NAMES.etranacogene,
} as const;

const MIMETICS = [AGENTS.emicizumab, AGENTS.denecimig];
const REBALANCING = [AGENTS.concizumab, AGENTS.marstacimab, AGENTS.fitusiran];
const GENE = [AGENTS.etranacogene];

export const RECOMMENDATIONS: Record<ScenarioKey, Record<SwitchReason, AgentName[]>> = {
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
    adherence: [...REBALANCING, ...GENE],
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

export interface ClassesToConsider {
  title: string;
  /** Carries inline `_em_` markup, rendered through `formatInline` (ADR 0004). */
  lead: string;
  /** Verbatim class labels listed in the box. */
  classes: string[];
  caption: string;
  caveat?: string;
}

const BOXES_CAPTION = "Click on the boxes below to learn more about each type of therapy";

/**
 * Double spaces in the exports are NOT transcribed — "for  prophylaxis" and
 * "TO LEARN  MORE" are justification artifacts, not authored spacing.
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
     * "Factor VIII mimetic", not "Factor VIIIa" — a client copy edit (2026-08-05)
     * on this screen only; `A-without` keeps the activated form. Not a typo.
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
  points: Bullet[];
}

export interface ReasonNote {
  considerations: NoteBlock;
  strategies: NoteBlock;
}

/**
 * 32 notes, verbatim from `[PDF-V]` (CONTEXT.md §4.2). The copy and the title
 * wording are SCENARIO-SPECIFIC, not shared per reason — preserved as-is.
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
          "Plan for a washout period of 3 to 5 half-lives of factor therapy before starting anti-TFPI treatment; avoid high factor activity when initiating anti-TFPI mAbs due to risk of thrombosis",
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
            /* `≥`, not the source's bare `>` — client copy edit, 2026-08-05. */
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
          "For patients requiring bypassing-agent therapy while receiving FVIII mimetic prophylaxis, avoid or minimize aPCC when possible because of thrombotic risk",
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
            /* The first child differs from `A-without`'s by two words — "≥1 year"
               here, "≥1 year of age" there. Transcribed as the source sets each,
               not reconciled. `≥` is the 2026-08-05 client copy edit. */
            text: "Frequent IV therapy is particularly challenging for children:",
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
            /* `≥`, not the source's bare `>` — client copy edit, 2026-08-05. */
            children: [
              "Marstacimab is indicated for patients ≥ age 6 years",
              "Concizumab and fitusiran are approved for children ≥12 years",
            ],
          },
          /* Top level, NOT a third child — measured at column 1755 in `out.txt`,
             and it is about gene therapy rather than about children. */
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
            /* `≥`, not the source's bare `>` — client copy edit, 2026-08-05. All
               four scenarios carry it; set as the character, not an underlined `>`. */
            children: [
              "Marstacimab is indicated for patients ≥ age 6 years",
              "Concizumab and fitusiran are approved for children ≥12 years",
            ],
          },
        ],
      },
      strategies: {
        title: "Strategies for Reducing Treatment Burden and Improving QoL",
        /* The client supplied these three verbatim (2026-08-05); the HB wording is
           gone rather than merged. */
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
  recommendations: Treatment[];
  note: ReasonNote;
}

const BY_AGENT = new Map(TREATMENTS.map((t) => [t.agent, t]));

/**
 * Throws rather than skips. `WizardResult` used to carry an `unresolved: string[]`
 * of names that found no row — a channel nothing read, so a mistyped name dropped an
 * agent off the leaf silently. `AgentName` makes the typo a compile error and
 * `content.test.ts` pins the roster's coverage, which leaves only "someone deleted a
 * row" — and that should be loud.
 */
function treatmentFor(name: AgentName): Treatment {
  const treatment = BY_AGENT.get(name);
  if (!treatment) throw new Error(`No treatment row for ${name}`);
  return treatment;
}

export function recommend(
  type: WizardHemophiliaType,
  hasInhibitors: boolean,
  reason: SwitchReason,
): WizardResult {
  const scenario = scenarioKey(type, hasInhibitors);
  return {
    scenario,
    reason,
    recommendations: RECOMMENDATIONS[scenario][reason].map(treatmentFor),
    note: SCENARIO_NOTES[scenario][reason],
  };
}
