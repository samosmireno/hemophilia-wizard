import { describe, expect, it } from "vitest";

import { SECTION_ORDER, isSpinePath, nextOf, prevOf } from "./sectionOrder";

describe("sectionOrder", () => {
  it("is the fifteen-step walkthrough spine in blueprint order", () => {
    expect([...SECTION_ORDER]).toEqual([
      "/",
      "/how-to",
      "/education/disease-background",
      "/education/treatment-landscape",
      "/education/rebalancing-agents",
      "/education/fviii-mimetics",
      "/education/prophylaxis-guidance",
      "/wizard-intro",
      "/wizard",
      "/wizard/scenario",
      "/wizard/reason",
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
    expect(nextOf("/")).toBe("/how-to");
    expect(nextOf("/how-to")).toBe("/education/disease-background");
    expect(nextOf("/education/fviii-mimetics")).toBe("/education/prophylaxis-guidance");
    expect(nextOf("/education/prophylaxis-guidance")).toBe("/wizard-intro");
    expect(nextOf("/wizard-intro")).toBe("/wizard");
    // The wizard's own four steps, then out of it.
    expect(nextOf("/wizard")).toBe("/wizard/scenario");
    expect(nextOf("/wizard/scenario")).toBe("/wizard/reason");
    expect(nextOf("/wizard/reason")).toBe("/wizard/therapies");
    expect(nextOf("/wizard/therapies")).toBe("/explore");
    expect(nextOf("/resources")).toBe("/survey");
  });

  it("prevOf steps backward through the spine", () => {
    expect(prevOf("/survey")).toBe("/resources");
    expect(prevOf("/explore")).toBe("/wizard/therapies");
    expect(prevOf("/wizard/therapies")).toBe("/wizard/reason");
    expect(prevOf("/wizard/reason")).toBe("/wizard/scenario");
    expect(prevOf("/wizard/scenario")).toBe("/wizard");
    expect(prevOf("/wizard")).toBe("/wizard-intro");
    expect(prevOf("/wizard-intro")).toBe("/education/prophylaxis-guidance");
    expect(prevOf("/education/prophylaxis-guidance")).toBe("/education/fviii-mimetics");
    expect(prevOf("/education/disease-background")).toBe("/how-to");
    expect(prevOf("/how-to")).toBe("/");
  });

  it("has no neighbour past either end", () => {
    expect(prevOf("/")).toBeUndefined();
    expect(nextOf("/survey")).toBeUndefined();
  });

  /*
    `nextOf`/`prevOf` no longer take these — a plain string is a type error, so
    "what does stepping from an off-line path do" is not a question the interface
    can be asked. `isSpinePath` is where a runtime path earns the narrowed type,
    and rejecting these is the half of its contract the spine test above can't pin.
  */
  it("isSpinePath rejects off-line and unknown paths", () => {
    for (const path of ["/glossary", "/acronyms", "/references", "/nope"]) {
      expect(isSpinePath(path)).toBe(false);
    }
    for (const path of SECTION_ORDER) {
      expect(isSpinePath(path)).toBe(true);
    }
  });
});
