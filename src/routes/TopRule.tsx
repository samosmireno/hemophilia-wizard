import { Outlet } from "react-router";

/**
 * Pathless layout route: the full-bleed crimson rule that tops every page
 * except the landing one.
 *
 * It lives in the route config rather than in `AppShell` behind a
 * `pathname === "/"` check, for the same reason the landing backdrop does —
 * "which pages get the rule" is a routing fact, and a layout component that
 * branches on the current path has to be re-read every time a route is added.
 * As a wrapper around the non-index children, the answer is visible in
 * `routes` itself: anything inside this element has the rule.
 *
 * `fixed` rather than in flow, because `AppShell`'s `<main>` is `min-h-dvh` —
 * an in-flow 14px band above it would make every page 14px taller than the
 * viewport and hand each one a scrollbar it has no content for.
 *
 * No clearance padding is needed to go with it: the rule is 14px and `<main>`
 * already opens with 16px of padding, so at scroll top it covers padding, not
 * content. Scrolled content passing beneath it is the intent — `z-30` keeps it
 * over the page (which is unpositioned, and would otherwise win on DOM order)
 * and under the sidebar's own z-40/z-50 chrome.
 *
 * 14px is the design's measurement, so it is written as `h-3.5` — that step is
 * exactly 0.875rem. `docs/styling.md` §10.
 */
export default function TopRule() {
  return (
    <>
      {/* Decorative, so there is no role to query it by — `data-top-rule` is the
          test seam, same convention as `data-page-backdrop` on the backdrops. */}
      <div
        aria-hidden="true"
        data-top-rule=""
        className="fixed inset-x-0 top-0 z-30 h-3.5 bg-brand-crimson-50"
      />
      <Outlet />
    </>
  );
}
