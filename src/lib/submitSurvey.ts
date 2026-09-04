import type { SurveyQuestionId, SurveyResponses } from "../data/survey";

/**
 * The survey submission seam (issue 06): `Survey.tsx` calls this and nothing
 * else, so pointing at a new destination touches this file only.
 *
 * Destination (2026-09-04): the survey endpoint — a standalone Apps Script web
 * app (`scripts/survey-endpoint.gs`) that appends one row per response to the
 * "Survey responses" tab of the client-facing 1737 Sheet, beside the GA4 feed
 * (`scripts/ga4-to-sheet.gs`). It replaced the Google Form so the survey and
 * the analytics share one Sheet. Body keys are the question ids; the endpoint
 * whitelists answers against `SURVEY_QUESTIONS` verbatim and drops anything
 * else, so an option-text edit must be mirrored there and redeployed, or every
 * response is silently rejected.
 *
 * The POST goes `no-cors`, so the response is opaque: resolution means
 * "handed to the browser", never "delivered" — the page's confirmation is
 * optimistic by decision (docs/styling.md §27).
 */
const ENDPOINT_URL =
  "https://script.google.com/macros/s/AKfycbwIIJj6Mv8naCMDhwVro31FcbhDIB1CiLEiAZGx3PoLHfCGdIg17VDk6Sxveg68XB8/exec";

export async function submitSurvey(responses: SurveyResponses): Promise<void> {
  // `URLSearchParams` makes the body `application/x-www-form-urlencoded` — a
  // CORS-"simple" type, so no preflight (which Apps Script web apps don't
  // answer) and the `no-cors` POST goes through.
  const body = new URLSearchParams();
  for (const [id, answer] of Object.entries(responses) as [SurveyQuestionId, string][]) {
    body.set(id, answer);
  }
  await fetch(ENDPOINT_URL, { method: "POST", mode: "no-cors", body });
}
