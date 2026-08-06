# 19 — Landing background video

Status: done
Phase: 4

## Outcome

`Landing` owns a `fixed inset-0 -z-10` backdrop — `<video>` under the `bg-page-landing`
gradient; `AppShell` paints `bg-page` unconditionally. Derived assets committed, ffmpeg recipe
in `docs/styling.md` §7; the loop is a ping-pong (ADR 0002); `prefers-reduced-motion: reduce`
mounts no `<video>`. Open: the designer has not supplied a clean-looping clip
(`docs/styling.md` §9 item 8), and the gradient/footage composite was measured, not confirmed.
