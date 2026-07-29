# 03 — Headless component primitives

Status: ready-for-agent
Phase: 0
Blocked by: —

## Goal

Build the reusable behavioral components headless (behavior + a11y now, skin later).

## Scope

- ~~`Modal`/`Popup`~~ — **done 2026-07-29**, see Comments.
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

## Comments

**2026-07-29 — `Popup` landed, skinned rather than headless.** `src/components/Popup.tsx`,
built from Figma `144:431`; rationale and geometry in `docs/styling.md` §13.

It **departs from this issue's "headless now, skin later" instruction, deliberately**:
the design arrived before the primitive did, so there was nothing to defer. Splitting
behaviour from a skin that already exists and has exactly one variant would have bought
a seam with no second consumer.

Three of the four behaviours here come from `<dialog>` + `showModal()` rather than from
our code — focus trap, `aria-modal` semantics, and the top layer (which is load-bearing:
its first caller, `DisclosureBand`, clips its own content with `overflow-hidden`). Scroll
lock is the one item the platform does not supply and is implemented. ESC and overlay
close both route through the `open` prop so the DOM cannot disagree with React.

Consequences for the rest of this issue:

- `DisclosureBand` was rewired off its provisional in-flow panel; triggers moved from
  `aria-controls` to `aria-haspopup="dialog"`.
- `src/test/setup.ts` gained an `HTMLDialogElement` shim — jsdom 25 has neither
  `showModal()` nor `close()`, and `CLAUDE.md` forbids an incidental dep bump. The shim is
  the state machine only; the platform behaviours are not faked, so nothing asserts them.
- **Never seen in a browser.** The rendered card, the inferred scrim, focus restoration
  and the real ESC path are all unverified — same gap `mlg-reskin` issue 03 logged.
- The remaining five primitives are untouched, so this issue stays open.
