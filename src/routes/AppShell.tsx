import { Outlet } from "react-router";

import { WizardAnswersProvider } from "../state/WizardAnswersProvider";
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
 * The padding is the app's, not any one page's, and every value in it that came
 * from somewhere else is a token rather than a number (docs/styling.md §12).
 * The design puts content `--spacing-gutter` (112px) from the left edge on its
 * 1440-wide canvas and every page inherits that here; the right side adds
 * `--spacing-rail` on top, which is what stops the content column clear of the
 * rail. Both are `lg:` only — 112px of a 375px phone would leave 151px of text,
 * so below that the gutter is an invented comfort value (32px, 48px at `sm`)
 * and stays a plain utility, because no design canvas exists down there to
 * transcribe.
 *
 * The vertical padding is clearance for chrome, not page rhythm: the top clears
 * `TopRule`'s band (`--spacing-below-rule` = the band + the designer's 16px, or
 * 32px at `lg`), and the bottom clears the sidebar's bottom bar
 * (`--spacing-bar`), which is not there at `lg` where the rail takes over. Page
 * rhythm proper is NOT here — it differs per page (see
 * `education/DiseaseBackground`) and the shell holds no route knowledge.
 *
 * `max-w-content` caps the measure. Fixed gutters alone give the content column
 * no upper bound, so on a wide monitor a chapter's prose would just keep
 * growing; the cap is the column's width at the design canvas, so nothing moves
 * at or below 1440 and the column centres above it. It lives on a wrapper
 * because `<main>`'s own padding is what clears the fixed chrome, and those two
 * jobs want different boxes. The wrapper is `flex flex-1 flex-col` so that a
 * page opting into vertical centring still sees a growing flex parent.
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
    /*
      The wizard's three answers are held here, above BOTH `<main>` and the
      sidebar — the sidebar needs them to know whether Next may leave `/wizard`,
      and the wizard's own three routes need them to outlive a detour to
      `/glossary`. This layout route never unmounts, which is what makes that
      work (the same property `AppSidebar`'s `lastSpinePath` ref relies on).

      It is the one piece of route knowledge in the shell, and it is deliberate
      rather than a lapse of the rule the backdrop comment below states: a
      provider is not a branch on `pathname`, it holds no wizard logic, and every
      alternative placement puts it below one of its two consumers. See
      `docs/adr/0003-session-scoped-wizard-answers.md`.
    */
    <WizardAnswersProvider>
      <div
        aria-hidden="true"
        data-page-backdrop="default"
        className="fixed inset-0 -z-10 bg-page"
      />
      <main className="flex min-h-dvh flex-col px-8 pt-below-rule pb-bar sm:px-12 lg:px-gutter lg:pt-below-rule-lg lg:pr-gutter-rail lg:pb-0">
        <div className="mx-auto flex w-full max-w-content flex-1 flex-col">
          <Outlet />
        </div>
      </main>
      <AppSidebar />
    </WizardAnswersProvider>
  );
}
