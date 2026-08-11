# 06 — Survey submission adapter seam + stub

Status: done (2026-08-11) — seam shipped and wired to the live Form
Phase: 0

## Goal

Build survey submission as a pluggable `submitSurvey(responses): Promise<void>` adapter with a
no-op stub, so swapping the real target later touches one file.

## Done

`src/lib/submitSurvey.ts`, called only by `Survey.tsx` (issue 13). `SurveyResponses` is
`Record<SurveyQuestionId, string>` in `src/data/survey.ts` — the option label verbatim.

**The destination decision landed 2026-08-11 (user): Google Form → linked Sheet.** Row-level and
timestamped, client-readable, the Forms Responses tab charts the distributions for free, and no
deployed code artifact to own. Rejected: GA4 (aggregate-only, ad-blocker-lossy, needs custom
dimensions registered before answers are even visible), Apps Script (a deployment to own for a
readable-response advantage that three fixed-choice answers don't need), form-backend services
(paid tier at CME volumes), Firestore (client can't read the console).

## Wired (2026-08-11)

The Form exists ("HM-85L Hemophilia Treatment Wizard — Outcomes Survey",
`e/1FAIpQLSdu_UpSaNkYniW-5CqcfhReX-bIUh_GID7Sh1UC6cowrYru6Q`) and the adapter POSTs its three
`entry.NNNN` fields `mode: "no-cors"`; ids were read off the form's public HTML, and
`submitSurvey.test.ts` pins the mapping. The response is opaque by design, so the UI's
confirmation stays optimistic (issue 13). The Form is now load-bearing: structural edits mint
new entry ids silently; option-text edits are id-safe but must mirror `survey.ts` verbatim.

## Remaining

One manual end-to-end check: submit from `npm run dev`, confirm the row lands in the linked
Sheet (also proves "collect email addresses" is off). No test submission has been sent.

~~Option-case mismatch~~ — fixed on the Form 2026-08-11 ("Strongly disagree" now lowercase on
both Likert questions; re-verified against the live form, entry ids unchanged).
