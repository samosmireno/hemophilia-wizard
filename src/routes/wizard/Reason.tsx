import { useNavigate } from "react-router";

import OptionGroup from "../../components/OptionGroup";
import PageSection from "../../components/PageSection";
import WizardSubmit from "../../components/WizardSubmit";
import { nextOf } from "../../data/sectionOrder";
import {
  REASON_CHOICES,
  WIZARD_INPUT_TITLE,
  WIZARD_QUESTIONS,
  type SwitchReason,
} from "../../data/wizard";
import { trackWizardSubmit } from "../../lib/analytics";
import { isComplete, useWizardAnswers } from "../../state/wizardAnswers";

/**
 * The reason question, split out of `/wizard` on client direction (2026-08-12)
 * so the scenario's class screen comes between the patient questions and the
 * reason — the blueprint's own order (CONTEXT.md §4). It wears `/wizard`'s
 * title: the two screens are halves of one intake form, and the client
 * artboard names no other.
 */
export default function Reason() {
  const { answers, setAnswer, complete } = useWizardAnswers();
  const navigate = useNavigate();

  const next = nextOf("/wizard/reason")!;

  return (
    <PageSection title={WIZARD_INPUT_TITLE}>
      <form
        className="mt-20"
        onSubmit={(event) => {
          event.preventDefault();
          // The type guard, not `complete` — the tracker needs the narrowing.
          if (!isComplete(answers)) return;
          trackWizardSubmit(answers);
          void navigate(next);
        }}
      >
        <OptionGroup
          legend={WIZARD_QUESTIONS.reason}
          name="switch-reason"
          options={REASON_CHOICES}
          value={answers.reason}
          onChange={(reason: SwitchReason | null) => setAnswer("reason", reason)}
        />

        <WizardSubmit open={complete} />
      </form>
    </PageSection>
  );
}
