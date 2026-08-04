# 10 — Drug info sheets (modal card, opened from component state)

Status: in-progress
Phase: 1
Blocked by: 00, 01, 02, 03
Gate: Gate 1 (client wireframe approval)

## Goal

Per-drug info sheets launched from drug buttons throughout the app.

## Scope

- Render as a `Popup` (issue 03) over the current route, opened by **component state** —
  the calling page holds the agent name and hands it to `DrugSheetPopup`. There is **no**
  standalone `/drugs/:id` page and **no `?drug=` query param**; see
  `docs/adr/0006-component-state-drug-sheets.md`, which supersedes this issue's original
  routing scope.
- Content from `src/data/drug-sheets.ts` (issue 00): Class/Target, Indication, Dosage &
  Administration, Monitoring, Clinical Trials (NCT #s), in that fixed order.
- ~~Group by class as Tabs where the blueprint shows tabbed sheets.~~ The seven artboards
  delivered 2026-08-04 draw no tabs on any sheet — five sections stacked, every time.
- Openable from wizard leaves (08), explore table (09), and education class cards (11) —
  each holds its own open-agent state and mounts one `DrugSheetPopup`.

## Acceptance

- Clicking a drug button on any surface opens that agent's sheet as a modal card over the
  page; ESC, the ✕ and a backdrop click all close it, leaving the page as it was. ✅ (08)
- Every agent a surface can name resolves to a sheet; an unknown or absent name → no card
  at all (graceful, no empty chrome). ✅
- The card renders all five sections, both per-sheet heading overrides, and trials as
  `Name (NCTxxxxx)`. ✅
- Wired on `/explore` (09) and the education class cards (11). ⬜

## Notes

Blueprint purple sticky: sheets "can be displayed however you determine is best".

**Original scope was a `?drug=<id>` overlay with history entries and reload-to-open.**
Reversed on 2026-08-04 when the first consumer was built: `WizardGate` redirects a cold
`/wizard/therapies?drug=…` before anything reads the param, so two of the three acceptance
criteria were unreachable on the only surface that existed. Full reasoning, and the note
that `/explore` is where a shareable link would actually earn its keep, in ADR 0006.

## Comments

**2026-08-04 — the card is built; two of its three consumers are not.**

- `src/components/DrugSheetPopup.tsx` — takes `agent: string | null` + `onClose`, looks the
  sheet up by verbatim agent name (`sheetFor`), owns the `Popup`, and decides the band
  title. Built from seven artboards, one per sheet; measurements in `docs/styling.md` §16.
- `src/data/drug-sheets.ts` — three optional fields for the three per-sheet deviations the
  artboards show (`title`, `classHeading`, `monitoringHeading`), Denecimig's TBD qualifier
  moved out of `monitoring[]` where it was a bullet, and `2 × 10¹³` in Unicode.
- **Client cut, 2026-08-04:** trial citation tails deleted — "only the clinical trials name
  (NCT…) would be kept". `ClinicalTrial.citation` is gone with them; the card has no link.
- `DrugSheetPopup.test.tsx` sweeps all seven sheets; `content.test.ts` pins the three
  optional fields to the single sheets that set them and asserts no citation survives.
