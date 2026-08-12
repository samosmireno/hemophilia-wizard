import { AGENT_NAMES, type AgentName } from "./agents";

export type YesNo = "Yes" | "No";

export interface Treatment {
  /** Column A — treatment class label, verbatim (may carry a parenthetical note). */
  treatmentClass: string;
  /** Column B — the roster name, and the join key every other module resolves by. */
  agent: AgentName;
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
 *
 * **In S1 row order**, which is the only record of it now: each row carried its own
 * 1-indexed `row` number and nothing ever read it, so the array position is the
 * provenance (row = index + 2). CONTEXT.md §5.1 holds the roster in the same order.
 *
 * Cell padding is NOT transcribed: S1 pads three `monitoring` cells with a leading
 * space, two class labels with a trailing one, and aligns Denecimig's parenthetical
 * with a run of them. Whitespace a spreadsheet uses to lay out a column is not copy,
 * and every one of these fields renders as-is in the §5 comparison table.
 */
export const TREATMENTS: readonly Treatment[] = [
  {
    treatmentClass: "Clotting factor replacement",
    agent: AGENT_NAMES.shl,
    moa: "Standard half-life",
    hemophiliaType: "A + B",
    inhibitors: "No",
    age: "0+",
    route: "IV",
    schedule: "3X/week",
    monitoring: "FVIII/FIX monitoring; PK-guided dose optimization; peak/trough levels as needed",
  },
  {
    treatmentClass: "Clotting factor replacement",
    agent: AGENT_NAMES.ehl,
    moa: "Extended half-life",
    hemophiliaType: "A + B",
    inhibitors: "No",
    age: "0+",
    route: "IV",
    schedule: "~2X/week",
    monitoring: "FVIII/FIX monitoring; PK-guided dose optimization; peak/trough levels as needed",
  },
  {
    treatmentClass: "Clotting factor replacement",
    agent: AGENT_NAMES.efanesoctocog,
    moa: "Ultralong half-life",
    hemophiliaType: "A",
    inhibitors: "No",
    age: "0+",
    route: "IV",
    schedule: "Weekly",
    monitoring:
      "FVIII/FIX monitoring; PK-guided dose optimization; peak/trough levels as needed; hypersensitivity reactions,FVIII inhibitor development",
  },
  {
    treatmentClass: "Factor VIII mimetic",
    agent: AGENT_NAMES.emicizumab,
    moa: "Factor VIII mimetic\nBsAb",
    hemophiliaType: "A",
    inhibitors: "Yes",
    age: "0+",
    route: "SC (vial/syringe)",
    schedule: "Monthly, bimonthly, weekly",
    monitoring: "Thrombotic events in pts on aPCC at high doses",
  },
  {
    treatmentClass: "Factor VIII mimetic (emerging / investigational)",
    agent: AGENT_NAMES.denecimig,
    moa: "Factor VIII mimetic\nBsAb",
    hemophiliaType: "A",
    inhibitors: "Yes",
    age: "TBD (studied in pts >1 year of age)",
    route: "SC (single-use prefilled pen)",
    schedule: "Monthly, bimonthly, weekly",
    monitoring: "TBD",
  },
  {
    treatmentClass: "Hemostatic rebalancing agent",
    agent: AGENT_NAMES.concizumab,
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
    treatmentClass: "Hemostatic rebalancing agent",
    agent: AGENT_NAMES.marstacimab,
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
    treatmentClass: "Hemostatic rebalancing agent",
    agent: AGENT_NAMES.fitusiran,
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
    treatmentClass: "Gene therapy",
    agent: AGENT_NAMES.etranacogene,
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

const BY_AGENT: ReadonlyMap<string, Treatment> = new Map(TREATMENTS.map((t) => [t.agent, t]));

/**
 * The roster row for an agent. **Total**, and throws rather than skips when it
 * cannot be — the opposite policy to `sheetFor()`, deliberately.
 *
 * The two differ because their key sets do. `AgentName` is the closed union of the
 * nine, every one of which has a row, so a miss means someone deleted one and that
 * should be loud. `sheetFor()` takes `string` and returns `undefined` because its
 * callers pass component state and because SHL and EHL genuinely have no sheet —
 * absence there is a real state, not corruption.
 *
 * `WizardResult` used to carry an `unresolved: string[]` of names that found no
 * row — a channel nothing read, so a mistyped name dropped an agent off the leaf
 * silently. `AgentName` makes the typo a compile error; array *coverage* is the one
 * thing the type cannot state, so `content.test.ts` pins that `TREATMENTS` holds
 * exactly one row per name, which is what makes the throw below unreachable.
 */
export function treatmentFor(name: AgentName): Treatment {
  const treatment = BY_AGENT.get(name);
  if (!treatment) throw new Error(`No treatment row for ${name}`);
  return treatment;
}
