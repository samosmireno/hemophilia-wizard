# Linear walkthrough navigation, with off-line reference pages

**Status:** accepted

The app is navigated as a **single linear walkthrough** — a persistent sidebar with
**Prev / Next** buttons that step through the sections in a fixed order — rather than a
section portal where every route is an independent, co-equal top-nav destination (and
not the blueprint's one-scrolling-canvas layout either). We chose this because HM-85L is
an accredited-CME-style activity meant to be _worked through_: education first, then the
interactive tools, then the survey. A guided path matches that intent and gives the
learner an obvious "what's next."

## The section order

The Prev/Next spine is a fixed sequence of nine steps:

1. `/` — Home
2. `/education/disease-background`
3. `/education/treatment-landscape`
4. `/education/rebalancing-agents`
5. `/education/fviiia-mimetics`
6. `/wizard`
7. `/explore`
8. `/resources` — curated Resources panel
9. `/survey`

This ordering is a structural fact the shell owns, encoded in `src/data/sectionOrder.ts`
(the canonical array plus `prevOf` / `nextOf` resolvers). It is independent of the visual
treatment — Prev on `/explore` must _know_ that `/wizard` precedes it regardless of how
the sidebar is styled.

## Off-line reference pages

Three pages sit **off** the linear line — each has its own route and its own
always-visible sidebar button, and none appears in Prev/Next:

- `/glossary` — domain-term definitions
- `/acronyms` — abbreviation expansions
- `/references` — the full bibliography (~40 citations)

This **splits** what the blueprint (and the original issue 12 / `CONTEXT.md §9`) bundled
as one combined "Resources / References / Glossary" destination into **four** routes:
`/resources` (curated panel, in-flow step 8) plus the three off-line pages above. Note
`Acronyms` content currently lives _inside_ `CONTEXT.md §8 Glossary` and is pulled out
into its own page as part of this split.

Reference material is looked up **on demand, from anywhere** — a learner reading the
wizard wants the glossary without losing their place in the walkthrough — so folding it
into the linear sequence would be wrong. Standalone routes also keep glossary/acronym
anchors stably addressable for cross-links from education (issue 11) and drug sheets.

### Prev returns to the flow (amended, issue 18)

"None appears in Prev/Next" leaves the arrows with nothing to do on a reference page. Both
being dead is a defensible reading, but it makes the sidebar look broken exactly where the
learner most needs a way back, and it contradicts the "without losing their place" intent
above. So, on the three off-line pages:

- **Next is disabled.** A reference page has no successor; inventing one would put it in
  the sequence, which is the thing this decision rejects.
- **Prev returns to the last walkthrough step visited** — the way back into the flow. It
  falls back to `/` when there is nothing remembered (a cold deep-link, or a reload).

Prev therefore means "back" in both cases; off the spine, back is where you came from
rather than the previous step. The remembered path is UI state, not part of the section
order — `sectionOrder.ts` stays the pure sequence, and the three off-line pages remain
absent from it.

## Jump shortcuts

The sidebar also carries direct **jump buttons** to Home and Wizard even though both are
in-flow steps — Wizard is the app's centerpiece interactive tool and must be reachable in
one click from any step, not only by Next-ing to it.

Five buttons in all: Home, Wizard, Acronyms, References, Glossary. The current page's own
button is **disabled and dimmed** and carries `aria-current="page"` — one dead button
always marks where you are, and every live button means "go somewhere else".

## Consequences

- `src/data/sectionOrder.ts` is the single source of truth for the order; Prev/Next and
  any progress affordance derive from it.
- Issue 01 builds the routes, per-route stubs, semantic landmarks, and `sectionOrder.ts`.
  The **sidebar** (Prev/Next + jump buttons) is a separate Phase-1 issue (#18), per the
  spec's "structure and styling are separable passes" principle. It was built without a
  Gate-1 wireframe: `mlg-components`' `Sidebar` owns its own fixed positioning and exposes
  no `className`, so its layout was never ours to specify — see issue 18.
- Issue 12 is re-scoped from one combined route to the four-route split described above.
- Removing issue 01's placeholder nav leaves `/education/*`, `/explore`, `/resources` and
  `/survey` reachable only by stepping the spine. That is this decision working as
  intended, but it is the moment it starts constraining everyday use.
