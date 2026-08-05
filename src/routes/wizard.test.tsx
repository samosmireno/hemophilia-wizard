import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { nextOf } from "../data/sectionOrder";
import {
  CLASSES_TO_CONSIDER,
  SWITCH_REASONS,
  WIZARD_INPUT_TITLE,
  WIZARD_QUESTIONS,
} from "../data/wizard";
import { seedWizardAnswers } from "../test/setup";
import { routes } from "./router";

/**
 * Mounted through the app's own `routes` rather than as a bare component, unlike
 * `wizardIntro.test.tsx`: the answers live in a provider in `AppShell` and the
 * pages beyond are guarded by a layout route, so the wiring under test only
 * exists when the real tree is rendered.
 */
function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

const at = (router: ReturnType<typeof renderAt>) => router.state.location.pathname;
const radio = (name: RegExp | string) => screen.getByRole("radio", { name });
const submit = () => screen.getByRole("button", { name: "Submit inputs" });

/** Answer all three questions through the UI, as a learner would. */
async function answerAll(user: ReturnType<typeof userEvent.setup>) {
  await user.click(radio("Hemophilia B"));
  await user.click(radio("Yes"));
  await user.click(radio("Increase adherence"));
}

describe("wizard — patient characteristics", () => {
  it("titles the page with the artboard's heading, uppercased in CSS", () => {
    renderAt("/wizard");
    const title = screen.getByRole("heading", { level: 1 });

    expect(title).toHaveAccessibleName(WIZARD_INPUT_TITLE);
    expect(title).toHaveClass("uppercase");
  });

  it("asks the three questions as named groups", () => {
    renderAt("/wizard");

    for (const question of Object.values(WIZARD_QUESTIONS)) {
      expect(screen.getByRole("group", { name: question })).toBeInTheDocument();
    }
  });

  /**
   * The reason buttons read left-to-right, top-to-bottom in the artboard's own
   * order, which is NOT `SWITCH_REASONS`' (the blueprint's). Asserted as DOM
   * order because that is also the tab and screen-reader order — the two must be
   * the one the design draws.
   */
  it("lays the four reasons out in the artboard's reading order", () => {
    renderAt("/wizard");

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

  /** The screen renders the artboard's imperative labels, not the source's gerunds. */
  it("labels the reasons with the artboard's wording", () => {
    renderAt("/wizard");

    for (const reason of SWITCH_REASONS) {
      expect(radio(reason.label)).toBeInTheDocument();
      expect(screen.queryByRole("radio", { name: reason.sourceLabel })).not.toBeInTheDocument();
    }
  });

  /** YES/NO is the artboard shouting, so it is a class — the copy stays Yes/No. */
  it("shouts the inhibitor answers in CSS, not in the copy", () => {
    renderAt("/wizard");

    expect(radio("Yes").closest("label")).toHaveClass("uppercase");
  });

  /**
   * Submit is right-aligned to the pill grid rather than to the content column,
   * so its box has to carry whatever cap `OptionGroup` gives itself — at every
   * step of the responsive pass, not just at the canvas. Asserted against the
   * group's own classes rather than against the literals, because the claim is
   * that the two agree, and a hard-coded pair would keep passing after one of
   * them moved (docs/styling.md §14).
   */
  it("aligns Submit to the pill grid at both steps of the cap", () => {
    renderAt("/wizard");
    const group = screen.getByRole("group", { name: WIZARD_QUESTIONS.type });
    const row = submit().parentElement!;

    for (const cap of ["max-w-110", "lg:max-w-225"]) {
      expect(group).toHaveClass(cap);
      expect(row).toHaveClass(cap);
    }
  });

  /**
   * Submit's type is stated at BOTH ends on purpose, and the `lg:` half is the
   * newer one. `Button`'s own `text-[26px]` is what the artboard draws, but it
   * is **px**, so once §19 started scaling the board above 1440 it was the one
   * size on this page the root step could not reach — the +2px this button is
   * drawn with over the option pills measured −10 at 1.5×. `lg:text-2xl` rounds
   * the drawn 26 to 24 and buys back proportionality at every rung (§14, §19,
   * styling open item 51).
   */
  it("states Submit's type at both ends of the package's fixed size", () => {
    renderAt("/wizard");

    // All three survive the merge: a `max-*` modifier, a `lg:` modifier and a
    // bare size are three groups to tailwind-merge, so neither step evicts the
    // package value the way an unprefixed `text-*` would. What settles it in the
    // browser is source order — Tailwind emits variant rules after bare ones at
    // equal specificity, so `lg:text-2xl` wins from `lg` up and `text-[26px]`
    // never applies at any width the app ships.
    expect(submit()).toHaveClass("max-lg:text-lg", "lg:text-2xl", "text-[26px]", "leading-5");
  });

  describe("the submit gate", () => {
    it("is disabled until all three questions are answered", async () => {
      const user = userEvent.setup();
      renderAt("/wizard");

      expect(submit()).toBeDisabled();
      await user.click(radio("Hemophilia B"));
      expect(submit()).toBeDisabled();
      await user.click(radio("Yes"));
      expect(submit()).toBeDisabled();
      await user.click(radio("Increase adherence"));
      expect(submit()).toBeEnabled();
    });

    it("closes again when an answer is cleared", async () => {
      const user = userEvent.setup();
      renderAt("/wizard");
      await answerAll(user);

      await user.click(radio("Yes")); // picking the chosen option clears it

      expect(radio("Yes")).not.toBeChecked();
      expect(submit()).toBeDisabled();
    });

    /**
     * Written against `nextOf` rather than the literal `/wizard/scenario`, for
     * the reason `wizardIntro.test.tsx` gives: this is the assertion that the
     * button and the sidebar's Next arrow read one spine, and a hard-coded path
     * would pass even if the page stopped consulting the order.
     */
    it("submits to the next walkthrough step", async () => {
      const user = userEvent.setup();
      const router = renderAt("/wizard");
      await answerAll(user);

      await user.click(submit());

      expect(at(router)).toBe(nextOf("/wizard"));
    });
  });

  /**
   * The answers outlive the page — the reason they are in a provider above the
   * shell rather than in this route's own state. Going forward and coming back
   * must find the form as it was left.
   */
  it("keeps the answers when the learner leaves and returns", async () => {
    const user = userEvent.setup();
    const router = renderAt("/wizard");
    await answerAll(user);
    await user.click(submit());

    await user.click(screen.getByRole("link", { name: "Wizard" }));

    expect(at(router)).toBe("/wizard");
    expect(radio("Hemophilia B")).toBeChecked();
    expect(radio("Yes")).toBeChecked();
    expect(radio("Increase adherence")).toBeChecked();
  });

  it("restores answers stored by an earlier visit in the same session", () => {
    seedWizardAnswers({ type: "A", hasInhibitors: false, reason: "monitoring" });
    renderAt("/wizard");

    expect(radio("Hemophilia A")).toBeChecked();
    expect(radio("No")).toBeChecked();
    expect(radio("Reduce monitoring requirement")).toBeChecked();
  });
});

/**
 * The other half of the gate: the sidebar's arrow is disabled (asserted in
 * `sidebar.test.tsx`), and these two pages refuse to render for a session that
 * has no scenario — which is what a reload, a bookmark or a pasted link is.
 */
describe("wizard — the pages past the questions", () => {
  it.each(["/wizard/scenario", "/wizard/therapies"])(
    "sends a cold %s back to the questions",
    (path) => {
      const router = renderAt(path);

      expect(at(router)).toBe("/wizard");
      expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(WIZARD_INPUT_TITLE);
    },
  );

  /**
   * `seedWizardAnswers`' default is HA without inhibitors for bleeding control,
   * so the scenario page wears that screen's heading and the leaf wears that
   * reason's. Both come from the data module rather than as literals — the
   * titles are transcribed copy, and `scenario.test.tsx` / `therapies.test.tsx`
   * are where they are asserted against each branch. Here the only claim is that
   * the gate lets an answered session through.
   */
  it.each([
    ["/wizard/scenario", CLASSES_TO_CONSIDER["A-without"].title],
    ["/wizard/therapies", SWITCH_REASONS.find((r) => r.id === "bleeding-control")!.label],
  ])("renders %s for an answered session", (path, title) => {
    seedWizardAnswers();
    const router = renderAt(path);

    expect(at(router)).toBe(path);
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(title);
  });

  it("resolves junk under /wizard to the wizard, not to the landing page", () => {
    const router = renderAt("/wizard/nonsense");

    expect(at(router)).toBe("/wizard");
  });
});
