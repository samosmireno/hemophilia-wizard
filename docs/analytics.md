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
Path only, never query strings — and the address bar itself is reduced to `utm_*` on
boot, see "Campaign links" below. The 15-step `SECTION_ORDER` spine means the funnel is
built in GA4 reporting straight from page paths — including the intake→scenario drop-off,
since `/wizard`'s Submit fires no event (see the table).

**Use time** — `step_duration` carries the foreground seconds spent on each route. GA4's
own _Average engagement time_ is unreliable for this SPA: gtag credits engaged time to the
next event it sends, which after reading a slide is the next slide's `page_view`, so every
route's number shifts one step forward. `step_duration` is measured by us instead
(`src/lib/useStepDuration.ts` over the pure `src/lib/stepTimer.ts`): the clock runs while
the tab is visible, pauses while hidden, and reports whole seconds on route change, on
tab-hide (the last reliable signal on mobile, where a backgrounded tab can be killed
without `pagehide`) and on unload. A tab-switch mid-slide therefore splits one visit into
two events — sums are unaffected, so per-route time is **Step seconds ÷ Views**, never an
average of the event values. Sub-second chunks (redirect hops) are dropped; a chunk is
capped at 1800 s so an idle desktop tab can't swamp the average. Report: Explore → Free
form, dimension _App route_, metrics _Step seconds_ and _Views_ (or Reports → Engagement →
Events → `step_duration` with _App route_ as secondary dimension). For wall-clock time
between steps — including time away from the tab — a Funnel exploration over the routes
with _Show elapsed time_ needs no code.

**Events** (all fired through typed helpers in `src/lib/analytics.ts`):

| Event                    | Fires when                                            | Params                                                                                                                                    |
| ------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `wizard_submit`          | Submit on `/wizard/reason` with all three answers     | `hemophilia_type` (`A`/`B`), `has_inhibitors` (`yes`/`no`), `switch_reason`, `run` (this run's ordinal within the tab session, 1 = first) |
| `recommendation_reached` | `/wizard/therapies` renders a leaf                    | `scenario` (e.g. `A-without-inhibitors`), `switch_reason`, `run` (the same ordinal as the submit that produced the leaf)                  |
| `drug_sheet_open`        | Any agent drug sheet opens, except the `/how-to` demo | `agent`, `page`                                                                                                                           |
| `survey_submit`          | The outcomes survey validates and submits             | — (the Google Form owns answer content; GA is the only success signal, since the Form POST is opaque `no-cors`)                           |
| `step_duration`          | Leaving a route, the tab being hidden, or unload      | `page`, `seconds` (whole foreground seconds on that route since the last report, capped at 1800)                                          |

Params reach gtag exactly as written: `sendEvent` calls `ReactGA.gtag` raw, because
`ReactGA.event` rewrites `page` to `page_path` on the way through (its Universal-Analytics
field map). That silently emptied the `page` dimension until 2026-08-25;
`src/lib/analytics.wire.test.ts` now runs real react-ga4 against jsdom's `dataLayer` to
guard the wire format.

**Repeat runs** — `run` on the two wizard events is that run's ordinal within the tab
session (`src/lib/wizardRun.ts`). A run is one `wizard_submit`, so Back → change an answer
→ resubmit is run 2 (that _is_ using the wizard again; the submitted combination is the
datum, ADR 0010); "Reset inputs" then submit is the next run — a reset is how a run starts
and does not touch the counter; a reload of `/wizard/therapies` re-fires
`recommendation_reached` with the same `run` as the submit that produced the leaf. The
param exists because the client's Sheet is fed by the GA4 Data API, which has no segments:
"sessions with ≥ 2 `wizard_submit`" cannot be asked there, but "`wizard_submit` where
`run` = 2" can, and every session that used the wizard again passes through run 2 exactly
once. Reports: **sessions that ran the wizard more than once** = Event count of
`wizard_submit` with _Wizard run_ = 2; **run distribution** = Event count of
`wizard_submit` by _Wizard run_. The counter lives where the answers live —
`sessionStorage`, one tab, gone with it (ADR 0003) — while a GA4 session is 30 minutes of
inactivity across tabs, so a learner who opens the app in a second tab restarts at run 1
inside the same GA4 session: accepted noise. Repeats _across_ sessions need no code —
GA4's _New vs. returning_ covers them.

**Deliberately not collected**: recommended agent lists (derivable offline from
`scenario` + `switch_reason` via `src/data/wizard.ts`), per-radio-click answer changes,
generic popup/accordion opens, back-navigation, scroll depth or reading position within
a route, survey answer content, query params, anything identifying. Also no event on `/wizard`'s own Submit — the reason split
(2026-08-12) moved `wizard_submit` to `/wizard/reason`, the first moment all three params
exist; who completed the patient questions is the `/wizard/scenario` pageview. Outbound clicks on `/references` and `/resources` come
from GA4 Enhanced Measurement, not from code.

## Campaign links (QR, website, email)

Channel attribution — did this visit come from the printed QR code, the client's site or
the email? — comes from GA4's automatic UTM handling, not from code. Without UTMs a QR
scan and an email click both arrive with no referrer and both report as `(direct)`;
only the website link is distinguishable, as a `referral`. So every distribution channel
gets its own tagged URL, all pointing at `/`:

| Channel     | Link                                                                 |
| ----------- | -------------------------------------------------------------------- |
| Printed QR  | `/?utm_source=qr&utm_medium=print&utm_campaign=<wave>`               |
| Client site | `/?utm_source=<site-domain>&utm_medium=referral&utm_campaign=<wave>` |
| Email       | `/?utm_source=email&utm_medium=email&utm_campaign=<wave>`            |

`utm_campaign` names the wave; `utm_content` distinguishes placements within a channel
(`congress-poster` vs `leaflet`). Point links at `/`, not a deep route: the
`<Navigate replace>` redirects in `src/routes/router.tsx` drop the query string, and
whether gtag reads the UTMs before that happens is a race. GA never sees email _opens_ —
that is the email tool's metric; GA sees the clicks that land.

**Per-recipient tokens are stripped on boot.** Email platforms append a recipient
identifier to every link (Mailchimp `mc_eid`, HubSpot `_hsenc`/`_hsmi`, Klaviyo `_kx`,
…), and a token in the address bar is a token in `page_location` on every hit — gtag's
automatic `scroll` / `user_engagement` included — in browser history, and in the
referrer of outbound clicks. `sanitizeLocation` (`src/lib/sanitizeLocation.ts`, the
first thing `main.tsx` runs) rewrites the URL to keep only `utm_source`, `utm_medium`,
`utm_campaign`, `utm_content`, `utm_term` and `utm_id`; anything else is gone before
the router, gtag or any hit sees it. It is an allowlist, not a blocklist, so the email
tool — unchosen as of 2026-08-25 — never matters. What it cannot police: the utm values
themselves are trusted, so a tool configured to write a per-recipient value into
`utm_content` would pass. Campaign authors own that — keep utm values to channel, wave
and placement.

## GA4 console checklist (one-time, property `G-C1HHCMQZNG`)

`G-C1HHCMQZNG` is the Impetus-owned property the site reports to (2026-08-28); it replaced
`G-JE497010X0`. A GA4 property starts empty and nothing below carries over, so every step
is per property — a future switch means redoing all of them, and the old property's data
stays where it is.

1. **Vercel**: set `VITE_GA_MEASUREMENT_ID` in the project's environment variables —
   without it, production deploys ship with analytics off.
2. **Admin → Data streams → web stream → Enhanced measurement**: turn **off** "Page
   changes based on browser history events" (the app sends its own SPA pageviews;
   leaving it on double-counts). Leave the rest on — that's where outbound-click
   tracking comes from.
3. **Admin → Custom definitions → Create custom dimension**: register each event param,
   else it's invisible in standard reports. One dimension per row; the **Event
   parameter** field must match the code's param name exactly:

   | Dimension name   | Scope | Description                                                                                                                 | Event parameter   |
   | ---------------- | ----- | --------------------------------------------------------------------------------------------------------------------------- | ----------------- |
   | Hemophilia type  | Event | Wizard answer: hemophilia type, `A` or `B`                                                                                  | `hemophilia_type` |
   | Has inhibitors   | Event | Wizard answer: inhibitor status, `yes` or `no`                                                                              | `has_inhibitors`  |
   | Switch reason    | Event | Wizard answer: `bleeding-control`, `monitoring`, `adherence`, `treatment-burden`                                            | `switch_reason`   |
   | Scenario         | Event | Type + inhibitor status on `recommendation_reached`, e.g. `A-without-inhibitors`                                            | `scenario`        |
   | Drug sheet agent | Event | Which agent's drug sheet was opened                                                                                         | `agent`           |
   | App route        | Event | Route an event belongs to: where a drug sheet was opened from, the route timed by `step_duration`, e.g. `/wizard/therapies` | `page`            |
   | Wizard run       | Event | Ordinal of this wizard run within the tab session, 1 = first                                                                | `run`             |

   The display names are deliberate: bare "Page" or "Agent" would sit confusingly next to
   GA4's built-in Page/User dimensions in report pickers. `page` was "Drug sheet page"
   until `step_duration` started sharing it (2026-08-25) — if it is already registered,
   edit the display name; the parameter binding is what matters. _Wizard run_ arrived
   after the first registration pass (2026-08-28) and has to be added on its own, in the
   property the deployed measurement ID points at — a dimension fills from the moment it
   is registered, never retroactively.

4. **Admin → Custom definitions → Custom metrics → Create custom metric**: _Step
   seconds_, scope Event, event parameter `seconds`, unit of measurement **Seconds**.
   Without it `step_duration` reports as a count only and the use-time question is
   unanswerable.

5. **Admin → Events**: mark `wizard_submit` and `survey_submit` as key events.
6. **Admin → Data collection and modification → Data retention**: set _Event data
   retention_ to **14 months** (the default is 2). Standard reports are pre-aggregated and
   unaffected; the Explore reports this doc leans on — Free form for Step seconds ÷ Views,
   the Funnel for elapsed time between steps — read raw event data and can only look back
   this far. Not retroactive: anything past the window is gone for good, so do it before
   launch data accumulates.

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
- [ ] Walk the spine with the Front arrow through all 15 steps: one `page_view` per
      step, page path correct each time; Back likewise, no doubles.
- [ ] Sidebar jump links (`/glossary`, `/acronyms`, `/references`): pageviews arrive for
      off-spine pages too.
- [ ] Load `/?utm_source=debugtest&mc_eid=abc123`: the address bar drops `mc_eid`
      before the page renders. Our `page` param is `/` with no query string; expanding
      the event, `page_location` (gtag's automatic field) carries `?utm_source=debugtest`
      and nothing else — the utm is what powers attribution, the token must never appear.
      Same check on `scroll` / `user_engagement` later in the session.
- [ ] Visit `/education` and a bogus URL like `/nope`: note the redirects land on
      `/education/disease-background` and `/` — check whether the pre-redirect path also
      fires a stray `page_view` (accepted noise either way, just know which).
- [ ] Deep-link `/wizard/scenario` in a fresh tab (no answers): the gate bounces to
      `/wizard` and fires its pageview — accepted noise, per the schema decision.
- [ ] Deep-link `/wizard/therapies` with the patient answers in but no reason (answer
      the two questions, then paste the URL in the same tab): the leaf gate bounces to
      `/wizard/reason` — same accepted noise, one pageview for the landing page.

### `wizard_submit`

- [ ] Answer the two patient questions on `/wizard` and Submit: **no event** — only the
      `/wizard/scenario` pageview. The event needs all three answers and belongs to the
      reason step.
- [ ] On `/wizard/reason` with no reason picked, Submit is disabled — nothing fires.
- [ ] Pick a reason, Submit: one `wizard_submit`; expand it and check
      `hemophilia_type`, `has_inhibitors` (`yes`/`no`), `switch_reason` match exactly
      what was clicked across both screens, and `run` is `1` (fresh tab).
- [ ] Go Back, change an answer on either screen, resubmit the reason step: a second
      event with the updated values and `run` = `2` — a resubmit is a new run, which is
      exactly the "used the wizard again" signal (see Repeat runs above).
- [ ] Reset inputs on a wizard screen, answer all three again, Submit: `run` = `3` — a
      reset starts a run, it does not restart the count.
- [ ] Open the app in a **new tab** and submit once: `run` is `1` again — the counter is
      per tab, so this is the accepted noise inside one GA4 session.
- [ ] If key events are already registered: the event row carries the key-event flag.

### `recommendation_reached`

- [ ] Front arrow from `/wizard/reason` to `/wizard/therapies`: one event;
      `scenario` is `A|B-with|without-inhibitors` and matches the answers,
      `switch_reason` rides along, and `run` equals the submit's.
- [ ] Reload `/wizard/therapies`: fires again alongside the `page_view`, with the
      **same** `run` — each viewing counts, by design; only a submit advances the run.
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

### `step_duration`

- [ ] Open an education slide, wait ~10 s, press Next: one `step_duration` arrives with
      the new `page_view`; `page` is the slide just left, `seconds` ≈ 10.
- [ ] On a slide, switch to another tab for a while, come back, wait ~5 s, press Next:
      two events for that slide — one on the switch-away, one on Next with ≈ 5. The
      hidden interval is in neither.
- [ ] Close the tab: a final event for the current route (beacon transport — allow a
      moment for it to appear).
- [ ] Visit `/education` (redirects at once): no `step_duration` for `/education` itself.
- [ ] If the custom metric is registered: `seconds` shows as _Step seconds_ in the
      Events report, not only in DebugView.

### Enhanced Measurement (no code — verifies console step 2)

- [ ] Click an outbound link on `/references` or `/resources`: a `click` event with
      `outbound: true` and the `link_url`/`link_domain` params.
- [ ] `scroll` and `user_engagement` events appear on long pages — expected, ignore.
- [ ] Every navigation still produces exactly **one** `page_view` — confirms the
      history-based auto pageview is off.
