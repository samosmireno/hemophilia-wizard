# 07 — Analytics: per-route pageviews

Status: ready-for-agent
Phase: 0
Blocked by: 01

## Goal

Emit per-route GA4 pageviews (and key events) now that the app is routed.

## Scope

- Build on the existing conditional `react-ga4` init in `src/main.tsx` (only active when
  `VITE_GA_MEASUREMENT_ID` is set).
- Fire a pageview on route change; add named events for high-value CME interactions
  (wizard completion, drug-sheet open, survey submit).

## Acceptance

- Route changes produce pageviews when GA id is set; no-op when unset.
- No analytics errors in console when the id is absent.

## Notes

Per-route pageviews are a benefit of the sectioned/routed decision — useful for CME
outcomes reporting.
