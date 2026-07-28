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
 * Drug sheets render as modal overlays via `?drug=<id>` on the current route.
 * Issue 10 mounts that overlay here (a sibling of `<main>`, reading the search
 * param) — the structure is kept flat so that edit is a clean addition.
 */
export default function AppShell() {
  return (
    <>
      <main className="p-4 pb-20 lg:pr-24 lg:pb-4">
        <Outlet />
      </main>
      <AppSidebar />
    </>
  );
}
