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
 *
 * **The trial citations are gone, by client direction (2026-08-04):** "delete the
 * colon and everything after on each bullet (ie, only the clinical trials name
 * (NCT…) would be kept". `ClinicalTrial` therefore has no `citation` field, and
 * the four Denecimig tails it held ("See Mancuso NEJM 2026" and its siblings) are
 * not stored anywhere in this module. They remain recoverable from
 * `documents/out_raw.txt`; CONTEXT.md §6 records the cut.
 */

/** One clinical-trial reference on a drug sheet. */
export interface ClinicalTrial {
  /** Trial name/label, verbatim (e.g. "HAVEN 3", "FRONTIER2", "Study 1"). */
  name: string;
  /** Registry id — an NCT number, or a jRCT id for NXT007-style trials. */
  id: string;
}

/** A per-drug information sheet. Fields are verbatim bullet lists from the PDF. */
export interface DrugSheet {
  /** Verbatim agent name — the join key to Treatment.agent / AGENTS values. */
  agent: string;
  /**
   * The heading the pop-up card wears, where the source gives the sheet one that
   * is not the agent's name. Falls back to `agent`.
   *
   * This is the caption/title split the education chapters record (see
   * `fviiia-mimetics`' `CARD_TITLE`): the button announces "Expand Denecimig",
   * because the agent is what the reader picked, and the card is named for what
   * the source calls the sheet. Stored in sentence case — every band in this app
   * is shouted by CSS, not by copy.
   */
  title?: string;
  /**
   * Label over `classTarget`, **without its trailing colon** — the card appends
   * that. Defaults to "Class/Target".
   *
   * Six sheets pair a class with a molecular target and say so; Efanesoctocog
   * alfa names a class alone and the source heads it "Class". Transcribed rather
   * than normalised, because the heading is telling you what the field under it
   * contains.
   */
  classHeading?: string;
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
    /*
      **"Factor VIII mimetic", not the source's "Factor VIIIa–mimetic"** — client
      copy edit, 2026-08-05, dropping the activated form's `a` and the dash. It is
      the same terminology pass that took Denecimig's sibling bullet below and every
      string the §7.5 chapter paints (see `denecimig-moa` in education.ts); this
      card was named a step later, so the two sheets agree again. Not a typo to
      reconcile against the artboard, which still draws the activated form.
    */
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
    /**
     * **"Factor VIII mimetic", not "Factor VIIIa–mimetic" (2026-08-05)** — a client
     * copy edit: drop the activated form's `a` and the dash. It landed on this
     * sheet first and on Emicizumab's above a step later, so the two agree; see
     * that one for the pass they both belong to.
     */
    classTarget: ["Factor VIII mimetic BsAb", "FIXa x FX BsAb"],
    /*
      `≥`, not the source's bare `>` — client copy edit, 2026-08-05 ("underline
      the > sign, ie, greater than or equal to"). It landed here first and on the
      three rebalancing-agent sheets below a step later, so every age threshold in
      this module now reads `≥`. It also agrees with what the education chapter
      has always said about FRONTIER3 ("patients ≥1 year of age").
    */
    indication: [
      "TBD based on FDA approval; clinical trial populations evaluated HA +/- inhibitors, patients ≥1 year",
    ],
    dosing: [
      "SC injection, prefilled pen with attachable syringe",
      "No washout required when switching from emicizumab",
    ],
    /*
      The source qualified this whole section at its heading — "Monitoring: TBD;
      based on phase 3 clinical trial data" — which is why `DrugSheet` used to
      carry a `monitoringHeading`. Cut by client direction, 2026-08-05, leaving
      the plain default; the field went with it, since it had no other user.
    */
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
    // `≥`, not the source's bare `>` — see the Denecimig sheet for the edit. The
    // dosing bullet's ">50 kg" is a weight, not an age, so it stays as authored.
    indication: ["Routine prophylaxis, patients ≥6 years with HA/HB +/- FVIII/FIX inhibitors"],
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
    // `≥`, not the source's bare `>` — see the Denecimig sheet for the edit. The
    // monitoring bullet's "> 6 months" is a duration, not an age, so it stays.
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
    // "2 × 10¹³" in Unicode, not "2 x 10^13": the caret renders literally, and a
    // dose that reads as ten-thousand-and-thirteen is a hazard rather than a
    // typo. Same notation CONTEXT.md §6 already uses for it.
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

/** Look up a drug sheet by its verbatim agent name (the Treatment.agent join key). */
export function sheetFor(agent: string): DrugSheet | undefined {
  return SHEET_BY_AGENT.get(agent);
}
