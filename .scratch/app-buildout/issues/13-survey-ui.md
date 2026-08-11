# 13 — Survey UI

Status: done (2026-08-11)
Phase: 1
Blocked by: 06 (done)

## Goal

Build the post-use outcomes survey at `/survey`: three Likert/usage questions, validation,
submit through the adapter, confirmation state.

## Done

`src/routes/Survey.tsx`, covered by `src/routes/survey.test.tsx`; styling record in
`docs/styling.md` §27 (no artboard — invented within the palette). Decisions from the
2026-08-11 grilling session:

- **Classic native radios, not `OptionGroup`** (user) — stacked fieldsets, `accent-color` on the
  palette primary. Issue 03's `LikertScale` primitive is moot.
- **All three questions required.** Submit stays enabled; a click with gaps marks each unanswered
  fieldset with an inline "Please select an answer." that clears when answered — chosen over a
  disabled button that can't say why.
- **Confirmation is an inline thank-you on the same route**, optimistic (the adapter's eventual
  `no-cors` POST is unreadable — issue 06).
- **Once per tab, survives refresh** (user): the submitted flag is `sessionStorage`, deliberately
  not the wizard answers' in-memory scope (ADR 0003) — a reload must not double-count; a new tab
  gets a fresh survey.
- **All copy beyond the §10 questions is unsourced** (title / Submit / error / thank-you) and
  flagged in styling.md §27 for a client copy pass.
- **No analytics event** (user: not yet — issue 07's "survey submit" event scope stands there).
