# 06 — Survey submission adapter seam + stub

Status: ready-for-agent
Phase: 0
Blocked by: —

## Goal

Build survey submission as a pluggable adapter so the destination decision stays off
the critical path.

## Scope

- Define a thin `submitSurvey(responses): Promise<void>` interface.
- Ship a **console/no-op stub** implementation now.
- Swapping the real target later (Firebase / Google Form / client endpoint — Firebase
  MCP is available) must touch **one file**, no UI rework.

## Acceptance

- Survey UI (issue 13) can submit against the stub end-to-end.
- Adapter boundary documented; real-target swap is isolated.

## Notes

Destination is **not yet defined** (settled decision). This issue exists precisely so
that non-decision does not block the survey build.
