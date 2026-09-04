import { describe, expect, it } from "vitest";

import { DRUG_SHEETS } from "../data/drug-sheets";
import { bindUnits } from "./bindUnits";

const NBSP = "\u00a0";

describe("bindUnits", () => {
  /** The break the client called out, 2026-09-04: Marstacimab's maintenance dose. */
  it("keeps a number with its unit", () => {
    expect(bindUnits("maintenance dose: 150 mg/week")).toBe(`maintenance dose: 150${NBSP}mg/week`);
    expect(bindUnits("3 mg/kg/wk for 4 wks")).toBe(`3${NBSP}mg/kg/wk for 4${NBSP}wks`);
    expect(bindUnits("aged 6–11 years")).toBe(`aged 6–11${NBSP}years`);
  });

  it("keeps a threshold with what it qualifies", () => {
    expect(bindUnits("weighing ≥50 kg")).toBe(`weighing ≥50${NBSP}kg`);
    expect(bindUnits("patients ≥ age 6 years")).toBe(`patients ≥${NBSP}age 6${NBSP}years`);
  });

  /** One dose, three tokens — a break anywhere inside it misreads. */
  it("keeps a product whole", () => {
    expect(bindUnits("2 × 10¹³ genome copies/kg")).toBe(`2${NBSP}×${NBSP}10¹³ genome copies/kg`);
  });

  /**
   * The guard that makes it safe to point at every sheet: a digit inside a name
   * is not a measurement, so `AAV5` does not swallow the word after it.
   */
  it("leaves a digit inside a name alone", () => {
    expect(bindUnits("antibodies to AAV5 vector capsid")).toBe("antibodies to AAV5 vector capsid");
    expect(bindUnits("NXT007 BsAb")).toBe("NXT007 BsAb");
  });

  it("leaves prose without a measurement untouched", () => {
    const plain = "SC injection (prefilled pen or syringe)";

    expect(bindUnits(plain)).toBe(plain);
  });

  /**
   * The property, asserted across the content it actually renders: gluing is
   * lossless — swap the NBSPs back for spaces and the sheet reads as authored.
   */
  it("changes nothing but which spaces break", () => {
    for (const sheet of DRUG_SHEETS) {
      for (const line of [...sheet.classTarget, ...sheet.indication, ...sheet.dosing]) {
        expect(bindUnits(line).replaceAll(NBSP, " "), sheet.agent).toBe(line);
      }
    }
  });
});
