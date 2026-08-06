export interface SurveyQuestion {
  id: string;
  prompt: string;
  options: string[];
}

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
