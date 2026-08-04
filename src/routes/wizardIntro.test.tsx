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
   * The 2026-08-04 responsive pass: the heading takes a three-step ramp instead
   * of the fixed 72px the clamp removal left it at.
   *
   * All three steps are pinned, because each answers a different question and
   * any one of them alone would let the others drift. `text-4xl` at base is set
   * by the unbreakable word — "PROPHYLACTIC" is ~397px of Barlow Condensed
   * uppercase at 72px, against a 311px column at 375 and a 256px one at 320 —
   * and `lg:text-7xl` is the drawn size arriving one breakpoint earlier than
   * `Landing`'s does, which the 729px drawn line inside a 752px column is what
   * permits (§8).
   *
   * The line height is asserted on every step for the reason it is written on
   * every step: one would do, so a step that lost it would still render 1.05
   * from the others' `--tw-leading` and nothing would look wrong until someone
   * edited the one that still carried it.
   *
   * jsdom computes no layout, so a class string is the only thing here that can
   * fail; the ink widths above are arithmetic (open item 41).
   */
  it("ramps the heading in three steps, restating its line height on each", () => {
    renderIntro();

    expect(screen.getByRole("heading", { level: 1 })).toHaveClass(
      "text-4xl/[1.05]",
      "sm:text-5xl/[1.05]",
      "lg:text-7xl/[1.05]",
      "max-w-3xl",
    );
  });

  /**
   * The CTA's inset, type and line box all ramp — the last of the regressions
   * open item 33 recorded when every `clamp()` in the app was replaced by its
   * own maximum.
   *
   * The line box is the half worth pinning hardest. `leading-5` is the design's
   * 20px box around 24px type, which is what makes the drawn pill 56px rather
   * than 68, and it is safe **only** where the label does not wrap; below `lg`
   * this 29-character label does, so those steps take `/tight` instead. A ramp
   * that carried `leading-5` down with it would put overlapping caps on a phone,
   * which is the exact bug this closes and one that has shipped twice.
   *
   * The inset steps are `Landing`'s, reused rather than invented — 128px of
   * `px-16` around ~257px of 16px label is a 321px pill in a 311px column.
   *
   * jsdom computes no layout, so a class string is the only thing here that can
   * fail; the label widths are estimates (open item 41).
   */
  it("ramps the CTA's inset and type, and keeps the drawn 20px line box at lg alone", () => {
    renderIntro();

    expect(screen.getByRole("button", { name: /input patient characteristics/i })).toHaveClass(
      "px-8",
      "py-3",
      "text-base/tight",
      "sm:px-12",
      "sm:py-3.5",
      "sm:text-xl/tight",
      "lg:px-16",
      "lg:py-4.5",
      "lg:text-2xl/5",
    );
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
