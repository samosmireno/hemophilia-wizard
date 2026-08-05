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
  SDM_LEAD,
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

  it("renders the lead sentence above the bullets", () => {
    const page = renderExplore();
    // Order is the assertion: the lead introduces the list, so a `<p>` that
    // rendered after it would be a different page.
    const lead = within(page).getByText(SDM_LEAD);
    const list = within(page).getAllByRole("list")[0];
    expect(lead.compareDocumentPosition(list)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("renders all three bullets verbatim", () => {
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
   * The space in the label is the assertion, and it is a regression test for a
   * bug this page shipped with for one commit: `preserveCase` returns a span
   * beside a bare text node, and a flex container makes each of those an
   * anonymous flex item and **drops the whitespace between them** — rendering
   * the label "FVIIIaMIMETICS". The centring now lives on a wrapper so the text
   * is not a flex item. `textContent` is what catches it; no box assertion
   * would.
   *
   * **The label lost its lower-case `a` on 2026-08-05** — it is "FVIII
   * mimetics" now — so `preserveCase` matches nothing in it and emits no span,
   * which is asserted below rather than assumed: with one text node the trap
   * cannot fire, and a label that grew a cased term back would need the wrapper
   * to still be there. The test above already checks all four label strings;
   * this one stays pointed at the label that used to split.
   */
  it("renders the FVIII label as one string, space intact", () => {
    const page = renderExplore();
    const label = [...page.querySelectorAll("p")].find((p) => p.textContent?.startsWith("FVIII"));

    expect(label).toHaveTextContent(/^FVIII mimetics$/);
    // No cased term left in it, so nothing is opted out of the uppercase.
    expect(label!.querySelector(".normal-case")).toBeNull();
  });
});

/**
 * The responsive pass of 2026-08-05, pinned.
 *
 * jsdom computes no layout, so none of this proves a pixel — what it proves is
 * that the four decisions the pass turned on are still expressed. Each is a
 * thing a later tidy-up would plausibly undo without noticing: the two leadings
 * are ratios BECAUSE they have to survive a size step, `grow` is `xl:` only
 * BECAUSE it distributes height in a column, and the CTA's drawn box is `lg:`
 * only BECAUSE it overlaps itself when the label wraps. The measurements
 * themselves are in docs/styling.md §17's browser table.
 */
describe("explore — the responsive pass", () => {
  /**
   * Three steps rather than §2's one — the heading is 190 characters, and 30px
   * would spend ~315px of a 320px viewport on it. `/none` rather than
   * `leading-9`: 36px against `text-4xl` is the same 1.0 ratio at the canvas,
   * but as an absolute it would render 1.5 at the 24px step.
   */
  it("ramps the heading in three steps, on a ratio", () => {
    const heading = within(renderExplore()).getByRole("heading", { level: 1 });

    expect(heading).toHaveClass("text-2xl/none", "sm:text-3xl/none", "lg:text-4xl/none");
    expect(heading.className).not.toMatch(/(^|\s)leading-/);
  });

  /** This page's one body step, and it lands on the 16px floor. */
  it("steps the bullets to the floor below lg, on a ratio", () => {
    const list = within(renderExplore()).getAllByRole("listitem")[0].closest("ul");

    expect(list).toHaveClass("text-base/[1.6]", "lg:text-xl/[1.6]");
    expect(list!.className).not.toMatch(/(^|\s)leading-/);
  });

  /**
   * Styling open item 33's last case. The drawn 24px type in a 20px line box is
   * kept at `lg` alone, where the label cannot wrap; everything below it is
   * `/tight`. A bare `text-2xl` or `leading-5` here is the regression.
   */
  it("keeps the CTA's drawn box at lg only", () => {
    const cta = within(renderExplore()).getByRole("button", { name: EXPLORE_TABLE_TITLE });

    expect(cta).toHaveClass("text-base/tight", "sm:text-xl/tight", "lg:text-2xl/5");
    expect(cta).toHaveClass("px-8", "py-3", "sm:px-12", "sm:py-3.5", "lg:px-16", "lg:py-4.5");
    expect(cta.className).not.toMatch(/(^|\s)(text-2xl|leading-5)(\s|$)/);
  });

  /**
   * The row must not `grow` below `xl`. The segments carry the drawn widths as
   * `flex-grow` factors, and in a column those split leftover HEIGHT — a stacked
   * segment would be as tall as the viewport allowed rather than as tall as its
   * contents. Denying the row its own growth leaves nothing to distribute.
   */
  it("stacks the segments as cards, and grows only at xl", () => {
    const page = renderExplore();
    const segments = [...page.querySelectorAll<HTMLElement>(".rounded-\\[8rem\\]")];
    const row = segments[0].parentElement!;

    expect(segments).toHaveLength(EXPLORE_SEGMENTS.length);
    expect(row).toHaveClass("gap-6", "xl:grow", "xl:flex-row", "xl:gap-0");
    expect(row.className).not.toMatch(/(^|\s)grow(\s|$)/);

    for (const [index, segment] of segments.entries()) {
      // Closed below `xl`, cut at it; padding mirrored against the new edge.
      expect(segment).toHaveClass("xl:rounded-b-none", "pt-16", "pb-16", "xl:pb-0");
      // The drawn ratio is inert below `xl` and exact at it.
      expect(segment).toHaveClass("basis-auto", "xl:basis-0");
      expect(segment.style.flexGrow).toBe(String(EXPLORE_SEGMENTS[index].width));
      expect(segment.style.flexBasis).toBe("");
    }
  });

  /**
   * A regression test for a bug this page shipped with from its first commit:
   * only the three segments stacked, so the right-hand one's two columns stayed
   * side by side at every width, each `flex-1` of a phone-width segment holding
   * a `basis-40 shrink-0` item that will not give. Measured at 320 before the
   * fix: `document.scrollWidth` 340 against a 320 viewport, with the caption
   * painted 44px outside the arch's own background.
   */
  it("stacks a segment's columns below sm, and only ratios them above it", () => {
    const page = renderExplore();
    // The right-hand segment is the only one drawn with two columns.
    const twoColumn = EXPLORE_SEGMENTS.findIndex((s) => s.columns.length > 1);
    const segment = page.querySelectorAll<HTMLElement>(".rounded-\\[8rem\\]")[twoColumn];
    const row = segment.firstElementChild!;

    expect(row).toHaveClass("flex-col", "sm:flex-row");
    expect(row.className).not.toMatch(/(^|\s)flex-row(\s|$)/);
    for (const column of row.children) {
      // `flex-1` is a HEIGHT ratio once the columns stack, which would force two
      // columns of one agent each to match on captions that wrap differently.
      expect(column).toHaveClass("sm:flex-1");
      expect(column.className).not.toMatch(/(^|\s)flex-1(\s|$)/);
    }
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

    expect(screen.getByRole("dialog").firstElementChild).toHaveClass("w-[min(85rem,96vw)]");
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
