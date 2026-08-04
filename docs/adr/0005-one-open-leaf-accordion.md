# 0005 — The wizard leaf's Considerations/Strategies pair is a one-open accordion

Date: 2026-08-04
Status: Accepted

## Context

Every leaf of the Treatment Wizard shows a pair of notes for its (scenario, reason):
a **Considerations** list and a **Strategies** list (CONTEXT.md §4.2, `SCENARIO_NOTES`).
The source annotation asks for _"2 buttons or tabs called 'Considerations' and
'Strategies' to launch the text in the light blue boxes to the right"_ — it does not
say which, and the blueprint draws both notes at once because it is a poster.

The `/wizard/therapies` artboards resolve it. Two exports were delivered, of the same
leaf (HB with inhibitors, improving bleeding control):

- one with the Considerations panel open, drawn **between** the two headers;
- one with the Strategies panel open, drawn **below** both headers.

In both, exactly one panel is open, the open header is crimson and the closed one
lagoon, and the arch beneath sits at the same y (553) despite panels of 152px and
335px above it.

The lists are long — 2 to 8 bullets, 141px to 337px of panel — and this is the page
that also carries the leaf's recommended agents, so both cannot be shown at once
without pushing the agents off the screen.

## Decision

**Exactly one of the two is open at all times, Considerations on mount.** Opening one
closes the other; clicking the open header does nothing.

It is built as an **accordion**, not as ARIA tabs: `<h2><button aria-expanded
aria-controls>` over a `role="region"` panel, with `aria-disabled="true"` on the open
header.

Both panels stay mounted in fixed DOM order and animate via
`grid-template-rows: 0fr ↔ 1fr`; the collapsed one carries `inert` and
`aria-hidden`.

## Rationale

**Why one open, not two.** The source calls them tabs, both artboards draw one, and a
both-open state is 480px of prose above a row of drug buttons. Making them independent
would also introduce a both-closed state the design never draws, in which a click hides
the whole leaf's clinical copy.

**Why not collapsible-to-none.** Same reason: nothing in the source shows it, and the
page's other half is a list of agent names that only make sense against the notes.

**Why an accordion and not ARIA tabs**, even though the behaviour _is_ a tab set. The
first artboard draws the open panel **between** the two headers. The ARIA tabs pattern
requires the tab list to be contiguous and followed by one panel; a tab strip
interrupted by its own panel is not that pattern, and implementing it would mean
announcing a structure the eye does not see. The accordion pattern describes exactly
what is drawn, and the "one always open" constraint is something APG's accordion
pattern already has an answer for.

**Why `aria-disabled` rather than `disabled` on the open header.** APG: _"If the
accordion panel associated with an accordion header is visible, and if the accordion
does not permit the panel to be collapsed, the header button element has aria-disabled
set to true."_ The real `disabled` attribute would take the header out of the tab order,
and the header is its panel's label — a keyboard user has to be able to reach and read
it. The click handler is what actually refuses; the attribute describes that.

It also settles the hover question. The open header takes no hover state, because a
lift under the cursor would advertise an action it does not have. Hover therefore
means "this one will open", which is true of the only header that has it.

**Why both panels stay mounted.** It is what lets one collapse while the other expands
on the same curve, which is what the two artboards are: the same four elements with the
row sizes swapped. The cost is that the closed panel is still in the accessibility
tree, so it is taken out explicitly — `overflow: hidden` hides it from the eye and from
nobody else.

**Why `grid-template-rows` and not `max-height`.** Sixteen leaves, sixteen different
panel heights, none of them known ahead of time. A `max-height` ceiling either clips a
tall panel or wrecks the easing of a short one; the grid form animates to the true
content height with no measurement and no magic number.

**State is component-local.** Which block was last open resets on remount. ADR 0003
holds the three answers for the session and deliberately nothing derived from them, and
which of two blocks a learner last looked at is not a patient characteristic.

## Consequences

- The learner cannot see both lists at once. On the tallest leaf (HA without inhibitors,
  reduced treatment burden) that is 8 Considerations bullets against 3 Strategies ones;
  reading both is two clicks.
- Anything that needs both lists at once — a print stylesheet, a "save my plan" export —
  will have to render them outside this component rather than by forcing it open.
- The open header is a focusable control that reports itself unavailable. That is the
  intended reading, but it is unusual enough that `therapies.test.tsx` pins both halves
  (`aria-disabled` set, and still `toBeEnabled`).
- The arch below is pinned to the bottom of the column (`mt-auto`) rather than flowed,
  so it does not jump when the open panel changes height — which is what the two
  artboards show.

## Alternatives considered

- **ARIA tabs with arrow-key navigation.** Truest to the source's wording and to the
  behaviour; rejected on the drawn layout, above.
- **Two independent disclosures.** Rejected: a both-open state does not fit the page and
  a both-closed state hides the content.
- **`<details>`/`<summary>` with `::details-content`.** The platform's own disclosure,
  and free exclusivity via `name=`. Rejected because the transition on
  `::details-content` is Chromium-only today, and because `name=`-grouped details are
  mutually exclusive but always collapsible — the state this ADR rules out.
