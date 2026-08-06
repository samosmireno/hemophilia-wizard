# 18 — Navigation sidebar (Prev/Next + jump buttons)

Status: done (2026-07-28)
Phase: 1

## Outcome

`src/routes/AppSidebar.tsx` — mlg `Sidebar` driven entirely by `sectionOrder.ts`: Prev/Next
step the spine (endpoints disabled); five jump items render as react-router `<Link>`s, the
current one a dimmed `disabled` button with `aria-current="page"`. Off-spine pages send Prev
back to the last spine step visited, else `/` (ADR 0001). Also: rail clearance in `AppShell`,
`--color-ui-sidebar-bg` + breakpoint-aware focus ring in `tokens.css`, `matchMedia` test stub.
