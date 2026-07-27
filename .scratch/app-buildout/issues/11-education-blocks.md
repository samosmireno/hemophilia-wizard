# 11 — Education blocks

Status: ready-for-human
Phase: 1
Blocked by: 00, 01, 02
Gate: Gate 1 (client wireframe approval)

## Goal

Build the background/education section at `/education`.

## Scope

- Content sections from **CONTEXT.md §7** (expanded 2026-07-27, now complete via the `[PDF-V]` +
  `[PPTX]` re-scan): landscape/personalization (§7.1); disease background — mechanism, diagnosis,
  **severity & bleeding-manifestation table** (§7.2, `[PPTX]` slide 6); **treatment-options class
  matrix** (§7.3, `[PPTX]` slide 7); clotting-factor-replacement benefits/challenges (§7.4);
  FVIIIa-mimetic BsAbs incl. emicizumab + Mim8/denecimig (§7.5); NFTs & hemostatic rebalancing
  agents + emerging agents NXT007/Inno8 (§7.6); the "Click here" pop-up index (§7.7); glossary
  entry point.
- Long-form content uses `Accordion` (issue 03) where appropriate; the education is authored in the
  source as **click-through pop-ups** (§7.7) — model each as a distinct block.
- Note (§7.7): ~24 source **figures** (MOA cascade, NXT007/Inno8 structures, severity schematics)
  are image assets, not text — surface them as images + the captions in §7.
- Structural + semantic tokens only.

## Acceptance

- All education content from CONTEXT.md present and correctly sourced.
- Cross-links to glossary (issue 12) resolve.

## Notes

Left-hand education blocks in the blueprint canvas.
