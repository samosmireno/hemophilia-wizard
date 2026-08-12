export interface GlossaryEntry {
  term: string;
  definition: string;
}

export interface Acronym {
  abbr: string;
  full: string;
}

export const GLOSSARY: readonly GlossaryEntry[] = [
  {
    term: "Bispecific antibody",
    definition:
      "Engineered antibody designed to bind two distinct antigens simultaneously, bridging two molecular targets to enable or enhance biologic function.",
  },
  {
    term: "Breakthrough bleeding",
    definition: "A bleeding episode that occurs despite ongoing prophylactic therapy",
  },
  {
    term: "Bypassing agent",
    definition:
      "Hemostatic therapy that promotes clot formation without requiring FVIII or FIX activity",
  },
  {
    // The source draws "Factor VIIIa-mimetic" — the `a` and hyphen came out in
    // the 2026-08-12 client terminology pass, like every mimetic mention app-wide.
    term: "Factor VIII mimetic bispecific antibody",
    definition: "Nonfactor therapy that bridges FIXa and FX to mimic FVIIIa cofactor activity",
  },
  {
    term: "Factor replacement therapy",
    definition:
      "Intravenous administration of FVIII or FIX concentrates to restore deficient clotting factor activity",
  },
  {
    term: "Gene therapy",
    definition:
      "Adeno-associated virus vector–based therapy that uses a gene construct carrying a functional clotting factor transgene to enable endogenous factor VIII or factor IX production",
  },
  {
    term: "Hemophilia A",
    definition:
      "A rare congenital bleeding disorder caused by deficient or dysfunctional factor VIII",
  },
  {
    term: "Hemophilia B",
    definition:
      "A rare congenital bleeding disorder caused by deficient or dysfunctional factor IX",
  },
  {
    term: "Hemostatic rebalancing agent",
    definition:
      "Nonfactor therapy that enhances thrombin generation by targeting endogenous anticoagulant pathways",
  },
  {
    term: "Inhibitors",
    definition:
      "Neutralizing alloantibodies that reduce or eliminate response to factor replacement therapy",
  },
  {
    // Source verbatim, including "homeostatic balancing agents" (sic — hemostatic
    // rebalancing) — except the mimetic's `a`, dropped in the 2026-08-12 pass.
    term: "Nonfactor therapy",
    definition:
      "Therapy that improves hemostasis without directly replacing FVIII or FIX. Examples include FVIII mimetic bispecific antibodies and homeostatic balancing agents.",
  },
  {
    term: "Prophylaxis",
    definition: "Scheduled therapy administered to prevent or reduce bleeding episodes",
  },
];

export const ACRONYMS: readonly Acronym[] = [
  { abbr: "AAV", full: "adeno-associated virus" },
  { abbr: "ACT", full: "activated clotting time" },
  { abbr: "ADA", full: "anti-drug antibody" },
  { abbr: "aPCC", full: "activated prothrombin complex concentrate" },
  { abbr: "APC", full: "activated protein C" },
  { abbr: "aPTT", full: "activated partial thromboplastin time" },
  { abbr: "AT", full: "antithrombin" },
  { abbr: "BLA", full: "Biologics License Application" },
  { abbr: "BsAb", full: "bispecific antibody" },
  { abbr: "D", full: "day" },
  { abbr: "ELISA", full: "enzyme-linked immunosorbent assay" },
  { abbr: "Fab", full: "fragment antigen-binding" },
  { abbr: "FDA", full: "US Food and Drug Administration" },
  { abbr: "FIX", full: "factor IX" },
  { abbr: "FIXa", full: "activated factor IX" },
  { abbr: "FVIIa", full: "activated factor VII" },
  { abbr: "FVIII", full: "factor VIII" },
  { abbr: "FVIIIa", full: "activated factor VIII" },
  { abbr: "FX", full: "factor X" },
  { abbr: "FXa", full: "activated factor X" },
  { abbr: "HA", full: "hemophilia A" },
  { abbr: "HB", full: "hemophilia B" },
  { abbr: "IV", full: "intravenous" },
  { abbr: "LFT", full: "liver function test" },
  { abbr: "mAb", full: "monoclonal antibody" },
  { abbr: "MOA", full: "mechanism of action" },
  { abbr: "NFT", full: "non-factor therapy" },
  { abbr: "OLE", full: "open-label extension" },
  { abbr: "PK", full: "pharmacokinetic" },
  { abbr: "PT", full: "prothrombin time" },
  { abbr: "QoL", full: "quality of life" },
  { abbr: "rFVIIa", full: "recombinant activated factor VII" },
  { abbr: "SC", full: "subcutaneous" },
  { abbr: "siRNA", full: "short interfering RNA" },
  { abbr: "TF", full: "tissue factor" },
  { abbr: "TFPI", full: "tissue factor pathway inhibitor" },
  {
    abbr: "VERITAS-Pro",
    full: "Validated Hemophilia Regimen Treatment Adherence Scale–Prophylaxis",
  },
  { abbr: "VWD", full: "von Willebrand disease" },
  { abbr: "VWF", full: "von Willebrand factor" },
  { abbr: "VWF:Act", full: "von Willebrand factor activity" },
  { abbr: "VWF:Ag", full: "von Willebrand factor antigen" },
];
