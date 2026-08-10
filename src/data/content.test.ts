import { describe, expect, it } from "vitest";

import { ALL_AGENT_NAMES } from "./agents";
import { DRUG_SHEETS, sheetFor } from "./drug-sheets";
import {
  EDUCATION_TOPICS,
  SEVERITY_TABLE,
  TREATMENT_OPTIONS_MATRIX,
  type EducationTopic,
} from "./education";
import { EXPLORE_AGENTS, EXPLORE_SEGMENTS } from "./explore";
import { ACRONYMS, GLOSSARY } from "./glossary";
import { REFERENCES, RESOURCES } from "./references";
import { SURVEY_QUESTIONS } from "./survey";
import { TREATMENTS } from "./treatments";
import { AGENTS, ALL_REASONS, ALL_SCENARIOS, leafFor } from "./wizard";

describe("drug sheets", () => {
  it("cover every novel agent the wizard can recommend, plus Efanesoctocog alfa", () => {
    const expected = [...Object.values(AGENTS), "Efanesoctocog alfa"];
    for (const agent of expected) {
      expect(sheetFor(agent), `missing drug sheet for ${agent}`).toBeDefined();
    }
  });

  // Through `leafFor`, so what is covered is the set a leaf actually paints a
  // button for — not a table that might name an agent no scenario reaches.
  it("cover every agent any wizard leaf recommends", () => {
    const names = new Set(
      ALL_SCENARIOS.flatMap((scenario) =>
        ALL_REASONS.flatMap((reason) =>
          leafFor({ ...scenario, reason }).recommendations.map((t) => t.agent),
        ),
      ),
    );

    expect(names.size).toBeGreaterThan(0);
    for (const name of names) {
      expect(sheetFor(name), `a leaf recommends ${name} but it has no drug sheet`).toBeDefined();
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

/*
  The class boxes' own invariants — coverage, the caveat, the emphasised polarity
  word, the "Therapeutic options" wording — moved to `wizard.test.ts` when
  `CLASSES_TO_CONSIDER` went private. They are facts about one module's data, not
  joins between modules, so they belong at that module's own seam. What stays here
  is the wizard's joins outward: to `DRUG_SHEETS`, above, and to `TREATMENTS`.
*/

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

describe("treatment roster", () => {
  /*
    `AgentName` makes a misspelled agent a compile error, but it cannot make
    `TREATMENTS` cover the roster — an array proves nothing about which of the nine
    names it contains. That gap is what `recommend()`'s `treatmentFor()` throws on
    and what `sheetFor()` returns `undefined` for, so it is asserted here instead.
  */
  it("hold exactly one row per name in AGENT_NAMES", () => {
    expect(TREATMENTS.map((t) => t.agent).sort()).toEqual([...ALL_AGENT_NAMES].sort());
  });

  /*
    S1 pads cells to lay out its columns — three `monitoring` values opened with a
    space, two class labels closed with one, and Denecimig's parenthetical was
    aligned with a run of fourteen. Every one of these fields renders as-is in the
    §5 comparison table, so the padding is a rendering defect waiting on a caller
    rather than copy to transcribe. Asserted across all fields of all rows, so a
    row re-transcribed from the XLSX fails here.
  */
  it("carry no spreadsheet cell padding", () => {
    for (const t of TREATMENTS) {
      for (const [field, value] of Object.entries(t)) {
        if (typeof value !== "string") continue;
        expect(value, `${t.agent}.${field}`).toBe(value.trim());
        // `moa` sets a deliberate newline; only runs of spaces are the artifact.
        expect(value, `${t.agent}.${field}`).not.toMatch(/ {2}/);
      }
    }
  });
});

/*
  Id uniqueness is no longer a test — `EDUCATION_TOPICS` is keyed, so a repeated id
  is a duplicate object-literal key and does not compile.
*/
describe("education", () => {
  /*
    `severity-bleeding` shipped with the body "Disease severity is classified by
    residual FVIII/FIX activity level (see SEVERITY_TABLE)" — a code identifier
    standing in for copy, in a topic no chapter read. It was invisible precisely
    because nothing rendered it; this is what would have said so.
  */
  it("carry no code identifiers standing in for copy", () => {
    const lines = Object.values(EDUCATION_TOPICS).flatMap((topic: EducationTopic) =>
      topic.body.flatMap((b) => (typeof b === "string" ? [b] : [b.text, ...b.children])),
    );
    for (const line of lines) {
      expect(line).not.toMatch(/\b[A-Z][A-Z0-9]*(_[A-Z0-9]+)+\b/);
    }
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
