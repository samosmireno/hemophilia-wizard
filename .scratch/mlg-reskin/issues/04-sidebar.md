# 04 — Sidebar chrome → brand palette

Status: done (2026-07-28)

## Outcome

`--color-ui-sidebar-bg` → `teal-100`, plus a `@media (width < 64rem)` override flipping
`--color-ui-navbar-ring` to white (values in `src/styles/tokens.css`). Closed together with
app-buildout issue 18. **No Figma export of the rail or bar ever arrived** — the value is
inferred; re-check it against this issue's contrast table if one is ever supplied.

Two findings that shaped it: `SidebarRail` paints **no background**, so the token is
bottom-bar-only and the rail's rings resolve against the _page_; and `PopupButton` is not in
the `Sidebar` at all. No single ground value passed every ring, hence the breakpoint-aware
ring — which resolved issue 02's blocker with no package release. Known limit: `64rem` in CSS
must track `Sidebar`'s JS breakpoint, and nothing enforces it.
