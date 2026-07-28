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
import { useLocation, useNavigate } from "react-router";

import { SECTION_ORDER, nextOf, prevOf, type SectionPath } from "../data/sectionOrder";

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
 * Note the jump items are *buttons*, not links — `SidebarItem` takes an
 * `onClick`, not an `href`, so there is no cmd-click / open-in-new-tab.
 * Tracked in `.scratch/mlg-reskin/issues/06-package-debts.md`.
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
  // Off the spine Prev always has somewhere to go — the remembered step, or the
  // `/` it is seeded with — so it is only ever dead at the head of the
  // walkthrough. Deciding it this way also keeps the ref out of render, where
  // reading it would be unsound under concurrent rendering.
  const backDisabled = onSpine && spineBack === undefined;

  const items: SidebarItem[] = JUMP_TARGETS.map(({ path, label, Icon }) => ({
    icon: <Icon />,
    label,
    // The current page's own button is dimmed and inert. `active` still sets
    // `aria-current="page"`: a disabled button leaves the tab order, so without
    // it a keyboard or screen-reader user would never meet the "you are here".
    active: pathname === path,
    disabled: pathname === path,
    onClick: () => void navigate(path),
  }));

  return (
    <Sidebar
      items={items}
      onBack={() => {
        const target = onSpine ? spineBack : lastSpinePath.current;
        if (target) void navigate(target);
      }}
      onFront={() => {
        if (front) void navigate(front);
      }}
      backDisabled={backDisabled}
      frontDisabled={front === undefined}
    />
  );
}
