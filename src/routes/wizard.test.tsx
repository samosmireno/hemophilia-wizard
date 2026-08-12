import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { nextOf } from "../data/sectionOrder";
import { WIZARD_INPUT_TITLE, WIZARD_QUESTIONS, classesFor, leafFor } from "../data/wizard";
import { seedWizardAnswers } from "../test/setup";
import { routes } from "./router";

/**
 * Mounted through the app's own `routes` rather than as a bare component, unlike
 * `wizardIntro.test.tsx`: the answers live in a provider in `AppShell` and the
 * pages beyond are guarded by layout routes, so the wiring under test only
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

/** Answer the two patient questions through the UI, as a learner would. */
async function answerPatient(user: ReturnType<typeof userEvent.setup>) {
  await user.click(radio("Hemophilia B"));
  await user.click(radio("Yes"));
}

describe("wizard — patient characteristics", () => {
  it("titles the page with the artboard's heading, uppercased in CSS", () => {
    renderAt("/wizard");
    const title = screen.getByRole("heading", { level: 1 });

    expect(title).toHaveAccessibleName(WIZARD_INPUT_TITLE);
    expect(title).toHaveClass("uppercase");
  });

  /**
   * Two questions, not three: the reason moved to its own step past the
   * scenario screen (client direction 2026-08-12, the blueprint's own order),
   * so its group must NOT render here — a page asking all three again is the
   * exact regression the split exists to prevent.
   */
  it("asks the two patient questions as named groups, and not the reason", () => {
    renderAt("/wizard");

    for (const question of [WIZARD_QUESTIONS.type, WIZARD_QUESTIONS.inhibitors]) {
      expect(screen.getByRole("group", { name: question })).toBeInTheDocument();
    }

    expect(screen.queryByRole("group", { name: WIZARD_QUESTIONS.reason })).not.toBeInTheDocument();
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
    it("is disabled until both patient questions are answered", async () => {
      const user = userEvent.setup();
      renderAt("/wizard");

      expect(submit()).toBeDisabled();
      await user.click(radio("Hemophilia B"));
      expect(submit()).toBeDisabled();
      await user.click(radio("Yes"));
      expect(submit()).toBeEnabled();
    });

    it("closes again when an answer is cleared", async () => {
      const user = userEvent.setup();
      renderAt("/wizard");
      await answerPatient(user);

      await user.click(radio("Yes")); // picking the chosen option clears it

      expect(radio("Yes")).not.toBeChecked();
      expect(submit()).toBeDisabled();
    });

    /**
     * The release is announced, not just permitted (docs/styling.md §20): the
     * moment the patient answers complete, Submit eases out of the disabled
     * dimming and plays a one-shot pulse. The transition class is asserted
     * alongside because it is the other half of the same cue — the package's
     * own list restated with `opacity` added, which is what makes the un-dim
     * ease at all.
     */
    it("announces the release with a one-shot pulse", async () => {
      const user = userEvent.setup();
      renderAt("/wizard");

      expect(submit()).toHaveClass("transition-[background-color,box-shadow,color,opacity]");
      expect(submit()).not.toHaveClass("animate-gate-release");

      await answerPatient(user);

      // motion-reduce travels with the pulse: the scale motion is dropped for
      // learners who asked for that, while the opacity ease stays.
      expect(submit()).toHaveClass("animate-gate-release", "motion-reduce:animate-none");
    });

    /**
     * The pulse marks the gate OPENING, not the gate being open: coming back
     * from the pages beyond, the session is already complete and nothing just
     * changed, so an armed pulse here would be announcing old news on every
     * return trip.
     */
    it("does not pulse when the page mounts with the gate already open", () => {
      seedWizardAnswers();
      renderAt("/wizard");

      expect(submit()).toBeEnabled();
      expect(submit()).not.toHaveClass("animate-gate-release");
    });

    /** Clearing disarms the pulse with the gate; re-completing announces again. */
    it("re-arms the pulse when the gate closes and reopens", async () => {
      const user = userEvent.setup();
      renderAt("/wizard");
      await answerPatient(user);

      await user.click(radio("Yes")); // picking the chosen option clears it
      expect(submit()).not.toHaveClass("animate-gate-release");

      await user.click(radio("No"));
      expect(submit()).toHaveClass("animate-gate-release");
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
      await answerPatient(user);

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
    await answerPatient(user);
    await user.click(submit());

    await user.click(screen.getByRole("link", { name: "Wizard" }));

    expect(at(router)).toBe("/wizard");
    expect(radio("Hemophilia B")).toBeChecked();
    expect(radio("Yes")).toBeChecked();
  });

  it("restores answers stored by an earlier visit in the same session", () => {
    seedWizardAnswers({ type: "A", hasInhibitors: false });
    renderAt("/wizard");

    expect(radio("Hemophilia A")).toBeChecked();
    expect(radio("No")).toBeChecked();
  });
});

/**
 * The other half of the gates: the sidebar's arrow is disabled (asserted in
 * `sidebar.test.tsx`), and the pages past the questions refuse to render for a
 * session missing what they need — which is what a reload, a bookmark or a
 * pasted link is. Two levels: the scenario pages need the two patient answers,
 * the leaf all three.
 */
describe("wizard — the pages past the questions", () => {
  it.each(["/wizard/scenario", "/wizard/reason", "/wizard/therapies"])(
    "sends a cold %s back to the questions",
    (path) => {
      const router = renderAt(path);

      expect(at(router)).toBe("/wizard");
      expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(WIZARD_INPUT_TITLE);
    },
  );

  /**
   * The nearest-missing-step rule: a session holding the two patient answers
   * but no reason is bounced from the leaf to the reason question, not all the
   * way back to `/wizard` — the gate lands the learner where the gap is.
   */
  it("sends a leaf missing only the reason to /wizard/reason", () => {
    seedWizardAnswers({ reason: null });
    const router = renderAt("/wizard/therapies");

    expect(at(router)).toBe("/wizard/reason");
    expect(screen.getByRole("group", { name: WIZARD_QUESTIONS.reason })).toBeInTheDocument();
  });

  /** The scenario pages themselves need no reason — patient answers suffice. */
  it.each(["/wizard/scenario", "/wizard/reason"])(
    "renders %s for a session with only the patient answers",
    (path) => {
      seedWizardAnswers({ reason: null });
      const router = renderAt(path);

      expect(at(router)).toBe(path);
    },
  );

  /**
   * `seedWizardAnswers`' default is HA without inhibitors for bleeding control,
   * so the scenario page wears that screen's heading and the leaf wears that
   * reason's. Both come from the data module rather than as literals — the
   * titles are transcribed copy, and `scenario.test.tsx` / `therapies.test.tsx`
   * are where they are asserted against each branch. Here the only claim is that
   * the gates let an answered session through.
   */
  it.each([
    ["/wizard/scenario", classesFor({ type: "A", hasInhibitors: false }).title],
    ["/wizard/reason", WIZARD_INPUT_TITLE],
    [
      "/wizard/therapies",
      leafFor({ type: "A", hasInhibitors: false, reason: "bleeding-control" }).heading,
    ],
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
