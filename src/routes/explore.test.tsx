import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { sheetFor } from "../data/drug-sheets";
import {
  EXPLORE_AGENTS,
  EXPLORE_SEGMENTS,
  EXPLORE_TABLE_TITLE,
  SDM_CONCLUSION,
  SDM_POINTS,
} from "../data/explore";
import { routes } from "./router";

/**
 * Mounted through the app's own `routes` rather than bare, for the reason the
 * wizard's tests record: the shell is where the page's landmarks come from, and
 * a bare render tests a tree that does not ship.
 *
 * Returns the page's own region — the `<section>`, named by its `<h1>` — because
 * the shell renders a sidebar full of buttons that would otherwise be indexed
 * alongside the page's seven.
 */
function renderExplore() {
  const router = createMemoryRouter(routes, { initialEntries: ["/explore"] });
  render(<RouterProvider router={router} />);
  return screen.getByRole("region", { name: SDM_CONCLUSION });
}

describe("explore — the SDM conclusion", () => {
  it("heads the page with the conclusion in the case it was written in", () => {
    const page = renderExplore();
    // Uppercase is CSS on this heading, so the accessible name must not be.
    expect(within(page).getByRole("heading", { level: 1 })).toHaveAccessibleName(SDM_CONCLUSION);
  });

  it("renders all four bullets verbatim", () => {
    const page = renderExplore();
    const items = within(page)
      .getAllByRole("listitem")
      .map((li) => li.textContent);
    for (const point of SDM_POINTS) {
      expect(items).toContain(point);
    }
  });

  /**
   * Asserted against reassembled `textContent` rather than with `getByText`,
   * because `preserveCase` splits a label carrying a cased term into a span
   * beside a text node and a string matcher only ever sees one element's own
   * text nodes. Reassembly is the property worth testing anyway — see below.
   */
  it("names each therapeutic class in the artboard's wording", () => {
    const rendered = [...renderExplore().querySelectorAll("p")].map((p) => p.textContent);
    for (const segment of EXPLORE_SEGMENTS) {
      for (const column of segment.columns) {
        expect(rendered).toContain(column.label);
      }
    }
  });

  /**
   * The space in "FVIIIa mimetics" is the assertion, and it is a regression test
   * for a bug this page shipped with for one commit: `preserveCase` returns a
   * span beside a bare text node, and a flex container makes each of those an
   * anonymous flex item and **drops the whitespace between them** — rendering the
   * label "FVIIIaMIMETICS". The centring now lives on a wrapper so the text is
   * not a flex item. `textContent` is what catches it; no box assertion would.
   */
  it("keeps FVIIIa's casing and its space through the uppercase transform", () => {
    const page = renderExplore();
    const label = [...page.querySelectorAll("p")].find((p) => p.textContent?.startsWith("FVIIIa"));

    expect(label).toHaveTextContent(/^FVIIIa mimetics$/);
    // The lower-case `a` survives only because it is in its own opted-out span.
    expect(within(label!).getByText("FVIIIa")).toHaveClass("normal-case");
  });
});

describe("explore — the comparison table", () => {
  it("opens the table's card from the CTA", async () => {
    const user = userEvent.setup();
    const page = renderExplore();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(within(page).getByRole("button", { name: EXPLORE_TABLE_TITLE }));

    expect(screen.getByRole("dialog")).toHaveAccessibleName(EXPLORE_TABLE_TITLE);
  });

  /**
   * The table itself is issue 09's and is not built. What is asserted here is
   * that the card is not *empty* — an opened dialog with no body is the state
   * `DisclosureBand` refuses to enter, and the only thing making it acceptable
   * here is that it says so.
   */
  it("states that the table is not built yet", async () => {
    const user = userEvent.setup();
    const page = renderExplore();

    await user.click(within(page).getByRole("button", { name: EXPLORE_TABLE_TITLE }));
    expect(within(screen.getByRole("dialog")).getByText(/not built yet/i)).toBeInTheDocument();
  });

  /**
   * The one card in the app off `Popup`'s default width, and the reason that
   * step exists: nine columns in the default card are 113px each. Asserted here
   * rather than left to `Popup`'s own width tests because what those cover is
   * that the prop works — this covers that *this* card asks for it, which is the
   * half that would quietly regress when the grid lands and the card is rebuilt
   * around it.
   */
  it("opens the table's card at the wide width", async () => {
    const user = userEvent.setup();
    const page = renderExplore();

    await user.click(within(page).getByRole("button", { name: EXPLORE_TABLE_TITLE }));

    expect(screen.getByRole("dialog").firstElementChild).toHaveClass("w-[min(1360px,96vw)]");
  });

  it("closes from the ✕", async () => {
    const user = userEvent.setup();
    const page = renderExplore();

    await user.click(within(page).getByRole("button", { name: EXPLORE_TABLE_TITLE }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: `Close ${EXPLORE_TABLE_TITLE}` }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("explore — the drug sheets", () => {
  it("draws a + for all seven agents, every one of which opens a sheet", () => {
    const page = renderExplore();
    for (const agent of EXPLORE_AGENTS) {
      expect(within(page).getByRole("button", { name: `Expand ${agent}` })).toHaveAttribute(
        "aria-haspopup",
        "dialog",
      );
    }
  });

  it.each(EXPLORE_AGENTS)("opens %s's own sheet, and only that one", async (agent) => {
    const user = userEvent.setup();
    const page = renderExplore();

    await user.click(within(page).getByRole("button", { name: `Expand ${agent}` }));

    const sheet = sheetFor(agent)!;
    expect(screen.getByRole("dialog")).toHaveAccessibleName(sheet.title ?? sheet.agent);
    // The clicked + is the only one showing its ✕.
    for (const other of EXPLORE_AGENTS.filter((a) => a !== agent)) {
      expect(within(page).getByRole("button", { name: `Expand ${other}` })).toBeInTheDocument();
    }
  });

  /**
   * `/explore` is where Efanesoctocog alfa's sheet becomes reachable — it has
   * been built with no caller since the sheets landed (CONTEXT.md §6), so this is
   * the one assertion no other page in the app can make.
   */
  it("reaches Efanesoctocog alfa's sheet, which no other page can", async () => {
    const user = userEvent.setup();
    const page = renderExplore();

    await user.click(within(page).getByRole("button", { name: "Expand Efanesoctocog alfa" }));
    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveAccessibleName("Efanesoctocog alfa");
    // Its one per-sheet deviation: the section is headed "Class", not
    // "Class/Target", because it names a class with no molecular target.
    expect(within(dialog).getByRole("heading", { name: "Class:" })).toBeInTheDocument();
  });

  it("swaps sheets when a second agent is clicked", async () => {
    const user = userEvent.setup();
    const page = renderExplore();

    await user.click(within(page).getByRole("button", { name: "Expand Emicizumab" }));
    /*
      Scoped to the dialog: the open trigger is named "Close Emicizumab" too —
      `PopupButton` builds both names the same way, and jsdom implements no top
      layer to make the one underneath unreachable. The first card is modal, so a
      real reader reaches the second agent by closing the first, which is why the
      clicks are in this order. Both points are `/wizard/therapies`' and
      docs/styling.md §13 prescribes the scoping.
    */
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Close Emicizumab" }),
    );
    await user.click(within(page).getByRole("button", { name: "Expand Fitusiran" }));

    expect(screen.getByRole("dialog")).toHaveAccessibleName("Fitusiran");
  });
});
