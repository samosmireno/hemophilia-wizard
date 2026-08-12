export const SECTION_ORDER = [
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
] as const;

export type SectionPath = (typeof SECTION_ORDER)[number];

/**
 * Whether a runtime path — the router's `pathname`, say — is on the spine.
 * The one place a plain string crosses into `SectionPath`; everything past
 * this guard is the compiler's problem, so `nextOf`/`prevOf` take the
 * narrowed type and a misspelled path is a type error, not a silent
 * `undefined`.
 */
export function isSpinePath(path: string): path is SectionPath {
  return (SECTION_ORDER as readonly string[]).includes(path);
}

export function prevOf(path: SectionPath): SectionPath | undefined {
  const i = SECTION_ORDER.indexOf(path);
  return i > 0 ? SECTION_ORDER[i - 1] : undefined;
}

export function nextOf(path: SectionPath): SectionPath | undefined {
  const i = SECTION_ORDER.indexOf(path);
  return i < SECTION_ORDER.length - 1 ? SECTION_ORDER[i + 1] : undefined;
}
