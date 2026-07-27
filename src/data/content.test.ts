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
