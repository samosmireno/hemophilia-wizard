# Session-scoped wizard answers, held above the shell

**Status:** accepted — amended 2026-08-12

> **Amendment (2026-08-12).** The flow is now **four** routes: on client direction the
> reason question moved out of `/wizard` to its own step, `/wizard/reason`, between the
> scenario screen and the leaf — restoring the blueprint's order (classes shown before
> the reason question, CONTEXT.md §4). Decision 4's gate is now stated twice **per
> door**: the two patient answers open `/wizard` (sidebar arrow + `ScenarioGate` over
> `/wizard/scenario` and `/wizard/reason`), and the reason opens `/wizard/reason`
> (sidebar arrow + `LeafGate` over `/wizard/therapies`, which bounces a reason-less
> session to `/wizard/reason` — the nearest missing step — rather than to `/wizard`).
> Everything else here stands unchanged.

The Treatment Wizard's three answers — hemophilia type, inhibitor status, reason for
considering a new therapy — live in a React context mounted in `AppShell`, mirrored into
`sessionStorage`, and nothing else about the wizard is stored. Four decisions come as a
package, and this records them together because each one is only defensible given the
others.

## The four

**1. The wizard is three routes, not one page.** `/wizard` collects the answers,
`/wizard/scenario` shows the therapeutic classes for the resolved scenario, and
`/wizard/therapies` the curated leaf. All three are on the walkthrough spine
(`SECTION_ORDER`), so Prev/Next steps through them like any other section.

**2. The answers outlive any of those routes**, so they are held above all of them, in a
provider in the layout route. That is also the only place both consumers can see them:
the pages need them, and so does `AppSidebar`, which is a sibling of `<main>`.

**3. `sessionStorage`, not memory and not the URL.** The store survives a reload and a
restored tab, and dies with the tab — which is what "session-scoped" was asked for. It is
read once, synchronously, in a lazy `useState` initializer, because the guard below
decides on first render.

**4. The gate is stated twice, deliberately.** `AppSidebar` disables the Next arrow on
`/wizard` until all three answers exist, and `WizardGate` redirects `/wizard/scenario` and
`/wizard/therapies` back to `/wizard` when they do not. The first governs the affordance,
the second the URL; neither covers the other's case.

## Why

**Why the provider is in the shell, when `AppShell`'s own comment says the shell holds no
route knowledge.** That rule is about _branching on the route_ — the reason `Landing`
mounts its own backdrop instead of the shell testing `pathname === "/"`. A provider
branches on nothing, holds no wizard logic, and renders no wizard markup; what it does is
outlive the routes below it, which is the one thing a route cannot do for itself. Every
lower placement fails: on `/wizard` the state dies when the learner steps forward, and on a
`/wizard` layout route it dies on the detour to `/glossary` that the walkthrough explicitly
supports (ADR 0001).

**Why the sidebar knows about the wizard at all.** `/wizard` is the only step in the
walkthrough with a precondition. It also has a Submit button, so without the gate the page
would offer two ways forward that disagree — one that checks the answers and one that does
not — and the ungated one is the arrow the learner has been pressing since `/`. Only
`AppSidebar` can disable that arrow, so the coupling has to point this way. It is one
boolean, read through the same hook the pages use.

**Why the answers are stored and the result is not.** `recommend(type, hasInhibitors,
reason)` is a pure function over data that ships in the bundle, so the result is always one
call away. Storing it would put a copy of transcribed clinical content — curated agent
lists, the scenario's Considerations and Strategies notes — into a store that outlives a
deploy. A tab left open across one would then render last week's recommendations, and
nothing in the app would notice.

**Why the store is validated on read rather than trusted.** It is writable by anything on
the origin and survives deploys, so a value found there may have been written by a
different version of this code. An unrecognised `reason` would otherwise reach
`RECOMMENDATIONS[scenario][reason]`, index to `undefined`, and take the leaf down. Each
field is checked independently, so a partially stale record loses only the bad field.

## What we rejected

**The answers in the URL** (`/wizard/therapies?type=A&inhibitors=no&reason=adherence`).
Shareable and bookmarkable, and it would delete `WizardGate` — the answers would arrive
with the request. Rejected because this is a CME activity about a _patient_: a URL is
pasted into tickets, chat and analytics, and these three fields are exactly the shape of
something that should not be. It also makes the sidebar's Prev/Next carry query strings
through every step to stay coherent.

**`localStorage`.** One character's difference and it survives the tab — which is the
problem. A shared or public workstation is a plausible setting for this activity, and the
next learner would open it on someone else's patient.

**In-memory context only.** Simplest, and arguably the truest reading of "reset on page
close". Rejected because a reload mid-flow loses the answers, and because it makes the
guarded routes undeep-linkable in a way that reads as a bug rather than a policy: opening
`/wizard/therapies` in a second tab would always bounce.

**Keeping the two follow-on routes off the spine**, reached only by Submit. It removes the
disagreement between the arrow and the button by removing the arrow. Rejected because it
dead-ends the walkthrough: from `/wizard/therapies` there would be no Next to `/explore`,
and the learner would have to walk back to `/wizard` to continue.

## Consequences

- `AppSidebar` imports `useWizardAnswers`. It is the only route-specific knowledge in it.
- A test that walks the spine needs answers in session state first; `seedWizardAnswers()`
  in `src/test/setup.ts` is that seam, and the same file clears `sessionStorage` between
  tests so one test's answers cannot un-gate another's.
- There is no reset control. The provider exposes `reset()` and nothing calls it: the
  artboard draws no such affordance, and per-group deselect already clears one answer at a
  time. Issue 08's "back/reset work" criterion is knowingly unmet pending a designed
  control.
- Analytics is untouched. Issue 07 owns GA4 events; submitting the wizard emits nothing.
