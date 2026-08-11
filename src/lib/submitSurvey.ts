import type { SurveyQuestionId, SurveyResponses } from "../data/survey";

/**
 * The survey submission seam (issue 06): `Survey.tsx` calls this and nothing
 * else, so pointing at a new destination touches this file only.
 *
 * Destination: the "HM-85L … Outcomes Survey" Google Form, whose linked Sheet
 * the client reads. The entry ids were read off the form's public HTML
 * (2026-08-11) and are COUPLED TO THE LIVE FORM — deleting or recreating a
 * question mints a new id and breaks the mapping silently, so re-extract them
 * after any structural edit. Option TEXT must also match `SURVEY_QUESTIONS`
 * verbatim or the Forms charts bucket the answer as unrecognized; editing
 * option text is id-safe.
 *
 * The POST goes `no-cors`, so the response is opaque: resolution means
 * "handed to the browser", never "delivered" — the page's confirmation is
 * optimistic by decision (docs/styling.md §27).
 */
const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdu_UpSaNkYniW-5CqcfhReX-bIUh_GID7Sh1UC6cowrYru6Q/formResponse";

const ENTRY_IDS: Record<SurveyQuestionId, string> = {
  q1: "entry.1950198496",
  q2: "entry.2071602327",
  q3: "entry.561719209",
};

export async function submitSurvey(responses: SurveyResponses): Promise<void> {
  // `URLSearchParams` makes the body `application/x-www-form-urlencoded` — a
  // CORS-"simple" type, which is what lets the `no-cors` POST through.
  const body = new URLSearchParams();
  for (const [id, answer] of Object.entries(responses) as [SurveyQuestionId, string][]) {
    body.set(ENTRY_IDS[id], answer);
  }
  await fetch(FORM_URL, { method: "POST", mode: "no-cors", body });
}
