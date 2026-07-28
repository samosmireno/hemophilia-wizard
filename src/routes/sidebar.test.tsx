import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { SECTION_ORDER } from "../data/sectionOrder";
import { setViewport } from "../test/setup";
import { routes } from "./router";

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

const at = (router: ReturnType<typeof renderAt>) => router.state.location.pathname;
const button = (name: string) => screen.getByRole("button", { name });

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
  it("steps Next through the whole section order", async () => {
    const user = userEvent.setup();
    const router = renderAt(SECTION_ORDER[0]);

    for (const expected of SECTION_ORDER.slice(1)) {
      await user.click(button("Next"));
      expect(at(router)).toBe(expected);
    }
  });

  it("steps Prev back through the whole section order", async () => {
    const user = userEvent.setup();
    const router = renderAt(SECTION_ORDER[SECTION_ORDER.length - 1]);

    for (const expected of [...SECTION_ORDER].reverse().slice(1)) {
      await user.click(button("Previous"));
      expect(at(router)).toBe(expected);
    }
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

describe("sidebar — jump buttons", () => {
  it.each(JUMPS)("%s navigates to %s", async (label, path) => {
    const user = userEvent.setup();
    // Start somewhere every jump is reachable from — the target's own button is
    // disabled once you are on it.
    const router = renderAt("/explore");

    await user.click(button(label));
    expect(at(router)).toBe(path);
  });

  it.each(JUMPS)("disables the %s button while on %s", (label, path) => {
    renderAt(path);
    expect(button(label)).toBeDisabled();
    expect(button(label)).toHaveAttribute("aria-current", "page");
  });

  it("leaves every other jump button enabled and unmarked", () => {
    renderAt("/glossary");
    for (const [label] of JUMPS.filter(([, path]) => path !== "/glossary")) {
      expect(button(label)).toBeEnabled();
      expect(button(label)).not.toHaveAttribute("aria-current");
    }
  });

  it("marks no jump button on an in-flow page that has none", () => {
    renderAt("/explore");
    for (const [label] of JUMPS) {
      expect(button(label)).toBeEnabled();
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

    await user.click(button("Glossary"));
    expect(at(router)).toBe("/glossary");

    await user.click(button("Previous"));
    expect(at(router)).toBe("/explore");
  });

  it("Prev remembers the most recent step across several detours", async () => {
    const user = userEvent.setup();
    const router = renderAt("/wizard");

    await user.click(button("Acronyms"));
    await user.click(button("Previous"));
    expect(at(router)).toBe("/wizard");

    await user.click(button("Next")); // /wizard -> /explore
    await user.click(button("References"));
    await user.click(button("Previous"));
    expect(at(router)).toBe("/explore");
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

  it("renders the rail above the breakpoint, with no More trigger", () => {
    renderAt("/explore");
    expect(screen.queryByRole("button", { name: "More" })).not.toBeInTheDocument();
    expect(button("Home")).toBeInTheDocument();
  });
});
