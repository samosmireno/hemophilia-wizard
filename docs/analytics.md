# Analytics

GA4 via `react-ga4`, wrapped by `src/lib/analytics.ts` — the only module allowed to
import `react-ga4`. Purpose: client engagement reporting (how many, how far, which
scenarios). Fully anonymous by design; ADR 0010 records the privacy line and why the
wizard answers may cross into event params.

## When tracking runs

Only when **both** hold (`initAnalytics` in `src/main.tsx`):

- `VITE_GA_MEASUREMENT_ID` is set — locally via `.env`, on Vercel via the project's
  environment variables (the `.env` file is gitignored, so a deploy without the Vercel
  var ships with analytics silently off).
- The build is production (`import.meta.env.PROD`) — dev sessions never send hits, even
  with an ID present.

## What is collected

**Pageviews** — every route change, sent manually from `AppShell` (`useLocation`
effect); init passes `send_page_view: false` so the landing page isn't double-counted.
Path only, never query strings. The 14-step `SECTION_ORDER` spine means the funnel is
built in GA4 reporting straight from page paths.

**Events** (all fired through typed helpers in `src/lib/analytics.ts`):

| Event                    | Fires when                                            | Params                                                                                                          |
| ------------------------ | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `wizard_submit`          | Submit on `/wizard` with all three answers            | `hemophilia_type` (`A`/`B`), `has_inhibitors` (`yes`/`no`), `switch_reason`                                     |
| `recommendation_reached` | `/wizard/therapies` renders a leaf                    | `scenario` (e.g. `A-without-inhibitors`), `switch_reason`                                                       |
| `drug_sheet_open`        | Any agent drug sheet opens, except the `/how-to` demo | `agent`, `page`                                                                                                 |
| `survey_submit`          | The outcomes survey validates and submits             | — (the Google Form owns answer content; GA is the only success signal, since the Form POST is opaque `no-cors`) |

**Deliberately not collected**: recommended agent lists (derivable offline from
`scenario` + `switch_reason` via `src/data/wizard.ts`), per-radio-click answer changes,
generic popup/accordion opens, back-navigation, timings, survey answer content, query
params, anything identifying. Outbound clicks on `/references` and `/resources` come
from GA4 Enhanced Measurement, not from code.

## GA4 console checklist (one-time, property `G-JE497010X0`)

1. **Vercel**: set `VITE_GA_MEASUREMENT_ID` in the project's environment variables —
   without it, production deploys ship with analytics off.
2. **Admin → Data streams → web stream → Enhanced measurement**: turn **off** "Page
   changes based on browser history events" (the app sends its own SPA pageviews;
   leaving it on double-counts). Leave the rest on — that's where outbound-click
   tracking comes from.
3. **Admin → Custom definitions → Create custom dimension**: register each event param,
   else it's invisible in standard reports. One dimension per row; the **Event
   parameter** field must match the code's param name exactly:

   | Dimension name   | Scope | Description                                                                      | Event parameter   |
   | ---------------- | ----- | -------------------------------------------------------------------------------- | ----------------- |
   | Hemophilia type  | Event | Wizard answer: hemophilia type, `A` or `B`                                       | `hemophilia_type` |
   | Has inhibitors   | Event | Wizard answer: inhibitor status, `yes` or `no`                                   | `has_inhibitors`  |
   | Switch reason    | Event | Wizard answer: `bleeding-control`, `monitoring`, `adherence`, `treatment-burden` | `switch_reason`   |
   | Scenario         | Event | Type + inhibitor status on `recommendation_reached`, e.g. `A-without-inhibitors` | `scenario`        |
   | Drug sheet agent | Event | Which agent's drug sheet was opened                                              | `agent`           |
   | Drug sheet page  | Event | Route the drug sheet was opened from, e.g. `/wizard/therapies`                   | `page`            |

   The "Drug sheet …" display names are deliberate: bare "Page" or "Agent" would sit
   confusingly next to GA4's built-in Page/User dimensions in report pickers.

4. **Admin → Events**: mark `wizard_submit` and `survey_submit` as key events.
