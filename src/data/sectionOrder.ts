/**
 * Canonical linear-walkthrough order — the single source of truth for the
 * Prev/Next spine (see `docs/adr/0001-linear-walkthrough-navigation.md`).
 *
 * The array below is the fixed sequence the sidebar (issue 18) steps through.
 * The three off-line reference pages (`/glossary`, `/acronyms`, `/references`)
 * are deliberately absent — they have their own routes and jump buttons but do
 * not participate in Prev/Next.
 *
 * `prevOf` / `nextOf` resolve neighbours by exact path. A path that is not in
 * the sequence (an off-line page, or anything unknown) has no neighbour, so
 * both resolvers return `undefined` for it.
 */

export const SECTION_ORDER = [
  "/",
  "/education/disease-background",
  "/education/treatment-landscape",
  "/education/rebalancing-agents",
  "/education/fviiia-mimetics",
  "/education/prophylaxis-guidance",
  "/wizard-intro",
  "/wizard",
  "/explore",
  "/resources",
  "/survey",
] as const;

export type SectionPath = (typeof SECTION_ORDER)[number];

/** The path before `path` in the walkthrough, or `undefined` at the start / off-line. */
export function prevOf(path: string): SectionPath | undefined {
  const i = SECTION_ORDER.indexOf(path as SectionPath);
  return i > 0 ? SECTION_ORDER[i - 1] : undefined;
}

/** The path after `path` in the walkthrough, or `undefined` at the end / off-line. */
export function nextOf(path: string): SectionPath | undefined {
  const i = SECTION_ORDER.indexOf(path as SectionPath);
  return i >= 0 && i < SECTION_ORDER.length - 1 ? SECTION_ORDER[i + 1] : undefined;
}
