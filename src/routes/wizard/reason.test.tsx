import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { nextOf } from "../../data/sectionOrder";
import {
  REASON_CHOICES,
  WIZARD_INPUT_TITLE,
  WIZARD_QUESTIONS,
  type SwitchReason,
} from "../../data/wizard";
import { seedWizardAnswers } from "../../test/setup";
import { routes } from "../router";

/**
 * Mounted through the app's `routes`, like `wizard.test.tsx`: the page sits
 * behind `ScenarioGate`, so it only exists for a session holding the two
 * patient answers. Every test seeds those; `reason: null` is the state the
 * learner arrives in.
 */
function renderReason(reason: SwitchReason | null = null) {
  seedWizardAnswers({ reason });
  const router = createMemoryRouter(routes, { initialEntries: ["/wizard/reason"] });
  render(<RouterProvider router={router} />);
  return router;
}

const at = (router: ReturnType<typeof renderReason>) => router.state.location.pathname;
const radio = (name: RegExp | string) => screen.getByRole("radio", { name });
const submit = () => screen.getByRole("button", { name: "Submit inputs" });

describe("wizard — the reason question", () => {
  /**
   * The same title as `/wizard`, on purpose: the two screens are halves of one
   * intake form split by the scenario interlude (client direction 2026-08-12),
   * and the client artboard names no other heading. Flagged for the styling
   * gate as a reused-title decision.
   */
  it("titles the page with the intake heading", () => {
    renderReason();
    const title = screen.getByRole("heading", { level: 1 });

    expect(title).toHaveAccessibleName(WIZARD_INPUT_TITLE);
    expect(title).toHaveClass("uppercase");
  });

  it("asks the reason as a named group, and neither patient question", () => {
    renderReason();

    expect(screen.getByRole("group", { name: WIZARD_QUESTIONS.reason })).toBeInTheDocument();

    for (const question of [WIZARD_QUESTIONS.type, WIZARD_QUESTIONS.inhibitors]) {
      expect(screen.queryByRole("group", { name: question })).not.toBeInTheDocument();
    }
  });

  /**
   * The reason buttons read left-to-right, top-to-bottom in the artboard's own
   * order, which is NOT `ALL_REASONS`' (the blueprint's). Asserted as DOM
   * order because that is also the tab and screen-reader order — the two must be
   * the one the design draws.
   */
  it("lays the four reasons out in the artboard's reading order", () => {
    renderReason();

    const reasons = screen
      .getByRole("group", { name: WIZARD_QUESTIONS.reason })
      .querySelectorAll("input[type=radio]");

    expect([...reasons].map((input) => (input as HTMLInputElement).value)).toEqual([
      "bleeding-control",
      "monitoring",
      "adherence",
      "treatment-burden",
    ]);
  });

  /**
   * The screen renders the artboard's imperative labels, not the source's gerunds.
   * The gerunds are literals here rather than a field read: they belong to the
   * blueprint's arch sentence, which is `wizard.ts`'s to compose and `wizard.test.ts`'s
   * to assert. What this pins is that none of the four reaches a radio.
   */
  it("labels the reasons with the artboard's wording", () => {
    renderReason();

    for (const choice of REASON_CHOICES) {
      expect(radio(choice.label)).toBeInTheDocument();
    }

    for (const gerund of [
      "Improving bleeding control",
      "Increased adherence",
      "Reduced treatment burden",
      "Reduced monitoring requirement",
    ]) {
      expect(screen.queryByRole("radio", { name: gerund })).not.toBeInTheDocument();
    }
  });

  describe("the submit gate", () => {
    it("is disabled until a reason is picked, and closes again on deselect", async () => {
      const user = userEvent.setup();
      renderReason();

      expect(submit()).toBeDisabled();

      await user.click(radio("Increase adherence"));
      expect(submit()).toBeEnabled();

      await user.click(radio("Increase adherence")); // picking the chosen option clears it
      expect(submit()).toBeDisabled();
    });

    /** The same release cue as `/wizard`'s Submit — one shared control. */
    it("announces the release with a one-shot pulse, only when the gate opens", async () => {
      const user = userEvent.setup();
      renderReason();

      expect(submit()).not.toHaveClass("animate-gate-release");

      await user.click(radio("Increase adherence"));
      expect(submit()).toHaveClass("animate-gate-release", "motion-reduce:animate-none");
    });

    it("does not pulse when the page mounts with the reason already picked", () => {
      renderReason("adherence");

      expect(submit()).toBeEnabled();
      expect(submit()).not.toHaveClass("animate-gate-release");
    });

    /** Same spine-reading assertion as `/wizard`'s: `nextOf`, not a literal. */
    it("submits to the next walkthrough step", async () => {
      const user = userEvent.setup();
      const router = renderReason();

      await user.click(radio("Increase adherence"));
      await user.click(submit());

      expect(at(router)).toBe(nextOf("/wizard/reason"));
    });
  });

  it("restores a reason stored by an earlier visit in the same session", () => {
    renderReason("monitoring");

    expect(radio("Reduce monitoring requirement")).toBeChecked();
  });
});
