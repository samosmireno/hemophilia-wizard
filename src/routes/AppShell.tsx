import { Link, Outlet } from "react-router";

/**
 * Layout route — semantic landmarks (`<header><nav>`, `<main>`) shared by every
 * page, with the child route rendered into `<Outlet />`.
 *
 * The nav below is a **temporary** placeholder so routes are navigable for
 * testing. The real navigation is issue 18's styled sidebar (Prev/Next + jump
 * buttons), built against the Gate-1 wireframe. Layout-only utilities here —
 * no color, no brand styling, no dependency on the design tokens (issue 02).
 *
 * Drug sheets render as modal overlays via `?drug=<id>` on the current route.
 * Issue 10 mounts that overlay here (a sibling of `<main>`, reading the search
 * param) — the structure is kept flat so that edit is a clean addition.
 */
export default function AppShell() {
  return (
    <>
      <header>
        <nav aria-label="Sections" className="flex flex-wrap gap-3 p-4">
          <Link to="/">Home</Link>
          <Link to="/education/disease-background">Disease background</Link>
          <Link to="/education/treatment-landscape">Treatment landscape</Link>
          <Link to="/education/rebalancing-agents">Rebalancing agents</Link>
          <Link to="/education/fviiia-mimetics">FVIIIa mimetics</Link>
          <Link to="/wizard">Wizard</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/survey">Survey</Link>
          <Link to="/glossary">Glossary</Link>
          <Link to="/acronyms">Acronyms</Link>
          <Link to="/references">References</Link>
        </nav>
      </header>
      <main className="p-4">
        <Outlet />
      </main>
    </>
  );
}
