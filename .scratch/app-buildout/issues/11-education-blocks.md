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
  bare `/education` lands on the first chapter; unknown section → sensible fallback.
- All education content from CONTEXT.md present and correctly sourced.
- Cross-links to glossary (issue 12) resolve; wizard deep-links to `rebalancing-agents`
  and `fviiia-mimetics` resolve.

## Notes

Left-hand education blocks in the blueprint canvas.
