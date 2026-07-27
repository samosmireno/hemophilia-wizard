import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { routes } from "./router";

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

const heading = () => screen.getByRole("heading", { level: 1 });

describe("router", () => {
  it("renders the landing page at /", () => {
    renderAt("/");
    expect(heading()).toHaveTextContent(/^Home$/);
  });

  it.each([
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

  it.each(["disease-background", "treatment-landscape", "rebalancing-agents", "fviiia-mimetics"])(
    "renders the %s education chapter",
    (section) => {
      renderAt(`/education/${section}`);
      expect(heading()).toHaveTextContent(`Education — ${section}`);
    },
  );

  it("redirects bare /education to the first chapter", async () => {
    const router = renderAt("/education");
    expect(await screen.findByText("Education — disease-background")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/education/disease-background");
  });

  it("redirects an unknown education section to the first chapter", async () => {
    const router = renderAt("/education/not-a-real-section");
    expect(await screen.findByText("Education — disease-background")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/education/disease-background");
  });

  it("redirects a deeper unknown path under a section to that section", async () => {
    const router = renderAt("/education/foo/bar");
    expect(await screen.findByText("Education — disease-background")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/education/disease-background");
  });

  it("redirects an unknown top-level route to the landing page", async () => {
    const router = renderAt("/nope");
    expect(await screen.findByRole("heading", { level: 1, name: /^Home$/ })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/");
  });

  it("navigates via the placeholder nav without a full reload", async () => {
    const user = userEvent.setup();
    const router = renderAt("/");
    await user.click(screen.getByRole("link", { name: "Wizard" }));
    expect(heading()).toHaveTextContent(/Treatment Wizard/);
    expect(router.state.location.pathname).toBe("/wizard");
  });
});
