import { useId, useState } from "react";
import { Button } from "mlg-components";
import { useNavigate } from "react-router";

import PageSection from "../components/PageSection";
import { SURVEY_QUESTIONS, type SurveyQuestionId, type SurveyResponses } from "../data/survey";
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
  const errorsId = useId();
  const [answers, setAnswers] = useState<Partial<SurveyResponses>>({});
  const [submitted, setSubmitted] = useState(() => sessionStorage.getItem(SUBMITTED_KEY) !== null);
  const [showErrors, setShowErrors] = useState(false);

  const setAnswer = (id: SurveyQuestionId, option: string) =>
    setAnswers((prev) => ({ ...prev, [id]: option }));

  return (
    // Last section on the spine — Prev comes from `AppSidebar`, there is no Next.
    <PageSection title="Survey" padsOwnBottom>
      {submitted ? (
        <>
          <p role="status" className="mt-8 text-lg text-black lg:text-xl">
            Thank you — your response has been submitted.
          </p>
          {/* The thank-you is the walkthrough's dead end — last spine section,
              no Next — so it offers the one move that makes sense. Navigation
              via the landing CTA's idiom: `Button` + `useNavigate`. */}
          <div className="mt-8">
            <Button
              className="px-6 leading-5 max-lg:text-lg lg:px-7.5 lg:py-4.5 lg:text-2xl"
              onClick={() => void navigate("/")}
            >
              Back to home
            </Button>
          </div>
        </>
      ) : (
        <form
          className="max-w-none"
          onSubmit={(event) => {
            event.preventDefault();
            if (SURVEY_QUESTIONS.some((q) => answers[q.id] === undefined)) {
              setShowErrors(true);
              return;
            }
            // Optimistic on purpose: the adapter's eventual `no-cors` POST is
            // unreadable, so there is no failure to wait for (issue 13).
            void submitSurvey(answers as SurveyResponses);
            sessionStorage.setItem(SUBMITTED_KEY, "true");
            setSubmitted(true);
          }}
        >
          {SURVEY_QUESTIONS.map((question) => {
            const invalid = showErrors && answers[question.id] === undefined;
            const errorId = `${errorsId}-${question.id}`;

            return (
              // `min-w-0`: a `<fieldset>` carries `min-inline-size: min-content`
              // in the UA stylesheet — without it a long prompt scrolls the
              // page sideways on a phone (same guard as `OptionGroup`).
              <fieldset
                key={question.id}
                className="mt-10 min-w-0 first:mt-8"
                aria-describedby={invalid ? errorId : undefined}
              >
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

                {invalid && (
                  <p id={errorId} className="mt-2 text-base font-semibold text-brand-crimson-50">
                    Please select an answer.
                  </p>
                )}
              </fieldset>
            );
          })}

          <div className="mt-8 flex justify-end">
            {/* The wizard submit's size ramp verbatim (docs/styling.md §14) —
                the package default is a fixed 26px/px-16 at every width. Skin
                stays the resting crimson; only the wizard recolours. */}
            <Button
              type="submit"
              className="px-6 leading-5 max-lg:text-lg lg:px-7.5 lg:py-4.5 lg:text-2xl"
            >
              Submit
            </Button>
          </div>
        </form>
      )}
    </PageSection>
  );
}
