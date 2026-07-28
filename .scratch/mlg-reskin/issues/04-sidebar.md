# 04 — Sidebar chrome → brand palette

Status: done (2026-07-28)
Blocked by: 02 (resolved)

## Goal

Re-skin the rail / bottom-bar shell.

## Outcome

```css
--color-ui-sidebar-bg: var(--color-brand-teal-100); /* in @theme */

@media (width < 64rem) {
  :root {
    --color-ui-navbar-ring: var(--color-ui-white);
  }
}
```

Closed together with `.scratch/app-buildout/issues/18-navigation-sidebar.md`,
which mounted the component for real. **No Figma export of the rail or bar ever
arrived** — the value is inferred, but the inference is narrow (see below) and
every contrast consequence was measured rather than assumed.

## Three findings that reshaped the issue

### 1. The rail paints no background at all

`SidebarRail` is
`fixed right-8 bottom-3 z-50 flex w-ui-sidebar-w flex-col items-center gap-5 py-5`
— no `bg-ui-sidebar-bg`. Only `SidebarBottomBar` and its "More" popover paint
the token.

So **`--color-ui-sidebar-bg` is a bottom-bar-only token.** At >=1024px the
buttons float on the page ground and this issue's colour is not on screen. The
"judge the chrome against the buttons" framing in the original scope only
applies below the breakpoint.

### 2. `PopupButton` is not in the `Sidebar`

The spec said three focus rings resolve against the sidebar ground and
disagree about it. Only two do. The bottom bar's "More" trigger is a **bespoke
button** using `--color-ui-navbar-*`, not a `PopupButton` — `Sidebar` renders
`NavBarButton` and `NavArrowButton` and nothing else. `PopupButton`'s rings
(issue 03) resolve against whatever page mounts it, which is issue 10's drug
sheets, not this.

The two that remain are `NavBarButton` (teal-100 ring) and `NavArrowButton`
(white ring), and they still disagree — one wants a light ground, one dark.

### 3. No single ground value works — the ring had to become breakpoint-aware

Measured, against every plausible candidate (bottom bar; `!` = under 3:1):

| ground                | NavBar ring | Arrow ring | NavBar fill | Arrow fill |
| --------------------- | ----------- | ---------- | ----------- | ---------- |
| teal-100 `#0d2e26`    | ! 1.00      | 14.62      | 14.62       | 3.19       |
| teal-75 `#1a5a4c`     | ! 1.82      | 8.04       | 8.04        | ! 1.76     |
| teal-50 `#2d8a78`     | 3.49        | 4.18       | 4.18        | ! 1.09     |
| teal-0 `#eef8f6`      | 13.51       | ! 1.08     | ! 1.08      | 4.23       |
| crimson-100 `#4a0a14` | ! 1.07      | 15.62      | 15.62       | 3.41       |
| lagoon-100 `#052a32`  | ! 1.04      | 15.18      | 15.18       | 3.31       |
| pkg ink `#15295a`     | ! 1.04      | 14.03      | 14.03       | 3.06       |
| white `#ffffff`       | 14.62       | ! 1.00     | ! 1.00      | 4.58       |

Every row fails something. The cause is structural: `NavBarButton` draws its
outline with **no `outline-offset`**, so the ring lands on whatever is behind
the button — and that ground is the _page_ in the rail but
`--color-ui-sidebar-bg` in the bar. One token cannot be both.

The fix makes the ring follow the ground, using the same breakpoint the
component switches on:

- **>=1024px (rail):** ring stays teal-100 on the light page — 14.62:1.
- **<1024px (bar):** ring flips to white on the teal-100 bar — 14.62:1, which
  also matches `NavArrowButton`'s white ring, so both controls in the bar
  indicate focus identically. The "More" popover paints the same
  `--color-ui-sidebar-bg`, so it is covered too.

This works because Tailwind compiles colour utilities to a runtime `var()`
reference (`outline-color: var(--color-ui-navbar-ring)` — verified in the
compiled CSS). A **shadow** token could not be overridden this way; `@theme`
inlines those (spec constraint 1).

With the ring resolved, teal-100 clears every check in the bar: NavBar fill
14.62:1, Arrow fill 3.19:1, both rings 14.62:1.

## Why teal-100 and not something else

Teal is the primary and the direction spec decision 4 already commits the ramp
to; chrome takes the primary, not the accent. The alternative that needed no
media query was teal-50, but crimson arrows sit at 1.09:1 on it — the prev/next
pair, the highest-frequency controls in the app, would lose their silhouette.
Trading a focus bug for a legibility one is not a trade.

## Resolves issue 02's "Raised"

Issue 02 raised the vanishing `NavBarButton` focus ring as blocking this issue,
and offered two exits: a non-teal-100 ground, or a v0.4.x package fix adding
`-outline-offset-[3px]`. This took a third: keep teal-100, make the _ring_
breakpoint-aware. No package release needed.

## Known limits

- **The breakpoint is duplicated.** `64rem` in CSS must track `Sidebar`'s
  `breakpoint` prop (a JS `matchMedia`, default 1024px). `AppSidebar`
  deliberately leaves the prop unset and both sites carry a comment, but
  nothing enforces it.
- **The rail's ring passes only because the page has no background yet.** If
  `.scratch/app-buildout/issues/02-semantic-token-scaffold.md` gives the page a
  dark surface, teal-100-on-dark fails in the rail and the `outline-offset`
  package fix becomes necessary after all. Noted in that issue.
- The value is inferred. If the designer ever supplies the rail/bar export,
  re-check it against the table above rather than transcribing.

## Verification

- Compiled CSS: `--color-ui-sidebar-bg: var(--color-brand-teal-100)` in `:root`
  as a `var()` chain; the override emitted as
  `@media not all and (width>=64rem){:root{--color-ui-navbar-ring:var(--color-ui-white)}}`.
- **Coverage check returns empty** — all 38 component tokens are now overridden
  and the base ramp is entirely unreferenced. **Issue 05 is moot.**
- `npm run build`, `npm run lint`, and 61 tests all clean.

## Downstream

`.scratch/app-buildout/issues/18-navigation-sidebar.md` — done, same change.
Package limitations found on the way are in `06-package-debts.md`.
