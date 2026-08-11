import ReactGA from "react-ga4";

import type { CompleteWizardAnswers } from "../state/wizardAnswers";

/**
 * The one gate on everything below. Set only by `initAnalytics`, which callers
 * (i.e. `main.tsx`) invoke with `import.meta.env.PROD` — the env read stays at
 * the entry point so this module is testable without stubbing `import.meta`.
 */
let enabled = false;

/**
 * Initialize GA4, production builds only. A missing VITE_GA_MEASUREMENT_ID must
 * not crash the app — react-ga4 throws "Require GA_MEASUREMENT_ID" on an empty
 * value — and a dev session must not pollute the client-facing property, which
 * is why the ID living in a local `.env` is harmless: without `isProduction`
 * nothing here ever runs.
 */
export function initAnalytics(measurementId: string | undefined, isProduction: boolean) {
  if (!measurementId || !isProduction) return;
  // `send_page_view: false`: pageviews are sent manually per route change (see
  // `AppShell`) — the gtag default would double-count the landing page.
  ReactGA.initialize(measurementId, { gtagOptions: { send_page_view: false } });
  enabled = true;
}

/** One pageview per route change. Path only — never `location.search`: campaign
 *  links love identifying query params, and this app promises anonymity. */
export function trackPageview(pathname: string) {
  if (!enabled) return;
  ReactGA.send({ hitType: "pageview", page: pathname });
}

/**
 * The three answers ride as three separate event params — a deliberate,
 * ADR-recorded exception to ADR 0003's "never URL-encode the patient shape"
 * (see docs/adr/0010): event params are aggregate, anonymous and never appear
 * in a URL.
 */
export function trackWizardSubmit(answers: CompleteWizardAnswers) {
  sendEvent("wizard_submit", {
    hemophilia_type: answers.type,
    has_inhibitors: answers.hasInhibitors ? "yes" : "no",
    switch_reason: answers.reason,
  });
}

/** Fires when `/wizard/therapies` shows a leaf. The recommended agents are NOT
 *  sent — they are a pure function of these two params (`leafFor`), so reports
 *  join them offline from `src/data/wizard.ts` instead of trusting a copy. */
export function trackRecommendationReached(answers: CompleteWizardAnswers) {
  sendEvent("recommendation_reached", {
    scenario: `${answers.type}-${answers.hasInhibitors ? "with" : "without"}-inhibitors`,
    switch_reason: answers.reason,
  });
}

/** Every drug-sheet open, tagged with the page it came from — except `/how-to`,
 *  whose sheet is a legend demo, not interest in an agent. */
export function trackDrugSheetOpen(agent: string, pathname: string) {
  if (pathname === "/how-to") return;
  sendEvent("drug_sheet_open", { agent, page: pathname });
}

/** No answer params on purpose: the Google Form is the system of record for
 *  survey content; GA records only that a submission happened — the one place
 *  that signal exists at all, since the Form POST is opaque (`no-cors`). */
export function trackSurveySubmit() {
  sendEvent("survey_submit", {});
}

function sendEvent(name: string, params: Record<string, string>) {
  if (!enabled) return;
  ReactGA.event(name, params);
}
