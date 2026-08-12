import { Navigate, Outlet } from "react-router";

import { useWizardAnswers } from "../../state/wizardAnswers";

/**
 * The outer gate: `/wizard/scenario` and `/wizard/reason` exist only for a
 * resolved scenario — the two patient answers. ADR 0003's double statement
 * holds at this door: the sidebar disables Next on `/wizard`, and this
 * redirects a cold deep link back to the questions.
 */
export function ScenarioGate() {
  const { scenarioComplete } = useWizardAnswers();

  if (!scenarioComplete) return <Navigate to="/wizard" replace />;

  return <Outlet />;
}

/**
 * The inner gate, nested under `ScenarioGate`: the leaf additionally needs the
 * reason. By the time this runs the patient answers exist, so the nearest
 * missing step is always the reason question — a half-complete session lands
 * on `/wizard/reason`, not back at `/wizard`.
 */
export function LeafGate() {
  const { complete } = useWizardAnswers();

  if (!complete) return <Navigate to="/wizard/reason" replace />;

  return <Outlet />;
}
