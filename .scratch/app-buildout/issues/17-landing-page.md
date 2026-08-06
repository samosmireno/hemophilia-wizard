# 17 — Landing page (`/`)

Status: done (2026-07-28)
Phase: 1

## Outcome

`/` renders the client's hero comp: backdrop (issue 19), activity code, title, one CTA to
`nextOf("/")`. Title single-sourced as `src/data/activity.ts`, imported by `education.ts`;
type ramp in `docs/styling.md` §8. The five section entry points were dropped (one CTA in the
comp, `AppSidebar` already jumps) — that acceptance line is superseded. CME framing, learning
objectives and accreditation copy remain TBD, deliberately not invented.
