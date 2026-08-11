import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SURVEY_QUESTIONS } from "../data/survey";
import { submitSurvey } from "../lib/submitSurvey";
import Survey from "./Survey";

vi.mock("../lib/submitSurvey", () => ({
  submitSurvey: vi.fn(() => Promise.resolve()),
}));

const ERROR = "Please select an answer.";

/** The fieldset named by a question's prompt — the two Likert questions share
 *  every option label, so radios are only unambiguous inside their group. */
const group = (prompt: string) => within(screen.getByRole("group", { name: prompt }));

async function answerAll(user: ReturnType<typeof userEvent.setup>) {
  for (const question of SURVEY_QUESTIONS) {
    await user.click(group(question.prompt).getByRole("radio", { name: question.options[0] }));
  }
}

beforeEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
});

describe("Survey", () => {
  it("renders each question as a radio group with its options", () => {
    render(<Survey />);
    for (const question of SURVEY_QUESTIONS) {
      expect(group(question.prompt).getAllByRole("radio")).toHaveLength(question.options.length);
    }
  });

  it("marks every unanswered question on submit and sends nothing", async () => {
    const user = userEvent.setup();
    render(<Survey />);

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(screen.getAllByText(ERROR)).toHaveLength(SURVEY_QUESTIONS.length);
    expect(submitSurvey).not.toHaveBeenCalled();
    // Still the form, not the thank-you.
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("clears a question's error the moment it is answered", async () => {
    const user = userEvent.setup();
    render(<Survey />);
    const [first] = SURVEY_QUESTIONS;

    await user.click(screen.getByRole("button", { name: "Submit" }));
    await user.click(group(first.prompt).getByRole("radio", { name: first.options[0] }));

    expect(screen.getAllByText(ERROR)).toHaveLength(SURVEY_QUESTIONS.length - 1);
  });

  it("submits the answers through the adapter and swaps to the thank-you", async () => {
    const user = userEvent.setup();
    render(<Survey />);

    await answerAll(user);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(submitSurvey).toHaveBeenCalledExactlyOnceWith({
      q1: SURVEY_QUESTIONS[0].options[0],
      q2: SURVEY_QUESTIONS[1].options[0],
      q3: SURVEY_QUESTIONS[2].options[0],
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Thank you — your response has been submitted.",
    );
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("keeps the thank-you across a remount in the same tab", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Survey />);

    await answerAll(user);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    unmount();
    render(<Survey />);

    // `sessionStorage` scoping: a refresh in this tab keeps the submitted
    // state; only a new tab (a fresh session store) gets a blank survey.
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(submitSurvey).toHaveBeenCalledTimes(1);
  });
});
