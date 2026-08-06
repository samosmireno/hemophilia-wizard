# 07 — Analytics: per-route pageviews

Status: ready-for-agent
Phase: 0
Blocked by: 01 (done)

## Goal

Emit GA4 pageviews on route change plus named events, no-op when `VITE_GA_MEASUREMENT_ID` is
unset.

## Remaining

All of it. `react-ga4` is **init-only** at `src/main.tsx:23`; nothing fires on navigation.
Scope: per-route pageviews + events for wizard completion, drug-sheet open, survey submit.
