# 06 — mlg-components package debts

Status: ready-for-human

## Goal

The live ledger of `mlg-components` limitations found while building against it. We own the
repo (`github.com/samosmireno/mlg-components`); each entry is a package change. None blocked
the work — all were accepted deliberately, and are recorded so they are known debt rather than
oversight. This app is on `^0.5.0`.

## Resolved in v0.5.0 (2026-07-28)

- **Debt 1 — `SidebarItem` had no `href`**, so jump targets rendered as buttons. Fixed by
  making the control polymorphic: `href` → `<a>`, `render(props)` → whatever you return,
  precedence `render` > `href` > `onClick`, `disabled` forcing `<button disabled>`. **App
  migrated** — `AppSidebar` returns a react-router `<Link>` per target, so
  Glossary/Acronyms/References open in a second tab; Prev/Next stay `onClick` (actions, not
  destinations).
- **Debt 3 — `active`'s JSDoc described behaviour it did not have.** Comment corrected to
  match the code and to point at the `disabled` pairing the app uses.
- **Debt 4 — `Sidebar` had no styling escape hatch.** New `--spacing-ui-sidebar-gap` token
  (this app overrides it to `0.5rem`). Rail padding and offsets are still hardcoded and there
  is no `classNames` slot object; add one only when a consumer needs more than the gap.

## 2. `active` has no visual treatment — half-open

The **mechanism shipped** in v0.5.0: `NavBarButton` carries
`aria-[current=page]:bg-ui-navbar-bg-current` / `-text-ui-navbar-fg-current`. But both tokens
**default to the resting fill**, so the state is invisible until someone sets them — and
**the current-page colours have never been chosen**. That is a Figma question nobody has
answered.

Until then the app keeps the `disabled`-dimming workaround (which conflates "you are here"
with "unavailable" and drops the item from the tab order, leaving `aria-current` as the only
cue). **Decision 2026-07-28: leave the current item disabled; revisit only with a design.**

## 5. `Button` has no `href` / `render` — OPEN

`ButtonProps` is still `ButtonHTMLAttributes<HTMLButtonElement>` and the component always
renders `<button type="button">`. So the landing hero's **LET'S GET STARTED** — a destination —
announces as a button, with no cmd-click, new-tab or copy-link. Workaround in
`src/routes/Landing.tsx`: `<Button onClick={() => navigate(next)}>`. Fix is debt 1's shape,
reused verbatim; `NavBarButtonProps` is the model.

## 6. `NavArrowButton` and `Button` are not `forwardRef` — OPEN

`ref` does not typecheck on either (`tsc -b` fails), so **focus management between chained
cards is impossible** — the `rebalancing-agents` mechanisms click-through steps between two
cards inside one `<dialog>`, unmounting the focused control. Shipped relying on the browser's
own behaviour: focus drops to `<body>` (measured in Chrome), the document is already inert, so
the next Tab lands on the new card's control. Degraded, not trapped. Two prop types gain
`ref`, or all four non-forwarding components in one pass. Also `docs/styling.md` §9 item 18.

## 7. The `disabled` opacity flip is untransitioned — OPEN (2026-08-06)

All four buttons carry `disabled:opacity-ui-disabled` and none has `opacity` in its
`transition-[…]` list, so becoming available snaps where every hover and press eases. Fix is
one word per component (`Button`, `NavArrowButton`, `NavBarButton`, `PopupButton`); the 120ms
duration and easing are already right.

The app worked around it for `Button` only — `/wizard`'s Submit restates the package's
transition list plus `opacity` via `className` (commit `cf552b3`). It could **not** do the
same for the sidebar's Next arrow: `Sidebar` renders `NavArrowButton` internally and forwards
no class, and a CSS rule into the package's DOM is the brittleness debt 4 rejected. Take the
transition-list fix in the next release; give `Sidebar` an arrow class hook only if a second
consumer needs it, per debt 4's own rule.

## Notes

Every debt here except 3 is the same family — the component decides what element or look it
renders and the consumer cannot say otherwise. When `Button` gets its `render` (debt 5), apply
it across the package in one pass rather than one component per page built; pair debt 6 with
it. Next candidate is `NavArrowButton`, whose Prev/Next become links the moment the walkthrough
gets shareable step URLs.
