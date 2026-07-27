# 03 — Headless component primitives

Status: ready-for-agent
Phase: 0
Blocked by: —

## Goal

Build the reusable behavioral components headless (behavior + a11y now, skin later).

## Scope

- `Modal`/`Popup` — focus trap, ESC/overlay close, `aria-modal`, scroll lock.
- `Tabs` — used by drug-sheet class grouping and the V3 Considerations/Strategies tabs.
- `Accordion` — education blocks / long content.
- `RadioCard` — wizard answer choices.
- `FilterSelect` — the three comparison-table dropdowns.
- `LikertScale` — survey questions.
- Compose classes with `cn()` from `src/lib/cn.ts`; style via semantic tokens (issue 02).

## Acceptance

- Each primitive keyboard-navigable and screen-reader labeled.
- Unit tests (Vitest + Testing Library) for open/close, selection, keyboard nav.

## Notes

Keep them presentational-agnostic so Phase 3 skins without touching behavior.
