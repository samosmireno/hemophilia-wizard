import { useCallback, useMemo, useState, type ReactNode } from "react";

import {
  NO_ANSWERS,
  WizardAnswersContext,
  isComplete,
  readStoredAnswers,
  writeStoredAnswers,
  type WizardAnswers,
  type WizardAnswersValue,
} from "./wizardAnswers";

export function WizardAnswersProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<WizardAnswers>(readStoredAnswers);

  const update = useCallback((next: WizardAnswers) => {
    writeStoredAnswers(next);
    setAnswers(next);
  }, []);

  const value = useMemo<WizardAnswersValue>(
    () => ({
      answers,
      setAnswer: (key, answer) => update({ ...answers, [key]: answer }),
      reset: () => update(NO_ANSWERS),
      complete: isComplete(answers),
    }),
    [answers, update],
  );

  return <WizardAnswersContext value={value}>{children}</WizardAnswersContext>;
}
