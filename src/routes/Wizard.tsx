import { useEffect, useRef, useState } from "react";
import { Button } from "mlg-components";
import { useNavigate } from "react-router";

import OptionGroup, { type Option } from "../components/OptionGroup";
import PageSection from "../components/PageSection";
import { trackWizardSubmit } from "../lib/analytics";
import { cn } from "../lib/cn";
import { nextOf } from "../data/sectionOrder";
import {
  HEMOPHILIA_TYPES,
  REASON_CHOICES,
  WIZARD_INPUT_TITLE,
  WIZARD_QUESTIONS,
  type SwitchReason,
  type WizardHemophiliaType,
} from "../data/wizard";
import { isComplete, useWizardAnswers } from "../state/wizardAnswers";

const INHIBITOR_OPTIONS: Option<"yes" | "no">[] = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
];

export default function Wizard() {
  const { answers, setAnswer, complete } = useWizardAnswers();
  const navigate = useNavigate();

  const prevComplete = useRef(complete);
  const [released, setReleased] = useState(false);
  useEffect(() => {
    if (complete === prevComplete.current) return;
    prevComplete.current = complete;
    setReleased(complete);
  }, [complete]);

  const next = nextOf("/wizard")!;

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

        <OptionGroup
          className="mt-6"
          legend={WIZARD_QUESTIONS.reason}
          name="switch-reason"
          options={REASON_CHOICES}
          value={answers.reason}
          onChange={(reason: SwitchReason | null) => setAnswer("reason", reason)}
        />

        <div className="mx-auto mt-8 flex max-w-110 justify-end lg:max-w-225">
          <Button
            type="submit"
            disabled={!complete}
            className={cn(
              "bg-brand-lagoon-50 px-6 leading-5 hover:bg-brand-lagoon-25 active:bg-brand-lagoon-75 max-lg:text-lg lg:px-7.5 lg:py-4.5 lg:text-2xl",
              "transition-[background-color,box-shadow,color,opacity]",
              // Re-armed per false→true flip of `complete`; `motion-reduce:animate-none`.
              released && "animate-gate-release motion-reduce:animate-none",
            )}
          >
            Submit inputs
          </Button>
        </div>
      </form>
    </PageSection>
  );
}
