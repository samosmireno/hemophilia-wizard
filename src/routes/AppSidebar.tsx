import { useEffect, useRef } from "react";
import {
  BookIcon,
  DocumentIcon,
  HomeIcon,
  InfoIcon,
  Sidebar,
  WizardIcon,
  type SidebarItem,
} from "mlg-components";
import { Link, useLocation, useNavigate } from "react-router";

import { SECTION_ORDER, nextOf, prevOf, type SectionPath } from "../data/sectionOrder";
import { useWizardAnswers } from "../state/wizardAnswers";

/**
 * The app's persistent navigation (issue 18), implementing the linear
 * walkthrough of `docs/adr/0001-linear-walkthrough-navigation.md`.
 *
 * `Sidebar` owns its own fixed positioning and picks its layout itself: a
 * bottom-right rail at >=1024px, a full-width bottom bar below that (items
 * collapse into a "More" popover under 640px). The breakpoint is the
 * component's `breakpoint` default — deliberately left unset, because
 * `src/styles/tokens.css` mirrors it in a media query to flip the focus-ring
 * colour for the bar. Passing a custom value here would silently desync the two.
 *
 * The jump items render as real `<Link>`s via `SidebarItem.render` (added in
 * mlg-components 0.5.0), so cmd-click and "open in new tab" work — Glossary,
 * Acronyms and References are exactly the pages a learner wants in a second tab
 * while working the wizard. `render` rather than `href` because a bare anchor
 * would reload the whole app instead of navigating client-side.
 *
 * The Prev/Next arrows stay `onClick` handlers: they are actions computed from
 * the current position, not addressable destinations.
 */

/** The five always-visible jump targets, in rail order (top to bottom). */
const JUMP_TARGETS = [
  { path: "/", label: "Home", Icon: HomeIcon },
  { path: "/wizard", label: "Wizard", Icon: WizardIcon },
  { path: "/acronyms", label: "Acronyms", Icon: BookIcon },
  { path: "/references", label: "References", Icon: DocumentIcon },
  { path: "/glossary", label: "Glossary", Icon: InfoIcon },
] as const;

function isSpinePath(path: string): path is SectionPath {
  return (SECTION_ORDER as readonly string[]).includes(path);
}

export default function AppSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  /**
   * The last walkthrough step visited, so Prev can return to it from an
   * off-line reference page — the ADR's "look something up without losing your
   * place". A ref, not state: it is only read inside the Prev handler, so
   * updating it never needs to trigger a render. Seeded with `/` so a cold
   * deep-link straight to `/glossary` still has somewhere to go back to.
   *
   * This survives every client-side navigation because `AppShell` is a layout
   * route and does not unmount. It does not survive a reload — that is the
   * seeded-`/` case.
   */
  const lastSpinePath = useRef<SectionPath>("/");
  useEffect(() => {
    if (isSpinePath(pathname)) lastSpinePath.current = pathname;
  }, [pathname]);

  const onSpine = isSpinePath(pathname);
  // Off the spine, Prev means "back into the walkthrough" and Next means
  // nothing — the reference pages have no successor.
  const spineBack = onSpine ? prevOf(pathname) : undefined;
  const front = onSpine ? nextOf(pathname) : undefined;

  /**
   * The walkthrough's one gated step. `/wizard` is followed by two pages that
   * exist only for an answered scenario, so until all three answers are in,
   * Next is dead and the page's own Submit button is the way forward — the two
   * say the same thing rather than offering a gated route and an ungated one.
   *
   * This is the only route-specific fact in the sidebar, and the reason it is
   * here rather than in the pages: the arrow is the sidebar's, and a page cannot
   * disable it. See `docs/adr/0003-session-scoped-wizard-answers.md`.
   *
   * When the gate releases, the cue lives on the page's Submit button
   * (docs/styling.md §20), not here: this arrow un-dims with no transition,
   * because `Sidebar` renders its arrows internally and exposes no class hook
   * for them, and reaching in with a CSS selector is the brittleness debt 4
   * already rejected. Package change — `opacity` joining the arrows' transition
   * list — tracked as mlg-reskin debt 7.
   */
  const { complete: wizardComplete } = useWizardAnswers();
  const gatedByWizard = pathname === "/wizard" && !wizardComplete;
  // Off the spine Prev always has somewhere to go — the remembered step, or the
  // `/` it is seeded with — so it is only ever dead at the head of the
  // walkthrough. Deciding it this way also keeps the ref out of render, where
  // reading it would be unsound under concurrent rendering.
  const backDisabled = onSpine && spineBack === undefined;

  const items: SidebarItem[] = JUMP_TARGETS.map(({ path, label, Icon }) => ({
    icon: <Icon />,
    label,
    // The current page's own item is dimmed and inert. `active` still sets
    // `aria-current="page"`: a disabled button leaves the tab order, so without
    // it a keyboard or screen-reader user would never meet the "you are here".
    //
    // `disabled` also forces the button branch, so the current item is the one
    // item that is *not* a link — deliberate, since it addresses the page you
    // are already on. 0.5.0 added `--color-ui-navbar-{bg,fg}-current` as the
    // non-disabling alternative, but it needs a design decision we do not have
    // yet, so the dimming stays. See issue 06, debt 2.
    active: pathname === path,
    disabled: pathname === path,
    // No `onClick` — `Link` owns the navigation. The bottom bar's "More" menu
    // still closes itself: `Sidebar` passes its own close handler through the
    // props spread below.
    render: (props) => <Link to={path} {...props} />,
  }));

  return (
    <Sidebar
      items={items}
      onBack={() => {
        const target = onSpine ? spineBack : lastSpinePath.current;
        if (target) void navigate(target);
      }}
      onFront={() => {
        if (front && !gatedByWizard) void navigate(front);
      }}
      backDisabled={backDisabled}
      frontDisabled={front === undefined || gatedByWizard}
    />
  );
}
