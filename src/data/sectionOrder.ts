export const SECTION_ORDER = [
  "/",
  "/education/disease-background",
  "/education/treatment-landscape",
  "/education/rebalancing-agents",
  "/education/fviii-mimetics",
  "/education/prophylaxis-guidance",
  "/wizard-intro",
  "/wizard",
  "/wizard/scenario",
  "/wizard/therapies",
  "/explore",
  "/resources",
  "/survey",
] as const;

export type SectionPath = (typeof SECTION_ORDER)[number];

export function prevOf(path: string): SectionPath | undefined {
  const i = SECTION_ORDER.indexOf(path as SectionPath);
  return i > 0 ? SECTION_ORDER[i - 1] : undefined;
}

export function nextOf(path: string): SectionPath | undefined {
  const i = SECTION_ORDER.indexOf(path as SectionPath);
  return i >= 0 && i < SECTION_ORDER.length - 1 ? SECTION_ORDER[i + 1] : undefined;
}
