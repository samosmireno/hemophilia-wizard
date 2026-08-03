import { describe, expect, it } from "vitest";

import { SECTION_ORDER, nextOf, prevOf } from "./sectionOrder";

describe("sectionOrder", () => {
  it("is the thirteen-step walkthrough spine in blueprint order", () => {
    expect([...SECTION_ORDER]).toEqual([
      "/",
      "/education/disease-background",
      "/education/treatment-landscape",
      "/education/rebalancing-agents",
      "/education/fviiia-mimetics",
      "/education/prophylaxis-guidance",
      "/wizard-intro",
      "/wizard",
      "/wizard/scenario",
      "/wizard/therapies",
      "/explore",
      "/resources",
      "/survey",
    ]);
  });

  it("excludes the three off-line reference pages", () => {
    for (const offLine of ["/glossary", "/acronyms", "/references"]) {
      expect(SECTION_ORDER).not.toContain(offLine);
    }
  });

  it("nextOf steps forward through the spine", () => {
    expect(nextOf("/")).toBe("/education/disease-background");
    expect(nextOf("/education/fviiia-mimetics")).toBe("/education/prophylaxis-guidance");
    expect(nextOf("/education/prophylaxis-guidance")).toBe("/wizard-intro");
    expect(nextOf("/wizard-intro")).toBe("/wizard");
    // The wizard's own three steps, then out of it.
    expect(nextOf("/wizard")).toBe("/wizard/scenario");
    expect(nextOf("/wizard/scenario")).toBe("/wizard/therapies");
    expect(nextOf("/wizard/therapies")).toBe("/explore");
    expect(nextOf("/resources")).toBe("/survey");
  });

  it("prevOf steps backward through the spine", () => {
    expect(prevOf("/survey")).toBe("/resources");
    expect(prevOf("/explore")).toBe("/wizard/therapies");
    expect(prevOf("/wizard/scenario")).toBe("/wizard");
    expect(prevOf("/wizard")).toBe("/wizard-intro");
    expect(prevOf("/wizard-intro")).toBe("/education/prophylaxis-guidance");
    expect(prevOf("/education/prophylaxis-guidance")).toBe("/education/fviiia-mimetics");
    expect(prevOf("/education/disease-background")).toBe("/");
  });

  it("has no neighbour past either end", () => {
    expect(prevOf("/")).toBeUndefined();
    expect(nextOf("/survey")).toBeUndefined();
  });

  it("returns undefined for off-line and unknown paths", () => {
    for (const path of ["/glossary", "/acronyms", "/references", "/nope"]) {
      expect(prevOf(path)).toBeUndefined();
      expect(nextOf(path)).toBeUndefined();
    }
  });
});
