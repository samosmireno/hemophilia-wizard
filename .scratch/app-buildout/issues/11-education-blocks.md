# 11 — Education blocks

Status: ready-for-human
Phase: 1
Blocked by: 00, 01, 02
Gate: Gate 1 (client wireframe approval)

## Goal

Build the multi-chapter background/education module as `/education/:section` subroutes
(per issue 01) — not a single page. `/education` renders/redirects to the first chapter.

## Scope

- Four chapter subroutes, each its own screen, mapping CONTEXT.md **§7** content
  (expanded 2026-07-27, complete via the `[PDF-V]` + `[PPTX]` re-scan):
  - `disease-background` — disease background: mechanism, diagnosis, **severity &
    bleeding-manifestation table** (§7.2, `[PPTX]` slide 6).
  - `treatment-landscape` — landscape/personalization (§7.1); **treatment-options class
    matrix** (§7.3, `[PPTX]` slide 7); clotting-factor-replacement benefits/challenges (§7.4).
  - `rebalancing-agents` — NFTs & hemostatic rebalancing agents + emerging agents
    NXT007/Inno8 (§7.6).
  - `fviiia-mimetics` — FVIIIa-mimetic BsAbs incl. emicizumab + Mim8/denecimig (§7.5).
- `rebalancing-agents` and `fviiia-mimetics` are **cross-link targets from the wizard's
  branch-landing panels** (issue 08) — their URLs must be stable/addressable.
- Long-form content within a chapter uses `Accordion` (issue 03) where appropriate; the
  source's **"Click here" figures** (§7.7) are **in-chapter local-state popups** — NOT
  routes and NOT the `?drug=` overlay (that param is reserved for drug sheets, issue 10).
- Note (§7.7): ~24 source **figures** (MOA cascade, NXT007/Inno8 structures, severity
  schematics) are image assets, not text — surface them as images + the captions in §7.
- Glossary entry point (issue 12).
- Structural + semantic tokens only.

## Acceptance

- Each of the four `/education/:section` subroutes resolves and renders its chapter;
  bare `/education` lands on the first chapter; unknown section → first chapter (no not-found page).
- All education content from CONTEXT.md present and correctly sourced.
- Cross-links to glossary (issue 12) resolve; wizard deep-links to `rebalancing-agents`
  and `fviiia-mimetics` resolve.

## Notes

Left-hand education blocks in the blueprint canvas.

## Comments

**2026-07-29 — `disease-background` first pass (design applied).**

`Education.tsx` is now a slug-keyed dispatch table over four per-chapter
components in `src/routes/education/`; the other three are still placeholders.
`disease-background` is built against the designer's 1440×800 reference
(docs/styling.md §11), including the app-wide 112/163 gutter now on `<main>`.

`EducationTopic.body` gained a nested level (`NestedBullet`) so a chapter cannot
lose its indentation to array position.

**Not met by this pass**, deliberately, so the acceptance criteria are not yet
satisfied:

- The three §7.7 disclosures are a `DisclosureBand` component (title + a 3-tuple
  of `{label, content?}`), which owns the open state and shows one at a time.
  Only the first has content — `diagnosis` is the one label with a matching
  `EDUCATION_TOPICS` title. **Since 2026-07-29 it opens in the real modal**
  (`src/components/Popup.tsx`, Figma `144:431`, docs/styling.md §13) rather than
  the in-flow panel this issue originally shipped; the other two have no assets,
  so they toggle and open nothing. `SEVERITY_TABLE` (§7.2, PPTX slide 6) still
  renders nowhere, so "all education content present" is open.
- ~~The clotting-cascade figure is a **static image placeholder**.~~ **Done
  2026-07-29** — see the comment below.
- The other two §7.7 figures have no assets.
- Glossary cross-links (issue 12) are not wired.
- Type sizes and the fit-to-one-screen requirement are open — styling.md §9
  items 9–11.

**2026-07-29 — the clotting cascade opens for real, and is composed rather than
photographed.**

The static placeholder is gone. `src/components/ExpandableFigure.tsx` is a
thumbnail that is its own trigger and opens the existing `Popup` — the fourth
§7.7 target on this chapter, and the only one the design draws in the chapter
body rather than behind a "Click here:" button, which is why it is not a fourth
`Disclosure` (the band's grid and arch are built for three, enforced by the
3-tuple). It owns its own open state, mirroring `DisclosureBand`, and takes
`children` so it knows nothing about what it opens.

The designer's export was the pop-up in its **open** state — band, ✕, two
annotation notes, diagram and conclusion flattened into one raster. Only the
diagram is genuinely a picture, so the file was taken apart: the band and ✕ are
dropped (`Popup` draws its own), the thumbnail keeps the band and loses only the
✕ so it labels itself, the diagram is cropped to its ink, and the notes and
conclusion are now **text** in `src/data/education.ts`
(`CLOTTING_CASCADE_NOTES`, `CLOTTING_CASCADE_CONCLUSION`), reassembled by
`src/routes/education/ClottingCascadeFigure.tsx`.

That is the part worth recording: CONTEXT.md §7.7 marks this figure image-borne,
and this moves two thirds of it back into the text layer. The notes reflow rather
than scaling with the picture, they are selectable and translatable, and the
diagram's `alt` shrinks to describing the cascade alone instead of restating
sentences that are now on the page. Geometry, the colour derivation and the
browser verification are in docs/styling.md §13.

`Popup` gained `surface="white"` as an opt-in for this card, because the diagram
is drawn on white and the gradient framed it as a rectangle. Deliberately not
global: the severity table's `bg-white/50` header pills are only visible against
that gradient.

`PopupFigure` moved out of the chapter into `src/components/`, since the two
`DISCLOSURES` figures still use it, and now takes the asset's `width` as well as
its `height` — the §7.7 exports are not one size, and a shared 720 cap cannot
serve them all.

A11y shape: the thumbnail is decorative (`alt=""`) and the description lives in
the card. An image button takes its name from `alt`, and a figure description
makes a hostile control name that would then be announced twice. The trigger is
named `Expand {title}`, which is `PopupButton`'s own convention, so a
screen-reader user hears the same verb here as on the three disclosures below.

Still not met by this issue: the other two §7.7 figures have no assets, glossary
cross-links (issue 12) are unwired, and styling.md §9 items 9–11 stay open.

**2026-07-29 — `treatment-landscape` first pass (design applied).**

The second of the four chapters is built against a 1440×800 artboard, at the same
type and tracking as `disease-background` by instruction. Three rows of
`[prose | reserved figure | "Click here:" +]` in one grid; geometry, the track
arithmetic and the browser verification are in docs/styling.md §11.

Two things worth recording beyond the layout:

`EducationTopic` content **moved to match the design's filing**. The three §7.1
landscape bullets ("The hemophilia treatment landscape is rapidly evolving", "Novel
therapies improve bleed protection…", "Novel therapeutic classes:") now live on the
`nft` topic, whose `body` was empty, because that is the heading the design puts them
under — "Non-factor therapies:", with the `+` beside them opening that same topic's
`benefitsChallenges`. `evolving-landscape` is left holding `ACTIVITY_TITLE` alone plus
the `title` this chapter uses as its `<h1>`. The classes bullet became a `NestedBullet`
at the same time, the design drawing it indented exactly as `disease-mechanism`'s
HA/HB pair. Nothing consumed any of these topics before, so the move cost nothing.

`BulletList` moved out of `DiseaseBackground` into `src/components/` — two chapters
now draw the same list, and the second copy would have been verbatim.

**Not met by this pass**, deliberately:

- **The three `+` buttons open nothing.** Uncontrolled `PopupButton`s, no `Popup`
  mounted, no `aria-haspopup` (announced only where something opens, per
  `DisclosureBand`). Content is a later pass, by agreement. Consequence: a clicked
  `+` sticks as `×`, the same state the two content-less disclosures on
  `disease-background` are already in.
- **The three figures have no assets** (CONTEXT.md §7.7 marks them image-borne), so
  the artboard's "PLACEHOLDER" boxes ship as empty reserved boxes holding the track.
- **§7.3's treatment-options class matrix is not on this artboard**, though this issue
  and CONTEXT.md's chapter table both assign it here. Most likely it is behind the
  third `+` ("Novel therapy classes for HA/HB"), which puts it in the deferred pop-up
  work. Until that is confirmed with the designer, "all education content present"
  stays open for this chapter.
- **§7.4's other three bullets render nowhere.** The design shows only the lead
  clotting-factor bullet; the prophylaxis guidance (recommended over episodic ·
  greatly reduces bleeding risk · may apply at ≥2 IU/dL) belongs to a different
  chapter and stays in the data module, sliced off here with a comment.
- Glossary cross-links (issue 12) are not wired.
- styling.md §9 items 9–11 and §12's 1024px cliff stay open; this chapter makes the
  cliff the wider of the two cases (220px of prose against 250px).

**2026-07-30 — `rebalancing-agents` first pass (design applied).**

The third of the four chapters, from a 1440×800 artboard like the other two. No grid
this time: prose, a centred row of three reserved figure boxes under a caption, and
one "Click here:" `+` whose caption sits to its **left** — an arrangement no other
chapter has. Geometry, the colour sampling and the browser verification are in
docs/styling.md §11. It fits one screen (800px exactly at 1440×800, verified in
Chromium), so §9 item 10 stays a `disease-background` problem.

**Unlike the first two, its body type is transcribed rather than snapped to the §2
scale** — a raw `text-[26px]`, because this export sets prose a third larger than
`disease-background`'s did and the gap had stopped being roundable. Two geometry values
follow from that and are shipped off the drawn numbers: the boxes square up to whole
scale steps (224×192 against the drawn 227×185) and the bottom row's gap tightens to
24 from 38, which is what keeps the chapter on one screen at the larger type. §9 item
9 is now a question the three chapters answer differently, which is the state it should
be in when the designer's sizes arrive.

Three more things worth recording beyond the layout:

**The `rebalancing-agents` topic was split in two.** It held all of §7.6's prose in one
flat `body`; the artboard draws two of those bullets on the chapter and none of the
other five, which are the TFPI/AT-pathway mechanism sentences belonging to the
"Mechanisms…" figure. One topic could only have been rendered by slicing it at an
index — a fact about a layout stored as an offset into an array — so the mechanism
prose moved to a new `rebalancing-mechanisms` topic, titled with §7.6's own figure
name. Nothing renders it yet; it is what the `+` will open when the asset lands. The
id is deliberately not in the §7.7 index: that index names click-through targets, and
this is the content behind one.

**`REBALANCING_AGENTS` is a new bespoke row type**, beside `SEVERITY_TABLE` and
`TREATMENT_OPTIONS_MATRIX`. The artboard colours the three agents by mechanism class
(two anti-TFPI mABs blue, one AT-directed siRNA crimson), so the colour is a function
of the agent, not of its position — held as §7.6's one semicolon-joined string, the
chapter could only recover that by matching on prose, and a reword would silently drop
a colour. `mechanism` is a union, which makes a fourth class a compile error in the
chapter rather than an agent rendered in no colour. The composed label
(`"Concizumab: anti-TFPI mAB"`) has one implementation, `rebalancingAgentLabel`, called
by both the data module and the chapter's tone lookup.

**`BulletList` gained an optional per-child class hook** — a function, because this
caller needs the children to differ from each other. Colour itself stays out of the
data module, which carries no display fields.

**Not met by this pass**, deliberately:

- **Nothing on this chapter opens.** The `+` is an uncontrolled `PopupButton` with no
  `Popup` mounted and no `aria-haspopup`; the figure it names is image-borne and its
  asset has not landed. Same placeholder state `treatment-landscape` shipped in.
- **The three boxes are inert** — no assets, and §7.7 names no target for any of them.
  **The caption above them says "click on the boxes"**, so the chapter currently
  instructs a click that does nothing. It ships as drawn because this pass is the
  layout; raised as styling.md §9 item 16.
- **§7.6's NXT007/Inno8 block renders nowhere.** This issue assigns the whole of §7.6
  to this chapter, but the artboard draws no such block, and the `emerging-mimetics`
  topic has no design. "All education content present" stays open for this chapter.
- The artboard's "homeostatic rebalancing agents" is not reproduced — a different word
  from hemostatic, and §7.6/§7.7 write it correctly. Same call as `disease-background`'s
  unreproduced "FACOTOR".
- Glossary cross-links (issue 12) are not wired.
- styling.md §9 items 9 and 14–16 are open. Item 9 is the live one: this chapter
  transcribes its type where the other two snap to the scale, so the three no longer
  render the same, and closing it means one call applied backwards to all three.

**2026-07-30 — `rebalancing-agents` mechanisms click-through (two chained cards).**

The chapter's `+` opens now. Its §7.7 target is the first in the codebase that is
**two cards deep**: the mechanism prose, then the coagulation-cascade diagram behind
its "View mechanism" CTA, with a `NavArrowButton` back. Geometry, type and the
divergences are in docs/styling.md §11; this records the model decisions.

**One `Popup` with a `"prose" | "figure"` step, not two dialogs.** The dialog is never
closed and reopened as the reader steps between the cards, so the platform's focus
restoration fires exactly once — on the way out, onto the `+`. It follows that ✕, ESC
and a backdrop click all mean _closed_ from either card, and that reopening starts at
the first: the `+` names the §7.7 target as a whole, not whichever card the reader
happened to leave on. The steps are a `Record` over the union, exhaustive by
construction like the chapter's `MECHANISM_TONE`. The trigger becomes controlled for
`treatment-landscape`'s stated reason — uncontrolled, it would keep showing ✕ after a
card closed by ESC.

**§7.6's block title was on the wrong topic, and this moved it.** The previous pass
split `rebalancing-agents` in two and left "Hemostatic Rebalancing Agents in Treatment
of HA/HB" on the half that holds the chapter's two bullets — but §7.6 sets that heading
over the _mechanism_ prose, which is what the artboard confirms by putting it on the
prose card's band. The tell was already in the code: the chapter needed a `HEADING`
literal purely to drop a scope qualifier its topic should never have carried. The title
moved to `rebalancing-mechanisms`, `rebalancing-agents` took the string the `<h1>`
actually shows, and the literal and its comment are gone. `router.test.tsx` already
pinned that heading, so nothing moved but the source of it.

**The mechanism prose became `NestedBullet`s**, which is the change its own comment was
holding out for ("it stayed flat until the artboard showed it nested"). The artboard
shows something stronger than an indent — each lead-in is a heading over its own list —
so the card dispatches on the `Bullet` union: a `string` is the lead paragraph, a
`NestedBullet` is a section. The trailing colons go with the flattening. That is what
keeps the card from splitting on punctuation or slicing at an index.

**The figure card's title is a chapter literal**, not a data read, which is how all
three of `disease-background`'s figure cards state theirs — a figure's title is stated
rather than derived. `figures[0]` holds that string plus the abbreviation gloss in
parentheses, and recovering half of a caption by splitting it is the derivation the
data module argues against everywhere else. `figures` is untouched.

**The asset was re-encoded** from 3469×1683 to 1772×860 at q82 (67K → 40K), per §13's
2x rule and on the precedent of the other three. Its drawn width, 886, is the only one
in that table that is derived rather than measured: the diagram fills the card, so it
is whatever `Popup`'s body is wide.

**Not met by this pass**, deliberately:

- **No focus management between the cards.** `NavArrowButton` and `Button` are not
  `forwardRef`, so `ref` does not typecheck on either and there is no handle to focus
  when the previous step's control unmounts. The browser's behaviour ships instead —
  focus drops to `<body>` (measured in Chrome, not the `<dialog>`), and the rest of
  the document is already inert, so the next Tab lands on the new card's control.
  Logged as styling.md §9 item 18 and in `.scratch/mlg-reskin/`.
- **The prose card glosses all three abbreviations** where the export glosses only AT,
  because that card's own copy introduces TFPI and APC too. A deliberate divergence,
  raised as §9 item 17 rather than settled.
- The three figure boxes are still inert; item 16 is untouched by this and stays open.
- §7.6's NXT007/Inno8 block still renders nowhere, and glossary cross-links (issue 12)
  are still unwired.
