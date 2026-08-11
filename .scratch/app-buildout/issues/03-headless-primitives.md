# 03 — Headless component primitives

Status: in-progress
Phase: 0

## Goal

Provide the reusable behavioural components the content screens need, keyboard-navigable and
screen-reader labelled, with Vitest coverage.

## Done

- `Modal`/`Popup` — `src/components/Popup.tsx` plus the `ModalLayer`/`Lightbox` family.
  Shipped **skinned rather than headless**: the design arrived before the primitive.
- `RadioCard` — shipped as `src/components/OptionGroup.tsx` (renamed, skinned); real
  `<input type="radio">` behind styled labels.
- `Accordion` — exists only inline in `src/routes/wizard/Therapies.tsx`; **not reusable**.

## Remaining

- `FilterSelect` — the three comparison-table dropdowns; needed by issue 09.
- ~~`LikertScale`~~ — **mooted 2026-08-11**: issue 13 shipped classic native radios by user
  decision; no primitive needed.
- `Tabs` — **mooted** by design changes (no artboard uses tabs).
