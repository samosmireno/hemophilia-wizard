/** Shortened to its opening clause at the client's direction (2026-08-05). */
export const SDM_CONCLUSION = "Leverage multidisciplinary care and SDM with patients";

export const SDM_LEAD =
  "SDM engages patients in their care, improves quality of care, and increases patient " +
  "satisfaction";

/** The client's 2026-08-05 rewrite; §9 records the artboard's set. */
export const SDM_POINTS: readonly string[] = [
  "Focus on what matters most to patients, families, and caregivers",
  "Empower patients and caregivers to actively participate in education and treatment decisions",
  "Utilize SDM to support improved adherence",
];

export interface ExploreColumn {
  /** Verbatim from the artboard — not a `TreatmentClass`; three of the four differ. */
  label: string;
  /** Verbatim names: the name is the join key `sheetFor()` looks a sheet up by. */
  agents: readonly string[];
}

export interface ExploreSegment {
  columns: readonly ExploreColumn[];
  /** Drawn width on the 1440 canvas, used as the flex ratio: 339 + 524 + 353 = 1216. */
  width: number;
}

export const EXPLORE_SEGMENTS: readonly ExploreSegment[] = [
  {
    width: 339,
    columns: [{ label: "FVIII mimetics", agents: ["Emicizumab", "Denecimig"] }],
  },
  {
    width: 524,
    columns: [
      {
        label: "Hemostatic rebalancing agents",
        agents: ["Concizumab", "Marstacimab", "Fitusiran"],
      },
    ],
  },
  {
    width: 353,
    columns: [
      { label: "UHL clotting factor replacement", agents: ["Efanesoctocog alfa"] },
      { label: "Gene therapy", agents: ["Etranacogene dezaparvovec-drlb"] },
    ],
  },
];

export const EXPLORE_AGENTS: readonly string[] = EXPLORE_SEGMENTS.flatMap((segment) =>
  segment.columns.flatMap((column) => column.agents),
);

/** One constant for both the pop-up's title and the button that opens it. */
export const EXPLORE_TABLE_TITLE = "Explore therapy options for HA/HB";
