import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { nextOf } from "../data/sectionOrder";
import { WIZARD_ENTRY_PROMPT } from "../data/wizard";
import { setReducedMotion } from "../test/setup";
import WizardIntro from "./WizardIntro";

/**
 * `WizardIntro` calls `useNavigate`, so it needs a router around it. Mounted as
 * a two-route memory router rather than through the app's `routes`, for the
 * reason `landing.test.tsx` gives: these tests are about the page, and which
 * path gets which backdrop stays in `router.test.tsx`.
 */
function renderIntro() {
  const router = createMemoryRouter(
    [
      { path: "/wizard-intro", element: <WizardIntro /> },
      { path: "/wizard", element: <h1>wizard</h1> },
    ],
    { initialEntries: ["/wizard-intro"] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("wizard intro card", () => {
  /**
   * The heading is the blueprint's entry node, read from the data module rather
   * than transcribed — a reword there must reach this page, not diverge from it.
   */
  it("shows the blueprint's entry-node line as its heading", () => {
    renderIntro();

    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(WIZARD_ENTRY_PROMPT);
  });

  /**
   * `uppercase` is a CSS transform, so the accessible name above is unaffected —
   * this asserts the copy was not shouted in the markup, as on every chapter.
   */
  it("uppercases the heading in CSS, not in the copy", () => {
    renderIntro();

    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("uppercase");
  });

  /**
   * The CTA is `nextOf("/wizard-intro")`, not the literal `/wizard`: this is the
   * assertion that the button and the sidebar's Next arrow read one spine. It is
   * written against `nextOf` for that reason — hard-coding `/wizard` here would
   * pass even if the page stopped consulting the order.
   */
  it("sends the CTA to the next walkthrough step", async () => {
    const router = renderIntro();

    await userEvent.click(screen.getByRole("button", { name: /input patient characteristics/i }));

    expect(router.state.location.pathname).toBe(nextOf("/wizard-intro"));
  });
});

/**
 * The backdrop is `aria-hidden`, so nothing in it is reachable by role; these
 * query the DOM directly, which is the trade-off decorative layers force.
 */
describe("wizard intro backdrop", () => {
  const video = () => document.querySelector("video");

  it("mounts the brand loop as the wash", () => {
    renderIntro();

    expect(video()).toBeInTheDocument();
    expect(document.querySelector("[data-page-backdrop='wizard-intro']")).toContainElement(video());
  });

  /**
   * The 25% is the measured design value and it lives in CSS rather than in a
   * pre-dimmed asset, for the reason `prophylaxis-guidance` records: the number
   * stays readable and changeable. A backdrop that lost the class would play the
   * footage at full strength under crimson type.
   */
  it("washes the footage at the measured 25%", () => {
    renderIntro();

    expect(video()).toHaveClass("opacity-25");
  });

  it("mounts a still instead of the video under prefers-reduced-motion", () => {
    setReducedMotion(true);
    renderIntro();

    // Not mounted, rather than mounted-and-paused — that also skips the fetch.
    expect(video()).not.toBeInTheDocument();
    expect(document.querySelector("[data-page-backdrop='wizard-intro'] img")).toHaveClass(
      "opacity-25",
    );
  });
});
