import { useNavigate } from "react-router";

import OptionGroup, { type Option } from "../components/OptionGroup";
import PageSection from "../components/PageSection";
import WizardSubmit from "../components/WizardSubmit";
import { nextOf } from "../data/sectionOrder";
import {
  HEMOPHILIA_TYPES,
  WIZARD_INPUT_TITLE,
  WIZARD_QUESTIONS,
  type WizardHemophiliaType,
} from "../data/wizard";
import { useWizardAnswers } from "../state/wizardAnswers";

const INHIBITOR_OPTIONS: Option<"yes" | "no">[] = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
];

export default function Wizard() {
  const { answers, setAnswer, scenarioComplete } = useWizardAnswers();
  const navigate = useNavigate();

  const next = nextOf("/wizard")!;

  return (
    <PageSection title={WIZARD_INPUT_TITLE}>
      <form
        className="mt-20"
        onSubmit={(event) => {
          event.preventDefault();
          if (!scenarioComplete) return;
          // Nothing tracks here on purpose: `wizard_submit` needs all three
          // answers and fires from /wizard/reason; the /wizard/scenario
          // pageview is this step's completion signal (docs/analytics.md).
          void navigate(next);
        }}
      >
        <OptionGroup
          legend={WIZARD_QUESTIONS.type}
          name="hemophilia-type"
          options={HEMOPHILIA_TYPES}
          value={answers.type}
          onChange={(type: WizardHemophiliaType | null) => setAnswer("type", type)}
        />

        <OptionGroup
          className="mt-6"
          legend={WIZARD_QUESTIONS.inhibitors}
          name="inhibitors"
          options={INHIBITOR_OPTIONS}
          optionClassName="uppercase"
          value={answers.hasInhibitors === null ? null : answers.hasInhibitors ? "yes" : "no"}
          onChange={(id) => setAnswer("hasInhibitors", id === null ? null : id === "yes")}
        />

        <WizardSubmit open={scenarioComplete} />
      </form>
    </PageSection>
  );
}
