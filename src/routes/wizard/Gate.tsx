import { Navigate, Outlet } from "react-router";

import { useWizardAnswers } from "../../state/wizardAnswers";

export default function WizardGate() {
  const { complete } = useWizardAnswers();

  if (!complete) return <Navigate to="/wizard" replace />;

  return <Outlet />;
}
