# 0007 — `/explore` is the SDM conclusion; the comparison table is a pop-up on it

Date: 2026-08-04
Status: Accepted
Supersedes: the page-shape decision in `.scratch/app-buildout/issues/09-explore-table.md`

## Context

Issue 09 specifies `/explore` as the §5 comparison table itself:

> Build the filterable comparison table at `/explore` … Three dropdown filters … Result
> grid driven by `filterTreatments()` / `evaluateTreatments()` … columns: Agent, MOA,
> Age, Route, Schedule, Monitoring.

That reading is the blueprint's. CONTEXT.md §2 lists the canvas left-to-right and files
item 4 as _"'Explore therapy options for HA/HB' button → the filterable table"_ — a
button and a table, with nothing said about what page the button lives on. Issue 09
answered that by putting the table at the route the button is named after.

The `/explore` artboard, delivered 2026-08-04, answers it differently. The page is
CONTEXT.md §9's **shared-decision-making conclusion node** — the heading _"Leverage
multidisciplinary care and SDM with patient…"_ over its four bullets — with the
"Explore therapy options for HA/HB" button beneath it and, below that, seven `+` buttons
grouped by therapeutic class under three arches. The table is not on the page at all.

Three things follow from that which were not knowable when issue 09 was written:

1. **The SDM node had no route.** CONTEXT.md files it under §9 "References & resources",
   and it appears on no other artboard. Issue 09's reading leaves the activity with no
   screen for its own conclusion.
2. **The seven `+` buttons are a third feature**, neither the table nor the wizard: a
   class-grouped index into the §6 drug sheets. It is the first and only caller of
   **Efanesoctocog alfa's** sheet, which CONTEXT.md §6 has recorded as built-and-
   unreachable since the sheets landed.
3. **§9's bullets are abridged in CONTEXT.md.** The artboard supplies them in full
   (_"Empower patients and caregivers to actively participate in education and
   decision-making around treatment selection"_ against §9's _"empower participation"_),
   so the artboard is a content source here and not only a layout one.

## Decision

**`/explore` renders the §9 SDM conclusion. The comparison table is a modal launched
from it.**

The route is unchanged — it stays `/explore`, stays on the walkthrough spine in
`SECTION_ORDER` between `/wizard/therapies` and `/resources`, and the button on the page
is still called "Explore therapy options". What changes is that the table is a `Popup`
body rather than the page body.

Issue 09's scope is amended accordingly: its filters, grid and empty state are still due,
inside that card.

## Rationale

**The artboard is the filing authority where it and the blueprint disagree.** This is not
a new call — it is the sixth time the repo has made it, and the first time it has been
written down as a decision rather than as a note on the thing it decided. The prior five:
the plural "Hemostatic rebalancing agents" on HA +inhib (CONTEXT.md §4); the four
`/wizard/scenario` screens' titles, leads and captions, which the blueprint has no
equivalent of (§4); NXT007 and Inno8 refiled from §7.6 onto the §7.5 chapter (§7.5); the
Denecimig card's opening class-level bullet, which §7.5 gives to emicizumab (§7.5); and
the dropped "NXT007:"/"Inno8:" prefixes (§7.5). The blueprint is a diagram of an activity;
the artboards are the activity. Where a fact exists in both, the drawn one is what ships.

**The blueprint does not actually contradict this.** Its yellow sticky asks _"Is there a
way that we can launch the table from the app so users can filter on each column?"_ —
"launch" is a modal's verb. Issue 09 inferred a page from a button's name; the artboard
supplies the page that button sits on. The two readings were never both supported.

**Why not rename the route.** `/explore` is load-bearing in three places — `SECTION_ORDER`,
`AppSidebar`'s Prev/Next, and `sectionOrder.test.ts` — and the page still explores therapy
options: it indexes seven of them by class and launches the table over all nine. A rename
would cost real edits to buy a name no more accurate than the one it replaced.

## Consequences

- **The comparison table ships behind one more click** than issue 09 assumed, and is not
  linkable. Consistent with ADR 0006, which put the drug sheets in the same position for
  the same reasons.
- **`Popup` is too narrow for the table.** It is `w-[min(1024px,92vw)]` and the table has
  nine columns — about 113px each. Before the grid lands it needs either a scroll region
  inside the card or a wide variant of `Popup`. Recorded as a styling open item; the card
  ships with a placeholder body meanwhile.
- **The placeholder card opens rather than staying inert**, which is the opposite of
  `DisclosureBand`'s rule that "a disclosure with no content opens nothing". The
  difference is what the emptiness means: that rule was written for §7.7 figures whose
  assets may never arrive, where an empty card is a dead end. This table is specified, its
  data and filter engine are built and tested, and the card is the container they drop
  into — so the placeholder is a state, not a stub, and it says so in words.
  <br>**Corrected 2026-08-10 — see the amendment below.**
- **CONTEXT.md §9 gains the four bullets verbatim**, and §5 gains a note that the table is
  a pop-up on this page rather than the page itself.
- **Efanesoctocog alfa's sheet is reachable at last**, closing the loose end §6 recorded.
- `router.test.tsx` graduates `/explore` out of its "renders a stub" list, the same move
  each education chapter made as its design landed.

### "Built and tested" was wrong (amended 2026-08-10)

The decision above stands unchanged. One supporting claim in its Consequences does not: the
filter engine was **never tested**, and as of 2026-08-10 it is deleted.

`evaluateTreatments` / `filterTreatments` and their four helpers had zero callers and zero tests
from the day they were written. Worse for this ADR's purposes, they answered a different question
than the artboard asks — patient eligibility rather than column filtering. The three drawn
dropdowns do not map onto them: no age dropdown exists, `hasInhibitors: false` applied no filter
at all, and the type dropdown's three values (A / B / A + B) do not fit a two-member union whose
resolver reads "A + B" as _both_. Rather than have issue 09 bend the table to fit an untested
engine, the engine went and issue 09 gained the specification instead. Details in CONTEXT.md §5.2.

**What this costs the reasoning above.** "The placeholder is a state, not a stub" rested on three
supports — the table is specified, its data exist, and its engine is built. Two of the three hold:
`TREATMENTS` is transcribed and tested, and §5 specifies the columns and the filters. The third is
gone. That is enough — the card is still a container waiting on a body someone has drawn, not a
promise of a feature nobody has designed — but it is now one support lighter, and the honest
statement is that the placeholder is a state because the **design** is settled, not because the
code was.

Nothing else in this ADR is affected: the table is still a `Popup` on `/explore`, the route still
sits on the spine, and the seven-agent class index is untouched.

## Alternatives considered

- **Keep issue 09's shape and put the SDM node somewhere else** — `/resources`, or a new
  route. Rejected: it invents a page the designer did not draw in order to preserve a page
  the designer replaced, and it would leave the "Explore therapy options" button with no
  drawn home.
- **Both: the table inline on `/explore` _and_ the SDM copy above it.** Rejected because
  the artboard's lower half is not empty — it is the seven-agent class index, drawn edge
  to edge and running off the bottom of the canvas. There is nowhere on the page for a
  nine-column grid, and stacking one below the arches would be a screen nobody designed.
