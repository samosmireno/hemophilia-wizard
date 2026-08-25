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
