/**
 * The trial citations are gone, by client direction (2026-08-04) — only the trial
 * name and NCT id are kept, so `ClinicalTrial` carries no `citation` field.
 */
export interface ClinicalTrial {
  name: string;
  id: string;
}

/** A per-drug information sheet. Fields are verbatim bullet lists from the PDF. */
export interface DrugSheet {
  /** Verbatim agent name — the join key to Treatment.agent / AGENTS values. */
  agent: string;
  /** The heading the pop-up card wears where it is not the agent's name. */
  title?: string;
  /** Label over `classTarget`, without its trailing colon. Defaults to "Class/Target". */
  classHeading?: string;
  classTarget: string[];
  indication: string[];
  dosing: string[];
  monitoring: string[];
  trials: ClinicalTrial[];
}

export const DRUG_SHEETS: readonly DrugSheet[] = [
  {
    agent: "Efanesoctocog alfa",
    // The one sheet whose heading is "Class" alone — see `classHeading`.
    classHeading: "Class",
    classTarget: ["Clotting factor replacement; ultralong half-life"],
    indication: [
      "Adults + pediatric patients with HA",
      "Routine prophylaxis",
      "On-demand control of bleeding episodes",
      "Perioperative management of bleeding",
    ],
    dosing: [
      "IV injection",
      "50 IU/kg 1X/wk",
      "Optimize dosage; measure plasma FVIII activity by aPTT-based one-stage clotting assay",
    ],
    monitoring: [
      "Hypersensitivity reactions including anaphylaxis",
      "Neutralizing antibodies (inhibitors)",
      "ADAs",
    ],
    trials: [
      { name: "Study 1", id: "NCT04161495" },
      { name: "Study 2", id: "NCT04759193" },
    ],
  },
  {
    agent: "Emicizumab",
    /* "Factor VIII mimetic", not the source's "Factor VIIIa–mimetic" — client copy
       edit, 2026-08-05. Not a typo to reconcile against the artboard. */
    classTarget: ["Factor VIII mimetic", "FIXa x FX BsAb"],
    indication: ["HA +/- inhibitors, newborn + older patients"],
    dosing: [
      "Subcutaneous injection (vial and syringe)",
      "Recommended loading dose, 3 mg/kg/wk for 4 wks",
      "Maintenance: 1.5 mg/kg/wk, 3 mg/kg every 2 wks, or 6 mg/kg monthly",
    ],
    monitoring: [
      "Mild to moderate injection site reactions",
      "Lab coagulation test interference: Do not use intrinsic pathway clotting-based coagulation lab tests to monitor for FVIII inhibitor titers, including ACT, Bethesda assays, and assays based on aPTT",
      "Thrombotic microangiopathy, thrombotic events",
      "Drug interaction with aPCC",
      "ADAs",
    ],
    trials: [
      { name: "HAVEN 3", id: "NCT02847637" },
      { name: "HAVEN 4", id: "NCT03020160" },
      { name: "HAVEN 2", id: "NCT02795767" },
    ],
  },
  {
    agent: "Denecimig",
    title: "Denecimig (emerging/investigational)",
    /* "Factor VIII mimetic", not "Factor VIIIa–mimetic" — client copy edit,
       2026-08-05. Not a typo to reconcile. */
    classTarget: ["Factor VIII mimetic BsAb", "FIXa x FX BsAb"],
    /* `≥`, not the source's bare `>` — client copy edit, 2026-08-05. Every age
       threshold in this module reads `≥`. */
    indication: [
      "TBD based on FDA approval; clinical trial populations evaluated HA +/- inhibitors, patients ≥1 year",
    ],
    dosing: [
      "SC injection, prefilled pen with attachable syringe",
      "No washout required when switching from emicizumab",
    ],
    monitoring: [
      "Injection site reactions (mostly mild, transient)",
      "No thromboembolic events or thrombotic microangiopathies",
      "No hypersensitivity reactions",
      "No clinically relevant findings in laboratory assessments",
    ],
    trials: [
      { name: "FRONTIER2", id: "NCT05053139" },
      { name: "FRONTIER3", id: "NCT05306418" },
      { name: "FRONTIER4", id: "NCT05685238" },
      { name: "FRONTIER5", id: "NCT05878938" },
    ],
  },
  {
    agent: "Concizumab",
    classTarget: ["Hemostatic rebalancing agent; TFPI mAB"],
    // `≥`, not the source's bare `>` — see the Denecimig sheet for the edit.
    indication: ["Routine prophylaxis, patients ≥12 years with HA/HB +/- FVIII/FIX inhibitors"],
    dosing: [
      "SC injection, prefilled pen",
      "D1: Loading dose, 1 mg/kg",
      "D2: Once daily dose, 0.2 mg/kg until individualization of maintenance dose",
      "Dose optimize after 4 weeks: Measure concizumab plasma concentration by concizumab ELISA assay",
    ],
    monitoring: [
      "Hypersensitivity reactions",
      "Routine concizumab plasma concentrations",
      "Thromboembolic events",
      "Increased lab values of fibrin D dimer and prothrombin fragment",
      "ADAs",
    ],
    trials: [
      { name: "Explorer7", id: "NCT04083781" },
      { name: "Explorer8", id: "NCT04082429" },
    ],
  },
  {
    agent: "Marstacimab",
    classTarget: ["Hemostatic rebalancing agent; TFPI mAB"],
    // `≥`, not the source's bare `>` — see Denecimig. Client direction of
    // 2026-08-06 extends that to the dosing bullet's weight threshold too.
    indication: ["Routine prophylaxis, patients ≥6 years with HA/HB +/- FVIII/FIX inhibitors"],
    dosing: [
      "SC injection (prefilled pen or syringe)",
      "Loading dose: 300 mg (two 150-mg injections)",
      "Maintenance dose: 150 mg/wk (start 1 week after the loading dose)",
      "Consider increasing dose to 300 mg/wk in patients weighing ≥50 kg",
    ],
    monitoring: [
      "Hypersensitivity reactions",
      "Thromboembolic events",
      "Increased lab values of fibrin D dimer and prothrombin fragment",
      "ADAs",
    ],
    trials: [
      { name: "BASIS study", id: "NCT03938792" },
      { name: "BASIS KIDS study", id: "NCT05611801" },
    ],
  },
  {
    agent: "Fitusiran",
    classTarget: ["Hemostatic rebalancing agent; AT-directed siRNA"],
    // `≥`, not the source's bare `>` — see Denecimig. Client direction of
    // 2026-08-06 extends that to the monitoring bullet's duration too.
    indication: ["Routine prophylaxis, patients ≥12 years with HA/HB +/- FVIII/FIX inhibitors"],
    dosing: [
      "SC injection (prefilled pen or syringe and vial for lower dose)",
      "Starting dose: 50 mg once every 2 months",
      "Monitor AT activity using an FDA-cleared test; maintain AT activity between 15-35% by adjusting the dose and/or frequency",
    ],
    monitoring: [
      "Thrombotic events",
      "AT levels",
      "Acute/recurrent gallbladder disease",
      "Hepatotoxicity: Measure LFTs at baseline, monthly for ≥ 6 months, after dose increases, periodically thereafter",
      "ADAs",
    ],
    trials: [
      { name: "ATLAS-INH", id: "NCT03417102" },
      { name: "ATLAS-A/B", id: "NCT03417245" },
      { name: "ATLAS-OLE", id: "NCT03754790" },
    ],
  },
  {
    agent: "Etranacogene dezaparvovec-drlb",
    classTarget: ["AAV vector-based gene therapy"],
    indication: ["Adults with HB without FIX inhibitors"],
    // "2 × 10¹³" in Unicode, not "2 x 10^13": the caret renders literally, and a
    // dose that reads as ten-thousand-and-thirteen is a hazard.
    dosing: ["Single IV infusion", "2 × 10¹³ genome copies/kg body weight"],
    monitoring: [
      "Eligibility: LFTs, hepatic ultrasound and elastography; hepatitis B/C, hepatologist consultation if needed",
      "Hypersensitivity reaction",
      "Hepatotoxicity; LFTs weekly for three months, then monthly for one year following infusion",
      "Immune-mediated neutralizing antibodies to AAV5 vector capsid",
      "Clinical observations / lab tests for FIX inhibitors",
      "Monitor plasma FIX activity (eg, weekly for 3 months) by aPTT-based one-stage clotting assay",
    ],
    trials: [{ name: "Prospective open-label study", id: "NCT03569891" }],
  },
];

const SHEET_BY_AGENT = new Map(DRUG_SHEETS.map((s) => [s.agent, s]));

export function sheetFor(agent: string): DrugSheet | undefined {
  return SHEET_BY_AGENT.get(agent);
}
