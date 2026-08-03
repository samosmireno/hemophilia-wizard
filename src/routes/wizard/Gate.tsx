import { Navigate, Outlet } from "react-router";

import { useWizardAnswers } from "../../state/wizardAnswers";

/**
 * Pathless layout route around everything past `/wizard`: the pages beyond only
 * exist for a scenario, so without three answers there is nothing to render and
 * the learner goes back to the question screen.
 *
 * This is the half of the gate that covers arriving from *outside* the app — a
 * reload, a bookmark, a pasted link. The other half is the sidebar's Next arrow,
 * which `AppSidebar` disables on `/wizard` until the answers are complete, so
 * that in-app navigation never reaches a redirect it would have to bounce off.
 * Both are needed and neither is redundant: one guards the URL, the other the
 * affordance. See `docs/adr/0003-session-scoped-wizard-answers.md`.
 *
 * `replace`, so the guarded URL does not become a back-button trap — the
 * redirect would fire again the moment the learner returned to it.
 */
export default function WizardGate() {
  const { complete } = useWizardAnswers();

  if (!complete) return <Navigate to="/wizard" replace />;

  return <Outlet />;
}
