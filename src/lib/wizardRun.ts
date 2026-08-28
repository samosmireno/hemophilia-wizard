/**
 * Which run of the wizard this is within the tab session. A run is one
 * `wizard_submit` — Submit on `/wizard/reason` with all three answers — and
 * `run` is its 1-based ordinal, tagged onto that event and onto the
 * `recommendation_reached` it leads to. It exists because the client's Sheet is
 * fed by the GA4 Data API, which has no segments: "sessions with two or more
 * submits" cannot be asked there, but "submits where `run` = 2" can, and every
 * session that used the wizard again passes through run 2 exactly once.
 *
 * Back → change an answer → resubmit is a new run (that IS using the wizard
 * again; the submitted combination is the datum, ADR 0010). "Reset inputs" does
 * not touch the counter — a reset is how a run starts, not how one ends.
 *
 * Lifetime = the answers' lifetime (ADR 0003): `sessionStorage`, one tab, gone
 * with it. A GA4 session is 30 minutes of inactivity across tabs, so a second
 * tab restarts at run 1 inside one GA4 session — accepted noise, recorded in
 * docs/analytics.md.
 */
export const RUNS_STORAGE_KEY = "hemophilia-wizard:runs:v1";

/**
 * The counter itself. Read from storage once per page load and owned here from
 * then on — storage is only its persistence across reloads, so a write that
 * fails (private mode, blocked storage) costs the next reload, not this session.
 */
let counter: number | null = null;

function readStored(): number {
  try {
    const parsed = Number(sessionStorage.getItem(RUNS_STORAGE_KEY));
    // Anything but a positive integer — missing, garbage, a stray decimal — is
    // a fresh session: a wrong `run` is worse than none.
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function load(): number {
  if (counter === null) counter = readStored();
  return counter;
}

/** A submit just happened: advance the counter, persist it, and return the new run's ordinal. */
export function nextWizardRun(): number {
  const run = load() + 1;
  counter = run;
  try {
    sessionStorage.setItem(RUNS_STORAGE_KEY, String(run));
  } catch {
    /* Private-mode or blocked storage: the counter lives on in memory for this page load. */
  }
  return run;
}

/** The ordinal of the latest run — 0 before any submit in this tab session. */
export function currentWizardRun(): number {
  return load();
}
