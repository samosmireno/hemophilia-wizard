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
