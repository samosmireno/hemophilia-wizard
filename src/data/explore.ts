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

/** One option of the comparison table's class dropdown. */
export interface ExploreClassFilter {
  /** The drawn label, verbatim from the column above — the dropdown option text. */
  label: string;
  /** The S1 `treatmentClass` cells the option matches, verbatim. */
  classes: readonly string[];
}

/**
 * The class dropdown's buckets: drawn label → the S1 class cells it covers
 * (decided 2026-08-11; CONTEXT.md §5.2). The labels are `EXPLORE_SEGMENTS`' four,
 * in drawn order — `content.test.ts` pins the correspondence. The mapping is here
 * rather than in the component because it encodes a content ruling, not a
 * rendering choice: "UHL clotting factor replacement" covers ALL THREE factor
 * rows — SHL and EHL included, though the drawn index above deliberately omits
 * them — reproducing the client's own S4 saved view ("Clotting factor
 * replacement"), which keeps every roster row reachable through some option.
 */
export const EXPLORE_CLASS_FILTERS: readonly ExploreClassFilter[] = [
  {
    label: "FVIII mimetics",
    classes: ["Factor VIIIa mimetic", "Factor VIIIa mimetic (emerging / investigational)"],
  },
  { label: "Hemostatic rebalancing agents", classes: ["Hemostatic rebalancing agent"] },
  { label: "UHL clotting factor replacement", classes: ["Clotting factor replacement"] },
  { label: "Gene therapy", classes: ["Gene therapy"] },
];

/**
 * Which filter bucket each `/wizard/scenario` illustration box opens, keyed by
 * the verbatim class labels `classesFor` lists — the same join key `Scenario`'s
 * own `BOX_ART` uses, since those labels are plain strings. The boxes open the
 * §5 comparison table pre-filtered to their class (ruled 2026-08-12), so this
 * map is the ruling: two mimetic wordings (the `A-with` copy edit) share the
 * FVIII bucket, and both factor-replacement labels share the UHL bucket —
 * which covers all three factor rows, FIX products included, so the
 * "FIX prophylaxis" box is not a dead end. `content.test.ts` pins coverage.
 */
const CLASS_BOX_FILTERS: ReadonlyMap<string, string> = new Map([
  ["Recombinant FVIII concentrates", "UHL clotting factor replacement"],
  ["FIX prophylaxis", "UHL clotting factor replacement"],
  ["Factor VIIIa mimetics", "FVIII mimetics"],
  ["Factor VIII mimetic", "FVIII mimetics"],
  ["Hemostatic rebalancing agents", "Hemostatic rebalancing agents"],
  ["Gene therapy", "Gene therapy"],
]);

/**
 * The filter bucket a scenario class box opens, or `undefined` for a label the
 * map does not carry. Partial like `sheetFor()` and for the same reason: the
 * key is a plain string arriving from component state, so coverage of the
 * labels `classesFor` actually lists is `content.test.ts`'s to pin, not a
 * type's to state.
 */
export function classFilterFor(label: string): ExploreClassFilter | undefined {
  const bucketLabel = CLASS_BOX_FILTERS.get(label);
  return EXPLORE_CLASS_FILTERS.find((filter) => filter.label === bucketLabel);
}

/** One constant for both the pop-up's title and the button that opens it. */
export const EXPLORE_TABLE_TITLE = "Explore therapy options for HA/HB";
