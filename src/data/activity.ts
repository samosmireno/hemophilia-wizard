/**
 * Activity-level identity — the CME activity code and its title.
 *
 * Source of truth: `CONTEXT.md` §1 (the code) and §7.1 (the title, which the
 * blueprint uses as the education framing block). It is app identity rather
 * than education content, which is why it lives here and not in
 * `education.ts` — that module imports `ACTIVITY_TITLE` for its first topic so
 * the landing hero and the framing block cannot drift apart
 * (`.scratch/app-buildout/issues/17-landing-page.md`).
 *
 * The title is exported in halves because the landing hero sets them at
 * different sizes and weights, splitting on the colon. `ACTIVITY_TITLE` is the
 * only form anything else should use — the split is a typographic detail of one
 * page, not a fact about the title.
 */

/** CME activity code. */
export const ACTIVITY_CODE = "HM-85L";

/** Title up to and including the colon. */
export const ACTIVITY_TITLE_LEAD = "The Future Is Now:";

/** Title after the colon. */
export const ACTIVITY_TITLE_TAIL = "Personalizing Hemophilia Prophylaxis in an Era of Novel Agents";

/** The full title, as the blueprint writes it. */
export const ACTIVITY_TITLE = `${ACTIVITY_TITLE_LEAD} ${ACTIVITY_TITLE_TAIL}`;
