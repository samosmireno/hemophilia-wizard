import { useState } from "react";
import { Button } from "mlg-components";
import { useNavigate } from "react-router";

import PageSection from "../components/PageSection";
import { WIZARD_BUTTON_SKIN } from "../components/wizardButton";
import { SURVEY_QUESTIONS, type SurveyQuestionId, type SurveyResponses } from "../data/survey";
import { trackSurveySubmit } from "../lib/analytics";
import { cn } from "../lib/cn";
import { submitSurvey } from "../lib/submitSurvey";

/**
 * Per-tab, survives refresh: `sessionStorage`, deliberately NOT the wizard
 * answers' in-memory session scope (ADR 0003) — a reload must not re-open a
 * survey this tab already answered, or GA-style double counting moves into the
 * Sheet instead.
 */
const SUBMITTED_KEY = "survey-submitted";

export default function Survey() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Partial<SurveyResponses>>({});
  const [submitted, setSubmitted] = useState(() => sessionStorage.getItem(SUBMITTED_KEY) !== null);

  const setAnswer = (id: SurveyQuestionId, option: string) =>
    setAnswers((prev) => ({ ...prev, [id]: option }));

  const allAnswered = SURVEY_QUESTIONS.every((q) => answers[q.id] !== undefined);

  return (
    // Last section on the spine — Prev comes from `AppSidebar`, there is no Next.
    <PageSection title="Survey" padsOwnBottom>
      {submitted ? (
        <>
          <p role="status" className="mt-8 text-lg text-black lg:text-xl">
            Thank you — your response has been submitted.
          </p>
          {/* The thank-you is the walkthrough's dead end — last spine section,
              no Next — so it offers the two moves that make sense: home, or
              back into the wizard for another patient. Navigation via the
              landing CTA's idiom: `Button` + `useNavigate`. Below `sm` the
              pair cannot share the column, so it stacks as a fit-content grid —
              one auto track sized by the wider label, both buttons stretched to
              it — rather than a wrapped flex row of ragged intrinsic widths.
              From `sm` the row fits and the buttons keep their own widths. */}
          <div className="mt-8 grid w-fit gap-4 sm:flex sm:w-auto sm:flex-wrap">
            <Button className={WIZARD_BUTTON_SKIN} onClick={() => void navigate("/")}>
              Back to home
            </Button>
            <Button className={WIZARD_BUTTON_SKIN} onClick={() => void navigate("/wizard")}>
              Back to wizard
            </Button>
          </div>
        </>
      ) : (
        <form
          className="max-w-none"
          onSubmit={(event) => {
            event.preventDefault();
            // Unreachable through the UI (Submit is disabled until complete);
            // kept so the `as SurveyResponses` cast below cannot lie.
            if (!allAnswered) return;
            // Optimistic on purpose: the adapter's eventual `no-cors` POST is
            // unreadable, so there is no failure to wait for (issue 13).
            void submitSurvey(answers as SurveyResponses);
            // Same optimism, and the only submission signal anywhere — the
            // Form's opaque response means GA alone records that these happen.
            trackSurveySubmit();
            sessionStorage.setItem(SUBMITTED_KEY, "true");
            setSubmitted(true);
          }}
        >
          {SURVEY_QUESTIONS.map((question) => {
            return (
              // `min-w-0`: a `<fieldset>` carries `min-inline-size: min-content`
              // in the UA stylesheet — without it a long prompt scrolls the
              // page sideways on a phone (same guard as `OptionGroup`).
              <fieldset key={question.id} className="mt-10 min-w-0 first:mt-8">
                <legend className="text-lg font-bold text-black lg:text-xl">
                  {question.prompt}
                </legend>

                <div className="mt-3 space-y-2.5">
                  {question.options.map((option) => (
                    <label
                      key={option}
                      className="flex w-fit cursor-pointer items-center gap-3 text-base text-black lg:text-lg"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        checked={answers[question.id] === option}
                        onChange={() => setAnswer(question.id, option)}
                        className="size-4 shrink-0 accent-brand-teal-50"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          })}

          <div className="mt-8 flex justify-end">
            {/* The wizard submit's size ramp, lagoon skin and gate verbatim
                (docs/styling.md §14, §20) — disabled until every question is
                answered, and the un-dim eases (the restated transition list
                adds `opacity` to the package's). The release pulse stays the
                wizard's own. */}
            <Button
              type="submit"
              disabled={!allAnswered}
              className={cn(
                WIZARD_BUTTON_SKIN,
                "transition-[background-color,box-shadow,color,opacity]",
              )}
            >
              Submit
            </Button>
          </div>
        </form>
      )}
    </PageSection>
  );
}
