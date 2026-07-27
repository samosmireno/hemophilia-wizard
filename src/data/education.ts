/**
 * Education content — the left-band "Click here:" pop-ups plus two structured
 * tables.
 *
 * Source of truth: `[PDF-V]` LEFT band + `[PPTX]` slides 6–7 (CONTEXT.md §7;
 * `documents/out_raw.txt`). Text verbatim (PDF soft-hyphen artifacts removed).
 *
 * Shape is deliberately lean (issue 00 anti-over-modeling checklist):
 * - EDUCATION_TOPICS is a FLAT list — prose pop-ups keyed to the §7.7
 *   click-through index. Optional `benefitsChallenges` where the source authors
 *   an explicit benefits/challenges pair; optional `figures` holding only the
 *   figure CAPTIONS the PDF names (the 24 images are not yet available as
 *   assets — Phase 1 attaches real files, so there is intentionally no `src`).
 * - The two genuinely tabular blocks get bespoke row types, like TREATMENTS.
 *
 * No display order/color/grouping fields — that is Phase 1/3 presentation.
 */

export interface BenefitsChallenges {
  benefits: string[];
  challenges: string[];
}

export interface EducationTopic {
  /** Stable id (matches the §7.7 click-through index where applicable). */
  id: string;
  title: string;
  /** Verbatim prose bullets. */
  body: string[];
  /** Present only where the source authors an explicit benefits/challenges pair. */
  benefitsChallenges?: BenefitsChallenges;
  /** Figure CAPTIONS the PDF names for this topic. No asset paths yet (Phase 1). */
  figures?: string[];
}

export const EDUCATION_TOPICS: readonly EducationTopic[] = [
  {
    id: "evolving-landscape",
    title: "The Evolving Treatment Landscape for Hemophilia",
    body: [
      "The Future Is Now: Personalizing Hemophilia Prophylaxis in an Era of Novel Agents",
      "The hemophilia treatment landscape is rapidly evolving",
      "Novel therapies improve bleed protection, reduce treatment burden, and enable individualized treatment",
      "Novel therapeutic classes: FVIIIa-mimetic BsAbs (HA); Hemostatic rebalancing agents (HA/HB); Gene therapy (HB)",
    ],
  },
  {
    id: "personalized-therapy",
    title: "Personalized therapy for HA/HB",
    body: [
      "The growing treatment landscape provides opportunities to individualize therapy, meeting the changing needs and preferences of each patient",
      "Increased personalization adds complexity to clinical decision-making and optimal treatment selection",
    ],
  },
  {
    id: "disease-mechanism",
    title: "Disease mechanism for HA and HB",
    body: [
      "HA and HB are rare but debilitating congenital bleeding disorders, resulting from X-linked recessive inheritance of clotting factor deficiencies:",
      "HA: FVIII deficiency due to F8 gene mutation",
      "HB: FIX deficiency due to F9 gene mutation",
      "Deficiency or absence of FVIII or FIX results in inadequate thrombin generation leading to increased bleeding",
    ],
  },
  {
    id: "diagnosis",
    title: "Diagnostic algorithm for HA/HB",
    body: [
      "Clinical diagnosis is made by laboratory evaluation indicating prolonged aPTT in conjunction with normal PT and fibrinogen levels, confirmed by testing for FVIII or FIX deficiency, and further characterized by F8/F9 genetic testing",
    ],
  },
  {
    id: "severity-bleeding",
    title: "Hemophilia Severity and Bleeding Patterns",
    body: [
      "Disease severity is classified by residual FVIII/FIX activity level (see SEVERITY_TABLE)",
    ],
    figures: ["Bleeding in males and females with hemophilia"],
  },
  {
    id: "clotting-factor-replacement",
    title: "Clotting factor replacement",
    body: [
      "Historically, HA and HB were managed with clotting factor replacement, given prophylactically to prevent bleeding or episodically to manage bleeding events",
      "Prophylactic treatment is recommended over episodic treatment to control bleeding in patients with moderately severe/severe hemophilia",
      "Prophylaxis greatly reduces bleeding risk with minimal toxicity",
      "Recommendations for prophylactic treatment may apply even for FVIII plasma levels ≥2 IU/dL",
    ],
    // "Benefits and Challenges Associated with Clotting Factor Replacement Therapies
    //  (Options include SHL, EHL, and UHL FVIII/FIX products)"
    benefitsChallenges: {
      benefits: [
        "Initiation and amplification of the clotting cascade",
        "Dosing frequency varies by product and patient need",
        "Well-understood long-term safety and efficacy",
      ],
      challenges: [
        "FVIII/FIX monitoring; PK-guided dose optimization; peak/trough levels as needed",
        "IV administration, infusion preparation, venous access, and ongoing dosing/monitoring requirements",
        "Development of neutralizing antibodies to FVIII or FIX can reduce treatment efficacy and increase risk for breakthrough bleeding and joint damage",
      ],
    },
  },
  {
    id: "fviiia-mimetics",
    title: "FVIIIa-Mimetic BsAbs: Approved and Emerging Agents for HA Prophylaxis",
    body: [
      "BsAbs work by simultaneously targeting two antigens",
      "FVIIIa mimetic BsAbs are engineered to bridge FIXa and FX, mimicking the cofactor functions of FVIII and triggering the coagulation cascade",
      "Emicizumab established FVIIIa-mimetic therapy as a first-in-class subcutaneous, nonfactor prophylaxis option for HA",
      "Emerging FVIIIa-mimetic therapies, including denecimig/Mim8, are being developed to further optimize hemostatic activity while improving dosing convenience",
    ],
  },
  {
    id: "emicizumab-overview",
    title: "Emicizumab (FDA-approved)",
    body: [
      "Recombinant, humanized BsAb; IgG4 immunoglobulin combines two binding fragments for FIXa and FX",
      "FDA-approved for prophylaxis of HA, with or without inhibitors in newborns or older patients",
      "Administered subcutaneously on a monthly, bimonthly, or weekly schedule",
      "FVIIIa-mimetic BsAb: Binds to activated FIXa and FX, enhancing catalytic efficiency of FIXa in converting FX on activated platelets",
    ],
    figures: ["Emicizumab MOA: Interactions with FIX/FIXa and FX/FXa"],
  },
  {
    id: "denecimig-overview",
    title: "Denecimig (Mim8): Investigational; currently under FDA review",
    body: [
      "A monovalent anti-FIXa arm enhances FIXa proteolytic activity to facilitate FX activation and subsequent thrombin generation and clot formation",
      "Pre-clinical studies demonstrated Mim8 potency up to 18-fold greater than emicizumab-equivalent analog",
      "BLA submitted for use as routine prophylaxis in adult and pediatric patients with HA with or without inhibitors",
      "FDA submission supported by results from the phase 3 FRONTIER clinical program:",
      "FRONTIER2: Denecimig SC administered monthly or weekly in patients >12 years of age",
      "FRONTIER3: Denecimig monthly or weekly in patients >1 year of age",
      "FRONTIER4: OLE",
      "Tiered dosing based on body weight avoids dose calculations, reduces treatment burden, and minimizes medication waste",
    ],
    figures: ["Mechanism of Action for Denecimig (Mim8): FVIIIa-mimetic BsAb"],
  },
  {
    id: "nft",
    title: "Non-factor Replacement Therapies",
    body: [],
    benefitsChallenges: {
      benefits: [
        "Subcutaneous administration",
        "Stable generation of thrombin",
        "Long half-life",
        "Shift disease from severe --> mild",
        "Effective regardless of inhibitor status",
      ],
      challenges: [
        "Increased thrombotic risk",
        "Development of ADA",
        "Complex MOA",
        "Lack of a standardized lab monitoring",
        "Management of major surgery",
        "Use in older populations",
      ],
    },
  },
  {
    id: "rebalancing-agents",
    title: "Hemostatic Rebalancing Agents in Treatment of HA/HB",
    body: [
      "Hemostatic rebalancing agents enhance thrombin generation by targeting endogenous anticoagulant pathways, including TFPI, AT, and the APC/protein S system",
      "Hemostatic rebalancing agents are NFTs administered by SC injection",
      "FDA-approved agents are indicated for prophylaxis of HA and HB, with and without inhibitors",
      "Anti-TFPI monoclonal antibodies: TFPI limits coagulation by inhibiting FXa and tissue factor–FVIIa complex",
      "Concizumab and marstacimab selectively bind the K2 domain of TFPI, reducing TFPI-mediated inhibition of FXa and enabling FXa generation by the FVIIa–TF pathway, promoting thrombin generation, clot formation, and hemostasis in HA/HB",
      "AT-directed siRNA: AT neutralizes thrombin and FXa, thereby limiting clot formation",
      "Fitusiran uses RNA interference to reduce hepatic AT production, restoring thrombin generation and rebalancing hemostasis",
      "Concizumab: anti-TFPI mAB; Marstacimab: anti-TFPI mAB; Fitusiran: AT-directed siRNA",
    ],
    figures: [
      "Mechanisms of Hemostatic Rebalancing Agents in the Coagulation Cascade (APC = activated protein C; AT = antithrombin; TFPI = tissue factor pathway inhibitor)",
    ],
  },
  {
    id: "emerging-mimetics",
    title: "Investigational FVIIIa-mimetic therapies in early-stage development",
    body: [
      "NXT007: Next-generation BsAb engineered by modifying emicizumab to enhance hemostasis in HA",
      "NXT007 is derived from emicizumab heavy-chain regions and incorporates two distinct light chains with charged-residue mutations designed to optimize antibody chain pairing and cofactor activity",
      "In vitro studies demonstrated that NXT007-treated plasma samples achieved coagulation activity equivalent to 100 IU/dL FVIII in a tissue factor–triggered thrombin generation assay",
      "NXT007 ongoing clinical trials: NXTAGE study (jRCT2080224835); WP44714 study (NCT05987449)",
      "Inno8: Novel VHH-based FVIIIa-mimetic; once-daily oral treatment of HA",
      "Inno8 is currently under evaluation in nonrandomized open-label phase 1 VOYAGER2 trial (NCT07220564)",
    ],
    figures: ["NXT007 BsAb Structure", "Inno8 Mechanism of Action"],
  },
];

/** §7.2 severity classification (PPTX slide 6). */
export interface SeverityRow {
  severity: string;
  factorLevel: string;
  manifestation: string;
}

export const SEVERITY_TABLE: readonly SeverityRow[] = [
  {
    severity: "Mild",
    factorLevel: ">5% – <40%",
    manifestation: "Rare spontaneous bleeding; prolonged bleeding with major trauma or surgery",
  },
  {
    severity: "Moderate",
    factorLevel: "1% – 5%",
    manifestation:
      "Occasional spontaneous bleeding; prolonged bleeding with minor trauma or surgery",
  },
  {
    severity: "Severe",
    factorLevel: "<1%",
    manifestation:
      "Frequent hemorrhages in joints, muscles, and soft tissues; life-threatening bleeding episodes (eg, intracranial hemorrhage)",
  },
];

/** Footnote marker keying a matrix row to TREATMENT_OPTIONS_FOOTNOTES. */
export type FootnoteKey = "a" | "b" | "c";

/** §7.3 class-level treatment-options matrix (PPTX slide 7). */
export interface TreatmentOptionRow {
  option: string;
  moa: string;
  population: string;
  indication: string;
  route: string;
  /** Footnote marker keyed into TREATMENT_OPTIONS_FOOTNOTES. */
  footnote?: FootnoteKey;
}

export const TREATMENT_OPTIONS_MATRIX: readonly TreatmentOptionRow[] = [
  {
    option: "FVIII/FIX concentrates",
    moa: "↑ FVIII by 2 IU/dL per IU/kg; ↑ FIX by 1 IU/dL per IU/kg",
    population: "HA/HB without inhibitors",
    indication: "Prophylaxis; treatment of bleeding episodes and surgery",
    route: "IV",
    footnote: "a",
  },
  {
    option: "FVIII mimetics",
    moa: "Mimics FVIII activity; 1st-generation equivalent to FVIII ~10–12 IU/dL",
    population: "HA with/without inhibitors",
    indication: "Prophylaxis",
    route: "SC",
    footnote: "b",
  },
  {
    option: "Rebalancing: siRNA",
    moa: "Reduces antithrombin; increases thrombin generation",
    population: "HA/HB with/without inhibitors",
    indication: "Prophylaxis",
    route: "SC",
    footnote: "b",
  },
  {
    option: "Rebalancing: anti-TFPI",
    moa: "Inhibits TFPI; increases thrombin generation",
    population: "HA/HB with/without inhibitors",
    indication: "Prophylaxis",
    route: "SC",
    footnote: "b",
  },
  {
    option: "AAV gene therapy",
    moa: "Recombinant AAV vector delivers a functional copy of the F9 gene into hepatocytes",
    population: "HB without inhibitors",
    indication: "Long-term prophylaxis / treatment break",
    route: "IV",
    footnote: "c",
  },
];

export const TREATMENT_OPTIONS_FOOTNOTES: Record<FootnoteKey, string> = {
  a: "EHL recombinant factors use pegylation or fusion to albumin or Fc fragments to extend half-life (fusion proteins ↑ half-life 1.5–6-fold).",
  b: "Breakthrough bleeds: without inhibitors → treat with FVIII/FIX concentrates; with inhibitors → treat with bypassing agents.",
  c: "Responses show inter-individual variability and uncertain duration.",
};
