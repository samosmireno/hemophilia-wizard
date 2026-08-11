# Wizard answers as GA4 event params

**Status:** accepted

The GA4 instrumentation (issue 07) sends the Treatment Wizard's three answers —
hemophilia type, inhibitor status, switch reason — to Google Analytics as three separate
params on the `wizard_submit` event, and derived forms of the same facts on
`recommendation_reached`. ADR 0003 rejected putting exactly these fields in the URL
because their combination is patient-shaped; this ADR records why event params are not
the same case, and where the line stays.

## The decision

**1. The answers ride as event params, never in a URL.** `wizard_submit` carries
`hemophilia_type`, `has_inhibitors` ("yes"/"no") and `switch_reason`;
`recommendation_reached` carries `scenario` (e.g. `A-without-inhibitors`) and
`switch_reason`. Pageviews send `location.pathname` only — `location.search` is dropped
wholesale, so campaign links cannot smuggle identifying params into a hit.

**2. Nothing that identifies a person accompanies them.** No user IDs, no `user_id`
call, no query strings, no free text — every tracked value is one of a closed set of
option ids that ship in the bundle. The audience is US-only HCPs describing a
hypothetical patient in fixed-choice controls.

**3. The recommended agents are not sent.** `leafFor` is a pure function of scenario and
reason, so agent lists in GA would be a copy that can drift from the data file across
deploys — the same argument ADR 0003 made against storing the result. Reports join
agents offline from `src/data/wizard.ts`.

## Why this does not break ADR 0003

That ADR's rejection was about the _carrier_, not the facts: "a URL is pasted into
tickets, chat and analytics." A URL travels — it lands in server logs, browser history,
shared screenshots, support threads — and it arrives attached to one person's session in
each of those places. An event param exists only inside GA's property, aggregate,
anonymous and unlinkable to a learner. The client engagement report this app exists to
produce ("which patient scenarios are HCPs exploring?") is unanswerable without the
combination, and the combination without a person attached is a statistic, not a record.

## What we rejected

**Sending nothing about answers.** Maximally cautious, and it reduces the wizard's
analytics to "N people pressed Submit" — the one chart the client actually wants gone.

**Per-answer-change events.** Radio-click fidelity (including deselects) triples event
volume to capture indecision nobody will query. The submitted combination is the datum.

## Consequences

- `src/lib/analytics.ts` is the only module that talks to `react-ga4`; the env reads
  stay in `main.tsx`, and nothing tracks outside production builds.
- The full event schema and the GA4-console setup it needs live in `docs/analytics.md`.
- Any future param must clear the same bar: closed vocabulary, no person attached,
  never URL-carried. Free-text or identity-adjacent values re-open this ADR.
