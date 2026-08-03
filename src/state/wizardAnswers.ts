import { createContext, useContext } from "react";

import type { SwitchReason, WizardHemophiliaType } from "../data/wizard";

/**
 * The three patient characteristics `/wizard` collects, held for the browsing
 * session. See `docs/adr/0003-session-scoped-wizard-answers.md` for why they
 * live here rather than in the route, and why `sessionStorage` rather than
 * memory or a URL.
 *
 * The provider itself is the one thing NOT here: it is a component, and
 * `react-refresh` wants a module that exports one to export nothing else. It
 * lives in `WizardAnswersProvider.tsx` and reads the store through the two
 * helpers below.
 *
 * **Answers only.** The wizard's *result* is not stored: `recommend()` is a pure
 * function of these three fields over data that ships in the bundle, so every
 * consumer derives it. A stored result could disagree with `wizard.ts` after a
 * deploy — a tab left open across one would render last week's curated agent
 * list, which is clinical content.
 */
export interface WizardAnswers {
  type: WizardHemophiliaType | null;
  hasInhibitors: boolean | null;
  reason: SwitchReason | null;
}

/** The same shape once all three questions are answered. */
export type CompleteWizardAnswers = {
  [K in keyof WizardAnswers]: NonNullable<WizardAnswers[K]>;
};

const EMPTY: WizardAnswers = { type: null, hasInhibitors: null, reason: null };

/**
 * Versioned so a shape change cannot be read back as the old one. Bump the
 * suffix rather than migrating: a session's answers are three clicks to redo,
 * and the alternative is migration code for data with a lifetime of one tab.
 */
export const ANSWERS_STORAGE_KEY = "hemophilia-wizard:answers:v1";

/** Narrowing guard: all three answered, so `recommend()` can be called. */
export function isComplete(answers: WizardAnswers): answers is CompleteWizardAnswers {
  return answers.type !== null && answers.hasInhibitors !== null && answers.reason !== null;
}

const REASONS: SwitchReason[] = ["bleeding-control", "adherence", "treatment-burden", "monitoring"];

/**
 * Read the stored answers, treating anything unrecognised as absent.
 *
 * Every field is validated rather than trusted. `sessionStorage` is writable by
 * anything running on the origin and survives a deploy, so the parse has to
 * assume the value was written by a different version of this file — an unknown
 * `reason` string would otherwise reach `RECOMMENDATIONS[scenario][reason]` and
 * index it to `undefined`.
 *
 * Wrapped in try/catch for the storage access itself, not just the parse:
 * reading `sessionStorage` throws outright in a browser with cookies blocked,
 * and losing the wizard is a better failure than losing the app.
 */
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
      reason: REASONS.includes(reason as SwitchReason) ? (reason as SwitchReason) : null,
    };
  } catch {
    return EMPTY;
  }
}

/** Persist, or give up silently — see `readStoredAnswers` on why this can throw. */
export function writeStoredAnswers(answers: WizardAnswers) {
  try {
    sessionStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(answers));
  } catch {
    /* Private-mode or blocked storage: the in-memory state still works. */
  }
}

export interface WizardAnswersValue {
  answers: WizardAnswers;
  /** Set one answer, or clear it with `null` — the deselect gesture. */
  setAnswer: <K extends keyof WizardAnswers>(key: K, value: WizardAnswers[K]) => void;
  /** Clear all three. No control calls this yet; see the ADR. */
  reset: () => void;
  complete: boolean;
}

/** Exported for the provider alone — consumers use `useWizardAnswers`. */
export const WizardAnswersContext = createContext<WizardAnswersValue | null>(null);

/** The empty set of answers, and what `reset()` restores. */
export const NO_ANSWERS = EMPTY;

/**
 * Throws outside the provider rather than falling back to empty answers: every
 * consumer is mounted under `AppShell`, so a missing provider is a wiring
 * mistake, and a silent empty default would surface as a guarded page that
 * always redirects.
 */
export function useWizardAnswers(): WizardAnswersValue {
  const value = useContext(WizardAnswersContext);
  if (!value) throw new Error("useWizardAnswers must be used within a WizardAnswersProvider");
  return value;
}
