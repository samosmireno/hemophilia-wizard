import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SURVEY_QUESTIONS } from "../data/survey";
import { submitSurvey } from "../lib/submitSurvey";
import Survey from "./Survey";

vi.mock("../lib/submitSurvey", () => ({
  submitSurvey: vi.fn(() => Promise.resolve()),
}));

/** A router because the thank-you's "Back to home" navigates; the stub `/`
 *  keeps the test off the real landing page's video and data. */
function renderSurvey() {
  const router = createMemoryRouter(
    [
      { path: "/survey", element: <Survey /> },
      { path: "/", element: <h1>Home stub</h1> },
    ],
    { initialEntries: ["/survey"] },
  );
  const view = render(<RouterProvider router={router} />);
  return { router, ...view };
}

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
    renderSurvey();
    for (const question of SURVEY_QUESTIONS) {
      expect(group(question.prompt).getAllByRole("radio")).toHaveLength(question.options.length);
    }
  });

  it("keeps Submit disabled until every question is answered", async () => {
    const user = userEvent.setup();
    renderSurvey();
    const submit = screen.getByRole("button", { name: "Submit" });

    for (const question of SURVEY_QUESTIONS) {
      // Disabled with zero answers, and still disabled with one gap left.
      expect(submit).toBeDisabled();
      await user.click(group(question.prompt).getByRole("radio", { name: question.options[0] }));
    }

    expect(submit).toBeEnabled();
    expect(submitSurvey).not.toHaveBeenCalled();
  });

  it("submits the answers through the adapter and swaps to the thank-you", async () => {
    const user = userEvent.setup();
    renderSurvey();

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
    const { unmount } = renderSurvey();

    await answerAll(user);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    unmount();
    renderSurvey();

    // `sessionStorage` scoping: a refresh in this tab keeps the submitted
    // state; only a new tab (a fresh session store) gets a blank survey.
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(submitSurvey).toHaveBeenCalledTimes(1);
  });

  it("offers the way home from the thank-you", async () => {
    const user = userEvent.setup();
    const { router } = renderSurvey();

    await answerAll(user);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await user.click(screen.getByRole("button", { name: "Back to home" }));

    expect(router.state.location.pathname).toBe("/");
  });
});
