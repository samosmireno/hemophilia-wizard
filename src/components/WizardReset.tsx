import { Button } from "mlg-components";

import { useWizardAnswers } from "../state/wizardAnswers";
import { WIZARD_BUTTON_SKIN } from "./wizardButton";

/**
 * The "Reset inputs" control at the left end of `/wizard`'s Submit row, under
 * Submit where the row stacks (client ask, 2026-08-25). One click, no are-you-sure — the answers are three radio
 * picks, cheap to redo (a prompt was built and removed the same day on client
 * direction). It clears all three answers, not the two on screen: a reason held
 * from an earlier run would otherwise survive a reset and re-open the leaf's
 * gate the moment the patient questions were answered again. Disabled while
 * there is nothing to clear — by the same "anything at all" test, so a hidden
 * reason alone still counts.
 *
 * `type="button"` is stated even though the package defaults to it: inside a
 * form a bare button submits, and a native `type="reset"` would clear the
 * radios without touching the state they mirror.
 */
export default function WizardReset() {
  const { answers, reset } = useWizardAnswers();

  const anythingToClear = Object.values(answers).some((answer) => answer !== null);

  return (
    <Button
      type="button"
      disabled={!anythingToClear}
      className={WIZARD_BUTTON_SKIN}
      onClick={reset}
    >
      Reset inputs
    </Button>
  );
}
