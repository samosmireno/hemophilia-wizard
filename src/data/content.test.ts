import { describe, expect, it } from "vitest";

import { DRUG_SHEETS, sheetFor } from "./drug-sheets";
import { EDUCATION_TOPICS, SEVERITY_TABLE, TREATMENT_OPTIONS_MATRIX } from "./education";
import { EXPLORE_AGENTS, EXPLORE_SEGMENTS } from "./explore";
import { ACRONYMS, GLOSSARY } from "./glossary";
import { REFERENCES, RESOURCES } from "./references";
import { SURVEY_QUESTIONS } from "./survey";
import { TREATMENTS } from "./treatments";
import { AGENTS, CLASSES_TO_CONSIDER, RECOMMENDATIONS, type ScenarioKey } from "./wizard";

const ALL_SCENARIOS: ScenarioKey[] = ["A-without", "A-with", "B-without", "B-with"];

describe("drug sheets", () => {
  it("cover every novel agent the wizard can recommend, plus Efanesoctocog alfa", () => {
    const expected = [...Object.values(AGENTS), "Efanesoctocog alfa"];
    for (const agent of expected) {
      expect(sheetFor(agent), `missing drug sheet for ${agent}`).toBeDefined();
    }
  });

  it("cover every agent name referenced in RECOMMENDATIONS", () => {
    const names = new Set(ALL_SCENARIOS.flatMap((s) => Object.values(RECOMMENDATIONS[s]).flat()));
    for (const name of names) {
      expect(
        sheetFor(name),
        `RECOMMENDATIONS names ${name} but it has no drug sheet`,
      ).toBeDefined();
    }
  });

  // `/explore` marks every one of its seven `+` buttons `aria-haspopup="dialog"`
  // unconditionally, which is only honest if every agent it draws has a sheet.
  // This is also what makes Efanesoctocog alfa's sheet reachable at last — it
  // was built with no caller when the sheets landed (CONTEXT.md §6).
  it("cover every agent /explore draws a button for", () => {
    for (const agent of EXPLORE_AGENTS) {
      expect(
        sheetFor(agent),
        `EXPLORE_SEGMENTS names ${agent} but it has no drug sheet`,
      ).toBeDefined();
    }
    expect(EXPLORE_AGENTS).toHaveLength(DRUG_SHEETS.length);
  });

  it("join to a Treatment row by verbatim agent name", () => {
    const agents = new Set(TREATMENTS.map((t) => t.agent));
    for (const sheet of DRUG_SHEETS) {
      expect(agents.has(sheet.agent), `${sheet.agent} has no Treatment row`).toBe(true);
    }
  });

  it("carry well-formed trial ids and non-empty required fields", () => {
    for (const sheet of DRUG_SHEETS) {
      expect(sheet.classTarget.length).toBeGreaterThan(0);
      expect(sheet.indication.length).toBeGreaterThan(0);
      expect(sheet.dosing.length).toBeGreaterThan(0);
      expect(sheet.monitoring.length).toBeGreaterThan(0);
      expect(sheet.trials.length).toBeGreaterThan(0);
      for (const trial of sheet.trials) {
        expect(trial.id, `${sheet.agent}/${trial.name} bad id ${trial.id}`).toMatch(
          /^NCT\d+$|^jRCT/,
        );
      }
    }
  });

  it("state the two optional fields only where the source deviates", () => {
    /*
      Both default in the card, so a value present on a sheet that does not need
      one is invisible rather than wrong — which is exactly the kind of drift
      worth pinning. Each is a single-sheet deviation transcribed from the PDF:
      Denecimig is the one sheet the source titles beyond the agent's name, and
      Efanesoctocog alfa is the one that names a class with no target.
    */
    expect(DRUG_SHEETS.filter((s) => s.title).map((s) => s.agent)).toEqual(["Denecimig"]);
    expect(DRUG_SHEETS.filter((s) => s.classHeading).map((s) => s.agent)).toEqual([
      "Efanesoctocog alfa",
    ]);
  });

  it("carry section headings without their colon", () => {
    /* The card appends it, so no record has to remember to — and a heading that
       arrived with one would render "Class::". */
    for (const sheet of DRUG_SHEETS) {
      expect(sheet.classHeading ?? "").not.toMatch(/:$/);
    }
  });

  it("keep the client's 2026-08-05 edits on the Denecimig sheet", () => {
    /*
      Three copy edits landing on one sheet, pinned as data rather than as
      rendering: the mimetic bullet loses the activated form's `a` and its dash,
      the age threshold becomes `≥`, and the whole-section "TBD; based on phase 3
      clinical trial data" qualifier is gone. Each would re-appear from the PDF on
      any re-transcription, which is what makes them worth stating.
    */
    const denecimig = DRUG_SHEETS.find((s) => s.agent === "Denecimig")!;

    expect(denecimig.classTarget[0]).toBe("Factor VIII mimetic BsAb");
    expect(denecimig.indication[0]).toContain("patients ≥1 year");
    expect(JSON.stringify(denecimig)).not.toMatch(/VIIIa|>1 year|TBD;/);
  });

  it("write every numeric threshold as `≥`", () => {
    /*
      The same 2026-08-05 edit, extended to the three rebalancing-agent sheets a
      step later ("underline the > sign, ie, greater than or equal to"), then on
      2026-08-06 to Marstacimab's ">50 kg" and Fitusiran's "> 6 months" — so no
      sheet carries a bare `>` threshold any more, whatever the unit. Asserted
      across every field of every sheet rather than the named ones, so a sheet
      transcribed later from the PDF's bare `>` fails here.
    */
    for (const sheet of DRUG_SHEETS) {
      for (const line of [...sheet.indication, ...sheet.dosing, ...sheet.monitoring]) {
        expect(line, sheet.agent).not.toMatch(/>\s*\d/);
      }
    }
  });

  it("keep no citation tail on any trial", () => {
    /*
      Client direction, 2026-08-04: "delete the colon and everything after on each
      bullet (ie, only the clinical trials name (NCT…) would be kept". Asserted on
      the two fields rather than on the rendered string, so re-adding the data
      fails here rather than silently at a call site that has not been updated.
    */
    for (const sheet of DRUG_SHEETS) {
      for (const trial of sheet.trials) {
        expect(Object.keys(trial).sort()).toEqual(["id", "name"]);
        expect(trial.name).not.toContain(":");
      }
    }
  });
});

describe("wizard class boxes", () => {
  it("cover all four scenarios with a non-empty class list", () => {
    for (const scenario of ALL_SCENARIOS) {
      expect(CLASSES_TO_CONSIDER[scenario].classes.length).toBeGreaterThan(0);
    }
  });

  it("carry a caveat only for HB with inhibitors", () => {
    expect(CLASSES_TO_CONSIDER["B-with"].caveat).toBeDefined();
    for (const scenario of ["A-without", "A-with", "B-without"] as ScenarioKey[]) {
      expect(CLASSES_TO_CONSIDER[scenario].caveat).toBeUndefined();
    }
  });

  /**
   * The three fields the `/wizard/scenario` artboards added. The type already
   * makes them required, so this asserts what a type cannot: that they are not
   * blank, and that the emphasis the four leads exist to carry is actually in
   * them.
   */
  it("name their scenario and lead with the polarity word emphasised", () => {
    for (const scenario of ALL_SCENARIOS) {
      const box = CLASSES_TO_CONSIDER[scenario];

      expect(box.title, scenario).not.toHaveLength(0);
      expect(box.caption, scenario).not.toHaveLength(0);

      // `_with_` on the two +inhibitor screens, `_without_` on the two others —
      // matched with the delimiters, so a lead that lost its markup fails here
      // rather than rendering an un-emphasised sentence nobody notices.
      const polarity = scenario.endsWith("-with") ? "_with_" : "_without_";
      expect(box.lead, scenario).toContain(polarity);
    }
  });

  /**
   * Transcribed, not templated — the reason the artboard copy is four literals
   * rather than a format string. If a future edit collapses these onto one
   * pattern, this is the test that objects.
   */
  it("keep HB-with-inhibitors' 'Therapeutic options' wording", () => {
    expect(CLASSES_TO_CONSIDER["B-with"].lead).toMatch(/^Therapeutic options for/);
    for (const scenario of ["A-without", "A-with", "B-without"] as ScenarioKey[]) {
      expect(CLASSES_TO_CONSIDER[scenario].lead, scenario).toMatch(
        /^Therapeutic classes to consider for/,
      );
    }
  });
});

describe("explore segments", () => {
  // The three arches tile the band 112→1328 with no gaps, and the widths are
  // used as flex-grow factors — so a typo would silently reproportion the row
  // rather than fail anywhere visible.
  it("carry drawn widths that sum to the 1216px band", () => {
    expect(EXPLORE_SEGMENTS.reduce((sum, s) => sum + s.width, 0)).toBe(1216);
  });

  it("draws each agent exactly once", () => {
    expect(new Set(EXPLORE_AGENTS).size).toBe(EXPLORE_AGENTS.length);
  });

  /**
   * The labels are the artboard's, and three of the four deliberately disagree
   * with `TREATMENT_CLASSES` — plural where the enum is singular, and "UHL
   * clotting factor replacement" naming a half-life the enum has no term for.
   * This is the test that objects if someone "fixes" them into the enum.
   */
  it("label columns in the artboard's wording, not the TreatmentClass enum", () => {
    const labels = EXPLORE_SEGMENTS.flatMap((s) => s.columns.map((c) => c.label));
    expect(labels).toEqual([
      "FVIII mimetics",
      "Hemostatic rebalancing agents",
      "UHL clotting factor replacement",
      "Gene therapy",
    ]);
  });
});

describe("education", () => {
  it("has unique topic ids", () => {
    const ids = EDUCATION_TOPICS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has fully populated tables", () => {
    expect(SEVERITY_TABLE).toHaveLength(3);
    expect(TREATMENT_OPTIONS_MATRIX).toHaveLength(5);
  });
});

describe("glossary, references, survey", () => {
  it("glossary and acronyms are non-empty", () => {
    expect(GLOSSARY.length).toBeGreaterThan(0);
    expect(ACRONYMS.length).toBeGreaterThan(0);
  });

  it("reference ids are unique", () => {
    const ids = REFERENCES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every resource category has items", () => {
    for (const cat of RESOURCES) {
      expect(cat.items.length, `${cat.category} has no items`).toBeGreaterThan(0);
    }
  });

  it("survey has three questions with options", () => {
    expect(SURVEY_QUESTIONS).toHaveLength(3);
    for (const q of SURVEY_QUESTIONS) {
      expect(q.options.length).toBeGreaterThan(0);
    }
  });
});
