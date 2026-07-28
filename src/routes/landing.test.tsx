import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { ACTIVITY_CODE, ACTIVITY_TITLE } from "../data/activity";
import { setReducedMotion } from "../test/setup";
import Landing from "./Landing";

/**
 * `Landing` calls `useNavigate`, so it cannot be rendered bare — it needs a
 * router around it. This mounts it as the only route rather than importing the
 * app's `routes`, keeping these tests about the page: route-level coverage
 * (which paths get which backdrop) stays in `router.test.tsx`.
 */
function renderLanding() {
  const router = createMemoryRouter(
    [
      { path: "/", element: <Landing /> },
      { path: "/education/:section", element: <h1>chapter</h1> },
    ],
    { initialEntries: ["/"] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

/**
 * The backdrop is `aria-hidden`, so nothing in it is reachable by role; these
 * query the DOM directly, which is the trade-off decorative layers force.
 */
describe("landing backdrop", () => {
  const video = () => document.querySelector("video");

  it("mounts the looping video under the gradient", () => {
    renderLanding();

    expect(video()).toBeInTheDocument();
    expect(document.querySelector(".bg-page-landing")).toBeInTheDocument();
  });

  // `muted` is asserted as a PROPERTY: React assigns it directly rather than
  // rendering an attribute, so `toHaveAttribute("muted")` fails on a correctly
  // muted video. It is also the precondition for autoplay in every browser, so
  // losing it silently disables the feature rather than degrading it.
  it("is muted and looping, so autoplay is allowed", () => {
    renderLanding();

    expect(video()?.muted).toBe(true);
    expect(video()?.loop).toBe(true);
  });

  it("mounts a still instead of the video under prefers-reduced-motion", () => {
    setReducedMotion(true);
    renderLanding();

    // Not mounted, rather than mounted-and-paused — that also skips the fetch.
    expect(video()).not.toBeInTheDocument();
    expect(document.querySelector("img")).toBeInTheDocument();
  });
});

describe("landing hero", () => {
  // The heading is split across two spans for typography; asserting the whole
  // title on the <h1> is what pins the accessible name back to one string.
  it("names the activity with the shared title", () => {
    renderLanding();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(ACTIVITY_TITLE);
    expect(screen.getByText(ACTIVITY_CODE)).toBeInTheDocument();
  });

  it("sends the CTA to the first walkthrough step after /", async () => {
    const router = renderLanding();

    await userEvent.click(screen.getByRole("button", { name: /get started/i }));

    expect(router.state.location.pathname).toBe("/education/disease-background");
  });
});
