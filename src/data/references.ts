/**
 * Bibliography and the curated "Resources" panel.
 *
 * Source of truth: `[PDF-V]` (`documents/out_raw.txt`; CONTEXT.md §9).
 * - REFERENCES: the bottom-left teal bibliography block. Kept as formatted
 *   citation display strings (nothing sorts/filters them), URLs inline.
 * - RESOURCES: the far-right categorized panel; each item's URL is split into
 *   `url` so Phase 1 can link it without re-parsing.
 *
 * Trademark glyphs (®/™) are stored verbatim; the V3 "superscript all
 * trademarks" instruction is Phase-3 styling, not encoded here. PDF soft-hyphen
 * line-wrap artifacts removed. "URLs accessed July 14, 2026."
 */

export interface Reference {
  id: string;
  /** Formatted citation, verbatim (URL inline when the source includes one). */
  text: string;
}

export interface ResourceItem {
  text: string;
  url?: string;
}

export interface ResourceCategory {
  category: string;
  items: ResourceItem[];
}

export const REFERENCES: readonly Reference[] = [
  {
    id: "r1",
    text: "Alhemo® (concizumab-mtci) PI. July 2025. https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/761315s003lbl.pdf.",
  },
  {
    id: "r2",
    text: "ALTUVIIIO® [antihemophilic factor (recombinant), Fc-VWF-XTEN fusion protein-ehtl] PI. December 2025. https://www.fda.gov/media/165594/download..",
  },
  {
    id: "r3",
    text: "American Journal of Managed Care. Evolving the treatment landscape with the first therapy approved for people with hemophilia A and B with or without inhibitors. June 20, 2025. https://www.ajmc.com/view/evolving-the-treatment-landscape-with-the-first-therapy-approved-for-people-with-hemophilia-a-and-b-with-or-without-inhibitors.",
  },
  { id: "r4", text: "Castaman G, Matino D. Haematologica. 2019;104:1702-1709." },
  { id: "r5", text: "Coffin D, et al. Haemophilia. 2024;30:1298-1308." },
  {
    id: "r6",
    text: "Drugs.com. Mim8 FDA Approval Status. April 26, 2026. https://www.drugs.com/history/mim8.html.",
  },
  {
    id: "r7",
    text: "Hematology Advisor. New Investigational Treatment Approaches in Routine Prophylaxis for Hemophilia A and B. December 2024. https://www.hematologyadvisor.com/cch/hemophilia-a-b-prophylaxis-anti-tfpi-marstacimab-emicizumab/.",
  },
  {
    id: "r8",
    text: "How HEMLIBRA Works. https://www.hemlibra-hcp.com/about/how-hemlibra-works.html?c=hea-18a958edaf4&gclsrc=aw.ds&gad_source=1&gad_campaignid=22298991040&gbraid=0AAAAAC7VVodLWvPubL-QZjqyiPaJBg8Zf&gclid=Cj0KCQjw39zSBhDhARIsANammDuNFPG-l4lJ2dErdeb05IR209Phel37iho9HfONv0BaOIp-YjhcDEoaAqKhEALw_wcB.",
  },
  {
    id: "r9",
    text: "HEMGENIX® (etranacogene dezaparvovec-drlb) PI. April 2026. https://labeling.cslbehring.com/PI/US/Hemgenix/EN/Hemgenix-Prescribing-Information.pdf.",
  },
  {
    id: "r10",
    text: "HEMLIBRA® PI. July 2025. https://www.gene.com/download/pdf/hemlibra_prescribing.pdf.",
  },
  {
    id: "r11",
    text: "HYMPAVZI® (marstacimab-hncq) PI. June 2026. https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/761369s003lbl.pdf.",
  },
  {
    id: "r12",
    text: "Ingemann L, et al. Inno8, the first orally administered factor VIII mimetic shows favorable safety, pharmacokinetic, and pharmacodynamic properties in healthy male participant. International Society on Thrombosis and Haemostasis - 34th Congress, 2026 (ISTH). LB 02.3.",
  },
  { id: "r13", text: "Jiménez-Yuste V. Semin Thromb Hemost. 2025;51:23-27." },
  { id: "r14", text: "Kitazawa T, et al. J Thromb Haemost. 2017:117:1348-1357." },
  { id: "r15", text: "Lauritzen B, et al. J Thromb Haemost. 2022;00:1–13." },
  { id: "r16", text: "Lim MY, et al.  J Thromb Haemost. 2026;24:2341-2354" },
  { id: "r17", text: "Lund J, et al. Res Pract Thromb Haemost. 2026." },
  {
    id: "r18",
    text: "Mahlangu J, et al. FRONTIER3: Safety and efficacy of Mim8 prophylaxis in paediatric patients with haemophilia A. European Association for Hemophilia and Allied Disorders (EAHAD) 2025. ORo1.",
  },
  { id: "r19", text: "Makris M, O'Mahony B. Res Pract Thromb Haemost. 2025;9:102726." },
  { id: "r20", text: "Mancuso ME, et al. N Engl J Med. 2026;394:1696-1709." },
  {
    id: "r21",
    text: "Oldenberg J, et al. FRONTIER5 Direct Switch Study: Safety of Initiating Mim8 Prophylaxis Without Washout of Emicizumab. ISTH 2025 Congress. OC 20.4.",
  },
  {
    id: "r22",
    text: "Our Commitment to the Hemophilia B Community: An Update on HEMGENIX® (etranacogene dezaparvovec-drlb) Availability. March 17, 2026. https://newsroom.csl.com/2026-03-17-Our-Commitment-to-the-Hemophilia-B-Community-An-Update-on-HEMGENIX-R-etranacogene-dezaparvovec-drlb-Availability.",
  },
  { id: "r23", text: "Persson P, et al. Res Pract Thromb Haemost. 2023;7:102181." },
  {
    id: "r24",
    text: "QFITLIA® (fitusiran) PI. March 2025. https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/219019s000lbl.pdf.",
  },
  { id: "r25", text: "Rezende SM, et al. J Thromb Haemost. 2024;22:2629-2652." },
  { id: "r26", text: "Sambe T, et al. J Thromb Haemost. 2025;23:3098-3110." },
  { id: "r27", text: "Teranishi-Ikawa Y, et al. J Thromb Haemost. 2024;22:430-440." },
  { id: "r28", text: "Van Thillo Q, Hermans C. Haematologica. 2025;110:2902-2912." },
  { id: "r29", text: "von Drygalski A, et al. N Engl J Med. 2023;388:310-318." },
];

export const RESOURCES: readonly ResourceCategory[] = [
  {
    category: "Clinical guidelines and recommendations",
    items: [
      {
        text: "National Bleeding Disorders Foundation. MASAC Document 267 - MASAC Recommendation Concerning Prophylaxis for Hemophilia A and B with and without Inhibitors.",
        url: "https://www.bleeding.org/healthcare-professionals/guidelines-on-care/masac-documents/masac-document-267-masac-recommendation-concerning-prophylaxis-for-hemophilia-a-and-b-with-and-without-inhibitors",
      },
      {
        text: "Pierce GF, Ozelo MC, Mahlangu J, et al. The WFH Guidelines for the Management of Haemophilia: AAV Gene Therapy, 2025. Haemophilia. 2026;32:20-54.",
      },
      {
        text: "Rezende SM, Neumann I, Angchaisuksiri P, et al. International Society on Thrombosis and Haemostasis clinical practice guideline for treatment of congenital hemophilia A and B based on the Grading of Recommendations Assessment, Development, and Evaluation methodology. J Thromb Haemost. 2024;22:2629-2652.",
      },
      {
        text: "Young G, Lassila R, Mason J, Prasca S. Deconstructing the ISTH Hemophilia Guidelines for the Clinician. J Thromb Haemost. 2025;23:1483-1495.",
      },
      {
        text: "Srivastava A, Mahlangu J, Pipe SW. Guidelines for management of hemophilia-why, what, and how? Res Pract Thromb Haemost. 2025;9:102879.",
      },
    ],
  },
  {
    category: "Review articles",
    items: [
      {
        text: "Mehta P, Reddivari AKR. Hemophilia. Updated 2023 Jun 5. In: StatPearls [Internet]. 2026.",
        url: "https://www.ncbi.nlm.nih.gov/books/NBK551607/",
      },
      {
        text: "AJMC. Evolving the treatment landscape with the first therapy approved for people with hemophilia A and B with or without inhibitors. June 20, 2025.",
        url: "https://www.ajmc.com/view/evolving-the-treatment-landscape-with-the-first-therapy-approved-for-people-with-hemophilia-a-and-b-with-or-without-inhibitors",
      },
      {
        text: "Eduarda Alves de Jesus V, Lamounier de Almeida D, Muniz Júnior RL, Alvares-Teodoro J, Pierce GF, Camelo RM. Factor-VIII mimetic bispecific antibodies for the treatment of hemophilia A: an update. Expert Rev Clin Pharmacol. 2026;19(3):219-238.",
      },
      {
        text: "Lim MY, Ardila J, Castaman G, et al. Diagnosis and management of hemophilia A and B. J Thromb Haemost. 2026;24:2341-2354.",
      },
      {
        text: "Lewandowska M, Nasr S, Shapiro AD. Emerging therapies in hemophilia: improving equitable access to care. J Blood Med. 2025;16:95-115.",
      },
      {
        text: "Makris M, O'Mahony B. Hemophilia treatments and the paradox of choice. Res Pract Thromb Haemost. 2025;9:102726.",
      },
      {
        text: "Ozelo MC, Chowdary P, Young G. New treatment in haemophilia: challenges, controversies and uncertainties. Haemophilia. 2026 Apr 16. [Epub ahead of print].",
      },
      { text: "Young G. Nonfactor therapies for hemophilia. Hemasphere. 2023;7(6):e911." },
    ],
  },
  {
    category: "Tools for clinical practice",
    items: [
      {
        text: "Coffin D, Skinner MW, Thornburg CD, et al. Development of the World Federation of Hemophilia Shared Decision-Making Tool. Haemophilia. 2024;30:1298-1308.",
      },
      {
        text: "Duncan N, Kronenberger W, Roberson C, Shapiro A. VERITAS-Pro: a new measure of adherence to prophylaxis regimens in haemophilia. Haemophilia. 2020;16:247-255.",
      },
      {
        text: "Molinari AC, Baldacci E, Barillari G, et al. Integrating clinical, functional, and patient-reported outcomes in haemophilia care: A Delphi-Based Consensus on a New Monitoring Tool. J Clin Med. 2026;15:2533.",
      },
      {
        text: "World Federation of Hemophilia. The WFH Shared Decision-Making Tool and Workbook: Shared Decision-Making in Hemophilia Management and Care. March 2025. Last reviewed: March 2025.",
        url: "https://www1.wfh.org/publications/files/pdf-2455.pdf",
      },
      {
        text: "World Federation of Hemophilia Shared Decision-Making Tool.",
        url: "https://sdm.wfh.org/",
      },
    ],
  },
];
