import { useEffect, useMemo, useState, type ReactNode } from "react";

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

  /**
   * Write-through lives here, not in the setters: an effect sees the state
   * React actually committed, so the store cannot diverge from the screen, and
   * the updaters below stay pure. The mount write is deliberate — it scrubs a
   * hand-edited store back to what `readStoredAnswers` accepted.
   */
  useEffect(() => {
    writeStoredAnswers(answers);
  }, [answers]);

  const value = useMemo<WizardAnswersValue>(
    () => ({
      answers,
      // Functional, not a spread of this render's `answers`: two `setAnswer`
      // calls in one handler would otherwise both spread the same stale
      // snapshot, and the last write would win alone.
      setAnswer: (key, answer) => setAnswers((prev) => ({ ...prev, [key]: answer })),
      reset: () => setAnswers(NO_ANSWERS),
      complete: isComplete(answers),
    }),
    [answers],
  );

  return <WizardAnswersContext value={value}>{children}</WizardAnswersContext>;
}
