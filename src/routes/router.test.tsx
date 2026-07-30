import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { ACTIVITY_TITLE } from "../data/activity";
import { routes } from "./router";

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

const heading = () => screen.getByRole("heading", { level: 1 });

/** The h1 of the chapter every unresolvable `/education/...` path lands on. */
const firstChapterHeading = () =>
  screen.findByRole("heading", { level: 1, name: "Hemophilia Disease Background" });

describe("router", () => {
  it("renders the landing page at /", () => {
    renderAt("/");
    expect(heading()).toHaveTextContent(ACTIVITY_TITLE);
  });

  it.each([
    ["/wizard-intro", /Treatment Wizard — Introduction/],
    ["/wizard", /Treatment Wizard/],
    ["/explore", /Explore/],
    ["/resources", /Resources/],
    ["/survey", /Survey/],
    ["/glossary", /Glossary/],
    ["/acronyms", /Acronyms/],
    ["/references", /References/],
  ])("renders a stub at %s", (path, expected) => {
    renderAt(path);
    expect(heading()).toHaveTextContent(expected);
  });

  // The built chapters, by the `<h1>` each one actually carries. A chapter
  // graduates from the placeholder list below to this one as its design lands.
  it.each([
    ["disease-background", "Hemophilia Disease Background"],
    ["treatment-landscape", "The Evolving Treatment Landscape for Hemophilia"],
    ["rebalancing-agents", "Hemostatic Rebalancing Agents"],
  ])("renders the %s chapter", (section, title) => {
    renderAt(`/education/${section}`);
    expect(heading()).toHaveTextContent(title);
  });

  it.each(["fviiia-mimetics", "prophylaxis-guidance"])(
    "renders the %s education chapter placeholder",
    (section) => {
      renderAt(`/education/${section}`);
      expect(heading()).toHaveTextContent(`Education — ${section}`);
    },
  );

  // `CHAPTERS` is looked up with `Object.hasOwn`, so an inherited Object key is
  // not a section — `in` would resolve it and then try to render it.
  it.each(["not-a-real-section", "toString", "constructor"])(
    "redirects the unknown education section %s to the first chapter",
    async (section) => {
      const router = renderAt(`/education/${section}`);
      expect(await firstChapterHeading()).toBeInTheDocument();
      expect(router.state.location.pathname).toBe("/education/disease-background");
    },
  );

  it("redirects bare /education to the first chapter", async () => {
    const router = renderAt("/education");
    expect(await firstChapterHeading()).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/education/disease-background");
  });

  it("redirects a deeper unknown path under a section to that section", async () => {
    const router = renderAt("/education/foo/bar");
    expect(await firstChapterHeading()).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/education/disease-background");
  });

  it("redirects an unknown top-level route to the landing page", async () => {
    const router = renderAt("/nope");
    expect(
      await screen.findByRole("heading", { level: 1, name: ACTIVITY_TITLE }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/");
  });

  // Backdrops are decorative, so they have no accessible role to query — the
  // data attribute is the seam. The shell's is unconditional; `/` adds a second,
  // its own (issue 19), which paints over the shell's at the same `-z-10` by
  // landing later in DOM order.
  describe("page backdrop", () => {
    const backdrop = (which: string) => document.querySelector(`[data-page-backdrop="${which}"]`);

    it.each(["/", "/wizard", "/explore", "/education/disease-background", "/glossary"])(
      "the shell paints the default gradient at %s",
      (path) => {
        renderAt(path);
        expect(backdrop("default")).toHaveClass("bg-page");
      },
    );

    it("adds the landing backdrop at / only", () => {
      renderAt("/");
      expect(backdrop("landing")).toBeInTheDocument();
    });

    it.each(["/wizard", "/explore", "/education/disease-background", "/glossary"])(
      "has no landing backdrop at %s",
      (path) => {
        renderAt(path);
        expect(backdrop("landing")).not.toBeInTheDocument();
      },
    );
  });

  // The crimson rule is mounted as a layout route around every non-index child,
  // so "which pages have it" is a routing assertion rather than a styling one.
  describe("top rule", () => {
    const rule = () => document.querySelector("[data-top-rule]");

    it.each([
      "/wizard-intro",
      "/wizard",
      "/explore",
      "/resources",
      "/survey",
      "/glossary",
      "/acronyms",
      "/references",
      "/education/disease-background",
    ])("paints the rule at %s", (path) => {
      renderAt(path);
      expect(rule()).toHaveClass("bg-brand-crimson-50");
    });

    it("has no rule on the landing page", () => {
      renderAt("/");
      expect(rule()).not.toBeInTheDocument();
    });

    it("has no rule after an unknown path redirects to the landing page", async () => {
      renderAt("/nope");
      await screen.findByRole("heading", { level: 1, name: ACTIVITY_TITLE });
      expect(rule()).not.toBeInTheDocument();
    });
  });

  // The sidebar's jump items are covered in depth by `sidebar.test.tsx`; this
  // keeps a route-level check that navigating actually resolves the target
  // route and renders it, not just that the location changed.
  it("navigates via the sidebar without a full reload", async () => {
    const user = userEvent.setup();
    const router = renderAt("/");
    await user.click(screen.getByRole("link", { name: "Wizard" }));
    expect(heading()).toHaveTextContent(/Treatment Wizard/);
    expect(router.state.location.pathname).toBe("/wizard");
  });
});
