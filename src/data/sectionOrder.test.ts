import { describe, expect, it } from "vitest";

import { SECTION_ORDER, nextOf, prevOf } from "./sectionOrder";

describe("sectionOrder", () => {
  it("is the nine-step walkthrough spine in blueprint order", () => {
    expect([...SECTION_ORDER]).toEqual([
      "/",
      "/education/disease-background",
      "/education/treatment-landscape",
      "/education/rebalancing-agents",
      "/education/fviiia-mimetics",
      "/wizard",
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
    expect(nextOf("/education/fviiia-mimetics")).toBe("/wizard");
    expect(nextOf("/wizard")).toBe("/explore");
    expect(nextOf("/resources")).toBe("/survey");
  });

  it("prevOf steps backward through the spine", () => {
    expect(prevOf("/survey")).toBe("/resources");
    expect(prevOf("/wizard")).toBe("/education/fviiia-mimetics");
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
