# 06 — Survey submission adapter seam + stub

Status: ready-for-agent
Phase: 0

## Goal

Build survey submission as a pluggable `submitSurvey(responses): Promise<void>` adapter with a
no-op stub, so swapping the real target later touches one file.

## Remaining

Nothing exists — no `submitSurvey` anywhere in `src`. The destination (Firebase / Google Form /
client endpoint) is **a client decision, still not made**; this issue exists so that
non-decision does not block issue 13.
