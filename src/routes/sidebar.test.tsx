import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { SECTION_ORDER } from "../data/sectionOrder";
import { seedWizardAnswers, setViewport } from "../test/setup";
import { routes } from "./router";

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

const at = (router: ReturnType<typeof renderAt>) => router.state.location.pathname;
const button = (name: string) => screen.getByRole("button", { name });
/** A jump target you are not currently on — renders as a real `<a>`. */
const link = (name: string) => screen.getByRole("link", { name });

/** The five always-visible jump targets, as label → path. */
const JUMPS = [
  ["Home", "/"],
  ["Wizard", "/wizard"],
  ["Acronyms", "/acronyms"],
  ["References", "/references"],
  ["Glossary", "/glossary"],
] as const;

const OFF_LINE = ["/glossary", "/acronyms", "/references"] as const;

describe("sidebar — walkthrough spine", () => {
  /**
   * Both walks need an answered wizard. Three of the fifteen steps are the pages
   * past `/wizard`, which only exist for answers: without them Next is dead on
   * `/wizard` and the gates bounce the pages beyond it back there. The gates
   * themselves are asserted below and in `wizard.test.tsx`; here they are a
   * precondition, so that these two stay tests of the spine.
   */
  it("steps Next through the whole section order", async () => {
    seedWizardAnswers();
    const user = userEvent.setup();
    const router = renderAt(SECTION_ORDER[0]);

    for (const expected of SECTION_ORDER.slice(1)) {
      await user.click(button("Next"));
      expect(at(router)).toBe(expected);
    }
  });

  it("steps Prev back through the whole section order", async () => {
    seedWizardAnswers();
    const user = userEvent.setup();
    const router = renderAt(SECTION_ORDER[SECTION_ORDER.length - 1]);

    for (const expected of [...SECTION_ORDER].reverse().slice(1)) {
      await user.click(button("Previous"));
      expect(at(router)).toBe(expected);
    }
  });

  /**
   * The arrow and each form's Submit button are one gate, not two — the reason
   * this lives in the sidebar's suite is that the coupling runs the wrong way to
   * be visible from the page: `AppSidebar` owns the arrow, so only it can
   * disable it. Two doors since the reason split off `/wizard`: the patient
   * answers open `/wizard`, the reason opens `/wizard/reason`.
   */
  it("disables Next on /wizard until the patient answers are complete", async () => {
    const user = userEvent.setup();
    const router = renderAt("/wizard");

    expect(button("Next")).toBeDisabled();
    await user.click(button("Next"));
    expect(at(router)).toBe("/wizard");
  });

  it("enables Next on /wizard on the patient answers alone — no reason needed", async () => {
    seedWizardAnswers({ reason: null });
    const user = userEvent.setup();
    const router = renderAt("/wizard");

    expect(button("Next")).toBeEnabled();
    await user.click(button("Next"));
    expect(at(router)).toBe("/wizard/scenario");
  });

  it("disables Next on /wizard/reason until the reason is picked", async () => {
    seedWizardAnswers({ reason: null });
    const user = userEvent.setup();
    const router = renderAt("/wizard/reason");

    expect(button("Next")).toBeDisabled();
    await user.click(button("Next"));
    expect(at(router)).toBe("/wizard/reason");
  });

  it("enables Next on /wizard/reason once the reason is picked", async () => {
    seedWizardAnswers();
    const user = userEvent.setup();
    const router = renderAt("/wizard/reason");

    expect(button("Next")).toBeEnabled();
    await user.click(button("Next"));
    expect(at(router)).toBe("/wizard/therapies");
  });

  /** The scenario interlude between the two forms is never gated forward. */
  it("leaves Next open on /wizard/scenario without a reason", async () => {
    seedWizardAnswers({ reason: null });
    const user = userEvent.setup();
    const router = renderAt("/wizard/scenario");

    expect(button("Next")).toBeEnabled();
    await user.click(button("Next"));
    expect(at(router)).toBe("/wizard/reason");
  });

  it("disables Prev at the first step", () => {
    renderAt(SECTION_ORDER[0]);
    expect(button("Previous")).toBeDisabled();
    expect(button("Next")).toBeEnabled();
  });

  it("disables Next at the last step", () => {
    renderAt(SECTION_ORDER[SECTION_ORDER.length - 1]);
    expect(button("Next")).toBeDisabled();
    expect(button("Previous")).toBeEnabled();
  });
});

describe("sidebar — jump targets", () => {
  it.each(JUMPS)("%s navigates to %s", async (label, path) => {
    const user = userEvent.setup();
    // Start somewhere every jump is reachable from — the target's own item is
    // disabled once you are on it.
    const router = renderAt("/explore");

    await user.click(link(label));
    expect(at(router)).toBe(path);
  });

  // The point of rendering these as anchors rather than buttons: a real href is
  // what makes cmd-click, middle-click and "open in new tab" work, which is how
  // a learner keeps Glossary or References open beside the wizard.
  it.each(JUMPS)("exposes %s as a real link to %s", (label, path) => {
    renderAt("/explore");
    expect(link(label)).toHaveAttribute("href", path);
  });

  it.each(JUMPS)("renders the %s item as a disabled button while on %s", (label, path) => {
    renderAt(path);
    // `disabled` forces the button branch, so the current item is the one jump
    // target that is deliberately not a link.
    expect(button(label)).toBeDisabled();
    expect(button(label)).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: label })).not.toBeInTheDocument();
  });

  it("leaves every other jump target a link and unmarked", () => {
    renderAt("/glossary");
    for (const [label] of JUMPS.filter(([, path]) => path !== "/glossary")) {
      expect(link(label)).not.toHaveAttribute("aria-current");
    }
  });

  it("marks no jump target on an in-flow page that has none", () => {
    renderAt("/explore");
    for (const [label] of JUMPS) {
      expect(link(label)).not.toHaveAttribute("aria-current");
    }
  });
});

describe("sidebar — off-line reference pages", () => {
  it.each(OFF_LINE)("disables Next on %s", (path) => {
    renderAt(path);
    expect(button("Next")).toBeDisabled();
  });

  it("Prev returns to the step you came from", async () => {
    const user = userEvent.setup();
    const router = renderAt("/explore");

    await user.click(link("Glossary"));
    expect(at(router)).toBe("/glossary");

    await user.click(button("Previous"));
    expect(at(router)).toBe("/explore");
  });

  it("Prev remembers the most recent step across several detours", async () => {
    // Answered, so the second leg can move forward off `/wizard` — and so the
    // remembered step is a guarded one, which is the case worth covering: the
    // gate must not fire on the way back into it.
    seedWizardAnswers();
    const user = userEvent.setup();
    const router = renderAt("/wizard");

    await user.click(link("Acronyms"));
    await user.click(button("Previous"));
    expect(at(router)).toBe("/wizard");

    await user.click(button("Next")); // /wizard -> /wizard/scenario
    await user.click(link("References"));
    await user.click(button("Previous"));
    expect(at(router)).toBe("/wizard/scenario");
  });

  it.each(OFF_LINE)("Prev falls back to Home on a cold %s", async (path) => {
    const user = userEvent.setup();
    const router = renderAt(path);

    expect(button("Previous")).toBeEnabled();
    await user.click(button("Previous"));
    expect(at(router)).toBe("/");
  });
});

describe("sidebar — layout variants", () => {
  it("renders the bottom bar below the breakpoint", async () => {
    setViewport(false);
    const user = userEvent.setup();
    const router = renderAt("/explore");

    // The bar keeps the arrows inline and adds a "More" trigger for the items.
    expect(button("More")).toBeInTheDocument();
    await user.click(button("Next"));
    expect(at(router)).toBe("/resources");
  });

  // The jump items carry no `onClick` of their own — `Link` owns the
  // navigation — so the menu can only close if `Sidebar` passes its own close
  // handler down to the rendered control. Regression guard for that path.
  it("closes the More menu after picking an item from it", async () => {
    setViewport(false);
    const user = userEvent.setup();
    const router = renderAt("/explore");

    await user.click(button("More"));
    // Scope to the menu: below `sm` the bar also holds an inline copy of every
    // item, hidden by a class jsdom does not evaluate.
    const menu = screen.getByRole("menu");
    await user.click(within(menu).getByRole("link", { name: "Glossary" }));

    expect(at(router)).toBe("/glossary");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("renders the rail above the breakpoint, with no More trigger", () => {
    renderAt("/explore");
    expect(screen.queryByRole("button", { name: "More" })).not.toBeInTheDocument();
    expect(link("Home")).toBeInTheDocument();
  });
});
