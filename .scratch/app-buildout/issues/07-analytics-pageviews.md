# 07 — Analytics: per-route pageviews

Status: done (2026-08-11)
Phase: 0
Blocked by: 01 (done)

## Goal

Emit GA4 pageviews on route change plus named events, no-op when `VITE_GA_MEASUREMENT_ID` is
unset.

## Remaining

Nothing in code. One manual step: the GA4-console checklist in `docs/analytics.md`
(Vercel env var, Enhanced Measurement toggle, custom dimensions, key events).

## Comments

Shipped 2026-08-11 via `src/lib/analytics.ts` (sole `react-ga4` importer, production-only):
per-route pageviews from `AppShell`, plus `wizard_submit`, `recommendation_reached`,
`drug_sheet_open` (excl. `/how-to` demo), `survey_submit`. Beyond the original no-op
condition, tracking also no-ops outside production builds, so a dev `.env` can't pollute
the live property. Schema: `docs/analytics.md`; the answers-as-params privacy ruling:
`docs/adr/0010`.

2026-08-25 — client meeting asked for channel attribution (QR / website / email). No
event needed: UTM-tagged links per channel, GA reads them. What it did need was
`src/lib/sanitizeLocation.ts`: on boot the address bar is reduced to `utm_*`, so a
per-recipient token from whatever email tool they eventually pick never reaches
`page_location`, history or referrers. `main.tsx` now builds the browser router itself
(after sanitizing) instead of importing it from `router.tsx`. Link table and the
"point campaign links at `/`" rule: `docs/analytics.md` → Campaign links; ruling:
`docs/adr/0010` amendment.

2026-08-25 (later) — same meeting's "use time per education slide / wizard step" ask.
GA4's Pages-and-screens engagement time shifts one route forward in this SPA (gtag credits
engaged time to the next event, i.e. the next slide's pageview), so `step_duration` is
measured by us: `src/lib/stepTimer.ts` (pure) + `src/lib/useStepDuration.ts` (visibility /
pagehide wiring), mounted once in `AppShell`. Chunked reports on leave / tab-hide / unload;
per-route time = Step seconds ÷ Views. Console: `page` dimension renamed "App route", new
custom metric "Step seconds" (`docs/analytics.md` checklist step 4).

Found while verifying the above in Chromium: `ReactGA.event` rewrites the `page` param to
`page_path` (react-ga4's UA field map), so `drug_sheet_open` had never sent `page` and the
"Drug sheet page" dimension could never populate. `sendEvent` now calls `ReactGA.gtag` raw;
`analytics.wire.test.ts` runs real react-ga4 against jsdom's `dataLayer` so a mock can't hide
this again. If the client already registered the dimension on `page`, it starts filling on
the next deploy — nothing to change in the console.
