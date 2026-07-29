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
  of `{label, content?}`), which owns the open state and shows one panel at a
  time. Only the first has content — `diagnosis` is the one label with a
  matching `EDUCATION_TOPICS` title — and its panel is **in-flow, not a modal**,
  because issue 03's Modal/Popup primitive does not exist yet. The other two have
  no assets, so they toggle and show nothing. `SEVERITY_TABLE` (§7.2, PPTX slide
  6) still renders nowhere, so "all education content present" is open.
- The clotting-cascade figure is a **static image placeholder**. The designer's
  export has the pop-up's close glyph baked into the raster, so the page
  currently paints a control that does nothing. It becomes a real panel when the
  Modal lands.
- The other two §7.7 figures have no assets.
- Glossary cross-links (issue 12) are not wired.
- Type sizes and the fit-to-one-screen requirement are open — styling.md §9
  items 9–11.
