/**
 * Treatment Wizard — the branching decision model (the MAIN engine).
 *
 * Source of truth: the blueprint in `documents/HM-85L Hemophilia Treatment
 * Wizard_V2_Vector.pdf`. Extracted with text coordinates so each recommendation
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
 * recommended agent list + a reason-specific considerations note. Each
 * recommended agent maps to a pop-up drug information sheet (see DRUG_SHEETS).
 */

import { TREATMENTS, type Treatment } from "./treatments";

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
 * Reason-specific "Pop-up note" of clinical considerations, shown alongside the
 * recommended agents. Shared across scenarios (the blueprint attaches these to
 * the reason, not the scenario). Text is verbatim from the source.
 */
export const REASON_NOTES: Record<SwitchReason, { title: string; points: string[] }> = {
  "bleeding-control": {
    title: "Considerations for Improving Bleeding Control",
    points: [
      "NFTs for hemophilia prophylaxis represent a major advance in effective bleeding prevention.",
      "Patient selection for NFTs requires careful consideration of multiple factors, including response to current therapy and bleeding patterns, age restrictions, comorbidities, and concurrent medications.",
      "Patients with inhibitors often have inadequate bleeding control with bypassing agents and may benefit significantly from novel NFTs.",
      "Monitoring includes clinical bleeding assessment and product-specific laboratory monitoring.",
      "Early evidence suggests that joint protection with NFTs is comparable to that of traditional factor prophylaxis.",
      "For patients with inhibitors, guidelines recommend prophylaxis with emicizumab over bypassing agents; FVIIIa mimetics do not cause/increase FVIII inhibitors and maintain efficacy in their presence.",
    ],
  },
  adherence: {
    title: "Considerations for Improving Treatment Adherence",
    points: [
      "SC administration of hemostatic rebalancing agents improves convenience over IV administration.",
      "Prefilled single-use pens/devices support adherence by simplifying administration steps and reducing preparation time.",
      "Dosing schedules vary among agents: Less frequent dosing may reduce missed doses and improve adherence.",
      "Fitusiran dosing is guided by AT activity, with dose and/or frequency adjusted as needed.",
    ],
  },
  "treatment-burden": {
    title: "Considerations for Reducing Treatment Burden and Improving QoL",
    points: [
      "SC administration reduces the burden associated with IV access, infusion preparation, and venous access challenges.",
      "Less frequent dosing schedules (weekly, every-other-week, or monthly) improve convenience and support adherence.",
      "Simplified dosing approaches, such as fixed or tiered dosing, may reduce the need for frequent dose calculations and ongoing treatment adjustments.",
      "Prefilled dosing pens simplify preparation and administration, reduce dosing complexity, and support at-home treatment.",
      "Frequent IV therapy is particularly challenging for children: Emicizumab is indicated for younger patients, including newborns; denecimig was evaluated in patients >1 year; Marstacimab is indicated for patients >6 years; other FDA-approved options are indicated for children >12 years.",
    ],
  },
  monitoring: {
    title: "Considerations and Strategies for Reducing Monitoring Requirement",
    points: [
      "NFTs avoid the need for routine FVIII/FIX peak/trough monitoring and PK-guided dose optimization.",
      "Monitoring patients on NFTs presents unique challenges; traditional tests, such as aPTT, do not accurately measure bleeding risk.",
      "NFTs require monitoring of clinical bleed control and product-specific safety monitoring, such as thrombotic risk, liver function, AT, or drug concentration, depending on the agent.",
    ],
  },
};

export interface WizardResult {
  scenario: ScenarioKey;
  reason: SwitchReason;
  /** Recommended treatments, resolved to full Treatment records. */
  recommendations: Treatment[];
  /** Any recommended agent names that had no matching Treatment record. */
  unresolved: string[];
  note: { title: string; points: string[] };
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
  return { scenario, reason, recommendations, unresolved, note: REASON_NOTES[reason] };
}
