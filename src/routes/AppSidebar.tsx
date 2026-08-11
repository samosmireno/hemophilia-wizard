import { useEffect, useRef } from "react";
import { Sidebar, type SidebarItem } from "mlg-components";
import { Link, useLocation, useNavigate } from "react-router";

import { isSpinePath, nextOf, prevOf, type SectionPath } from "../data/sectionOrder";
import { useWizardAnswers } from "../state/wizardAnswers";
import { JUMP_TARGETS } from "./jumpTargets";

export default function AppSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const lastSpinePath = useRef<SectionPath>("/");
  useEffect(() => {
    if (isSpinePath(pathname)) lastSpinePath.current = pathname;
  }, [pathname]);

  const onSpine = isSpinePath(pathname);
  // Off the spine, Prev means "back into the walkthrough" and Next means
  // nothing — the reference pages have no successor.
  const spineBack = onSpine ? prevOf(pathname) : undefined;
  const front = onSpine ? nextOf(pathname) : undefined;

  const { complete: wizardComplete } = useWizardAnswers();
  const gatedByWizard = pathname === "/wizard" && !wizardComplete;
  const backDisabled = onSpine && spineBack === undefined;

  const items: SidebarItem[] = JUMP_TARGETS.map(({ path, label, Icon }) => ({
    icon: <Icon />,
    label,
    active: pathname === path,
    disabled: pathname === path,
    render: (props) => <Link to={path} {...props} />,
  }));

  return (
    // The breakpoint is deliberately left unset — tokens.css mirrors the 64rem
    // default in a media query; passing a custom value silently desyncs the two.
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
