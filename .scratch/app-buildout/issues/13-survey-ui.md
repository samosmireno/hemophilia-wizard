# 13 — Survey UI

Status: ready-for-human
Phase: 1
Blocked by: 00, 01, 02, 03, 06
Gate: Gate 1 (client wireframe approval)

## Goal

Build the post-use outcomes survey at `/survey`.

## Scope

- 3 Likert/usage questions (copy from CONTEXT.md) using `LikertScale` (issue 03).
- Validation + submit against the `submitSurvey` stub (issue 06).
- Confirmation / thank-you state after submit.
- Structural + semantic tokens only.

## Acceptance

- All 3 questions render; submit fires the adapter and shows confirmation.
- Real destination swap remains isolated to the adapter (issue 06).

## Notes

Accredited-CME-style outcomes survey — questions are fixed by the blueprint.
