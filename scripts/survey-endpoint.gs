/**
 * Survey endpoint: a standalone Apps Script web app that appends each outcomes-survey
 * response as a row in the client-facing 1737 Sheet, replacing the Google Form.
 *
 * Standalone (script.google.com, in the deploying account's own Drive) rather than bound
 * to the Sheet, because publishing a web app needs Deploy, which an external editor of a
 * Shared Drive file is not allowed to do. The script writes into the Sheet by ID, so the
 * deploying account only needs edit access on it. The endpoint runs as that account —
 * if it loses access, submissions stop.
 *
 * Setup (once, as the account that has edit access on the Sheet):
 *  1. script.google.com → New project → name it, e.g. "1737 survey endpoint".
 *  2. Paste this file over Code.gs; set SHEET_ID (the Sheet URL is
 *     /spreadsheets/d/<SHEET_ID>/edit); save.
 *  3. Deploy → New deployment → gear → Web app → Execute as: Me → Who has access:
 *     Anyone (learners are anonymous — "Anyone with a Google account" would reject
 *     them) → Deploy → authorise → copy the Web app URL (ends in /exec).
 *  4. App side: `src/lib/submitSurvey.ts` posts to that URL with keys q1/q2/q3 instead of
 *     the Form's entry ids; body stays URL-encoded, fetch stays `no-cors`.
 *  5. Any later edit here needs Deploy → Manage deployments → pencil → Version: New →
 *     Deploy, or /exec keeps serving the old code. The URL does not change.
 *
 * The answer whitelist mirrors SURVEY_QUESTIONS in src/data/survey.ts verbatim; keep the
 * two in sync. Anything else is dropped silently (the endpoint is anonymous, like the
 * Form was), so drive-by POSTs cannot fill the tab with junk.
 */

const SHEET_ID = "PASTE_SHEET_ID";
const TAB = "Survey responses";

const LIKERT = ["Strongly agree", "Agree", "Neutral", "Disagree", "Strongly disagree"];
const ALLOWED = {
  q1: LIKERT,
  q2: LIKERT,
  q3: [
    "For general education",
    "To assist with treatment decisions",
    "During discussion with a patient",
    "I do not plan to use this tool",
  ],
};
const QUESTIONS = Object.keys(ALLOWED);

function doPost(e) {
  const p = (e && e.parameter) || {};
  const answers = QUESTIONS.map((q) => p[q]);
  const valid = answers.every((a, i) => ALLOWED[QUESTIONS[i]].includes(a));
  if (!valid) return ContentService.createTextOutput("rejected");

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(TAB) || ss.insertSheet(TAB);
  if (sheet.getLastRow() === 0) sheet.appendRow(["timestamp", ...QUESTIONS]);
  sheet.appendRow([new Date(), ...answers]);
  return ContentService.createTextOutput("ok");
}

/** Browser sanity check: opening the /exec URL should print this. */
function doGet() {
  return ContentService.createTextOutput("survey endpoint up");
}
