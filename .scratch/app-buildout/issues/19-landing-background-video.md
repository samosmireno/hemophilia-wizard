# 19 — Landing background video

Status: done
Phase: 4
Blocked by: 01, 02, 18
Gate: —

## Goal

Put the client's footage behind `/` as a looping, full-viewport backdrop, with the
existing landing gradient washed over it.

## Why this is not issue 17

Issue 17 (the landing page proper) is behind Gate 1 and says in its own scope that the
hero/visual is TBD and that the page is "structural + semantic tokens only (no brand
styling)". A background video is a hero visual and it is brand styling, so folding it
into 17 would have widened a gated ticket. This is the visual layer only; 17 still owns
the page content — the shared title constant and the five section entry points — and
`Landing` keeps its `<h1>Home</h1>` placeholder until 17 runs.

## Scope

- `Landing` owns a `fixed inset-0 -z-10` backdrop: `<video>` with
  `bg-page-landing` stacked over it as a sibling element.
- `AppShell` drops its `pathname === "/"` branch and paints `bg-page`
  unconditionally. Landing's layer lands later in DOM order, so it paints over the
  shell's at the same z-index; both mount in one React commit.
- Derived assets committed (`landing-loop.mp4`, `landing-poster.jpg`); the 8.99 MB
  source is gitignored, with the ffmpeg recipe in `docs/styling.md` §7.
- The loop is a ping-pong — see `docs/adr/0002-ping-pong-landing-loop.md`.
- `prefers-reduced-motion: reduce` does not mount the `<video>` at all.

## Decisions

| #   | Decision                                                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `Landing` owns the layer, not `AppShell` — a route fact does not belong in a layout, and it keeps a 1.9 MB import out of every other route's module graph |
| 2   | Wrapper grounded `bg-white`, so the pre-video state is pixel-identical to before                                                                          |
| 3   | Ping-pong the clip; ask the designer for a clean-looping one in parallel                                                                                  |
| 4   | Honour `prefers-reduced-motion` by not mounting the video, not by pausing it                                                                              |
| 5   | Commit derived assets only; no build-time transcode (breaks the reproducibility rule in `CLAUDE.md`)                                                      |
| 6   | Backdrop only — issue 17 untouched and still gated                                                                                                        |
| 7   | Reuse `data-page-backdrop` as the test seam; behavioural tests, not attribute-exhaustive                                                                  |

## Acceptance

- [x] `/` renders the looping video with the landing gradient over it; no other route does.
- [x] Every route including `/` still gets the shell's `bg-page` layer.
- [x] Under `prefers-reduced-motion: reduce`, no `<video>` is mounted.
- [x] `npm test` green; `npm run build` type-checks clean; `npm run lint` clean.

## Notes

`src/test/setup.ts`'s `matchMedia` stub had to become query-aware. It previously answered
`true` to everything, which would have reported reduced-motion as ON in every test and
silently prevented the video from ever mounting anywhere in the suite. It now keys off
the query string, and `setReducedMotion()` sits alongside `setViewport()`.

Open: the designer has not supplied a clean-looping clip (`docs/styling.md` §9, item 8),
and the reference image's gradient/footage composite was verified by measurement rather
than confirmed by them.
