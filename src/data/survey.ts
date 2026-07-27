/**
 * Post-use outcomes survey.
 *
 * Source of truth: the LEFT band of the blueprint (`documents/out_raw.txt`;
 * CONTEXT.md §10). Prompts/options verbatim. The source mislabels two items
 * "Question 2" — a typo; we use clean ids q1/q2/q3.
 *
 * No `type` discriminator: q1/q2 (a shared 5-point Likert scale) and q3 (a
 * single-choice set) all render as "pick one option". Phase 1 can add a
 * discriminator if a screen needs to treat the scale specially.
 */

export interface SurveyQuestion {
  id: string;
  prompt: string;
  options: string[];
}

/** The 5-point Likert scale shared by q1 and q2. */
const LIKERT = ["Strongly agree", "Agree", "Neutral", "Disagree", "Strongly disagree"];

export const SURVEY_QUESTIONS: readonly SurveyQuestion[] = [
  {
    id: "q1",
    prompt:
      "This tool helped me better understand novel and emerging prophylaxis options for hemophilia.",
    options: LIKERT,
  },
  {
    id: "q2",
    prompt:
      "This tool helped me compare treatment options based on hemophilia type, inhibitor status, treatment goals, monitoring requirements, and treatment burden",
    options: LIKERT,
  },
  {
    id: "q3",
    prompt: "How do you plan to use this tool?",
    options: [
      "For general education",
      "To assist with treatment decisions",
      "During discussion with a patient",
      "I do not plan to use this tool",
    ],
  },
];
