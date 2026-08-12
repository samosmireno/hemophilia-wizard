import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { AGENT_NAMES } from "../data/agents";
import { CASCADE_TITLE } from "./education/DiseaseBackground";
import { routes } from "./router";

/**
 * Mounted through the app's own `routes` so the live sidebar is present — the
 * page's legend describes it, and the "demos don't navigate" assertions only
 * mean something with the real navigation next to them. Queries are scoped to
 * the page's region for the reason `therapies.test.tsx` records: the shell's
 * sidebar would otherwise be indexed alongside the page's own controls.
 */
function renderHowTo() {
  const router = createMemoryRouter(routes, { initialEntries: ["/how-to"] });
  render(<RouterProvider router={router} />);
  return { router, region: screen.getByRole("region", { name: "How to Use" }) };
}

describe("how-to — the demos are real and live", () => {
  it("keeps the BEGIN demo look-only: clicking it navigates nowhere", async () => {
    const user = userEvent.setup();
    const { router, region } = renderHowTo();

    await user.click(within(region).getByRole("button", { name: "Begin" }));

    expect(router.state.location.pathname).toBe("/how-to");
  });

  it("opens the demo pop-up from the + and closes it from the ✕", async () => {
    const user = userEvent.setup();
    const { region } = renderHowTo();

    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(within(region).getByRole("button", { name: "Expand This is a pop-up" }));

    /* Scoped to the dialog for §13's reason: the open trigger shares the
       "Close …" name and jsdom implements no top layer. */
    const card = screen.getByRole("dialog");
    expect(card).toHaveAccessibleName("This is a pop-up");
    await user.click(within(card).getByRole("button", { name: "Close This is a pop-up" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("enlarges the clickable-image demo into the cascade figure", async () => {
    const user = userEvent.setup();
    const { region } = renderHowTo();

    await user.click(within(region).getByRole("button", { name: `Expand ${CASCADE_TITLE}` }));

    expect(screen.getByRole("dialog")).toHaveAccessibleName(CASCADE_TITLE);
  });

  it("serves the real drug sheet from the agent-box demo", async () => {
    const user = userEvent.setup();
    const { region } = renderHowTo();

    await user.click(
      within(region).getByRole("button", { name: `Expand ${AGENT_NAMES.fitusiran}` }),
    );

    expect(screen.getByRole("dialog")).toHaveAccessibleName(AGENT_NAMES.fitusiran);
  });
});

describe("how-to — the demo drawer pair", () => {
  const headers = (region: HTMLElement) =>
    within(region)
      .getAllByRole("heading", { level: 2 })
      .flatMap((h) => within(h).queryAllByRole("button"));

  it("opens the first drawer on mount and swaps on click, one always open", async () => {
    const user = userEvent.setup();
    const { region } = renderHowTo();
    const [first, second] = headers(region);

    expect(first).toHaveTextContent("First drawer");
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(second).toHaveAttribute("aria-expanded", "false");

    await user.click(second);

    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(first).toHaveAttribute("aria-expanded", "false");

    /* The open one will not collapse — ADR 0005's invariant, demonstrated live. */
    await user.click(second);
    expect(second).toHaveAttribute("aria-expanded", "true");
  });
});

describe("how-to — the sidebar legend replicas", () => {
  /**
   * The replica buttons mirror the live rail and press like it, but none of
   * them navigates — and none answers to a live control's name (the arrows say
   * "… example"; the jump replicas are icon-only, with the printed labels
   * beside them doing the explaining), so the spine walk in `sidebar.test.tsx`
   * (which reaches the arrows by their exact names, on /how-to like every
   * other step) can never grab a replica by mistake. The legend's `<ul>` is
   * the page's only list, so its list items are the structural handle.
   */
  it("presses like a button but navigates nowhere", async () => {
    const user = userEvent.setup();
    const { router, region } = renderHowTo();

    const replicas = within(region)
      .getAllByRole("listitem")
      .flatMap((item) => within(item).queryAllByRole("button"));
    expect(replicas).toHaveLength(8); // six jump buttons + the two arrows

    for (const replica of replicas) {
      expect(replica).toBeEnabled();
      await user.click(replica);
      expect(router.state.location.pathname).toBe("/how-to");
    }
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("answers to no live rail control's name inside the page", () => {
    const { region } = renderHowTo();

    for (const name of ["Home", "Wizard", "How To", "Acronyms", "References", "Glossary"]) {
      expect(within(region).queryByRole("button", { name })).toBeNull();
      expect(within(region).queryByRole("link", { name })).toBeNull();
    }
    expect(within(region).queryByRole("button", { name: "Previous" })).toBeNull();
    expect(within(region).queryByRole("button", { name: "Next" })).toBeNull();
  });

  it("prints a label for every live jump button plus the arrows", () => {
    const { region } = renderHowTo();

    for (const label of ["Home", "Wizard", "How To", "Acronyms", "References", "Glossary"]) {
      expect(within(region).getByText(label)).toBeInTheDocument();
    }
    expect(within(region).getByText("Previous / Next")).toBeInTheDocument();
  });
});
