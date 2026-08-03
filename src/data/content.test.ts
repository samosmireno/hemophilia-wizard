import { describe, expect, it } from "vitest";

import { DRUG_SHEETS, sheetFor } from "./drug-sheets";
import { EDUCATION_TOPICS, SEVERITY_TABLE, TREATMENT_OPTIONS_MATRIX } from "./education";
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
