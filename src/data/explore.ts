import { AGENT_NAMES, type AgentName } from "./agents";

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
  /**
   * Verbatim from the artboard, and the app's only class vocabulary. `treatments.ts`
   * once carried a canonical four-class enum that three of these four disagreed
   * with; it went with the unbuilt filter engine (ADR 0007). Transcribed, never
   * derived — `content.test.ts` pins the four.
   */
  label: string;
  /** The join key `sheetFor()` looks a sheet up by. */
  agents: readonly AgentName[];
}

export interface ExploreSegment {
  columns: readonly ExploreColumn[];
  /** Drawn width on the 1440 canvas, used as the flex ratio: 339 + 524 + 353 = 1216. */
  width: number;
}

export const EXPLORE_SEGMENTS: readonly ExploreSegment[] = [
  {
    width: 339,
    columns: [{ label: "FVIII mimetics", agents: [AGENT_NAMES.emicizumab, AGENT_NAMES.denecimig] }],
  },
  {
    width: 524,
    columns: [
      {
        label: "Hemostatic rebalancing agents",
        agents: [AGENT_NAMES.concizumab, AGENT_NAMES.marstacimab, AGENT_NAMES.fitusiran],
      },
    ],
  },
  {
    width: 353,
    columns: [
      { label: "UHL clotting factor replacement", agents: [AGENT_NAMES.efanesoctocog] },
      { label: "Gene therapy", agents: [AGENT_NAMES.etranacogene] },
    ],
  },
];

export const EXPLORE_AGENTS: readonly AgentName[] = EXPLORE_SEGMENTS.flatMap((segment) =>
  segment.columns.flatMap((column) => column.agents),
);

/** One constant for both the pop-up's title and the button that opens it. */
export const EXPLORE_TABLE_TITLE = "Explore therapy options for HA/HB";
