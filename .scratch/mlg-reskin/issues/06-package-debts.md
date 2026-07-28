# 06 — mlg-components package debts

Status: ready-for-human
Blocked by: —

## Goal

Three limitations in `mlg-components` v0.4.1 found while building the real
navigation (`.scratch/app-buildout/issues/18-navigation-sidebar.md`). None
blocked that work; all were accepted deliberately and are recorded here so they
are known debt rather than oversight. Each is a package change — we own the
repo (`github.com/samosmireno/mlg-components`).

## 1. `SidebarItem` has no `href` — navigation renders as buttons

`SidebarItem` is `{ icon, label, onClick, active, disabled }`, and `itemButton`
renders `NavBarButton`, which is `<button type="button">`. So the app's five
jump targets are buttons that navigate. Consequences:

- Screen readers announce "button", not "link".
- No cmd-click / middle-click / "Open in new tab", and no status-bar URL preview.
- Nothing to copy-link-address from.

That last group matters for this app specifically: Glossary, Acronyms and
References are exactly the pages a learner would want open in a second tab
while working the wizard.

**Fix:** optional `href` on `SidebarItem`; `Sidebar` renders `<a>` when present
and `<button>` otherwise. Needs a story for router integration — a consumer on
react-router wants `<Link>` behaviour, so probably an `as`/`render` escape hatch
rather than a bare anchor.

## 2. `active` has no visual treatment

`itemButton` sets `aria-current="page"` from `active`, but `NavBarButton` has no
`aria-current:` variant in its class list — the current page's button looks
identical to every other.

The app works around this by passing `disabled: true` alongside `active: true`,
which dims the button via the package's own
`disabled:opacity-ui-disabled`. That is a genuine affordance and it is what the
design wanted, but it is a workaround: it conflates "you are here" with
"unavailable", and it drops the button out of the tab order (which is why
`active` is still passed — `aria-current` is then the only cue a keyboard or
screen-reader user gets).

**Fix:** style `aria-current="page"` on `NavBarButton` behind a new token pair
(`--color-ui-navbar-bg-current` / `-fg-current`), so consumers can mark the
current item without disabling it. Needs a Figma export — no design exists for
this state yet.

## 3. `active`'s JSDoc describes behaviour it does not have

`SidebarItem.active` is documented as:

> Marks the current page — **greys/disables the button** and sets aria-current.

It does neither of the first two. `itemButton` computes
`disabled: item.disabled || item.onClick === void 0` — `active` is not consulted.
Only `aria-current` is set.

**Fix:** either correct the comment, or make it true by implementing debt 2.
Cheapest correct move is to fix the comment now and let debt 2 change it back.

## Notes

Debts 2 and 3 are the same code path and should land together. Debt 1 is
independent and larger — it changes the component's API shape, not just its
skin.
