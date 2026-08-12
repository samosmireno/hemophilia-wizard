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

## DebugView verification (before the client link goes out)

### Getting in

- DebugView only shows debug-flagged hits: install the **Google Analytics Debugger**
  browser extension and toggle it on — no code change needed.
- Use a **production build**: the Vercel deploy, or locally `npm run build &&
npm run preview` (the local `.env` supplies the ID; the dev server never sends).
- Open **Admin → DebugView**, pick your debug device from the top-left picker; click any
  event in the timeline to expand its params.
- Debug hits are real hits in the property. A handful pre-launch is harmless; to exclude
  them entirely, define internal traffic first (Admin → Data streams → stream →
  Configure tag settings → Define internal traffic) and activate that data filter.
- DebugView shows every param whether or not it's registered as a custom dimension —
  seeing a param here does NOT confirm checklist step 3 worked; only reports do.

### Pageviews and config

- [ ] Cold-load `/`: exactly **one** `page_view` (two means the auto pageview or the
      Enhanced Measurement history toggle is still on), plus the normal
      `session_start` / `first_visit`.
- [ ] `npm run dev` with the extension on: DebugView stays **silent** — the `PROD`
      guard holds.
- [ ] Walk the spine with the Front arrow through all 14 steps: one `page_view` per
      step, page path correct each time; Back likewise, no doubles.
- [ ] Sidebar jump links (`/glossary`, `/acronyms`, `/references`): pageviews arrive for
      off-spine pages too.
- [ ] Load `/?utm_source=debugtest`: our `page` param is `/` with no query string.
      Expanding the event, `page_location` (gtag's automatic field) DOES carry the full
      URL — expected, it's what powers utm attribution. Watch-item only if campaign
      links ever carry per-recipient tokens; then we override `page_location` too.
- [ ] Visit `/education` and a bogus URL like `/nope`: note the redirects land on
      `/education/disease-background` and `/` — check whether the pre-redirect path also
      fires a stray `page_view` (accepted noise either way, just know which).
- [ ] Deep-link `/wizard/scenario` in a fresh tab (no answers): the gate bounces to
      `/wizard` and fires its pageview — accepted noise, per the schema decision.

### `wizard_submit`

- [ ] With any answer missing, Submit is disabled — nothing fires.
- [ ] Complete the three answers, Submit: one `wizard_submit`; expand it and check
      `hemophilia_type`, `has_inhibitors` (`yes`/`no`), `switch_reason` match exactly
      what was clicked.
- [ ] Go Back, change an answer, resubmit: a second event with the updated values
      (expected — the once-per-session counting method absorbs this in reports).
- [ ] If key events are already registered: the event row carries the key-event flag.

### `recommendation_reached`

- [ ] Front arrow from `/wizard/scenario` to `/wizard/therapies`: one event;
      `scenario` is `A|B-with|without-inhibitors` and matches the answers,
      `switch_reason` rides along.
- [ ] Reload `/wizard/therapies`: fires again alongside the `page_view` — each viewing
      counts, by design.
- [ ] The agents on screen match what `scenario` + `switch_reason` imply — the event
      deliberately carries no agent list.

### `drug_sheet_open`

- [ ] Open an agent sheet on `/wizard/therapies`: one event, `agent` = roster name,
      `page` = `/wizard/therapies`.
- [ ] Same on `/explore` and `/education/rebalancing-agents`: `page` follows the route.
- [ ] Close via ✕, Escape, and backdrop, reopening in between: exactly one event per
      open, nothing on close.
- [ ] The `/how-to` demo sheet (Fitusiran): **no** event.

### `survey_submit`

- [ ] Submit with a question unanswered: inline errors, **no** event.
- [ ] Complete and submit: one `survey_submit`, no answer params on it; then reload
      `/survey` — the thank-you state holds and nothing can double-fire.

### Enhanced Measurement (no code — verifies console step 2)

- [ ] Click an outbound link on `/references` or `/resources`: a `click` event with
      `outbound: true` and the `link_url`/`link_domain` params.
- [ ] `scroll` and `user_engagement` events appear on long pages — expected, ignore.
- [ ] Every navigation still produces exactly **one** `page_view` — confirms the
      history-based auto pageview is off.
