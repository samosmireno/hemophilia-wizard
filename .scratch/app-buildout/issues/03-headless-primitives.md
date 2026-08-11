# 03 — Headless component primitives

Status: done — the last live item (`FilterSelect`) shipped 2026-08-11; the other two are mooted
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

- ~~`FilterSelect`~~ — **shipped 2026-08-11** as `src/components/FilterSelect.tsx` for issue 09's
  three comparison-table dropdowns: a labelled **native `<select>`** (user decision — no artboard
  draws the open list, and correct a11y inside a modal beats owning a listbox), `""` as the All
  sentinel, skinned like the rest (the design precedent over headless, same as `Popup`).
- ~~`LikertScale`~~ — **mooted 2026-08-11**: issue 13 shipped classic native radios by user
  decision; no primitive needed.
- `Tabs` — **mooted** by design changes (no artboard uses tabs).
