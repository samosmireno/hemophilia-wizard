export type HemophiliaType = "A" | "B";
export type YesNo = "Yes" | "No";

export const TREATMENT_CLASSES = [
  "Clotting factor replacement",
  "Factor VIII mimetic",
  "Hemostatic rebalancing agent",
  "Gene therapy",
] as const;
export type TreatmentClass = (typeof TREATMENT_CLASSES)[number];

export interface Treatment {
  /** 1-indexed row in the source sheet (S1). */
  row: number;
  /** Column A — treatment class label, verbatim (may carry trailing spaces / notes). */
  treatmentClass: string;
  /** Column B — agent / product name, verbatim. */
  agent: string;
  /** Column C — mechanism of action, verbatim (original newline preserved). */
  moa: string;
  /** Column D — hemophilia type served: "A", "B", or "A + B". Verbatim. */
  hemophiliaType: string;
  /** Column E — indicated for use with inhibitors. Verbatim. */
  inhibitors: YesNo;
  /** Column F — patient age label, verbatim (e.g. "0+", "6+", "12+", "Adults"). */
  age: string;
  /** Column G — administration route, verbatim. */
  route: string;
  /** Column H — dosing schedule, verbatim. */
  schedule: string;
  /** Column I — monitoring & safety notes, verbatim. */
  monitoring: string;
}

/**
 * The 9 treatments, S1 verbatim — with one intentional departure, on Fitusiran's
 * `route` (see there).
 */
export const TREATMENTS: readonly Treatment[] = [
  {
    row: 2,
    treatmentClass: "Clotting factor replacement",
    agent: "SHL",
    moa: "Standard half-life",
    hemophiliaType: "A + B",
    inhibitors: "No",
    age: "0+",
    route: "IV",
    schedule: "3X/week",
    monitoring: " FVIII/FIX monitoring; PK-guided dose optimization; peak/trough levels as needed",
  },
  {
    row: 3,
    treatmentClass: "Clotting factor replacement ",
    agent: "EHL",
    moa: "Extended half-life",
    hemophiliaType: "A + B",
    inhibitors: "No",
    age: "0+",
    route: "IV",
    schedule: "~2X/week",
    monitoring: " FVIII/FIX monitoring; PK-guided dose optimization; peak/trough levels as needed",
  },
  {
    row: 4,
    treatmentClass: "Clotting factor replacement ",
    agent: "Efanesoctocog alfa",
    moa: "Ultralong half-life",
    hemophiliaType: "A",
    inhibitors: "No",
    age: "0+",
    route: "IV",
    schedule: "Weekly",
    monitoring:
      " FVIII/FIX monitoring; PK-guided dose optimization; peak/trough levels as needed; hypersensitivity reactions,FVIII inhibitor development",
  },
  {
    row: 5,
    treatmentClass: "Factor VIIIa mimetic",
    agent: "Emicizumab",
    moa: "Factor VIIIa–mimetic\nBsAb",
    hemophiliaType: "A",
    inhibitors: "Yes",
    age: "0+",
    route: "SC (vial/syringe)",
    schedule: "Monthly, bimonthly, weekly",
    monitoring: "Thrombotic events in pts on aPCC at high doses",
  },
  {
    row: 6,
    treatmentClass: "Factor VIIIa mimetic              (emerging / investigational)",
    agent: "Denecimig",
    moa: "Factor VIIIa–mimetic\nBsAb",
    hemophiliaType: "A",
    inhibitors: "Yes",
    age: "TBD (studied in pts >1 year of age)",
    route: "SC (single-use prefilled pen)",
    schedule: "Monthly, bimonthly, weekly",
    monitoring: "TBD",
  },
  {
    row: 7,
    treatmentClass: "Hemostatic rebalancing agent",
    agent: "Concizumab",
    moa: "TFPI mAb",
    hemophiliaType: "A + B",
    inhibitors: "Yes",
    age: "12+",
    route: "SC (single-use prefilled pen)",
    schedule: "Daily",
    monitoring:
      "Thrombotic events, hypersensitivity reactions, increased laboratory values for fibrin D-dimer and prothrombin fragment",
  },
  {
    row: 8,
    treatmentClass: "Hemostatic rebalancing agent",
    agent: "Marstacimab",
    moa: "TFPI mAb",
    hemophiliaType: "A + B",
    inhibitors: "Yes",
    age: "6+",
    route: "SC (single-use prefilled pen)",
    schedule: "Weekly",
    monitoring:
      "Thrombotic events, hypersensitivity reactions, increased laboratory values for fibrin D-dimer and prothrombin fragment",
  },
  {
    row: 9,
    treatmentClass: "Hemostatic rebalancing agent",
    agent: "Fitusiran",
    moa: "AT-directed siRNA",
    hemophiliaType: "A + B",
    inhibitors: "Yes",
    age: "12+",
    // Richer value taken from S3; S1 had "SC (single-use prefilled pen)".
    route: "SC (single-use prefilled pen or vial/syringe)",
    schedule: "Every 1-2 months",
    monitoring: "Thrombotic events; liver enzymes, gall bladder disease, Anti-thrombin monitoring",
  },
  {
    row: 10,
    treatmentClass: "Gene therapy",
    agent: "Etranacogene dezaparvovec-drlb",
    moa: "AAV vector",
    hemophiliaType: "B",
    inhibitors: "No",
    age: "Adults",
    route: "IV",
    schedule: "Single infusion",
    monitoring:
      "Infusion reactions, liver function monitoring, requires immunosuppressive therapy; supply shortage",
  },
];

export function typesServed(t: Treatment): ReadonlySet<HemophiliaType> {
  const raw = t.hemophiliaType.toUpperCase();
  const set = new Set<HemophiliaType>();
  if (raw.includes("A")) set.add("A");
  if (raw.includes("B")) set.add("B");
  return set;
}

/** Unrecognized labels fall back to 0 (no restriction). */
export function minAge(t: Treatment): number {
  const label = t.age;
  const plus = label.match(/(\d+)\s*\+/);
  if (plus) return Number(plus[1]);
  if (/adult/i.test(label)) return 18;
  const gt = label.match(/>\s*(\d+)\s*(year|yr)/i);
  if (gt) return Number(gt[1]);
  return 0;
}

export function isAgeProvisional(t: Treatment): boolean {
  return /tbd/i.test(t.age);
}

/** Normalize the verbatim column-A label into one of the four canonical classes. */
export function classOf(t: Treatment): TreatmentClass {
  const c = t.treatmentClass.toLowerCase();
  if (c.includes("mimetic")) return "Factor VIII mimetic";
  if (c.includes("rebalancing")) return "Hemostatic rebalancing agent";
  if (c.includes("gene")) return "Gene therapy";
  return "Clotting factor replacement";
}

/** An omitted criterion is not applied. */
export interface PatientCriteria {
  hemophiliaType?: HemophiliaType;
  hasInhibitors?: boolean;
  age?: number;
  treatmentClass?: TreatmentClass;
}

export interface EligibilityResult {
  treatment: Treatment;
  eligible: boolean;
  /** Human-readable reasons a treatment was excluded (empty when eligible). */
  reasons: string[];
}

export function evaluateTreatments(criteria: PatientCriteria): EligibilityResult[] {
  return TREATMENTS.map((treatment) => {
    const reasons: string[] = [];

    if (criteria.hemophiliaType && !typesServed(treatment).has(criteria.hemophiliaType)) {
      reasons.push(
        `Not indicated for hemophilia ${criteria.hemophiliaType} (serves ${treatment.hemophiliaType}).`,
      );
    }
    if (criteria.hasInhibitors && treatment.inhibitors !== "Yes") {
      reasons.push("Not indicated for use with inhibitors.");
    }
    if (criteria.age !== undefined) {
      const min = minAge(treatment);
      if (criteria.age < min) {
        reasons.push(
          `Below minimum age (${treatment.age}${isAgeProvisional(treatment) ? ", provisional" : ""}).`,
        );
      }
    }
    if (criteria.treatmentClass && classOf(treatment) !== criteria.treatmentClass) {
      reasons.push(`Outside selected class (${classOf(treatment)}).`);
    }

    return { treatment, eligible: reasons.length === 0, reasons };
  });
}

export function filterTreatments(criteria: PatientCriteria): Treatment[] {
  return evaluateTreatments(criteria)
    .filter((r) => r.eligible)
    .map((r) => r.treatment);
}
