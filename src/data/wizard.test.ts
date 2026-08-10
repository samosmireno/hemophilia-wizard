import { describe, expect, it } from "vitest";

import { AGENT_NAMES } from "./agents";
import {
  ALL_REASONS,
  ALL_SCENARIOS,
  REASON_CHOICES,
  type Scenario,
  type SwitchReason,
  classesFor,
  leafFor,
} from "./wizard";

/*
  The wizard's two resolvers, tested at their own seam. Before this file the same
  ground was covered by mounting the whole app once per leaf — which is still what
  `routes/wizard/*.test.tsx` do, because what they assert is DOM: the accordion, the
  agent buttons, the responsive ramp. What is asserted here is the resolution itself,
  and it needs no DOM at all.
*/

function name({ type, hasInhibitors }: Scenario) {
  return `H${type} ${hasInhibitors ? "with" : "without"} inhibitors`;
}

const SCENARIOS = ALL_SCENARIOS.map((scenario) => [name(scenario), scenario] as const);

const LEAVES = ALL_SCENARIOS.flatMap((scenario) =>
  ALL_REASONS.map((reason) => [`${name(scenario)} / ${reason}`, { ...scenario, reason }] as const),
);

const MIMETICS = [AGENT_NAMES.emicizumab, AGENT_NAMES.denecimig];

describe("the reason model", () => {
  it("offers the four reasons in the artboard's reading order", () => {
    expect(REASON_CHOICES.map((choice) => choice.id)).toEqual([
      "bleeding-control",
      "monitoring",
      "adherence",
      "treatment-burden",
    ]);
  });

  /** The screen wears the artboard's imperative; the blueprint's gerund is the arch's. */
  it("labels the choices with the artboard's imperative", () => {
    expect(REASON_CHOICES.map((choice) => choice.label)).toEqual([
      "Improve bleeding control",
      "Reduce monitoring requirement",
      "Increase adherence",
      "Reduce treatment burden",
    ]);
  });

  it("offers every reason exactly once", () => {
    const offered = [...REASON_CHOICES.map((choice) => choice.id)].sort();
    expect(offered).toEqual([...ALL_REASONS].sort());
    expect(new Set(ALL_REASONS).size).toBe(ALL_REASONS.length);
  });
});

describe("classesFor", () => {
  it.each(SCENARIOS)("gives %s its own titled screen", (_label, scenario) => {
    const screen = classesFor(scenario);

    expect(screen.title).toBe(
      `Hemophilia ${scenario.type} ${scenario.hasInhibitors ? "with" : "without"} inhibitors`,
    );
    expect(screen.classes.length).toBeGreaterThan(0);
    expect(screen.caption).not.toBe("");
  });

  /** The polarity word is the branch the whole screen turns on (ADR 0004). */
  it.each(SCENARIOS)("emphasises the polarity word in %s's lead", (_label, scenario) => {
    expect(classesFor(scenario).lead).toContain(scenario.hasInhibitors ? "_with_" : "_without_");
  });

  it("carries the bypassing-agents caveat on hemophilia B with inhibitors, and nowhere else", () => {
    for (const scenario of ALL_SCENARIOS) {
      const caveat = classesFor(scenario).caveat;
      if (scenario.type === "B" && scenario.hasInhibitors) {
        expect(caveat).toMatch(/^Note: Bypassing agents/);
      } else {
        expect(caveat, name(scenario)).toBeUndefined();
      }
    }
  });

  /*
    Transcribed, not templated — the reason the artboard copy is four literals
    rather than a format string. HB with inhibitors alone says "Therapeutic
    options"; the other three say "Therapeutic classes to consider". If a future
    edit collapses these onto one pattern, this is the test that objects.
  */
  it("keeps HB-with-inhibitors' 'Therapeutic options' wording", () => {
    for (const scenario of ALL_SCENARIOS) {
      const expected =
        scenario.type === "B" && scenario.hasInhibitors
          ? /^Therapeutic options for/
          : /^Therapeutic classes to consider for/;

      expect(classesFor(scenario).lead, name(scenario)).toMatch(expected);
    }
  });

  /** Reading no reason is the point: one screen serves all four. */
  it("resolves the same screen whatever the reason", () => {
    for (const scenario of ALL_SCENARIOS) {
      const screens = ALL_REASONS.map(() => classesFor(scenario));
      expect(new Set(screens).size).toBe(1);
    }
  });
});

describe("leafFor", () => {
  it.each(LEAVES)("resolves every recommended agent to a roster row for %s", (_label, query) => {
    const { recommendations } = leafFor(query);

    expect(recommendations.length).toBeGreaterThan(0);
    for (const treatment of recommendations) {
      expect(treatment.agent).not.toBe("");
      expect(treatment.moa).not.toBe("");
    }
  });

  it.each(LEAVES)("recommends each agent at most once for %s", (_label, query) => {
    const agents = leafFor(query).recommendations.map((t) => t.agent);
    expect(new Set(agents).size).toBe(agents.length);
  });

  /*
    Only the leading word is pinned. The rest of the title is scenario-specific
    verbatim copy (CONTEXT.md §4.2) and varies across the sixteen — "Requirement"
    and "Requirements", "for Reducing" and "to Reduce" all ship as drawn. What does
    hold everywhere is that the pair names the same thing twice.
  */
  it.each(LEAVES)(
    "pairs a Considerations block with a Strategies block for %s",
    (_label, query) => {
      const { considerations, strategies } = leafFor(query);

      expect(considerations.title).toMatch(/^Considerations\b/);
      expect(strategies.title).toMatch(/^Strategies\b/);
      expect(considerations.title.replace(/^Considerations/, "")).toBe(
        strategies.title.replace(/^Strategies/, ""),
      );
      expect(considerations.points.length).toBeGreaterThan(0);
      expect(strategies.points.length).toBeGreaterThan(0);
    },
  );

  it.each(LEAVES)("heads %s with the artboard's imperative", (_label, query) => {
    const expected = REASON_CHOICES.find((choice) => choice.id === query.reason);
    expect(leafFor(query).heading).toBe(expected?.label);
  });

  /*
    The arch sentence is the blueprint's (CONTEXT.md §4.2) and is written against the
    blueprint's gerund, not the artboard's imperative the `<h1>` above it wears. This
    is the assertion that used to be reachable only by mounting the page.
  */
  it.each([
    ["bleeding-control", "Improving bleeding control"],
    ["adherence", "Increased adherence"],
    ["treatment-burden", "Reduced treatment burden"],
    ["monitoring", "Reduced monitoring requirement"],
  ] as [SwitchReason, string][])("reads %s into the arch as its gerund", (reason, gerund) => {
    for (const scenario of ALL_SCENARIOS) {
      expect(leafFor({ ...scenario, reason }).archTitle).toBe(
        `Novel therapies to consider if ${gerund} is the primary reason for switching therapies:`,
      );
    }
  });
});

describe("leafFor — the recommendation matrix", () => {
  /** CONTEXT.md §4.1: reduced monitoring narrows hemophilia A to the mimetics. */
  it("recommends mimetics alone when hemophilia A asks for reduced monitoring", () => {
    for (const hasInhibitors of [false, true]) {
      const agents = leafFor({
        type: "A",
        hasInhibitors,
        reason: "monitoring",
      }).recommendations.map((t) => t.agent);
      expect(agents).toEqual(MIMETICS);
    }
  });

  /** Gene therapy is hemophilia B's, and only where there are no inhibitors. */
  it("offers etranacogene only to hemophilia B without inhibitors", () => {
    for (const scenario of ALL_SCENARIOS) {
      for (const reason of ALL_REASONS) {
        const agents = leafFor({ ...scenario, reason }).recommendations.map((t) => t.agent);
        const offered = agents.includes(AGENT_NAMES.etranacogene);

        if (scenario.type === "B" && !scenario.hasInhibitors) {
          expect(offered, `${name(scenario)} / ${reason}`).toBe(
            reason === "adherence" || reason === "treatment-burden",
          );
        } else {
          expect(offered, `${name(scenario)} / ${reason}`).toBe(false);
        }
      }
    }
  });

  /** No mimetic is a hemophilia B option — an FVIIIa mimetic has no FVIII to mimic. */
  it("keeps the FVIIIa mimetics off every hemophilia B leaf", () => {
    for (const scenario of ALL_SCENARIOS.filter((s) => s.type === "B")) {
      for (const reason of ALL_REASONS) {
        const agents = leafFor({ ...scenario, reason }).recommendations.map((t) => t.agent);
        expect(agents, `${name(scenario)} / ${reason}`).not.toContain(AGENT_NAMES.emicizumab);
        expect(agents, `${name(scenario)} / ${reason}`).not.toContain(AGENT_NAMES.denecimig);
      }
    }
  });
});
