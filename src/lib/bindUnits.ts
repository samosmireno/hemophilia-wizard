/**
 * A measurement is one word: `150 mg/week` may not wrap between the number and
 * its unit, and `≥ age 6 years` may not strand the operator at a line end.
 * Glued at render time rather than in the data — which space is breakable is
 * typesetting, and the copy stays a plain sentence to transcribe against. The
 * same call `bindArrows` makes for `↑`/`↓` in §5's matrix.
 */

/** `≥`, `~`: a threshold reads as a prefix on what follows, number or word. */
const OPERATOR = /([≥≤<>~])\s+/g;

/**
 * The whole run of digits is matched, and the guard in front of it keeps a
 * name's digits out — `AAV5 vector` and `NXT007 BsAb` are two words each, where
 * `150 mg` is one. The guard is captured rather than a lookbehind, which Safari
 * only learned in 16.4.
 */
const MEASUREMENT = /([^A-Za-z\d]|^)(\d+(?:\.\d+)?)\s+(?=[A-Za-z%])/g;

/** `2 × 10¹³ genome copies/kg` — the whole product is the dose. */
const PRODUCT = /\s*×\s*/g;

export function bindUnits(text: string): string {
  return text
    .replace(OPERATOR, "$1\u00a0")
    .replace(MEASUREMENT, "$1$2\u00a0")
    .replace(PRODUCT, "\u00a0×\u00a0");
}
