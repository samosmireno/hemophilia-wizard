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

/**
 * Holds the wizard's three answers for the session. Mounted in `AppShell`, above
 * both `<main>` and the sidebar — see `wizardAnswers.ts` for the shape and
 * `docs/adr/0003-session-scoped-wizard-answers.md` for the decision.
 *
 * Split from that module because it is the only component in it, and a module
 * that exports a component must export nothing else for fast refresh to work.
 */
export function WizardAnswersProvider({ children }: { children: ReactNode }) {
  /**
   * Lazy initializer, deliberately: `wizard/Gate` decides whether to redirect on
   * its *first* render, so the restored answers have to be in state before that
   * render happens. Restoring in an effect would paint the guarded page, bounce
   * to `/wizard`, and lose the answers it was about to honour.
   */
  const [answers, setAnswers] = useState<WizardAnswers>(readStoredAnswers);

  /**
   * Writing inside the setter rather than in an effect keeps the store a
   * consequence of the *change* — an effect would also fire on mount and write
   * back what it just read, and would write again on every StrictMode double
   * render.
   */
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
