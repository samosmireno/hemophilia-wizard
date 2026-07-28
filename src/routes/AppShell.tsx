import { Outlet } from "react-router";

import AppSidebar from "./AppSidebar";

/**
 * Layout route — the `<main>` landmark plus the persistent navigation shared by
 * every page, with the child route rendered into `<Outlet />`.
 *
 * `AppSidebar` (issue 18) is the real navigation and carries its own `<nav>`
 * landmark; it replaced the temporary link list issue 01 put here. It is
 * `fixed` in both its layouts, so `<main>` reserves clearance: bottom for the
 * bar (<1024px), right for the rail (>=1024px).
 *
 * `min-h-dvh flex flex-col` is what lets a page centre itself vertically: the
 * child opts in with `flex-1` (see `Landing`). A percentage height would NOT
 * work — `min-height: 100%` against a parent whose `height` is `auto` resolves
 * to zero, and `min-h-dvh` leaves the height `auto`. Border-box means the
 * padding above is *inside* that height, so the box a page grows into is the
 * area actually clear of the bar and the rail: on a phone the landing hero
 * centres above the bottom bar rather than behind it.
 *
 * Both are inert for every other route — each renders a single `<section>` that
 * does not grow, and `min-h-dvh` is a floor, not a height, so a long chapter is
 * unaffected. `Landing`'s backdrop is `fixed`, i.e. out of flow, so it is not a
 * flex item either.
 *
 * Drug sheets render as modal overlays via `?drug=<id>` on the current route.
 * Issue 10 mounts that overlay here (a sibling of `<main>`, reading the search
 * param) — the structure is kept flat so that edit is a clean addition.
 *
 * The page gradient is a decorative `fixed inset-0` layer rather than a class on
 * `<main>` or `<body>`, for two reasons (docs/styling.md §6):
 *
 * - Both gradients size their ellipse in **percentages of the painted box**. On
 *   `<main>`, a long `/education/:section` chapter would stretch it to full
 *   document height and push the second stop off-screen; `fixed inset-0` pins
 *   the geometry to the viewport whatever the content does.
 * - It sits behind the sidebar as well as the content, so the rail — which
 *   paints no background of its own (§4.5) — floats on the gradient instead of
 *   cutting a strip out of it.
 *
 * `-z-10` is load-bearing: `fixed` makes this a positioned element, which would
 * otherwise paint *over* `<main>`'s in-flow content regardless of DOM order.
 * `bg-page` is alpha, so it composites over the page canvas (white).
 *
 * This backdrop is unconditional — the shell knows nothing about routes. `/`
 * deviates by rendering its OWN backdrop (video + `bg-page-landing`) from
 * `Landing`, which lands later in DOM order and so paints over this one at the
 * same `-z-10`. That inverts the arrangement issue 01 shipped, where the shell
 * branched on `pathname === "/"`: a route-specific fact does not belong in a
 * layout component, and keeping it here would have put a 1.9 MB video import in
 * the module graph of every route that never shows it. See issue 19.
 */
export default function AppShell() {
  return (
    <>
      <div
        aria-hidden="true"
        data-page-backdrop="default"
        className="fixed inset-0 -z-10 bg-page"
      />
      <main className="flex min-h-dvh flex-col p-4 pb-20 lg:pr-24 lg:pb-4">
        <Outlet />
      </main>
      <AppSidebar />
    </>
  );
}
