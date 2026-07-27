/**
 * Per-drug pop-up information sheets.
 *
 * Source of truth: the RIGHT band of the blueprint (`documents/HM-85L
 * Hemophilia Treatment Wizard_V3_Vector.pdf`, transcribed in
 * `documents/out_raw.txt`); see CONTEXT.md §6.
 *
 * Each sheet is the content the blueprint asks to launch as a pop-up from a
 * drug button ("Note: Please add a button for each drug which will pop up to an
 * information sheet."). Popup vs. page is a Phase-1 presentation choice; this
 * module stays presentation-free.
 *
 * Keyed by the verbatim `agent` string so the sheet joins to `Treatment.agent`
 * (treatments.ts) and to the wizard's `AGENTS` values (wizard.ts) with no
 * separate id scheme — reuse `sheetFor(agent)` / `SHEET_BY_AGENT`.
 *
 * Coverage: the source authored 7 sheets — the 6 novel agents the wizard can
 * recommend (Emicizumab, Denecimig, Concizumab, Marstacimab, Fitusiran,
 * Etranacogene) plus Efanesoctocog alfa. It authored NO per-drug sheet for the
 * generic SHL / EHL rows in treatments.ts (they are class-level, not branded
 * agents); those two comparison-table rows are self-contained and intentionally
 * have no sheet.
 *
 * Text fields are bulleted lists, kept verbatim (PDF soft-hyphen line-wrap
 * artifacts removed). The `points: string[]` shape mirrors `NoteBlock` in
 * wizard.ts.
 */

/** One clinical-trial reference on a drug sheet. */
export interface ClinicalTrial {
  /** Trial name/label, verbatim (e.g. "HAVEN 3", "FRONTIER2", "Study 1"). */
  name: string;
  /** Registry id — an NCT number, or a jRCT id for NXT007-style trials. */
  id: string;
  /** Denecimig-only citation tail, verbatim (e.g. "See Mancuso NEJM 2026"). */
  citation?: string;
}

/** A per-drug information sheet. Fields are verbatim bullet lists from the PDF. */
export interface DrugSheet {
  /** Verbatim agent name — the join key to Treatment.agent / AGENTS values. */
  agent: string;
  /** "Class" / "Class/Target" — 1–2 source lines. */
  classTarget: string[];
  /** "Indication(s)" bullets. */
  indication: string[];
  /** "Dosage and Administration" bullets. */
  dosing: string[];
  /** "Monitoring" bullets. */
  monitoring: string[];
  /** "Clinical Trial(s)" entries. */
  trials: ClinicalTrial[];
}

export const DRUG_SHEETS: readonly DrugSheet[] = [
  {
    agent: "Efanesoctocog alfa",
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
    classTarget: ["Factor VIIIa–mimetic", "FIXa x FX BsAb"],
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
    classTarget: ["Factor VIIIa–mimetic BsAb", "FIXa x FX BsAb"],
    indication: [
      "TBD based on FDA approval; clinical trial populations evaluated HA +/- inhibitors, patients >1 year",
    ],
    dosing: [
      "SC injection, prefilled pen with attachable syringe",
      "No washout required when switching from emicizumab",
    ],
    monitoring: [
      "Monitoring: TBD; based on phase 3 clinical trial data:",
      "Injection site reactions (mostly mild, transient)",
      "No thromboembolic events or thrombotic microangiopathies",
      "No hypersensitivity reactions",
      "No clinically relevant findings in laboratory assessments",
    ],
    // Source spells "FRONTEIR5" and "Oldenburg"; kept as-authored.
    trials: [
      { name: "FRONTIER2", id: "NCT05053139", citation: "See Mancuso NEJM 2026" },
      { name: "FRONTIER3", id: "NCT05306418", citation: "See Mahlangu EAHAD 2025" },
      { name: "FRONTIER4", id: "NCT05685238", citation: "See Windyga ISTH 2026" },
      { name: "FRONTEIR5", id: "NCT05878938", citation: "See Oldenburg ISTH 2026" },
    ],
  },
  {
    agent: "Concizumab",
    classTarget: ["Hemostatic rebalancing agent; TFPI mAB"],
    indication: ["Routine prophylaxis, patients >12 years with HA/HB +/- FVIII/FIX inhibitors"],
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
    indication: ["Routine prophylaxis, patients >6 years with HA/HB +/- FVIII/FIX inhibitors"],
    dosing: [
      "SC injection (prefilled pen or syringe)",
      "Loading dose: 300 mg (two 150-mg injections)",
      "Maintenance dose: 150 mg/wk (start 1 week after the loading dose)",
      "Consider increasing dose to 300 mg/wk in patients weighing >50 kg",
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
    indication: ["Routine prophylaxis, patients >12 years with HA/HB +/- FVIII/FIX inhibitors"],
    dosing: [
      "SC injection (prefilled pen or syringe and vial for lower dose)",
      "Starting dose: 50 mg once every 2 months",
      "Monitor AT activity using an FDA-cleared test; maintain AT activity between 15-35% by adjusting the dose and/or frequency",
    ],
    monitoring: [
      "Thrombotic events",
      "AT levels",
      "Acute/recurrent gallbladder disease",
      "Hepatotoxicity: Measure LFTs at baseline, monthly for > 6 months, after dose increases, periodically thereafter",
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
    dosing: ["Single IV infusion", "2 x 10^13 genome copies/kg body weight"],
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

/** Look up a drug sheet by its verbatim agent name (the Treatment.agent join key). */
export function sheetFor(agent: string): DrugSheet | undefined {
  return SHEET_BY_AGENT.get(agent);
}
