# 06 — mlg-components package debts

Status: ready-for-human
Blocked by: —

## Goal

Limitations in `mlg-components` v0.4.1 found while building the real
navigation (`.scratch/app-buildout/issues/18-navigation-sidebar.md`). None
blocked that work; all were accepted deliberately and are recorded here so they
are known debt rather than oversight. Each is a package change — we own the
repo (`github.com/samosmireno/mlg-components`).

**All four shipped in `mlg-components` v0.5.0 (2026-07-28)** — a minor, new API
surface, no breaking change. This app is on `^0.5.0` and has taken up all of it
except the debt 2 colours, which are a design decision that has not been made.
See [Follow-up in this app](#follow-up-in-this-app).

## 1. `SidebarItem` has no `href` — navigation renders as buttons — FIXED (v0.5.0)

`SidebarItem` is `{ icon, label, onClick, active, disabled }`, and `itemButton`
renders `NavBarButton`, which is `<button type="button">`. So the app's five
jump targets are buttons that navigate. Consequences:

- Screen readers announce "button", not "link".
- No cmd-click / middle-click / "Open in new tab", and no status-bar URL preview.
- Nothing to copy-link-address from.

That last group matters for this app specifically: Glossary, Acronyms and
References are exactly the pages a learner would want open in a second tab
while working the wizard.

**Fixed** by making the control polymorphic, with the router story the original
fix note asked for:

- `SidebarItem.href` → renders `<a>`.
- `SidebarItem.render(props)` → renders whatever you return, with the styling,
  accessible name, `aria-current` and menu-close handler passed in. This is the
  react-router path: `render: (p) => <Link to="/glossary" {...p} />`.
- Precedence is `render` > `href` > `onClick`; `disabled` overrides all three and
  forces `<button disabled>`, because a focusable click-blocked anchor is an a11y
  trap.

Two knock-on fixes this forced, both in `Sidebar`:

- `itemButton` used to compute `disabled: item.disabled || item.onClick === undefined`,
  which would have disabled every link-only item. It now treats `href` and
  `render` as activation paths too.
- The bottom bar's `pick()` returned `undefined` when an item had no `onClick`,
  so an `href`/`render` item would navigate and leave the "More" menu open behind
  it. It now always returns a handler that closes the menu.

`NavBarButton`'s props are typed against `HTMLElement` rather than
`HTMLButtonElement` so one handler type spreads onto a button, an anchor, or a
`Link` without variance errors.

## 2. `active` has no visual treatment — FIXED (v0.5.0)

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

**Fixed** — `NavBarButton` now carries
`aria-[current=page]:bg-ui-navbar-bg-current` / `-text-ui-navbar-fg-current`,
behind the token pair the original fix note specified.

The missing Figma export was the blocker, and it is sidestepped rather than
resolved: both tokens **default to the resting fill**, so the state is invisible
until someone sets them. The package ships the mechanism, not a look. This
mirrors how `--color-ui-popup-open-bg-focus` already defaults to
`-bg-hover` — an established pattern here, not a new one.

Cascade note, checked against compiled output rather than assumed: Tailwind emits
arbitrary variants after `hover:`/`active:`, and they carry equal specificity, so
the current-page fill **wins over hover and active** regardless of class order in
the source. That is the behaviour we want — hovering should not preview a page
you are already on — but it is emergent from Tailwind's ordering, so a future
Tailwind upgrade that reorders variants would silently flip it. A consumer who
wants hover back has to say so via `className`.

**Still needs the design pass:** picking the actual current-page colours is a
Figma question that has not been answered. Until it is, this app keeps the
`disabled` dimming workaround described above.

## 3. `active`'s JSDoc describes behaviour it does not have — FIXED (v0.5.0)

`SidebarItem.active` was documented as:

> Marks the current page — **greys/disables the button** and sets aria-current.

It did neither of the first two. `itemButton` computes
`disabled: item.disabled || item.onClick === void 0` — `active` is not consulted.
Only `aria-current` is set.

**Fixed** by correcting the comment to describe what the code does, and pointing
at the `disabled` pairing the app actually uses. Implementing debt 2 will change
this comment back.

## 4. `Sidebar` had no styling escape hatch — FIXED (v0.5.0)

Found while trying to tighten the rail's button spacing from the app.
`SidebarProps` has no `className`, and the composite doesn't forward one the way
`Button` / `NavArrowButton` / `PopupButton` do — so the rail's hardcoded `gap-5`
could not be overridden by a consumer at all. The only options were editing the
package or a brittle CSS rule targeting `nav[aria-label="Application navigation"]`.

**Fixed** for spacing via a new `--spacing-ui-sidebar-gap` token (default
`1.25rem`, unchanged for other consumers), consumed as `gap-ui-sidebar-gap` on
both the rail's item column and its arrow pair. This app overrides it to
`0.5rem` in `src/styles/tokens.css`. Matches the existing
`--spacing-ui-sidebar-w` pattern and documented in the package README.

Still open in the general case: this buys _spacing_ configurability only. Rail
padding (`py-5`) and offsets (`right-8 bottom-3`) are still hardcoded, and there
is no `classNames` slot object. Add one if a consumer needs more than the gap —
don't add it speculatively.

## Follow-up in this app

1. ~~**Publish** `mlg-components` 0.5.0.~~ Done 2026-07-28.
2. ~~**Bump** this app and reinstall.~~ Done — `^0.5.0`. This is what activated
   the `--spacing-ui-sidebar-gap: 0.5rem` override in `src/styles/tokens.css`,
   which until the bump was a no-op against a token the installed package did not
   define. Verified in the compiled bundle, not just asserted.
3. ~~**Migrate `AppSidebar`** to `render`.~~ Done — the five jump targets are
   `<Link>`s, so Glossary, Acronyms and References open in a second tab beside
   the wizard. The ADR's `lastSpinePath` ref and the Prev/Next arrows are
   unchanged and stay `onClick` handlers: they are actions computed from the
   current position, not addressable destinations.
4. **Reconsider the `disabled` workaround** — still open, and deliberately so.
   Dropping it for `--color-ui-navbar-{bg,fg}-current` would put the current item
   back in the tab order, but picking those colours is the Figma question from
   debt 2 that nobody has answered. **Decision 2026-07-28: leave the current item
   disabled.** Revisit only with a design.

Test fallout from step 3, handled: `sidebar.test.tsx` and `router.test.tsx`
queried jump targets by `button` role. They now split — `link()` for the four
you can go to, `button()` for the current one, which `disabled` keeps as a
button. Suite went 61 → 67, the new ones covering `href` correctness per target
and the bottom bar's "More" menu closing after a pick.

## Notes

Debts 2 and 3 were the same code path and landed together, as predicted. Debt 1
was the larger one — it changed the component's API shape, and the
router-integration story it needed is the `render` escape hatch.

Debt 4 was found and fixed after the original three were written up; it is the
same family as 1 and 2 (the composite offered no way in), which is worth noticing
if a fifth one shows up. `Sidebar` still has no general `className`/`classNames`
escape hatch — three targeted knobs now exist instead. That is the right trade
while the consumer list is one app; revisit if it grows.
