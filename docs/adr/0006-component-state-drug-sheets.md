# 0006 — Drug information sheets are component state, not a routed overlay

Date: 2026-08-04
Status: Accepted
Supersedes: the routing decision in `.scratch/app-buildout/issues/10-drug-info-sheets.md`

## Context

Every agent the wizard can recommend has a §6 information sheet (`DRUG_SHEETS`, 7 of
them). The blueprint's note asks only that a drug button "pop up to an information
sheet", and its purple sticky says the sheets "can be displayed however you determine
is best" — so the presentation was ours to choose, and issue 10 chose:

> Render as `Modal` as an overlay on the current route, driven by a `?drug=<id>` query
> param (e.g. `/explore?drug=marstacimab`, `/wizard?drug=concizumab`) … opening/closing
> is a history entry.

with acceptance criteria that a `?drug=` URL re-opens the sheet on refresh and that the
back button closes it. `/wizard/therapies` shipped its `+` buttons inert rather than
pre-empt that, because guessing would have settled it by accident.

Three facts about the actual codebase bear on it, and only the third was knowable when
issue 10 was written:

1. **Every pop-up in the app is component state.** `DisclosureBand` and all four §7.5
   agent cards hold an open id in `useState`; none touches the router.
2. **`/wizard/therapies` is the only consumer that exists.** `/explore` is still a stub
   (issue 09) and the education class blocks are unbuilt (issue 11).
3. **The refresh criterion is unreachable on that page.** `WizardGate` sends a session
   without all three answers back to `/wizard`, and ADR 0003 scopes the answers to the
   session. Loading `/wizard/therapies?drug=concizumab` cold therefore redirects before
   anything reads the param — the deep link resolves to a page that is not the page.

## Decision

**A drug sheet is opened by holding its agent name in component state.**
`DrugSheetPopup` takes `agent: string | null` and an `onClose`, looks the sheet up with
`sheetFor()`, and owns the `Popup` itself. `/wizard/therapies` holds one `openAgent`.

No query param, no history entry, no deep link. Issue 10's scope and acceptance are
amended to match.

**The agent name is the key**, not a slug: it is already the join between
`Treatment.agent`, `AGENTS` and `DRUG_SHEETS`, and adding a `drug-id` scheme would mean
a fourth spelling of the same six drugs.

## Rationale

**Why not the param, given the issue asked for it.** Two of its three acceptance
criteria describe behaviour the only consumer cannot have. Refresh redirects, per fact 3.
And "back closes the sheet" costs something specific here that it would not cost on
`/explore`: `/wizard/therapies` is the last step of a three-screen flow whose Prev arrow
is how a learner walks back through it, and browser Back is the same gesture. Making a
sheet a history entry means Back sometimes means "close this card" and sometimes means
"return to my scenario", decided by state the learner cannot see.

**Why not build it for the consumer that does not exist yet.** `/explore` is a table of
nine agents and is the place a shareable `?drug=` link would genuinely earn its keep.
When it lands, this component is the seam to add it behind: the sheet's own title, its
five sections and its lookup do not change, and a routed wrapper can hold the same
`agent` prop. Deciding it now would fix the URL shape against a table nobody has built.

**Why the component owns the dialog, where the §7.5 cards do not.** Each of those four
is a body its chapter wraps in a `Popup`, with the card's heading stated as a local
literal — right for them, because a chapter's cards belong to the chapter. A drug sheet
does not: the same seven cards are due on three surfaces, and what a sheet is _called_
is a property of the drug (`DrugSheet.title`, which only Denecimig sets). A caller that
had to supply the title would be a third place for the "(emerging/investigational)"
qualifier to go missing.

**Why an unknown agent opens nothing** rather than an empty card. `treatments.ts` carries
generic SHL and EHL rows for which the source authored no sheet at all (CONTEXT.md §6),
so "no sheet" is a real state a caller can reach, not just a typo. `DisclosureBand`
already answers the same question the same way.

## Consequences

- A drug sheet cannot be linked to, bookmarked or shared. Nothing in the source asks for
  it, and the wizard's own leaf is not linkable either — it is behind three answers held
  in `sessionStorage`.
- Back and ESC now mean different things: ESC closes the card, Back leaves the page with
  the card open. That is the platform's own split for a modal `<dialog>` and matches
  every other pop-up in the app.
- Opening a sheet is not a GA4 pageview. If the client wants per-drug engagement
  numbers, it needs an event rather than falling out of routing for free — worth raising
  at the next content gate.
- Issue 10 is no longer a routing task. What is left of it is wiring the same component
  into `/explore` (09) and the education class blocks (11).
- `therapies.test.tsx`'s "promises no dialog, because none opens yet" is deleted rather
  than inverted-in-place; the replacement sweeps `aria-haspopup="dialog"` across all
  sixteen leaves.

## Alternatives considered

- **`?drug=<id>` with a history entry**, as issue 10 specified. Rejected above.
- **`?drug=<id>` with `replace: true`** — the URL reflects the open card so it is
  inspectable, but Back still means "previous wizard step". Rejected because it keeps
  all of the coupling and delivers none of the benefit: a URL you cannot reload is not a
  link, and fact 3 says this one cannot be reloaded.
- **A standalone `/drugs/:id` page.** Ruled out by issue 01 and still right: a drug sheet
  is contextual — it means something because of the leaf that recommended it — and it is
  never a destination.
