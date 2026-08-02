/**
 * Education content — the left-band "Click here:" pop-ups plus two structured
 * tables.
 *
 * Source of truth: `[PDF-V]` LEFT band + `[PPTX]` slides 6–7 (CONTEXT.md §7;
 * `documents/out_raw.txt`). Text verbatim (PDF soft-hyphen artifacts removed).
 *
 * Shape is deliberately lean (issue 00 anti-over-modeling checklist):
 * - EDUCATION_TOPICS is a FLAT list of topics — prose pop-ups keyed to the §7.7
 *   click-through index. Optional `benefitsChallenges` where the source authors
 *   an explicit benefits/challenges pair; optional `figures` holding only the
 *   figure CAPTIONS the PDF names (the 24 images are not yet available as
 *   assets — Phase 1 attaches real files, so there is intentionally no `src`).
 *   A topic's `body` carries at most ONE nested level (`NestedBullet`), which
 *   is as deep as the source goes.
 * - The two genuinely tabular blocks get bespoke row types, like TREATMENTS.
 *
 * No display order/color/grouping fields — that is Phase 1/3 presentation.
 */

import { ACTIVITY_TITLE } from "./activity";

export interface BenefitsChallenges {
  benefits: string[];
  challenges: string[];
}

/**
 * A bullet that carries a nested level beneath it. The source authors two
 * levels in places — `disease-mechanism`'s lead line ends in a colon and the
 * HA:/HB: pair belongs under it, which is how the design renders them.
 *
 * The nesting is a property of the content, not of a layout: expressing it here
 * rather than by array position means a chapter cannot silently lose its
 * indentation when a bullet is inserted or reordered.
 */
export interface NestedBullet {
  text: string;
  children: string[];
}

/** One prose bullet — flat, or with a nested level of its own. */
export type Bullet = string | NestedBullet;

export interface EducationTopic {
  /** Stable id (matches the §7.7 click-through index where applicable). */
  id: string;
  title: string;
  /** Verbatim prose bullets. */
  body: Bullet[];
  /** Present only where the source authors an explicit benefits/challenges pair. */
  benefitsChallenges?: BenefitsChallenges;
  /** Figure CAPTIONS the PDF names for this topic. No asset paths yet (Phase 1). */
  figures?: string[];
}

/**
 * The mechanism class an agent belongs to. A union rather than a string: the
 * `rebalancing-agents` chapter draws the two classes in two different colours,
 * so a typo here would silently fall through to the wrong one — and this is
 * what makes a third class a compile error in the chapter rather than an agent
 * that renders in nobody's colour.
 */
export type RebalancingMechanism = "anti-TFPI mAB" | "AT-directed siRNA";

/** §7.6's three FDA-approved hemostatic rebalancing agents. */
export interface RebalancingAgent {
  name: string;
  mechanism: RebalancingMechanism;
}

/**
 * The three agents, split into name and mechanism rather than kept as the one
 * semicolon-joined string §7.6 transcribes — a bespoke row type beside
 * `SEVERITY_TABLE` and `TREATMENT_OPTIONS_MATRIX`, for the same reason those
 * two have one.
 *
 * **The split is what joins the copy to its colour.** The `rebalancing-agents`
 * artboard sets the two anti-TFPI mABs in blue and the AT-directed siRNA in
 * crimson, so the colour is a function of `mechanism` — a fact about the agent,
 * which is why it is modelled here, while the colours themselves stay in the
 * chapter (this module carries no display fields). Held as one flat string, the
 * chapter could only recover that by matching on the prose, and rewording a
 * bullet would silently drop a colour.
 *
 * Declared above `EDUCATION_TOPICS` rather than beside its two siblings at the
 * foot of the file because the `rebalancing-agents` topic composes its nested
 * bullets from it at module init.
 */
export const REBALANCING_AGENTS: readonly RebalancingAgent[] = [
  { name: "Concizumab", mechanism: "anti-TFPI mAB" },
  { name: "Marstacimab", mechanism: "anti-TFPI mAB" },
  { name: "Fitusiran", mechanism: "AT-directed siRNA" },
];

/**
 * One agent as the source writes it — "Concizumab: anti-TFPI mAB".
 *
 * Exported because it has two callers and they must agree exactly: the topic
 * below builds its nested bullets from it, and the chapter builds the lookup
 * that colours them by the same string. Composed in either place separately,
 * a change to the separator would leave the colours matching nothing.
 */
export function rebalancingAgentLabel({ name, mechanism }: RebalancingAgent): string {
  return `${name}: ${mechanism}`;
}

export const EDUCATION_TOPICS: readonly EducationTopic[] = [
  {
    id: "evolving-landscape",
    /** Also the `treatment-landscape` chapter's `<h1>`, read from here. */
    title: "The Evolving Treatment Landscape for Hemophilia",
    body: [
      // Shared with the landing hero, which renders the same string as its
      // headline — see `activity.ts`.
      //
      // The only bullet left here. The other three moved to `nft` below,
      // because that is the heading the design files them under — see the note
      // on that topic.
      ACTIVITY_TITLE,
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
      {
        // U+2011 NON-BREAKING HYPHEN in "X‑linked", not ASCII "-": a line break
        // between the X and the term reads as two things. It renders identically
        // and copies as a hyphen; only the wrap point differs.
        text: "HA and HB are rare but debilitating congenital bleeding disorders, resulting from X‑linked recessive inheritance of clotting factor deficiencies:",
        children: [
          "HA: FVIII deficiency due to F8 gene mutation",
          "HB: FIX deficiency due to F9 gene mutation",
        ],
      },
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
  /**
   * §7.5's approved agent, as its pop-up card draws it: three bullets beside the
   * MOA diagram.
   *
   * **The MOA sentence used to be a fourth bullet here** and now lives in
   * `emicizumab-moa` below. That is the `rebalancing-mechanisms` split, for the
   * same reason: the card does not draw it, and prose an artboard omits gets
   * moved rather than cut off by an index in the chapter — an inserted or
   * reordered bullet would otherwise silently change which copy is dropped.
   *
   * `figures` still names the diagram, unchanged; that caption is now also the
   * split topic's `title`, which is what the enlarged figure card wears.
   */
  {
    id: "emicizumab-overview",
    title: "Emicizumab (FDA-approved)",
    body: [
      "Recombinant, humanized BsAb; IgG4 immunoglobulin combines two binding fragments for FIXa and FX",
      "FDA-approved for prophylaxis of HA, with or without inhibitors in newborns or older patients",
      "Administered subcutaneously on a monthly, bimonthly, or weekly schedule",
    ],
    figures: ["Emicizumab MOA: Interactions with FIX/FIXa and FX/FXa"],
  },
  /**
   * The diagram beside the bullets above, and the one sentence describing it.
   *
   * `title` is `emicizumab-overview.figures[0]` verbatim rather than a reference
   * to it: a figure's title is *stated* in this codebase, not derived (see
   * `MECHANISM_FIGURE_TITLE` in the `rebalancing-agents` chapter). The two being
   * equal is the point — this topic is that figure — but stating it means the
   * caption list stays a caption list and nothing has to index into it.
   *
   * `body` is one bullet because the source authors one. It renders under the
   * enlarged diagram, which is the only place it is drawn at all.
   */
  {
    id: "emicizumab-moa",
    title: "Emicizumab MOA: Interactions with FIX/FIXa and FX/FXa",
    body: [
      "FVIIIa-mimetic BsAb: Binds to activated FIXa and FX, enhancing catalytic efficiency of FIXa in converting FX on activated platelets",
    ],
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
  /**
   * §7.6's benefits/challenges pair, and — since the `treatment-landscape`
   * design landed — the three §7.1 landscape bullets as well.
   *
   * **The prose is §7.1's but the heading over it is this topic's**, which is
   * the design's own filing, not a transcription slip: the chapter draws these
   * three bullets under "Non-factor therapies:" and the `+` beside them opens
   * this topic's `benefitsChallenges`. They were in `evolving-landscape` while
   * nothing rendered them; `body` was empty here for the same reason.
   *
   * `title` is still §7.6's name for the class and is not what the chapter
   * shows — that heading is a literal there, because the two disagree.
   */
  {
    id: "nft",
    title: "Non-factor Replacement Therapies",
    body: [
      "The hemophilia treatment landscape is rapidly evolving",
      "Novel therapies improve bleed protection, reduce treatment burden, and enable individualized treatment",
      {
        // One flat semicolon-joined string until the design showed it drawn as
        // a nested list — the same shape, and the same reasoning, as
        // `disease-mechanism`'s HA/HB pair above.
        text: "Novel therapeutic classes:",
        children: [
          "FVIIIa-mimetic BsAbs (HA)",
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
        // A real arrow, not the transcription's ASCII `-->`: this string is
        // rendered copy, the artboard draws "severe → mild", and CONTEXT.md
        // §7.6 states it the same way.
        "Shift disease from severe → mild",
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
  /**
   * §7.6's class overview, as the `rebalancing-agents` chapter draws it: two
   * bullets, the second carrying the three agents.
   *
   * **This topic was split when that design landed.** It used to hold all of
   * §7.6's prose in one flat `body` — the two bullets below, the four
   * TFPI/AT-pathway sentences now in `rebalancing-mechanisms`, and the three
   * agents as one semicolon-joined string. The artboard draws the two halves in
   * two different places (these bullets on the chapter, the mechanism prose
   * behind the "Mechanisms…" figure), so one topic could only have been
   * rendered by slicing it at an index — which is a fact about a layout stored
   * as an offset into an array. The split states it instead.
   *
   * **The split put §7.6's block title on the wrong half, and this is the
   * correction.** It read "Hemostatic Rebalancing Agents in Treatment of HA/HB"
   * — which is the heading §7.6 sets over the *mechanism* prose, not over these
   * two bullets — and the chapter had to carry a `HEADING` literal to drop the
   * scope qualifier the artboard does not draw. Both halves of that are gone:
   * the qualified title moved to `rebalancing-mechanisms`, whose pop-up wears
   * it, and this is now the string the chapter's `<h1>` actually shows.
   *
   * The children are composed from `REBALANCING_AGENTS` rather than written out
   * here for the reason recorded on that array: the chapter colours two of them
   * and not the third, and the two halves of that must not be able to drift.
   */
  {
    id: "rebalancing-agents",
    title: "Hemostatic Rebalancing Agents",
    body: [
      "Hemostatic rebalancing agents are NFTs administered by SC injection",
      {
        text: "FDA-approved agents are indicated for prophylaxis of HA and HB, with and without inhibitors",
        children: REBALANCING_AGENTS.map(rebalancingAgentLabel),
      },
    ],
  },
  /**
   * The other half of the split above: how the three agents act, which is what
   * the §7.7 "Mechanisms of hemostatic rebalancing agents within the coagulation
   * cascade" click-through is about.
   *
   * That target opens **two** cards, and this topic supplies both. This `body`
   * is the first — the prose card, headed by the `title` below. The second is
   * the `figures[0]` diagram, which the chapter titles with a literal of its own
   * because a figure's title is stated rather than derived (the same call
   * `disease-background` makes for all three of its cards).
   *
   * **`title` is §7.6's block heading, which sits over this prose in the
   * source** — "Hemostatic rebalancing agents in treatment of HA/HB — enhance
   * thrombin generation by targeting endogenous anticoagulant pathways…". It
   * arrived here from `rebalancing-agents`, which held it only because that is
   * where the split left it; see the correction recorded there.
   *
   * The id is not in the §7.7 index — that index names click-through targets,
   * and this is the content behind one of them.
   *
   * **The two lead-ins are `NestedBullet`s now, which is what this comment used
   * to be waiting for.** It read: "flat, though two of the four bullets lead
   * into the two beneath them — the source punctuates rather than indents, and
   * no design has drawn this yet… it stayed flat until the artboard showed it
   * nested." The artboard has shown it, and drawn something stronger than an
   * indent: each lead-in is a heading over its own list. The trailing colons go
   * with the flattening — they were the punctuation standing in for the indent,
   * so keeping them would set a heading that ends in a colon it no longer needs.
   */
  {
    id: "rebalancing-mechanisms",
    title: "Hemostatic Rebalancing Agents in Treatment of HA/HB",
    body: [
      "Hemostatic rebalancing agents enhance thrombin generation by targeting endogenous anticoagulant pathways, including TFPI, AT, and the APC/protein S system",
      {
        text: "Anti-TFPI monoclonal antibodies",
        children: [
          "TFPI limits coagulation by inhibiting FXa and tissue factor–FVIIa complex",
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
    figures: [
      "Mechanisms of Hemostatic Rebalancing Agents in the Coagulation Cascade (APC = activated protein C; AT = antithrombin; TFPI = tissue factor pathway inhibitor)",
    ],
  },
  /**
   * §7.6's two investigational agents, **one topic per agent**.
   *
   * They were a single `emerging-mimetics` topic, holding all six bullets and
   * both figure captions, while nothing rendered them. The `fviiia-mimetics`
   * artboard settles the filing: it draws NXT007 and Inno8 as two separate `+`
   * disclosures inside its own panel, and the designer has drawn a card behind
   * each (Pop ups 12 and 13) — so they are two targets, not one, and they belong
   * to §7.5's chapter rather than §7.6's. CONTEXT.md §7.5 records the move.
   *
   * The split is clean at the source: the six bullets were already four about
   * NXT007 followed by two about Inno8, and `figures` already named one diagram
   * per agent. Nothing is rephrased — the leading "NXT007:" / "Inno8:" stay on
   * the bullets that carry them, as the source writes them.
   *
   * `title` is each card's own heading, not the chapter's caption for it: the
   * panel labels the buttons "NXT007" and "Inno8" flat, where Pop up 13 heads
   * its card "Inno8: Oral FVIIIa Mimetic for HA". The same caption-vs-title
   * split `Disclosure` documents.
   */
  {
    id: "nxt007-overview",
    title: "NXT007",
    body: [
      "NXT007: Next-generation BsAb engineered by modifying emicizumab to enhance hemostasis in HA",
      "NXT007 is derived from emicizumab heavy-chain regions and incorporates two distinct light chains with charged-residue mutations designed to optimize antibody chain pairing and cofactor activity",
      "In vitro studies demonstrated that NXT007-treated plasma samples achieved coagulation activity equivalent to 100 IU/dL FVIII in a tissue factor–triggered thrombin generation assay",
      "NXT007 ongoing clinical trials: NXTAGE study (jRCT2080224835); WP44714 study (NCT05987449)",
    ],
    figures: ["NXT007 BsAb Structure"],
  },
  {
    id: "inno8-overview",
    title: "Inno8: Oral FVIIIa Mimetic for HA",
    body: [
      "Inno8: Novel VHH-based FVIIIa-mimetic; once-daily oral treatment of HA",
      "Inno8 is currently under evaluation in nonrandomized open-label phase 1 VOYAGER2 trial (NCT07220564)",
    ],
    figures: ["Inno8 Mechanism of Action"],
  },
];

/**
 * Look a topic up by id. Chapters compose from named topics rather than
 * rendering the list in order — `disease-background` pulls `disease-mechanism`
 * and `diagnosis`, and the §7.x → chapter mapping is many-to-one — so this is
 * the join between a chapter component and the content.
 */
export function topicById(id: string): EducationTopic | undefined {
  return EDUCATION_TOPICS.find((topic) => topic.id === id);
}

/**
 * The two annotation notes the §7.7 clotting-cascade figure draws beside the
 * diagram, and the conclusion under it.
 *
 * Transcribed off the designer's export, which is the only source: CONTEXT.md
 * §7.7 records this content as image-borne — it appears in no text layer of the
 * `[PDF-V]` blueprint. Here rather than in the component because it IS content,
 * and because a chapter should not be the place a sentence of source copy lives.
 *
 * The conclusion is stored sentence-case; the design shouts it, but uppercase is
 * CSS in this codebase so the accessible name stays readable.
 */
export const CLOTTING_CASCADE_NOTES: readonly string[] = [
  "The amplification loop is critical for thrombin generation in tissues with limited expression of tissue factor (joints and muscles)",
  "FVIII and FIX play a critical role in amplifying the generation of thrombin and in clot formation",
];

/** The crimson line under the §7.7 clotting-cascade figure. */
export const CLOTTING_CASCADE_CONCLUSION = "Hemophilia reduces thrombin generation";

/** §7.2 severity classification (PPTX slide 6). */
export interface SeverityRow {
  severity: string;
  factorLevel: string;
  /**
   * One entry per bullet, not one semicolon-joined sentence: the §7.7 pop-up
   * draws these as a list under each severity, so the split is the content's
   * own shape rather than the renderer's job to guess back out of punctuation.
   */
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

/** Footnote marker keying a matrix row to TREATMENT_OPTIONS_FOOTNOTES. */
export type FootnoteKey = "a" | "b" | "c";

/** §7.3 class-level treatment-options matrix (PPTX slide 7). */
export interface TreatmentOptionRow {
  option: string;
  moa: string;
  population: string;
  /**
   * One entry per indication, not one semicolon-joined sentence — the same call
   * `SeverityRow.manifestations` makes, for the same reason: the §7.7 pop-up
   * stacks these as separate lines, so the split is the content's own shape
   * rather than something the renderer has to guess back out of punctuation.
   * Only the first row has two.
   */
  indication: readonly string[];
  route: string;
  /** Footnote marker keyed into TREATMENT_OPTIONS_FOOTNOTES. */
  footnote?: FootnoteKey;
}

/**
 * The rows as the §7.7 "Table 1" pop-up draws them.
 *
 * **Reconciled with the artboard, not with CONTEXT.md §7.3.** The transcription
 * this started as compressed the source into table shorthand — `↑ FVIII by 2
 * IU/dL per IU/kg`, `HA/HB`, `→` — which was right while these strings were a
 * record of PPTX slide 7 and wrong the moment they became on-screen copy. The
 * artboard spells all of it out, and the artboard is the authority for what the
 * screen says (docs/styling.md §11), so the shorthand is expanded here rather
 * than re-expanded by the renderer. §7.3 keeps the source's own wording.
 *
 * Three drawn strings are **not** reproduced, on the "FACOTOR" precedent — an
 * unambiguous slip is a slip, not copy: the export's "anti–THPI" (the same row's
 * MOA says TFPI), its second "IU/dl", and "inter-individiual" in footnote c.
 *
 * One divergence is deliberate and open: the export gives AAV gene therapy the
 * population "Hemophilia A/B without inhibitors", which contradicts the MOA cell
 * beside it (an F9 transgene is hemophilia B) and CONTEXT.md §7.3. Held at B and
 * raised for the designer.
 */
export const TREATMENT_OPTIONS_MATRIX: readonly TreatmentOptionRow[] = [
  {
    option: "FVIII/FIX concentrates",
    moa: "Increase FVIII levels by 2 IU/dL per IU/kg and FIX levels by 1 IU/dL per IU/kg",
    population: "Hemophilia A/B without inhibitors",
    indication: ["Prophylaxis", "Treatment of bleeding episodes and surgery"],
    route: "IV",
    footnote: "a",
  },
  {
    option: "FVIII mimetics",
    moa: "Mimics activity of FVIII 1st generation equivalent to FVIII ~10–12 IU/dL",
    population: "Hemophilia A with/without inhibitors",
    indication: ["Prophylaxis"],
    route: "SC",
    footnote: "b",
  },
  {
    option: "Rebalancing: siRNA",
    moa: "Reduced antithrombin; increases thrombin generation",
    population: "Hemophilia A/B with/without inhibitors",
    indication: ["Prophylaxis"],
    route: "SC",
    footnote: "b",
  },
  {
    option: "Rebalancing: anti-TFPI",
    moa: "Inhibits TFPI; increases thrombin generation",
    population: "Hemophilia A/B with/without inhibitors",
    indication: ["Prophylaxis"],
    route: "SC",
    footnote: "b",
  },
  {
    option: "AAV gene therapy",
    moa: "Recombinant AAV vector delivers a functional copy of the F9 gene into hepatocytes",
    population: "Hemophilia B without inhibitors",
    indication: ["Long-term prophylaxis/treatment break"],
    route: "IV",
    footnote: "c",
  },
];

/**
 * The three markers resolved, under the table.
 *
 * `Bullet` rather than a plain string because footnote b genuinely has a nested
 * level — the export draws its two branches as a sub-list under "For
 * breakthrough bleeds:", which is the shape `NestedBullet` exists to hold and
 * the reason it is not a `→`-joined sentence any more.
 */
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
