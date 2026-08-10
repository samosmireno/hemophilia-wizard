import { createContext, useContext } from "react";

import { ALL_REASONS, type SwitchReason, type WizardHemophiliaType } from "../data/wizard";

export interface WizardAnswers {
  type: WizardHemophiliaType | null;
  hasInhibitors: boolean | null;
  reason: SwitchReason | null;
}

export type CompleteWizardAnswers = {
  [K in keyof WizardAnswers]: NonNullable<WizardAnswers[K]>;
};

const EMPTY: WizardAnswers = { type: null, hasInhibitors: null, reason: null };

export const ANSWERS_STORAGE_KEY = "hemophilia-wizard:answers:v1";

export function isComplete(answers: WizardAnswers): answers is CompleteWizardAnswers {
  return answers.type !== null && answers.hasInhibitors !== null && answers.reason !== null;
}

export function readStoredAnswers(): WizardAnswers {
  try {
    const raw = sessionStorage.getItem(ANSWERS_STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY;
    const { type, hasInhibitors, reason } = parsed as Record<string, unknown>;
    return {
      type: type === "A" || type === "B" ? type : null,
      hasInhibitors: typeof hasInhibitors === "boolean" ? hasInhibitors : null,
      reason: ALL_REASONS.includes(reason as SwitchReason) ? (reason as SwitchReason) : null,
    };
  } catch {
    return EMPTY;
  }
}

export function writeStoredAnswers(answers: WizardAnswers) {
  try {
    sessionStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(answers));
  } catch {
    /* Private-mode or blocked storage: the in-memory state still works. */
  }
}

export interface WizardAnswersValue {
  answers: WizardAnswers;
  setAnswer: <K extends keyof WizardAnswers>(key: K, value: WizardAnswers[K]) => void;
  /** No control calls this yet; see the ADR. */
  reset: () => void;
  complete: boolean;
}

/** Exported for the provider alone — consumers use `useWizardAnswers`. */
export const WizardAnswersContext = createContext<WizardAnswersValue | null>(null);

export const NO_ANSWERS = EMPTY;

export function useWizardAnswers(): WizardAnswersValue {
  const value = useContext(WizardAnswersContext);
  if (!value) throw new Error("useWizardAnswers must be used within a WizardAnswersProvider");
  return value;
}

/**
 * The answers, narrowed, for the pages behind `WizardGate`. Throws rather than
 * rendering nothing: ADR 0003 states the gate twice on purpose — the sidebar
 * disables Next, and the gate redirects the URL — and neither of those is this.
 * A page reaching here without answers means both went wrong, which is a defect
 * and should read as one instead of as a blank screen.
 */
export function useCompleteWizardAnswers(): CompleteWizardAnswers {
  const { answers } = useWizardAnswers();
  if (!isComplete(answers)) {
    throw new Error("A wizard leaf rendered without answers — WizardGate should have redirected");
  }
  return answers;
}
