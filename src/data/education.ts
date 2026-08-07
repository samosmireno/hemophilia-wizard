import { ACTIVITY_TITLE } from "./activity";
import { AGENT_NAMES, type AgentName } from "./agents";

export interface BenefitsChallenges {
  benefits: string[];
  challenges: string[];
}

export interface NestedBullet {
  text: string;
  children: string[];
}

export type Bullet = string | NestedBullet;

/**
 * One filing unit of source copy — not one chapter. A chapter composes several
 * (`treatment-landscape` reads four), and a topic that no chapter reads is an
 * orphan: keying `EDUCATION_TOPICS` by id is what makes that visible, since every
 * read is a checked property access rather than a `find()` that can miss.
 */
export interface EducationTopic {
  title: string;
  body: Bullet[];
  benefitsChallenges?: BenefitsChallenges;
  /**
   * The caption of the figure this topic owns — the title of the split-off figure
   * topic where there is one (`emicizumab-moa`, `denecimig-moa`, `nxt007-structure`),
   * the source's own caption where there is not (`inno8-overview`,
   * `rebalancing-mechanisms`; CONTEXT.md §7.6).
   *
   * Not rendered: every chapter states its own control title, because two of them
   * name the raster's painted heading rather than the source's. This is the record
   * of which figure belongs to which topic, so it must still agree with the page.
   */
  figures?: string[];
}

export type RebalancingMechanism = "anti-TFPI mAb" | "AT-directed siRNA";

export interface RebalancingAgent {
  name: AgentName;
  mechanism: RebalancingMechanism;
}

export const REBALANCING_AGENTS: readonly RebalancingAgent[] = [
  { name: AGENT_NAMES.concizumab, mechanism: "anti-TFPI mAb" },
  { name: AGENT_NAMES.marstacimab, mechanism: "anti-TFPI mAb" },
  { name: AGENT_NAMES.fitusiran, mechanism: "AT-directed siRNA" },
];

/** Shared by the `rebalancing-agents` bullets and the chapter's own render — both must agree. */
export function rebalancingAgentLabel({ name, mechanism }: RebalancingAgent): string {
  return `${name}: ${mechanism}`;
}

export const EDUCATION_TOPICS = {
  "evolving-landscape": {
    /** Also the `treatment-landscape` chapter's `<h1>`, read from here. */
    title: "The Evolving Treatment Landscape for Hemophilia",
    body: [ACTIVITY_TITLE],
  },
  "personalized-therapy": {
    title: "Personalized therapy for HA/HB",
    body: [
      "The growing treatment landscape provides opportunities to individualize therapy, meeting the changing needs and preferences of each patient",
      "Increased personalization adds complexity to clinical decision-making and optimal treatment selection",
    ],
  },
  "disease-mechanism": {
    title: "Disease mechanism for HA and HB",
    body: [
      {
        // U+2011 NON-BREAKING HYPHEN in "X‑linked", not ASCII "-".
        text: "HA and HB are rare but debilitating congenital bleeding disorders, resulting from X‑linked recessive inheritance of clotting factor deficiencies:",
        children: [
          "HA: FVIII deficiency due to F8 gene mutation",
          "HB: FIX deficiency due to F9 gene mutation",
        ],
      },
      "Deficiency or absence of FVIII or FIX results in inadequate thrombin generation leading to increased bleeding",
    ],
  },
  diagnosis: {
    title: "Diagnostic algorithm for HA/HB",
    body: [
      "Clinical diagnosis is made by laboratory evaluation indicating prolonged aPTT in conjunction with normal PT and fibrinogen levels, confirmed by testing for FVIII or FIX deficiency, and further characterized by F8/F9 genetic testing",
    ],
  },
  "clotting-factor-replacement": {
    title: "Clotting factor replacement",
    body: [
      "Historically, HA and HB were managed with clotting factor replacement, given prophylactically to prevent bleeding or episodically to manage bleeding events",
    ],
    benefitsChallenges: {
      benefits: [
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
  /**
   * Split off `clotting-factor-replacement` (2026-08-07), which held all four
   * sentences: `treatment-landscape` read bullet 1 and this chapter read bullets
   * 2–4 by index, promoting bullet 2 to its `<h1>`. A sentence that is a heading on
   * one page is not a body bullet on another, and an insertion in the source order
   * would have silently retitled the chapter. The same split the NXT007 and
   * Denecimig artboards prompted (CONTEXT.md §7.5).
   */
  "prophylaxis-guidance": {
    /** A full sentence, because that is what the artboard sets as the chapter title. */
    title:
      "Prophylactic treatment is recommended over episodic treatment to control bleeding in patients with moderately severe/severe hemophilia",
    body: [
      "Prophylaxis greatly reduces bleeding risk with minimal toxicity",
      "Recommendations for prophylactic treatment may apply even for FVIII plasma levels ≥2 IU/dL",
    ],
  },
  "fviii-mimetics": {
    title: "FVIII Mimetic BsAbs: Approved and Emerging Agents for HA Prophylaxis",
    body: [
      "BsAbs work by simultaneously targeting two antigens",
      "FVIII mimetic BsAbs are engineered to bridge FIXa and FX, mimicking the cofactor functions of FVIII and triggering the coagulation cascade",
      "Emicizumab established FVIII mimetic therapy as a first-in-class subcutaneous, nonfactor prophylaxis option for HA",
      "Emerging FVIII mimetic therapies, including denecimig (Mim8), are being developed to further optimize hemostatic activity while improving dosing convenience",
    ],
  },
  "emicizumab-overview": {
    title: "Emicizumab (FDA-approved)",
    body: [
      "Recombinant, humanized BsAb; IgG4 immunoglobulin combines two binding fragments for FIXa and FX",
      "FDA-approved for prophylaxis of HA, with or without inhibitors in newborns or older patients",
      "Administered subcutaneously on a monthly, bimonthly, or weekly schedule",
    ],
    figures: ["Emicizumab MOA: Interactions with FIX/FIXa and FX/FXa"],
  },
  "emicizumab-moa": {
    title: "Emicizumab MOA: Interactions with FIX/FIXa and FX/FXa",
    body: [
      "FVIII mimetic BsAb: Binds to activated FIXa and FX, enhancing catalytic efficiency of FIXa in converting FX on activated platelets",
    ],
  },
  /**
   * The FRONTIER age limits are `≥`, where `[PDF-V]` types a bare `>` — client
   * copy edit, 2026-08-05 (CONTEXT.md §7.5). Not a typo to reconcile.
   */
  "denecimig-overview": {
    title: "Denecimig (Mim8): Investigational currently under FDA review",
    body: [
      "FVIII mimetic BsAb: Binds to activated FIXa and FX, enhancing catalytic efficiency of FIXa in converting FX on activated platelets",
      "BLA submitted for use as routine prophylaxis in adult and pediatric patients with HA with or without inhibitors",
      {
        text: "FDA submission supported by results from the phase 3 FRONTIER clinical program:",
        children: [
          "FRONTIER2: Denecimig SC administered monthly or weekly in patients ≥12 years of age",
          "FRONTIER3: Denecimig monthly or weekly in patients ≥1 year of age",
          "FRONTIER4: OLE",
        ],
      },
      "Tiered dosing based on body weight avoids dose calculations, reduces treatment burden, and minimizes medication waste",
    ],
    figures: ["Mechanism of Action for Denecimig (Mim8): FVIII mimetic BsAb"],
  },
  /**
   * `title` quotes the heading painted into `denecimig.webp`'s own pixels;
   * `DENECIMIG_FIGURE_ALT` in the chapter quotes it too — both move if the asset does.
   */
  "denecimig-moa": {
    title: "Mechanism of Action for Denecimig (Mim8): FVIII mimetic BsAb",
    body: [
      "A monovalent anti-FIXa arm enhances FIXa proteolytic activity to facilitate FX activation and subsequent thrombin generation and clot formation",
      "Pre-clinical studies demonstrated denecimig (Mim8) potency up to 18-fold greater than emicizumab-equivalent analog",
    ],
  },
  nft: {
    title: "Non-factor Replacement Therapies",
    body: [
      "The hemophilia treatment landscape is rapidly evolving",
      "Novel therapies improve bleed protection, reduce treatment burden, and enable individualized treatment",
      {
        text: "Novel therapeutic classes:",
        children: [
          "FVIII mimetic BsAbs (HA)",
          "Hemostatic rebalancing agents (HA/HB)",
          "Gene therapy (HB)",
        ],
      },
    ],
    benefitsChallenges: {
      benefits: [
        "Subcutaneous administration",
        "Stable generation of thrombin",
        "Long half-life",
        // A real arrow, not the transcription's ASCII `-->`.
        "Shift disease from severe → mild",
        "Effective regardless of inhibitor status",
      ],
      challenges: [
        "Increased thrombotic risk",
        "Development of ADA",
        "Complex MOA",
        "Lack of standardized lab monitoring",
        "Management of major surgery",
        "Use in older populations",
      ],
    },
  },
  "rebalancing-agents": {
    title: "Hemostatic Rebalancing Agents",
    body: [
      "Hemostatic rebalancing agents are NFTs administered by SC injection",
      {
        text: "FDA-approved agents are indicated for prophylaxis of HA and HB, with and without inhibitors",
        children: REBALANCING_AGENTS.map(rebalancingAgentLabel),
      },
    ],
  },
  "rebalancing-mechanisms": {
    title: "Hemostatic Rebalancing Agents in Treatment of HA/HB",
    body: [
      "Hemostatic rebalancing agents enhance thrombin generation by targeting endogenous anticoagulant pathways, including TFPI, AT, and the APC/protein S system",
      {
        text: "Anti-TFPI monoclonal antibodies",
        children: [
          "TFPI limits coagulation by inhibiting FXa and TF–FVIIa complex",
          "Concizumab and marstacimab selectively bind the K2 domain of TFPI, reducing TFPI-mediated inhibition of FXa and enabling FXa generation by the FVIIa–TF pathway, promoting thrombin generation, clot formation, and hemostasis in HA/HB",
        ],
      },
      {
        text: "AT-directed siRNA",
        children: [
          "AT neutralizes thrombin and FXa, thereby limiting clot formation",
          "Fitusiran uses RNA interference to reduce hepatic AT production, restoring thrombin generation and rebalancing hemostasis",
        ],
      },
    ],
    /* The abbreviation footnote the source appended here went with the card that
       carried it (2026-08-06); what is left is the title the chapter draws. */
    figures: ["Mechanisms of Hemostatic Rebalancing Agents in the Coagulation Cascade"],
  },
  /**
   * The ZEBRHA trials are the client's, not the source's (2026-08-05, CONTEXT.md
   * §7.5) — different trials from the PDF's NXTAGE/WP44714, not a re-wording.
   */
  "nxt007-overview": {
    title: "NXT007",
    body: [
      "Next-generation BsAb engineered by modifying emicizumab to enhance hemostasis in HA",
      "In vitro studies demonstrated that NXT007-treated plasma samples achieved coagulation activity equivalent to 100 IU/dL FVIII in a tissue factor–triggered thrombin generation assay",
      {
        text: "Initiated in phase 3 trials:",
        children: ["ZEBRHA 1 (NCT07416526)", "ZEBRHA 2 (NCT07416604)"],
      },
    ],
    figures: ["NXT007 BsAb Structure"],
  },
  /**
   * `title` is also painted into `nxt007.webp`'s own pixels. The body's opening
   * "Zemocimig (NXT007)" is the client's INN (2026-08-05, CONTEXT.md §7.5) — the
   * only place it reaches this module; the two `title`s still transcribe the source.
   */
  "nxt007-structure": {
    title: "NXT007 BsAb Structure",
    body: [
      "Zemocimig (NXT007) is derived from emicizumab heavy-chain regions and incorporates two distinct light chains with charged-residue mutations designed to optimize antibody chain pairing and cofactor activity",
    ],
  },
  /**
   * VOYAGER2 is phase 1/2, not the phase 1 the source states — client copy edit,
   * 2026-08-05 (CONTEXT.md §7.5). "1/2" is two phase numbers, not a fraction.
   */
  "inno8-overview": {
    title: "Inno8: Oral FVIII Mimetic for HA",
    body: [
      "Novel VHH-based FVIII mimetic; once-daily oral treatment of HA",
      "Currently under evaluation in nonrandomized open-label phase 1/2 VOYAGER2 trial (NCT07220564)",
    ],
    figures: ["Inno8 Mechanism of Action"],
  },
} satisfies Record<string, EducationTopic>;

/** The id of a topic that exists. A chapter reading anything else does not compile. */
export type TopicId = keyof typeof EDUCATION_TOPICS;

export const CLOTTING_CASCADE_NOTES: readonly string[] = [
  "The amplification loop is critical for thrombin generation in tissues with limited expression of tissue factor (joints and muscles)",
  "FVIII and FIX play a critical role in amplifying the generation of thrombin and in clot formation",
];

export const CLOTTING_CASCADE_CONCLUSION = "Hemophilia reduces thrombin generation";

export interface SeverityRow {
  severity: string;
  factorLevel: string;
  manifestations: readonly string[];
}

export const SEVERITY_TABLE: readonly SeverityRow[] = [
  {
    severity: "Mild",
    factorLevel: ">5% – <40%",
    manifestations: [
      "Rare spontaneous bleeding",
      "Prolonged bleeding with major trauma or surgery",
    ],
  },
  {
    severity: "Moderate",
    factorLevel: "1% – 5%",
    manifestations: [
      "Occasional spontaneous bleeding",
      "Prolonged bleeding with minor trauma or surgery",
    ],
  },
  {
    severity: "Severe",
    factorLevel: "<1%",
    manifestations: [
      "Frequent hemorrhages in joints, muscles, and soft tissues",
      "Life-threatening bleeding episodes (eg, intracranial hemorrhage)",
    ],
  },
];

export type FootnoteKey = "a" | "b" | "c";

export interface TreatmentOptionRow {
  option: string;
  moa: string;
  population: string;
  indication: readonly string[];
  route: string;
  footnote?: FootnoteKey;
}

/**
 * The shorthand is the copy, on the client's 2026-08-05 instruction — `↑`, `→`,
 * `HA`/`HB` override the artboard's longhand. Do not re-expand.
 */
export const TREATMENT_OPTIONS_MATRIX: readonly TreatmentOptionRow[] = [
  {
    option: "FVIII/FIX concentrates",
    moa: "↑ FVIII levels by 2 IU/dL per IU/kg and FIX levels by 1 IU/dL per IU/kg",
    population: "HA/HB without inhibitors",
    indication: ["Prophylaxis", "Treatment of bleeding episodes and surgery"],
    route: "IV",
    footnote: "a",
  },
  {
    option: "FVIII mimetics",
    // The client's 2026-08-05 wording, left exactly as given — asked and
    // answered, so do not re-litigate it.
    moa: "Mimics activity of emicizumab equivalent to FVIII ~10–12 IU/dL",
    population: "HA with/without inhibitors",
    indication: ["Prophylaxis"],
    route: "SC",
    footnote: "b",
  },
  {
    option: "Rebalancing: siRNA",
    moa: "↓ antithrombin; ↑ thrombin generation",
    population: "HA/HB with/without inhibitors",
    indication: ["Prophylaxis"],
    route: "SC",
    footnote: "b",
  },
  {
    option: "Rebalancing: anti-TFPI",
    moa: "Inhibits TFPI; ↑ thrombin generation",
    population: "HA/HB with/without inhibitors",
    indication: ["Prophylaxis"],
    route: "SC",
    footnote: "b",
  },
  {
    option: "AAV gene therapy",
    moa: "Recombinant AAV vector → functional copy of the F9 gene into hepatocytes",
    population: "HB without inhibitors",
    indication: ["Long-term prophylaxis/treatment break"],
    route: "IV",
    footnote: "c",
  },
];

export const TREATMENT_OPTIONS_FOOTNOTES: Record<FootnoteKey, Bullet> = {
  a: "EHL recombinant factors use pegylation or fusion to albumin or Fc fragments to extend factor half-life; fusion proteins increase half-life by 1.5- to 6-fold",
  b: {
    text: "For breakthrough bleeds:",
    children: [
      "Hemophilia A or B without inhibitors; treat with FVIII/FIX concentrates",
      "Hemophilia A or B with inhibitors; treat with bypassing agents",
    ],
  },
  c: "Responses are associated with inter-individual variability and uncertain duration",
};
